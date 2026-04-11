import { exchangeCodeForToken, fetchDiscordGuilds, fetchDiscordUser } from "./_shared/auth.js";
import {
  buildSessionCookie,
  clearOauthStateCookie,
  getOauthStateFromEvent
} from "./_shared/session.js";
import { serverError, badRequest } from "./_shared/response.js";

export const handler = async (event) => {
  try {
    const code = event.queryStringParameters?.code;
    const state = event.queryStringParameters?.state;
    if (!code) return badRequest("Missing OAuth code");
    if (!state) return badRequest("Missing OAuth state");

    const savedState = getOauthStateFromEvent(event);
    if (!savedState || savedState !== state) {
      return badRequest("OAuth state mismatch");
    }

    const tokenPayload = await exchangeCodeForToken(code);
    const accessToken = tokenPayload?.access_token;
    if (!accessToken) {
      return serverError("Missing Discord access token");
    }

    const [user, guilds] = await Promise.all([
      fetchDiscordUser(accessToken),
      fetchDiscordGuilds(accessToken)
    ]);

    const session = {
      user: {
        id: String(user.id),
        username: user.username,
        global_name: user.global_name || null,
        avatar: user.avatar || null
      },
      guilds: guilds.map((guild) => ({
        id: String(guild.id),
        name: guild.name,
        icon: guild.icon || null,
        owner: Boolean(guild.owner)
      })),
      createdAt: new Date().toISOString()
    };

    return {
      statusCode: 302,
      headers: {
        Location: "/"
      },
      multiValueHeaders: {
        "Set-Cookie": [buildSessionCookie(session), clearOauthStateCookie()]
      },
      body: ""
    };
  } catch (error) {
    console.error("auth-callback error:", error);
    return serverError(error.message || "OAuth callback failed");
  }
};
