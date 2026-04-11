CREATE INDEX idx_audit_logs_guild_created_at
  ON audit_logs (guild_id, created_at);

CREATE INDEX idx_shop_categories_guild_enabled
  ON shop_categories (guild_id, is_enabled, sort_order);

CREATE INDEX idx_shop_items_guild_category_visible
  ON shop_items (guild_id, category_id, is_visible, is_enabled, sort_order);

CREATE INDEX idx_shop_orders_guild_user_created
  ON shop_orders (guild_id, discord_user_id, created_at);

CREATE INDEX idx_shop_orders_guild_status_created
  ON shop_orders (guild_id, status, created_at);

CREATE INDEX idx_shop_order_items_order_id
  ON shop_order_items (order_id);

CREATE INDEX idx_shop_order_events_order_id
  ON shop_order_events (order_id, created_at);

CREATE INDEX idx_media_assets_owner
  ON media_assets (guild_id, owner_type, owner_id);

CREATE INDEX idx_media_assets_storage_key
  ON media_assets (storage_key(191));
