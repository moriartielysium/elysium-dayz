import { getDb } from './db.js';

export const DEFAULT_CURRENCY_NAME = '$';

export function normalizeCurrencyName(value) {
  const text = String(value ?? '').trim();
  return text || DEFAULT_CURRENCY_NAME;
}

export async function ensureEconomyTables() {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS guild_economy_settings (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      guild_id BIGINT NOT NULL,
      kill_reward INT NOT NULL DEFAULT 0,
      playtime_reward INT NOT NULL DEFAULT 500,
      currency_name VARCHAR(50) NOT NULL DEFAULT '$',
      economy_log_channel_id BIGINT NULL,
      link_channel_id BIGINT NULL,
      status_channel_id BIGINT NULL,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_guild_economy_settings_guild_id (guild_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS player_wallets (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      guild_id BIGINT NOT NULL,
      discord_user_id BIGINT NOT NULL,
      balance INT NOT NULL DEFAULT 0,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_player_wallets_guild_user (guild_id, discord_user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS player_wallet_transactions (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      guild_id BIGINT NOT NULL,
      discord_user_id BIGINT NOT NULL,
      amount INT NOT NULL,
      balance_after INT NOT NULL,
      transaction_type VARCHAR(50) NOT NULL,
      description TEXT NULL,
      meta_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_wallet_tx_guild_user_created (guild_id, discord_user_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export function mapEconomyRow(row = {}) {
  return {
    currencyName: normalizeCurrencyName(row.currency_name),
    playtimeReward: Number(row.playtime_reward ?? 500),
    killReward: Number(row.kill_reward ?? 0),
    statusChannelId: row.status_channel_id ? String(row.status_channel_id) : '',
    linkChannelId: row.link_channel_id ? String(row.link_channel_id) : '',
    economyLogChannelId: row.economy_log_channel_id ? String(row.economy_log_channel_id) : '',
  };
}

export async function loadEconomySettings(guildId) {
  await ensureEconomyTables();
  const db = getDb();
  const [rows] = await db.execute(
    `
      SELECT currency_name, playtime_reward, kill_reward, status_channel_id, link_channel_id, economy_log_channel_id
      FROM guild_economy_settings
      WHERE guild_id = ?
      LIMIT 1
    `,
    [String(guildId)]
  );

  if (rows[0]) return mapEconomyRow(rows[0]);

  await db.execute(
    `
      INSERT INTO guild_economy_settings (guild_id, currency_name, playtime_reward, kill_reward)
      VALUES (?, ?, 500, 0)
      ON DUPLICATE KEY UPDATE guild_id = VALUES(guild_id)
    `,
    [String(guildId), DEFAULT_CURRENCY_NAME]
  );

  return {
    currencyName: DEFAULT_CURRENCY_NAME,
    playtimeReward: 500,
    killReward: 0,
    statusChannelId: '',
    linkChannelId: '',
    economyLogChannelId: '',
  };
}

export async function saveEconomySettings(guildId, patch = {}) {
  await ensureEconomyTables();
  const current = await loadEconomySettings(guildId);
  const next = {
    currencyName: normalizeCurrencyName(patch.currencyName ?? current.currencyName),
    playtimeReward: Number.isFinite(Number(patch.playtimeReward)) ? Math.trunc(Number(patch.playtimeReward)) : current.playtimeReward,
    killReward: Number.isFinite(Number(patch.killReward)) ? Math.trunc(Number(patch.killReward)) : current.killReward,
    statusChannelId: patch.statusChannelId ?? current.statusChannelId,
    linkChannelId: patch.linkChannelId ?? current.linkChannelId,
    economyLogChannelId: patch.economyLogChannelId ?? current.economyLogChannelId,
  };

  const nullableId = (value) => {
    const text = String(value ?? '').trim();
    return text ? text : null;
  };

  const db = getDb();
  const [existingRows] = await db.execute(
    'SELECT id FROM guild_economy_settings WHERE guild_id = ? ORDER BY id ASC LIMIT 1',
    [String(guildId)]
  );

  const params = [
    next.currencyName,
    next.playtimeReward,
    next.killReward,
    nullableId(next.statusChannelId),
    nullableId(next.linkChannelId),
    nullableId(next.economyLogChannelId),
  ];

  if (existingRows[0]?.id) {
    await db.execute(
      `
        UPDATE guild_economy_settings
        SET currency_name = ?,
            playtime_reward = ?,
            kill_reward = ?,
            status_channel_id = ?,
            link_channel_id = ?,
            economy_log_channel_id = ?,
            updated_at = NOW()
        WHERE id = ?
      `,
      [...params, String(existingRows[0].id)]
    );
  } else {
    await db.execute(
      `
        INSERT INTO guild_economy_settings (
          guild_id, currency_name, playtime_reward, kill_reward,
          status_channel_id, link_channel_id, economy_log_channel_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [String(guildId), ...params]
    );
  }

  return next;
}

export async function loadWallet(guildId, discordUserId) {
  await ensureEconomyTables();
  const db = getDb();
  const [rows] = await db.execute(
    `
      SELECT id, balance, updated_at
      FROM player_wallets
      WHERE guild_id = ? AND discord_user_id = ?
      LIMIT 1
    `,
    [String(guildId), String(discordUserId)]
  );

  if (!rows[0]) {
    return { id: null, balance: 0, updatedAt: null };
  }

  return {
    id: rows[0].id ? String(rows[0].id) : null,
    balance: Math.max(0, Number(rows[0].balance || 0)),
    updatedAt: rows[0].updated_at || null,
  };
}

export async function loadPlayerLink(guildId, discordUserId) {
  const db = getDb();
  const [rows] = await db.execute(
    `
      SELECT id, psn_name, normalized_psn_name, created_at
      FROM player_links
      WHERE guild_id = ? AND discord_user_id = ?
      LIMIT 1
    `,
    [String(guildId), String(discordUserId)]
  );

  return rows[0] || null;
}

export async function loadLinkedPlayer(guildId, discordUserId) {
  const link = await loadPlayerLink(guildId, discordUserId);
  if (!link) return { link: null, player: null };

  const db = getDb();
  const [rows] = await db.execute(
    `
      SELECT player_id, nitrado_name, nitrado_account, created_at
      FROM players
      WHERE guild_id = ?
        AND LOWER(TRIM(nitrado_name)) = LOWER(TRIM(?))
      LIMIT 1
    `,
    [String(guildId), link.psn_name]
  );

  return { link, player: rows[0] || null };
}

export function publicEconomyPayload(settings) {
  return {
    currencyName: normalizeCurrencyName(settings?.currencyName),
    currency: normalizeCurrencyName(settings?.currencyName),
  };
}
