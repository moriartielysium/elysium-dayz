const { buildAuthorizeUrl } = require("./_lib/discord");
const { redirect } = require("./_lib/response");
const { createStateCookie, generateId } = require("./_lib/session");
exports.handler = async () => {
  try {
    const state = generateId(16);
    return redirect(buildAuthorizeUrl(state), [createStateCookie(state)]);
  } catch (error) {
    console.error("auth-login error:", error);
    return { statusCode: 500, body: "Login failed" };
  }
};
