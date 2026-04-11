import { ok, unauthorized, serverError } from "./_shared/response.js";
import { getSessionFromEvent } from "./_shared/session.js";
import { getDb } from "./_shared/db.js";
import { isSuperAdmin } from "./_shared/access.js";

export const handler = async (event) => {
  try {
    const session = getSessionFromEvent(event);
    if (!session?.user) return unauthorized("Not logged in");

    const db = getDb();
    const superAdmin = isSuperAdmin(session.user.id);
    let rows = [];

    if (superAdmin) {
      const [result] = await db.execute(
        `
          SELECT guild_id, slug, display_name, short_description, site_enabled
          FROM web_guild_settings
          WHERE site_enabled = 1
          ORDER BY display_name ASC
        `
      );
      rows = result;
    } else {
      const sessionGuildIds = (session.guilds || []).map((guild) => String(guild.id));
      if (!sessionGuildIds.length) {
        return ok({ ok: true, guilds: [] });
      }

      const placeholders = sessionGuildIds.map(() => "?").join(",");
      const [result] = await db.execute(
        `
          SELECT guild_id, slug, display_name, short_description, site_enabled
          FROM web_guild_settings
          WHERE site_enabled = 1
            AND guild_id IN (${placeholders})
          ORDER BY display_name ASC
        `,
        sessionGuildIds
      );
      rows = result;
    }

    return ok({
      ok: true,
      guilds: rows.map((row) => ({
        guildId: String(row.guild_id),
        slug: row.slug,
        displayName: row.display_name,
        shortDescription: row.short_description || ""
      }))
    });
  } catch (error) {
    console.error("guilds-available error:", error);
    return serverError(error.message || "Failed to load guilds");
  }
};
