CREATE TABLE IF NOT EXISTS web_nitrado_accounts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  discord_user_id BIGINT NOT NULL,
  account_label VARCHAR(255) NULL,
  access_token_enc TEXT NOT NULL,
  refresh_token_enc TEXT NULL,
  token_type VARCHAR(50) NULL,
  expires_at DATETIME NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_web_nitrado_accounts_user (discord_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS web_nitrado_services (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nitrado_account_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  service_type VARCHAR(100) NULL,
  server_name VARCHAR(255) NULL,
  details_json JSON NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_synced_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_web_nitrado_services_service (service_id),
  KEY idx_web_nitrado_services_account (nitrado_account_id),
  CONSTRAINT fk_web_nitrado_services_account
    FOREIGN KEY (nitrado_account_id) REFERENCES web_nitrado_accounts(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS web_nitrado_service_bindings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  guild_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 1,
  created_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_web_nitrado_bindings_guild (guild_id),
  UNIQUE KEY uq_web_nitrado_bindings_service (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
