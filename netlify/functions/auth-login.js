import crypto from "node:crypto";
import { getDiscordOAuthUrl } from "./_shared/auth.js";
import { buildOauthStateCookie } from "./_shared/session.js";

export const handler = async () => {
  const state = crypto.randomBytes(24).toString("hex");

  return {
    statusCode: 302,
    headers: {
      Location: getDiscordOAuthUrl(state),
      "Set-Cookie": buildOauthStateCookie(state)
    },
    body: ""
  };
};
