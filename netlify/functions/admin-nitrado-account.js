import { getDb } from "./_shared/db.js";
import { getSessionFromEvent } from "./_shared/session.js";
import { badRequest, forbidden, serverError, unauthorized, ok } from "./_shared/response.js";
import { isGuildAdmin, isSuperAdmin, resolveGuildBySlug } from "./_shared/access.js";

export const handler = async (event) => {
  try {
    const slug = event.queryStringParameters?.slug;
    if (!slug) return badRequest("slug is required");

    const session = getSessionFromEvent(event);
    if (!session?.user) return unauthorized("Not logged in");

    const guild = await resolveGuildBySlug(slug);
    if (!guild) return badRequest("guild not found");

    const superAdmin = isSuperAdmin(session.user.id);
    const guildAdmin = await isGuildAdmin(guild.guild_id, session.user.id);
    if (!superAdmin && !guildAdmin) {
      return forbidden("Admin access required");
    }

    const db = getDb();
    const [accountRows] = await db.execute(
      `
        SELECT id, discord_user_id, account_label, token_type, expires_at, is_active, created_at, updated_at
        FROM web_nitrado_accounts
        WHERE discord_user_id = ? AND is_active = 1
        LIMIT 1
      `,
      [String(session.user.id)]
    );

    const account = accountRows[0] || null;
    if (!account) {
      return ok({ ok: true, connected: false, account: null, services: [] });
    }

    const [serviceRows] = await db.execute(
      `
        SELECT s.id, s.service_id, s.service_type, s.server_name, s.last_synced_at,
               b.guild_id AS bound_guild_id
        FROM web_nitrado_services s
        LEFT JOIN web_nitrado_service_bindings b
          ON b.service_id = s.service_id
        WHERE s.nitrado_account_id = ?
          AND s.is_active = 1
        ORDER BY s.server_name ASC, s.service_id ASC
      `,
      [account.id]
    );

    return ok({
      ok: true,
      connected: true,
      account: {
        id: account.id,
        discordUserId: String(account.discord_user_id),
        accountLabel: account.account_label,
        tokenType: account.token_type,
        expiresAt: account.expires_at,
        createdAt: account.created_at,
        updatedAt: account.updated_at
      },
      services: serviceRows.map((row) => ({
        id: row.id,
        serviceId: String(row.service_id),
        serviceType: row.service_type,
        serverName: row.server_name,
        lastSyncedAt: row.last_synced_at,
        isBoundToCurrentGuild: String(row.bound_guild_id || "") === String(guild.guild_id),
        boundGuildId: row.bound_guild_id ? String(row.bound_guild_id) : null
      }))
    });
  } catch (error) {
    console.error("admin-nitrado-account error:", error);
    return serverError(error.message || "Failed to load Nitrado account");
  }
};
