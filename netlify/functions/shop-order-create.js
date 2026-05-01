import { badRequest, unauthorized, ok, serverError } from './_shared/response.js';
import { getSessionFromEvent } from './_shared/session.js';
import { resolveGuildBySlug } from './_shared/access.js';
import { parseJsonBody } from './_shared/validation.js';
import { getDb } from './_shared/db.js';
import { loadEconomySettings, loadLinkedPlayer, normalizeCurrencyName } from './_shared/economy-db.js';

function normalizeCartItems(body = {}) {
  if (Array.isArray(body.items)) {
    return body.items
      .map((item) => ({ id: String(item.id || item.itemId || item.item_id || '').trim(), quantity: Math.max(1, Math.trunc(Number(item.quantity || 1))) }))
      .filter((item) => item.id);
  }
  const one = String(body.itemId || body.item_id || body.id || '').trim();
  return one ? [{ id: one, quantity: 1 }] : [];
}

export const handler = async (event) => {
  let connection;
  try {
    if (event.httpMethod !== 'POST') return badRequest('POST only');

    const session = getSessionFromEvent(event);
    if (!session?.user) return unauthorized('Not logged in');

    const body = parseJsonBody(event);
    if (!body) return badRequest('Invalid JSON body');

    const slug = event.queryStringParameters?.slug || body.slug;
    if (!slug) return badRequest('slug is required');

    const guild = await resolveGuildBySlug(slug);
    if (!guild) return badRequest('guild not found');

    const { link, player } = await loadLinkedPlayer(guild.guild_id, session.user.id);
    if (!link) return badRequest('link required');
    if (!player?.player_id) return badRequest('player not found in bot database yet');

    const cart = normalizeCartItems(body);
    if (!cart.length) return badRequest('items are required');

    const ids = [...new Set(cart.map((item) => item.id))];
    const quantities = new Map(cart.map((item) => [item.id, item.quantity]));
    const placeholders = ids.map(() => '?').join(',');

    const db = getDb();
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [itemRows] = await connection.execute(
      `
        SELECT id, name, item_code, price, stock_mode, stock_qty
        FROM shop_items
        WHERE guild_id = ?
          AND id IN (${placeholders})
          AND is_enabled = 1
          AND is_visible = 1
        FOR UPDATE
      `,
      [String(guild.guild_id), ...ids]
    );

    if (itemRows.length !== ids.length) {
      await connection.rollback();
      return badRequest('some shop items were not found');
    }

    const orderItems = itemRows.map((item) => {
      const quantity = quantities.get(String(item.id)) || 1;
      const price = Number(item.price || 0);
      return {
        id: String(item.id),
        name: item.name,
        itemCode: item.item_code || null,
        price,
        quantity,
        lineTotal: price * quantity,
        stockMode: item.stock_mode || 'unlimited',
        stockQty: item.stock_qty === null || item.stock_qty === undefined ? null : Number(item.stock_qty),
      };
    });

    for (const item of orderItems) {
      if (item.stockMode === 'limited' && item.stockQty !== null && item.stockQty < item.quantity) {
        await connection.rollback();
        return badRequest(`not enough stock for ${item.name}`);
      }
    }

    const total = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    if (total <= 0) {
      await connection.rollback();
      return badRequest('order total must be greater than zero');
    }

    const [walletRows] = await connection.execute(
      `
        SELECT id, balance
        FROM player_wallets
        WHERE guild_id = ? AND discord_user_id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [String(guild.guild_id), String(session.user.id)]
    );

    let walletId = walletRows[0]?.id || null;
    let balance = Math.max(0, Number(walletRows[0]?.balance || 0));

    if (!walletId) {
      const [insertWallet] = await connection.execute(
        `INSERT INTO player_wallets (guild_id, discord_user_id, balance) VALUES (?, ?, 0)`,
        [String(guild.guild_id), String(session.user.id)]
      );
      walletId = insertWallet.insertId;
      balance = 0;
    }

    if (balance < total) {
      await connection.rollback();
      return badRequest('not enough balance');
    }

    const balanceAfter = balance - total;
    await connection.execute(
      `UPDATE player_wallets SET balance = ?, updated_at = NOW() WHERE id = ?`,
      [balanceAfter, walletId]
    );

    const [txResult] = await connection.execute(
      `
        INSERT INTO player_wallet_transactions
          (guild_id, discord_user_id, amount, balance_after, transaction_type, description, meta_json)
        VALUES (?, ?, ?, ?, 'shop_purchase', ?, ?)
      `,
      [
        String(guild.guild_id),
        String(session.user.id),
        -total,
        balanceAfter,
        'Покупка в магазине сайта',
        JSON.stringify({ source: 'website', slug, items: orderItems.map((item) => ({ id: item.id, quantity: item.quantity })) }),
      ]
    );

    const economy = await loadEconomySettings(guild.guild_id);
    const currencyName = normalizeCurrencyName(economy.currencyName);

    const [orderResult] = await connection.execute(
      `
        INSERT INTO shop_orders
          (guild_id, discord_user_id, player_id, wallet_transaction_id, total_amount, currency_name_snapshot, status)
        VALUES (?, ?, ?, ?, ?, ?, 'paid')
      `,
      [String(guild.guild_id), String(session.user.id), String(player.player_id), txResult.insertId, total, currencyName]
    );

    const orderId = orderResult.insertId;
    for (const item of orderItems) {
      await connection.execute(
        `
          INSERT INTO shop_order_items
            (order_id, item_id, item_name_snapshot, item_code_snapshot, price_snapshot, quantity, line_total, fulfillment_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        `,
        [orderId, item.id, item.name, item.itemCode, item.price, item.quantity, item.lineTotal]
      );

      if (item.stockMode === 'limited') {
        await connection.execute(
          `UPDATE shop_items SET stock_qty = GREATEST(COALESCE(stock_qty, 0) - ?, 0) WHERE id = ?`,
          [item.quantity, item.id]
        );
      }
    }

    await connection.execute(
      `
        INSERT INTO shop_order_events (order_id, event_type, actor_discord_user_id, payload_json)
        VALUES (?, 'created_from_website', ?, ?)
      `,
      [orderId, String(session.user.id), JSON.stringify({ total, currencyName })]
    );

    await connection.commit();

    return ok({
      ok: true,
      guildId: String(guild.guild_id),
      orderId: String(orderId),
      total,
      currencyName,
      balanceAfter,
      status: 'paid',
    });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => null);
    console.error('shop-order-create error:', error);
    return serverError(error.message || 'Failed to create order');
  } finally {
    if (connection) connection.release();
  }
};
