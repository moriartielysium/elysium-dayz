import { ok, unauthorized, serverError } from "./_shared/response.js";
import { getSessionFromEvent } from "./_shared/session.js";
import { isSuperAdmin } from "./_shared/access.js";
import { getDb } from "./_shared/db.js";

export const handler = async (event) => {
  try {
    const session = getSessionFromEvent(event);
    if (!session?.user) {
      return unauthorized("Not logged in");
    }

    const superAdmin = isSuperAdmin(session.user.id);
    const db = getDb();
    let availableGuilds = [];

    if (superAdmin) {
      const [rows] = await db.execute(
        `
          SELECT guild_id, slug, display_name, short_description
          FROM web_guild_settings
          WHERE site_enabled = 1
          ORDER BY display_name ASC
        `
      );
      availableGuilds = rows;
    } else {
      const sessionGuildIds = (session.guilds || []).map((guild) => String(guild.id));
      if (sessionGuildIds.length) {
        const placeholders = sessionGuildIds.map(() => "?").join(",");
        const [rows] = await db.execute(
          `
            SELECT guild_id, slug, display_name, short_description
            FROM web_guild_settings
            WHERE site_enabled = 1
              AND guild_id IN (${placeholders})
            ORDER BY display_name ASC
          `,
          sessionGuildIds
        );
        availableGuilds = rows;
      }
    }

    return ok({
      ok: true,
      user: session.user,
      guilds: session.guilds || [],
      isSuperAdmin: superAdmin,
      availableGuilds: availableGuilds.map((row) => ({
        guildId: String(row.guild_id),
        slug: row.slug,
        displayName: row.display_name,
        shortDescription: row.short_description || ""
      }))
    });
  } catch (error) {
    console.error("me error:", error);
    return serverError(error.message || "Failed to load current user");
  }
};
