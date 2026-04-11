import { getDb } from "./db.js";

export function getSuperAdminIds() {
  const raw = process.env.SUPER_ADMIN_IDS || "";
  const owner = process.env.OWNER_DISCORD_ID || "";
  return [...new Set([...raw.split(","), owner].map((v) => v.trim()).filter(Boolean))];
}

export function isSuperAdmin(discordUserId) {
  if (!discordUserId) return false;
  return getSuperAdminIds().includes(String(discordUserId));
}

export async function isGuildAdmin(guildId, discordUserId) {
  if (!guildId || !discordUserId) return false;
  if (isSuperAdmin(discordUserId)) return true;

  const db = getDb();
  const [rows] = await db.execute(
    `
      SELECT 1
      FROM web_guild_admins
      WHERE guild_id = ?
        AND discord_user_id = ?
        AND is_active = 1
      LIMIT 1
    `,
    [guildId, String(discordUserId)]
  );

  return rows.length > 0;
}

export async function resolveGuildBySlug(slug) {
  const db = getDb();
  const [rows] = await db.execute(
    `
      SELECT guild_id, slug, display_name, site_enabled
      FROM web_guild_settings
      WHERE slug = ?
      LIMIT 1
    `,
    [slug]
  );
  return rows[0] || null;
}

export async function hasPlayerLink(guildId, discordUserId) {
  const db = getDb();
  const [rows] = await db.execute(
    `
      SELECT 1
      FROM player_links
      WHERE guild_id = ?
        AND discord_user_id = ?
      LIMIT 1
    `,
    [guildId, String(discordUserId)]
  );
  return rows.length > 0;
}
