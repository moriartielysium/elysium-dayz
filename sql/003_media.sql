CREATE TABLE IF NOT EXISTS media_assets (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  guild_id BIGINT NULL,
  owner_type VARCHAR(50) NOT NULL,
  owner_id BIGINT NULL,
  storage_provider VARCHAR(50) NOT NULL,
  storage_key VARCHAR(255) NOT NULL,
  public_url TEXT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT NULL,
  width INT NULL,
  height INT NULL,
  uploaded_by BIGINT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
