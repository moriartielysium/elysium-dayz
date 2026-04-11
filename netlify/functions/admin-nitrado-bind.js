import { getDb } from "./_shared/db.js";
import { getSessionFromEvent } from "./_shared/session.js";
import { badRequest, forbidden, ok, serverError, unauthorized } from "./_shared/response.js";
import { isGuildAdmin, isSuperAdmin, resolveGuildBySlug } from "./_shared/access.js";

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") return badRequest("POST required");

    const session = getSessionFromEvent(event);
    if (!session?.user) return unauthorized("Not logged in");

    const body = event.body ? JSON.parse(event.body) : {};
    const slug = body.slug;
    const serviceId = body.serviceId;
    if (!slug) return badRequest("slug is required");
    if (!serviceId) return badRequest("serviceId is required");

    const guild = await resolveGuildBySlug(slug);
    if (!guild) return badRequest("guild not found");

    const superAdmin = isSuperAdmin(session.user.id);
    const guildAdmin = await isGuildAdmin(guild.guild_id, session.user.id);
    if (!superAdmin && !guildAdmin) {
      return forbidden("Admin access required");
    }

    const db = getDb();
    const [serviceRows] = await db.execute(
      `SELECT service_id FROM web_nitrado_services WHERE service_id = ? LIMIT 1`,
      [String(serviceId)]
    );
    if (!serviceRows.length) return badRequest("service not found");

    await db.execute(
      `DELETE FROM web_nitrado_service_bindings WHERE guild_id = ? OR service_id = ?`,
      [String(guild.guild_id), String(serviceId)]
    );

    await db.execute(
      `
        INSERT INTO web_nitrado_service_bindings (guild_id, service_id, is_primary, created_by)
        VALUES (?, ?, 1, ?)
      `,
      [String(guild.guild_id), String(serviceId), String(session.user.id)]
    );

    return ok({ ok: true, guildId: String(guild.guild_id), serviceId: String(serviceId) });
  } catch (error) {
    console.error("admin-nitrado-bind error:", error);
    return serverError(error.message || "Failed to bind Nitrado service");
  }
};
