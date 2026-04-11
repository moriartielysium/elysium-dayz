import { ok, badRequest, unauthorized } from "./_shared/response.js";
import { getSessionFromEvent } from "./_shared/session.js";
import { resolveGuildBySlug, hasPlayerLink, isGuildAdmin, isSuperAdmin } from "./_shared/access.js";

export const handler = async (event) => {
  const slug = event.queryStringParameters?.slug;
  if (!slug) return badRequest("slug is required");

  const session = getSessionFromEvent(event);
  if (!session?.user) return unauthorized("Not logged in");

  const guild = await resolveGuildBySlug(slug);
  if (!guild) return badRequest("guild not found");

  const linked = await hasPlayerLink(guild.guild_id, session.user.id);
  const superAdmin = isSuperAdmin(session.user.id);
  const guildAdmin = await isGuildAdmin(guild.guild_id, session.user.id);

  return ok({
    ok: true,
    guildId: String(guild.guild_id),
    isLinked: linked,
    isSuperAdmin: superAdmin,
    isGuildAdmin: guildAdmin,
    canUsePlayerZone: linked,
    canUseAdminZone: superAdmin || guildAdmin
  });
};
