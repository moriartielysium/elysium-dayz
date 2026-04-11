import { ok, badRequest, unauthorized, forbidden, serverError } from "./_shared/response.js";
import { getSessionFromEvent } from "./_shared/session.js";
import {
  resolveGuildBySlug,
  hasPlayerLink,
  isGuildAdmin,
  isSuperAdmin
} from "./_shared/access.js";

export const handler = async (event) => {
  try {
    const slug = event.queryStringParameters?.slug;
    if (!slug) return badRequest("slug is required");

    const session = getSessionFromEvent(event);
    if (!session?.user) return unauthorized("Not logged in");

    const guild = await resolveGuildBySlug(slug);
    if (!guild) return badRequest("guild not found");
    if (!guild.site_enabled) return forbidden("guild site is disabled");

    const superAdmin = isSuperAdmin(session.user.id);
    const sessionGuildIds = new Set((session.guilds || []).map((entry) => String(entry.id)));
    const inGuild = sessionGuildIds.has(String(guild.guild_id));

    if (!superAdmin && !inGuild) {
      return forbidden("You do not have access to this guild");
    }

    const linked = await hasPlayerLink(guild.guild_id, session.user.id);
    const guildAdmin = await isGuildAdmin(guild.guild_id, session.user.id);

    return ok({
      ok: true,
      guildId: String(guild.guild_id),
      slug: guild.slug,
      displayName: guild.display_name,
      inGuild: superAdmin ? true : inGuild,
      isLinked: linked,
      isSuperAdmin: superAdmin,
      isGuildAdmin: guildAdmin,
      canUsePlayerZone: linked,
      canUseAdminZone: superAdmin || guildAdmin
    });
  } catch (error) {
    console.error("guild-access error:", error);
    return serverError(error.message || "Failed to check guild access");
  }
};
