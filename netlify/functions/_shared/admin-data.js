import { getDb } from './db.js';
import { resolveGuildBySlug } from './access.js';

export function cleanSettingsInput(body = {}) {
  const copy = { ...(body || {}) };
  delete copy.slug;
  delete copy.guild_slug;
  delete copy.guildId;
  delete copy.guild_id;
  delete copy.ok;
  return copy.settings && typeof copy.settings === 'object' && !Array.isArray(copy.settings)
    ? { ...copy.settings }
    : copy;
}

export async function ensureAdminSettingsTable() {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS web_admin_settings (
      guild_id VARCHAR(32) NOT NULL PRIMARY KEY,
      slug VARCHAR(100) NOT NULL,
      settings_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_web_admin_settings_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export async function resolveGuildFromEvent(event, body = {}) {
  const slug = event.queryStringParameters?.slug || event.queryStringParameters?.guild_slug || body.slug || body.guild_slug;
  if (!slug) {
    const error = new Error('slug is required');
    error.statusCode = 400;
    throw error;
  }

  const guild = await resolveGuildBySlug(slug);
  if (!guild) {
    const error = new Error('guild not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    guild,
    guildId: String(guild.guild_id),
    slug: guild.slug || slug,
    displayName: guild.display_name || guild.displayName || slug,
  };
}

export async function loadStoredSettings(guildId) {
  await ensureAdminSettingsTable();
  const db = getDb();
  const [rows] = await db.execute(
    'SELECT settings_json FROM web_admin_settings WHERE guild_id = ? LIMIT 1',
    [String(guildId)]
  );

  const raw = rows[0]?.settings_json;
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function saveStoredSettings({ guildId, slug, patch = {}, replace = false }) {
  await ensureAdminSettingsTable();
  const db = getDb();
  const current = replace ? {} : await loadStoredSettings(guildId);
  const next = { ...current, ...patch };

  await db.execute(
    `
      INSERT INTO web_admin_settings (guild_id, slug, settings_json)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        slug = VALUES(slug),
        settings_json = VALUES(settings_json),
        updated_at = NOW()
    `,
    [String(guildId), slug, JSON.stringify(next)]
  );

  return next;
}

export async function fetchDiscordChannels(guildId) {
  const token = process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN || process.env.DISCORD_TOKEN || '';
  if (!token || !guildId) {
    return { channels: [], channelPickerEnabled: Boolean(token), channelsLoaded: false };
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: {
        Authorization: `Bot ${token}`,
        Accept: 'application/json',
      },
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(payload)) {
      return { channels: [], channelPickerEnabled: true, channelsLoaded: false };
    }

    const channels = payload
      .filter((channel) => channel && [0, 5, 10, 11, 12, 15].includes(Number(channel.type)))
      .map((channel) => ({
        id: String(channel.id),
        name: channel.name || String(channel.id),
        type: channel.type,
        parentId: channel.parent_id ? String(channel.parent_id) : null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

    return { channels, channelPickerEnabled: true, channelsLoaded: true };
  } catch {
    return { channels: [], channelPickerEnabled: true, channelsLoaded: false };
  }
}

export function toInt(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : fallback;
}

export function toFloat(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function toBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return ['true', '1', 'yes', 'on', 'enabled'].includes(String(value).toLowerCase());
}
