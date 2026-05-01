import { ok, badRequest, unauthorized, serverError } from './_shared/response.js';
import { getSessionFromEvent } from './_shared/session.js';
import { resolveGuildBySlug } from './_shared/access.js';
import { getDb } from './_shared/db.js';
import { loadEconomySettings, loadPlayerLink, publicEconomyPayload } from './_shared/economy-db.js';

export const handler = async (event) => {
  try {
    const session = getSessionFromEvent(event);
    if (!session?.user) return unauthorized('Not logged in');

    const slug = event.queryStringParameters?.slug;
    if (!slug) return badRequest('slug is required');

    const guild = await resolveGuildBySlug(slug);
    if (!guild) return badRequest('guild not found');

    const link = await loadPlayerLink(guild.guild_id, session.user.id);
    if (!link) return badRequest('link required');

    const db = getDb();
    const [rows] = await db.execute(
      `
        SELECT
          o.id,
          o.total_amount,
          o.currency_name_snapshot,
          o.status,
          o.created_at,
          GROUP_CONCAT(oi.item_name_snapshot ORDER BY oi.id SEPARATOR ', ') AS item_names
        FROM shop_orders o
        LEFT JOIN shop_order_items oi ON oi.order_id = o.id
        WHERE o.guild_id = ? AND o.discord_user_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 100
      `,
      [String(guild.guild_id), String(session.user.id)]
    );

    const economy = await loadEconomySettings(guild.guild_id);
    return ok({
      ok: true,
      guildId: String(guild.guild_id),
      ...publicEconomyPayload(economy),
      orders: rows.map((row) => ({
        id: String(row.id),
        itemName: row.item_names || 'Заказ',
        item_name: row.item_names || 'Заказ',
        pricePaid: Number(row.total_amount || 0),
        price_paid: Number(row.total_amount || 0),
        currencyName: row.currency_name_snapshot || economy.currencyName,
        status: row.status || 'pending',
        createdAt: row.created_at,
        created_at: row.created_at,
      })),
    });
  } catch (error) {
    console.error('player-orders error:', error);
    return serverError(error.message || 'Failed to load orders');
  }
};
