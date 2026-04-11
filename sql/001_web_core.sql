CREATE TABLE IF NOT EXISTS web_super_admins (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  discord_user_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  added_by BIGINT NULL,
  note VARCHAR(255) NULL,
  UNIQUE KEY uq_web_super_admins_discord_user_id (discord_user_id)
);

CREATE TABLE IF NOT EXISTS web_guild_admins (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  guild_id BIGINT NOT NULL,
  discord_user_id BIGINT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  added_by BIGINT NULL,
  UNIQUE KEY uq_web_guild_admins_guild_user (guild_id, discord_user_id)
);

CREATE TABLE IF NOT EXISTS web_guild_settings (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  guild_id BIGINT NOT NULL,
  slug VARCHAR(100) NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  short_description TEXT NULL,
  site_enabled TINYINT(1) NOT NULL DEFAULT 1,
  public_clans_enabled TINYINT(1) NOT NULL DEFAULT 1,
  public_shop_enabled TINYINT(1) NOT NULL DEFAULT 1,
  theme_variant VARCHAR(50) NOT NULL DEFAULT 'dark',
  logo_asset_id BIGINT NULL,
  banner_asset_id BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_web_guild_settings_guild_id (guild_id),
  UNIQUE KEY uq_web_guild_settings_slug (slug)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  guild_id BIGINT NULL,
  actor_discord_user_id BIGINT NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id BIGINT NULL,
  payload_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO web_super_admins (discord_user_id, note)
VALUES (1176837882141474833, 'Owner');
