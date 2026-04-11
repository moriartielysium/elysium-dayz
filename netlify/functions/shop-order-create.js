import { badRequest, unauthorized, ok, serverError } from "./_shared/response.js";
import { getSessionFromEvent } from "./_shared/session.js";
import { resolveGuildBySlug, hasPlayerLink } from "./_shared/access.js";
import { parseJsonBody } from "./_shared/validation.js";

/**
 * TODO:
 * Полноценная логика:
 * 1. получить guild по slug
 * 2. проверить session
 * 3. проверить /link
 * 4. найти player_id
 * 5. загрузить товары
 * 6. посчитать сумму
 * 7. проверить баланс в player_wallets
 * 8. списать валюту
 * 9. создать shop_orders
 * 10. создать shop_order_items
 * 11. записать shop_order_events
 */
export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") return badRequest("POST only");

    const session = getSessionFromEvent(event);
    if (!session?.user) return unauthorized("Not logged in");

    const slug = event.queryStringParameters?.slug;
    if (!slug) return badRequest("slug is required");

    const guild = await resolveGuildBySlug(slug);
    if (!guild) return badRequest("guild not found");

    const linked = await hasPlayerLink(guild.guild_id, session.user.id);
    if (!linked) return badRequest("link required");

    const body = parseJsonBody(event);
    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return badRequest("items are required");
    }

    return ok({
      ok: true,
      guildId: String(guild.guild_id),
      message: "shop-order-create skeleton ready",
      nextStep: "implement balance debit + order insert flow"
    });
  } catch (error) {
    console.error("shop-order-create error:", error);
    return serverError();
  }
};
