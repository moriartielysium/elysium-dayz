const { getSession, updateSession } = require("./_lib/session");
const { getUserGuilds } = require("./_lib/discord");
const { ok, badRequest, unauthorized, forbidden, serverError } = require("./_lib/response");
const { hasManageAccess } = require("./_lib/permissions");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return badRequest("POST required");
    }

    const session = await getSession(event);
    if (!session) {
      return unauthorized("Not logged in");
    }

    if (!session.accessToken) {
      return unauthorized("Missing Discord access token");
    }

    const body = JSON.parse(event.body || "{}");
    const guildId = body.guildId;

    if (!guildId) {
      return badRequest("Missing guildId");
    }

    const userGuilds = await getUserGuilds(session.accessToken);
    const guild = userGuilds.find((g) => g.id === guildId);

    if (!guild) {
      return forbidden("You do not have access to this guild");
    }

    if (!hasManageAccess(guild.permissions)) {
      return forbidden("You do not have Manage Server permission");
    }

    const nextSettings = {
      logChannelId: String(body.logChannelId || "").trim(),
      adminRoleId: String(body.adminRoleId || "").trim(),
      language: String(body.language || "ru").trim() || "ru",
      notificationsEnabled: Boolean(body.notificationsEnabled),
      nitradoServiceId: String(body.nitradoServiceId || "").trim(),
      nitradoServerName: String(body.nitradoServerName || "").trim(),
      setupCompleted: Boolean(body.setupCompleted)
    };

    const guildSettings = {
      ...(session.guildSettings || {}),
      [guildId]: nextSettings
    };

    const setCookie = updateSession(session, { guildSettings });

    return ok(
      {
        ok: true,
        message: "Settings saved",
        settings: nextSettings
      },
      { "Set-Cookie": setCookie }
    );
  } catch (error) {
    console.error("guild-settings-save error:", error);
    return serverError(error.message);
  }
};
