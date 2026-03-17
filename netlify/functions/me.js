const { getSession } = require("./_lib/session");
const { ok, unauthorized, serverError } = require("./_lib/response");
const { isSuperAdmin } = require("./_lib/admin");

exports.handler = async (event) => {
  try {
    const session = await getSession(event);
    if (!session) {
      return unauthorized("Not logged in");
    }

    return ok({
      ok: true,
      user: {
        ...session.user,
        isSuperAdmin: isSuperAdmin(session.user.id)
      }
    });
  } catch (error) {
    console.error("me error:", error);
    return serverError();
  }
};
