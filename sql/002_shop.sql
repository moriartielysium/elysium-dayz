CREATE TABLE IF NOT EXISTS shop_categories (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  guild_id BIGINT NOT NULL,
  parent_id BIGINT NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description TEXT NULL,
  image_asset_id BIGINT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_shop_categories_guild_slug (guild_id, slug)
);

CREATE TABLE IF NOT EXISTS shop_items (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  guild_id BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL,
  item_code VARCHAR(150) NULL,
  description TEXT NULL,
  price INT NOT NULL,
  currency_type VARCHAR(30) NOT NULL DEFAULT 'wallet',
  image_asset_id BIGINT NULL,
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  fulfillment_mode VARCHAR(30) NOT NULL DEFAULT 'manual',
  stock_mode VARCHAR(30) NOT NULL DEFAULT 'unlimited',
  stock_qty INT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_shop_items_guild_slug (guild_id, slug)
);

CREATE TABLE IF NOT EXISTS shop_orders (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  guild_id BIGINT NOT NULL,
  discord_user_id BIGINT NOT NULL,
  player_id BIGINT NOT NULL,
  wallet_transaction_id BIGINT NULL,
  refund_transaction_id BIGINT NULL,
  total_amount INT NOT NULL,
  currency_name_snapshot VARCHAR(50) NOT NULL,
  status VARCHAR(40) NOT NULL,
  failure_reason TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shop_order_items (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  item_id BIGINT NOT NULL,
  item_name_snapshot VARCHAR(150) NOT NULL,
  item_code_snapshot VARCHAR(150) NULL,
  price_snapshot INT NOT NULL,
  quantity INT NOT NULL,
  line_total INT NOT NULL,
  fulfillment_status VARCHAR(40) NOT NULL DEFAULT 'pending',
  meta_json JSON NULL
);

CREATE TABLE IF NOT EXISTS shop_order_events (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  actor_discord_user_id BIGINT NULL,
  payload_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
