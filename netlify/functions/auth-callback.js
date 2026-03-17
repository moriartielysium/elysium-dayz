const { exchangeCodeForToken, getCurrentUser } = require("./_lib/discord");
const { redirect } = require("./_lib/response");
const { createSession, getStateFromCookies } = require("./_lib/session");
const { getConfig } = require("./_lib/env");

const config = getConfig();

exports.handler = async (event) => {
  try {
    const params = new URLSearchParams(event.queryStringParameters || {});
    const code = params.get("code");
    const state = params.get("state");

    const savedState = getStateFromCookies(event);

    if (!code || !state || !savedState || state !== savedState) {
      return redirect(`${config.siteUrl}/?error=oauth_state`);
    }

    const tokenData = await exchangeCodeForToken(code);
    const user = await getCurrentUser(tokenData.access_token);

    const sessionCookie = await createSession(user, tokenData);

    return redirect(`${config.siteUrl}/dashboard.html`, [sessionCookie]);
  } catch (error) {
    console.error("auth-callback error:", error);
    return redirect(`${config.siteUrl}/?error=oauth_callback`);
  }
};
