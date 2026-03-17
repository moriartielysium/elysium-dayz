const { getSession } = require("./_lib/session");
const { getUserGuilds } = require("./_lib/discord");
const { ok, unauthorized, serverError } = require("./_lib/response");
const { hasManageAccess } = require("./_lib/permissions");
const { isSuperAdmin } = require("./_lib/admin");

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

    let guilds = userGuilds
      .filter((guild) => hasManageAccess(guild.permissions))
      .map((guild) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        hasBot: null,
        canManage: true,
        source: "user"
      }));

    const superAdmin = isSuperAdmin(session.user.id);

    return ok({
      ok: true,
      isSuperAdmin: superAdmin,
      guilds
    });
  } catch (error) {
    console.error("guilds error:", error);
    return serverError(error.message);
  }
};
