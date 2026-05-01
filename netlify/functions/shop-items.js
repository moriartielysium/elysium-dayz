import { ok, badRequest, serverError } from './_shared/response.js';
import { resolveGuildBySlug } from './_shared/access.js';
import { getDb } from './_shared/db.js';
import { loadEconomySettings, publicEconomyPayload } from './_shared/economy-db.js';

export const handler = async (event) => {
  try {
    const slug = event.queryStringParameters?.slug;
    if (!slug) return badRequest('slug is required');

    const guild = await resolveGuildBySlug(slug);
    if (!guild) return badRequest('guild not found');

    const categoryId = event.queryStringParameters?.category_id || event.queryStringParameters?.categoryId || '';
    const params = [String(guild.guild_id)];
    let categoryFilter = '';
    if (categoryId) {
      categoryFilter = 'AND i.category_id = ?';
      params.push(String(categoryId));
    }

    const db = getDb();
    const [rows] = await db.execute(
      `
        SELECT
          i.id, i.category_id, i.name, i.slug, i.item_code, i.description, i.price,
          i.currency_type, i.fulfillment_mode, i.stock_mode, i.stock_qty,
          i.sort_order, c.name AS category_name, m.public_url AS image_url
        FROM shop_items i
        LEFT JOIN shop_categories c ON c.id = i.category_id
        LEFT JOIN media_assets m ON m.id = i.image_asset_id AND m.is_active = 1
        WHERE i.guild_id = ?
          ${categoryFilter}
          AND i.is_enabled = 1
          AND i.is_visible = 1
        ORDER BY i.sort_order ASC, i.name ASC
      `,
      params
    );

    const economy = await loadEconomySettings(guild.guild_id);
    const items = rows.map((row) => ({
      id: String(row.id),
      categoryId: row.category_id ? String(row.category_id) : null,
      category_id: row.category_id ? String(row.category_id) : null,
      categoryName: row.category_name || '',
      name: row.name,
      slug: row.slug,
      itemCode: row.item_code || '',
      item_code: row.item_code || '',
      description: row.description || '',
      price: Number(row.price || 0),
      currencyName: economy.currencyName,
      currency_name: economy.currencyName,
      currencyType: row.currency_type || 'wallet',
      image: row.image_url || '',
      imageUrl: row.image_url || '',
      image_url: row.image_url || '',
      fulfillmentMode: row.fulfillment_mode || 'manual',
      stockMode: row.stock_mode || 'unlimited',
      stockQty: row.stock_qty === null || row.stock_qty === undefined ? null : Number(row.stock_qty),
    }));

    return ok({ ok: true, guildId: String(guild.guild_id), ...publicEconomyPayload(economy), items });
  } catch (error) {
    console.error('shop-items error:', error);
    return serverError(error.message || 'Failed to load shop items');
  }
};
