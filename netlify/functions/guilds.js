const { getSession } = require("./_lib/session");
const { getUserGuilds } = require("./_lib/discord");
const { ok, unauthorized, serverError } = require("./_lib/response");
const { hasManageAccess } = require("./_lib/permissions");

exports.handler = async (event) => {
  try {
    const session = await getSession(event);
    if (!session) {
      return unauthorized("Not logged in");
    }

    if (!session.accessToken) {
      return unauthorized("Missing Discord access token");
    }

    const userGuilds = await getUserGuilds(session.accessToken);

    const guilds = userGuilds
      .filter((guild) => hasManageAccess(guild.permissions))
      .map((guild) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        hasBot: null,
        canManage: true
      }));

    return ok({
      ok: true,
      guilds
    });
  } catch (error) {
    console.error("guilds error:", error);
    return serverError(error.message);
  }
};
