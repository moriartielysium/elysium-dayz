CREATE TABLE IF NOT EXISTS web_admin_settings (
  guild_id VARCHAR(32) NOT NULL PRIMARY KEY,
  slug VARCHAR(100) NOT NULL,
  settings_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_web_admin_settings_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
