const { getSession } = require("./_lib/session");
const { ok, unauthorized, serverError } = require("./_lib/response");
exports.handler = async (event) => {
  try {
    const session = await getSession(event);
    if (!session) return unauthorized("Not logged in");
    return ok({ ok: true, user: session.user });
  } catch (error) {
    console.error("me error:", error);
    return serverError();
  }
};
