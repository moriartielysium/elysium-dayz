import { ok, badRequest, serverError } from './_shared/response.js';
import { resolveGuildBySlug } from './_shared/access.js';
import { getDb } from './_shared/db.js';
import { loadEconomySettings, publicEconomyPayload } from './_shared/economy-db.js';

export const handler = async (event) => {
  try {
    const slug = event.queryStringParameters?.slug;
    const id = event.queryStringParameters?.id;
    if (!slug) return badRequest('slug is required');
    if (!id) return badRequest('id is required');

    const guild = await resolveGuildBySlug(slug);
    if (!guild) return badRequest('guild not found');

    const db = getDb();
    const [rows] = await db.execute(
      `
        SELECT i.*, c.name AS category_name, m.public_url AS image_url
        FROM shop_items i
        LEFT JOIN shop_categories c ON c.id = i.category_id
        LEFT JOIN media_assets m ON m.id = i.image_asset_id AND m.is_active = 1
        WHERE i.guild_id = ? AND i.id = ?
        LIMIT 1
      `,
      [String(guild.guild_id), String(id)]
    );

    if (!rows[0]) return badRequest('item not found');
    const economy = await loadEconomySettings(guild.guild_id);
    const row = rows[0];

    return ok({
      ok: true,
      guildId: String(guild.guild_id),
      ...publicEconomyPayload(economy),
      item: {
        id: String(row.id),
        categoryId: row.category_id ? String(row.category_id) : null,
        name: row.name,
        slug: row.slug,
        itemCode: row.item_code || '',
        description: row.description || '',
        price: Number(row.price || 0),
        currencyName: economy.currencyName,
        image: row.image_url || '',
        imageUrl: row.image_url || '',
        categoryName: row.category_name || '',
      },
    });
  } catch (error) {
    console.error('shop-item-details error:', error);
    return serverError(error.message || 'Failed to load item');
  }
};
