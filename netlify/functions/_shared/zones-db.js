import { getDb } from './db.js';
import { resolveGuildFromEvent, toBool, toFloat, toInt } from './admin-data.js';

async function ensureColumn(db, table, column, definition) {
  const [rows] = await db.execute(`SHOW COLUMNS FROM ${table} LIKE ?`, [column]);
  if (!rows.length) {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
  }
}

export async function ensureZoneTables() {
  const db = getDb();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS zone_control_settings (
      guild_id VARCHAR(32) NOT NULL PRIMARY KEY,
      enabled TINYINT(1) NOT NULL DEFAULT 1,
      announce_channel_id VARCHAR(32) NULL,
      event_log_channel_id VARCHAR(32) NULL,
      default_capture_seconds INT NOT NULL DEFAULT 300,
      default_reward_amount INT NOT NULL DEFAULT 0,
      min_players_to_capture INT NOT NULL DEFAULT 1,
      tick_seconds INT NOT NULL DEFAULT 30,
      settings_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS zone_control_zones (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      guild_id VARCHAR(32) NOT NULL,
      name VARCHAR(120) NOT NULL,
      description TEXT NULL,
      center_x DOUBLE NOT NULL DEFAULT 0,
      center_z DOUBLE NOT NULL DEFAULT 0,
      radius DOUBLE NOT NULL DEFAULT 150,
      capture_seconds INT NOT NULL DEFAULT 300,
      reward_amount INT NOT NULL DEFAULT 0,
      color VARCHAR(20) NOT NULL DEFAULT '#f59e0b',
      enabled TINYINT(1) NOT NULL DEFAULT 1,
      owner_clan_id VARCHAR(64) NULL,
      owner_name VARCHAR(120) NULL,
      last_captured_at DATETIME NULL,
      meta_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_zone_control_zones_guild (guild_id),
      KEY idx_zone_control_zones_enabled (guild_id, enabled)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS zone_control_events (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      guild_id VARCHAR(32) NOT NULL,
      zone_id BIGINT NULL,
      event_type VARCHAR(50) NOT NULL DEFAULT 'event',
      zone_name VARCHAR(120) NULL,
      player_name VARCHAR(120) NULL,
      message TEXT NULL,
      payload_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_zone_control_events_guild_created (guild_id, created_at),
      KEY idx_zone_control_events_zone (zone_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Existing bot installations may already have these tables with a smaller schema.
  // Add only missing columns; do not drop/rename anything.
  await ensureColumn(db, 'zone_control_settings', 'announce_channel_id', 'announce_channel_id VARCHAR(32) NULL');
  await ensureColumn(db, 'zone_control_settings', 'event_log_channel_id', 'event_log_channel_id VARCHAR(32) NULL');
  await ensureColumn(db, 'zone_control_settings', 'default_capture_seconds', 'default_capture_seconds INT NOT NULL DEFAULT 300');
  await ensureColumn(db, 'zone_control_settings', 'default_reward_amount', 'default_reward_amount INT NOT NULL DEFAULT 0');
  await ensureColumn(db, 'zone_control_settings', 'min_players_to_capture', 'min_players_to_capture INT NOT NULL DEFAULT 1');
  await ensureColumn(db, 'zone_control_settings', 'tick_seconds', 'tick_seconds INT NOT NULL DEFAULT 30');
  await ensureColumn(db, 'zone_control_settings', 'settings_json', 'settings_json JSON NULL');

  await ensureColumn(db, 'zone_control_zones', 'description', 'description TEXT NULL');
  await ensureColumn(db, 'zone_control_zones', 'center_x', 'center_x DOUBLE NOT NULL DEFAULT 0');
  await ensureColumn(db, 'zone_control_zones', 'center_z', 'center_z DOUBLE NOT NULL DEFAULT 0');
  await ensureColumn(db, 'zone_control_zones', 'radius', 'radius DOUBLE NOT NULL DEFAULT 150');
  await ensureColumn(db, 'zone_control_zones', 'capture_seconds', 'capture_seconds INT NOT NULL DEFAULT 300');
  await ensureColumn(db, 'zone_control_zones', 'reward_amount', 'reward_amount INT NOT NULL DEFAULT 0');
  await ensureColumn(db, 'zone_control_zones', 'color', "color VARCHAR(20) NOT NULL DEFAULT '#f59e0b'");
  await ensureColumn(db, 'zone_control_zones', 'enabled', 'enabled TINYINT(1) NOT NULL DEFAULT 1');
  await ensureColumn(db, 'zone_control_zones', 'owner_name', 'owner_name VARCHAR(120) NULL');
  await ensureColumn(db, 'zone_control_zones', 'last_captured_at', 'last_captured_at DATETIME NULL');
  await ensureColumn(db, 'zone_control_zones', 'meta_json', 'meta_json JSON NULL');

  await ensureColumn(db, 'zone_control_events', 'zone_id', 'zone_id BIGINT NULL');
  await ensureColumn(db, 'zone_control_events', 'event_type', "event_type VARCHAR(50) NOT NULL DEFAULT 'event'");
  await ensureColumn(db, 'zone_control_events', 'zone_name', 'zone_name VARCHAR(120) NULL');
  await ensureColumn(db, 'zone_control_events', 'player_name', 'player_name VARCHAR(120) NULL');
  await ensureColumn(db, 'zone_control_events', 'message', 'message TEXT NULL');
  await ensureColumn(db, 'zone_control_events', 'payload_json', 'payload_json JSON NULL');
}

export function zoneSettingsFromBody(body = {}) {
  return {
    enabled: toBool(body.enabled ?? body.is_enabled, true) ? 1 : 0,
    announceChannelId: String(body.announceChannelId ?? body.announce_channel_id ?? body.channelId ?? body.channel_id ?? ''),
    eventLogChannelId: String(body.eventLogChannelId ?? body.event_log_channel_id ?? body.logChannelId ?? body.log_channel_id ?? ''),
    defaultCaptureSeconds: toInt(body.defaultCaptureSeconds ?? body.default_capture_seconds ?? body.captureSeconds ?? body.capture_seconds, 300),
    defaultRewardAmount: toInt(body.defaultRewardAmount ?? body.default_reward_amount ?? body.rewardAmount ?? body.reward_amount, 0),
    minPlayersToCapture: toInt(body.minPlayersToCapture ?? body.min_players_to_capture ?? body.minPlayers ?? body.min_players, 1),
    tickSeconds: toInt(body.tickSeconds ?? body.tick_seconds ?? body.checkIntervalSeconds ?? body.check_interval_seconds, 30),
  };
}

export function zoneFromBody(body = {}) {
  return {
    name: String(body.name ?? body.title ?? '').trim(),
    description: String(body.description ?? body.note ?? '').trim(),
    centerX: toFloat(body.centerX ?? body.center_x ?? body.x ?? body.posX ?? body.pos_x, 0),
    centerZ: toFloat(body.centerZ ?? body.center_z ?? body.z ?? body.y ?? body.posZ ?? body.pos_z, 0),
    radius: toFloat(body.radius ?? body.captureRadius ?? body.capture_radius, 150),
    captureSeconds: toInt(body.captureSeconds ?? body.capture_seconds ?? body.captureTime ?? body.capture_time, 300),
    rewardAmount: toInt(body.rewardAmount ?? body.reward_amount ?? body.reward ?? body.points, 0),
    color: String(body.color ?? body.mapColor ?? body.map_color ?? '#f59e0b').trim() || '#f59e0b',
    enabled: toBool(body.enabled ?? body.is_enabled ?? body.active, true) ? 1 : 0,
  };
}

function mapSettings(row = {}) {
  return {
    enabled: Boolean(row.enabled),
    announceChannelId: row.announce_channel_id || '',
    announce_channel_id: row.announce_channel_id || '',
    eventLogChannelId: row.event_log_channel_id || '',
    event_log_channel_id: row.event_log_channel_id || '',
    defaultCaptureSeconds: Number(row.default_capture_seconds ?? 300),
    default_capture_seconds: Number(row.default_capture_seconds ?? 300),
    defaultRewardAmount: Number(row.default_reward_amount ?? 0),
    default_reward_amount: Number(row.default_reward_amount ?? 0),
    minPlayersToCapture: Number(row.min_players_to_capture ?? 1),
    min_players_to_capture: Number(row.min_players_to_capture ?? 1),
    tickSeconds: Number(row.tick_seconds ?? 30),
    tick_seconds: Number(row.tick_seconds ?? 30),
  };
}

function mapZone(row = {}) {
  return {
    id: String(row.id),
    name: row.name || '',
    description: row.description || '',
    centerX: Number(row.center_x ?? 0),
    center_x: Number(row.center_x ?? 0),
    centerZ: Number(row.center_z ?? 0),
    center_z: Number(row.center_z ?? 0),
    radius: Number(row.radius ?? 150),
    captureSeconds: Number(row.capture_seconds ?? 300),
    capture_seconds: Number(row.capture_seconds ?? 300),
    rewardAmount: Number(row.reward_amount ?? 0),
    reward_amount: Number(row.reward_amount ?? 0),
    color: row.color || '#f59e0b',
    enabled: Boolean(row.enabled),
    ownerName: row.owner_name || '',
    owner_name: row.owner_name || '',
    lastCapturedAt: row.last_captured_at || '',
    last_captured_at: row.last_captured_at || '',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
  };
}

function mapEvent(row = {}) {
  return {
    id: String(row.id),
    zoneId: row.zone_id ? String(row.zone_id) : '',
    zone_id: row.zone_id ? String(row.zone_id) : '',
    type: row.event_type || 'event',
    event_type: row.event_type || 'event',
    zoneName: row.zone_name || '',
    zone_name: row.zone_name || '',
    playerName: row.player_name || '',
    player_name: row.player_name || '',
    message: row.message || '',
    createdAt: row.created_at || '',
    created_at: row.created_at || '',
  };
}

export async function loadZoneBundle(event) {
  await ensureZoneTables();
  const meta = await resolveGuildFromEvent(event);
  const db = getDb();

  const [[settingsRow]] = await db.execute(
    'SELECT * FROM zone_control_settings WHERE guild_id = ? LIMIT 1',
    [meta.guildId]
  );

  const [zonesRows] = await db.execute(
    'SELECT * FROM zone_control_zones WHERE guild_id = ? ORDER BY enabled DESC, name ASC, id ASC',
    [meta.guildId]
  );

  const [eventsRows] = await db.execute(
    'SELECT * FROM zone_control_events WHERE guild_id = ? ORDER BY created_at DESC, id DESC LIMIT 50',
    [meta.guildId]
  );

  return {
    ok: true,
    guildId: meta.guildId,
    guild_id: meta.guildId,
    slug: meta.slug,
    displayName: meta.displayName,
    display_name: meta.displayName,
    settings: mapSettings(settingsRow || {}),
    zones: zonesRows.map(mapZone),
    events: eventsRows.map(mapEvent),
  };
}

export async function saveZoneSettingsForEvent(event, body = {}) {
  await ensureZoneTables();
  const meta = await resolveGuildFromEvent(event, body);
  const db = getDb();
  const settings = zoneSettingsFromBody(body);

  const values = [
    settings.enabled,
    settings.announceChannelId || null,
    settings.eventLogChannelId || null,
    settings.defaultCaptureSeconds,
    settings.defaultRewardAmount,
    settings.minPlayersToCapture,
    settings.tickSeconds,
    JSON.stringify(body || {}),
  ];

  const [existingRows] = await db.execute(
    'SELECT guild_id FROM zone_control_settings WHERE guild_id = ? LIMIT 1',
    [meta.guildId]
  );

  if (existingRows.length) {
    await db.execute(
      `
        UPDATE zone_control_settings
        SET enabled = ?, announce_channel_id = ?, event_log_channel_id = ?,
            default_capture_seconds = ?, default_reward_amount = ?,
            min_players_to_capture = ?, tick_seconds = ?, settings_json = ?,
            updated_at = NOW()
        WHERE guild_id = ?
      `,
      [...values, meta.guildId]
    );
  } else {
    await db.execute(
      `
        INSERT INTO zone_control_settings (
          enabled, announce_channel_id, event_log_channel_id, default_capture_seconds,
          default_reward_amount, min_players_to_capture, tick_seconds, settings_json, guild_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [...values, meta.guildId]
    );
  }

  const bundle = await loadZoneBundle({ ...event, queryStringParameters: { slug: meta.slug } });
  return bundle;
}

export async function createZoneForEvent(event, body = {}) {
  await ensureZoneTables();
  const meta = await resolveGuildFromEvent(event, body);
  const db = getDb();
  const zone = zoneFromBody(body);
  if (!zone.name) {
    const error = new Error('zone name is required');
    error.statusCode = 400;
    throw error;
  }

  const [result] = await db.execute(
    `
      INSERT INTO zone_control_zones (
        guild_id, name, description, center_x, center_z, radius,
        capture_seconds, reward_amount, color, enabled, meta_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      meta.guildId,
      zone.name,
      zone.description || null,
      zone.centerX,
      zone.centerZ,
      zone.radius,
      zone.captureSeconds,
      zone.rewardAmount,
      zone.color,
      zone.enabled,
      JSON.stringify(body || {}),
    ]
  );

  await db.execute(
    'INSERT INTO zone_control_events (guild_id, zone_id, event_type, zone_name, message, payload_json) VALUES (?, ?, ?, ?, ?, ?)',
    [meta.guildId, result.insertId || null, 'zone_created', zone.name, `Зона «${zone.name}» создана через админ-панель`, JSON.stringify({ source: 'web_admin' })]
  );

  return loadZoneBundle({ ...event, queryStringParameters: { slug: meta.slug } });
}

export async function updateZoneForEvent(event, body = {}) {
  await ensureZoneTables();
  const zoneId = event.queryStringParameters?.id || body.id || body.zoneId || body.zone_id;
  if (!zoneId) {
    const error = new Error('zone id is required');
    error.statusCode = 400;
    throw error;
  }

  const meta = await resolveGuildFromEvent(event, body);
  const db = getDb();
  const zone = zoneFromBody(body);
  if (!zone.name) {
    const error = new Error('zone name is required');
    error.statusCode = 400;
    throw error;
  }

  await db.execute(
    `
      UPDATE zone_control_zones
      SET name = ?, description = ?, center_x = ?, center_z = ?, radius = ?,
          capture_seconds = ?, reward_amount = ?, color = ?, enabled = ?,
          meta_json = ?, updated_at = NOW()
      WHERE id = ? AND guild_id = ?
    `,
    [
      zone.name,
      zone.description || null,
      zone.centerX,
      zone.centerZ,
      zone.radius,
      zone.captureSeconds,
      zone.rewardAmount,
      zone.color,
      zone.enabled,
      JSON.stringify(body || {}),
      String(zoneId),
      meta.guildId,
    ]
  );

  await db.execute(
    'INSERT INTO zone_control_events (guild_id, zone_id, event_type, zone_name, message, payload_json) VALUES (?, ?, ?, ?, ?, ?)',
    [meta.guildId, String(zoneId), 'zone_updated', zone.name, `Зона «${zone.name}» обновлена через админ-панель`, JSON.stringify({ source: 'web_admin' })]
  );

  return loadZoneBundle({ ...event, queryStringParameters: { slug: meta.slug } });
}

export async function deleteZoneForEvent(event, body = {}) {
  await ensureZoneTables();
  const zoneId = event.queryStringParameters?.id || body.id || body.zoneId || body.zone_id;
  if (!zoneId) {
    const error = new Error('zone id is required');
    error.statusCode = 400;
    throw error;
  }

  const meta = await resolveGuildFromEvent(event, body);
  const db = getDb();
  const [[zoneRow]] = await db.execute('SELECT name FROM zone_control_zones WHERE id = ? AND guild_id = ? LIMIT 1', [String(zoneId), meta.guildId]);
  await db.execute('DELETE FROM zone_control_zones WHERE id = ? AND guild_id = ?', [String(zoneId), meta.guildId]);
  await db.execute(
    'INSERT INTO zone_control_events (guild_id, zone_id, event_type, zone_name, message, payload_json) VALUES (?, ?, ?, ?, ?, ?)',
    [meta.guildId, String(zoneId), 'zone_deleted', zoneRow?.name || '', `Зона «${zoneRow?.name || zoneId}» удалена через админ-панель`, JSON.stringify({ source: 'web_admin' })]
  );

  return loadZoneBundle({ ...event, queryStringParameters: { slug: meta.slug } });
}
