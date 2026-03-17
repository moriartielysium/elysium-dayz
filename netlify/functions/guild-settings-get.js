const { getSession } = require("./_lib/session");
const { getUserGuilds } = require("./_lib/discord");
const { ok, badRequest, unauthorized, forbidden, serverError } = require("./_lib/response");
const { hasManageAccess } = require("./_lib/permissions");

exports.handler = async (event) => {
  try {
    const session = await getSession(event);
    if (!session) {
      return unauthorized("Not logged in");
    }

    const guildId = event.queryStringParameters?.id;
    if (!guildId) {
      return badRequest("Missing guild id");
    }

    if (!session.accessToken) {
      return unauthorized("Missing Discord access token");
    }

    const userGuilds = await getUserGuilds(session.accessToken);
    const guild = userGuilds.find((g) => g.id === guildId);

    if (!guild) {
      return forbidden("You do not have access to this guild");
    }

    if (!hasManageAccess(guild.permissions)) {
      return forbidden("You do not have Manage Server permission");
    }

    const settings = session.guildSettings?.[guildId] || {
      logChannelId: "",
      adminRoleId: "",
      language: "ru",
      notificationsEnabled: true,
      nitradoServiceId: "",
      nitradoServerName: "",
      setupCompleted: false
    };

    return ok({
      ok: true,
      guild: {
        id: guild.id,
        name: guild.name,
        icon: guild.icon
      },
      settings
    });
  } catch (error) {
    console.error("guild-settings-get error:", error);
    return serverError(error.message);
  }
};
