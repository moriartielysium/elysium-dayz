const { getSession } = require("./_lib/session");
const { getUserGuilds } = require("./_lib/discord");
const { ok, unauthorized, serverError } = require("./_lib/response");
const { hasManageAccess } = require("./_lib/permissions");
const { isSuperAdmin } = require("./_lib/admin");
const { query } = require("./_lib/db");

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

    const userGuildList = userGuilds
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

    // 👇 если НЕ админ — просто возвращаем его сервера
    if (!superAdmin) {
      return ok({
        ok: true,
        isSuperAdmin: false,
        guilds: userGuildList
      });
    }

    // 👇 если админ — тянем ВСЕ сервера из базы
    const result = await query(`
      select guild_id, guild_name
      from bot_guilds
      order by updated_at desc
    `);

    const botGuilds = result.rows.map((g) => ({
      id: g.guild_id,
      name: g.guild_name || "Unknown Guild",
      icon: null,
      hasBot: true,
      canManage: true,
      source: "bot"
    }));

    // объединяем (чтобы не было дублей)
    const merged = [...botGuilds];

    for (const g of userGuildList) {
      if (!merged.find((x) => x.id === g.id)) {
        merged.push(g);
      }
    }

    return ok({
      ok: true,
      isSuperAdmin: true,
      guilds: merged
    });
  } catch (error) {
    console.error("guilds error:", error);
    return serverError(error.message);
  }
};
