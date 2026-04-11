import crypto from "node:crypto";
import { getNitradoOAuthUrl } from "./_shared/nitrado.js";
import { buildNitradoOauthStateCookie, getSessionFromEvent } from "./_shared/session.js";
import { unauthorized } from "./_shared/response.js";

export const handler = async (event) => {
  const session = getSessionFromEvent(event);
  if (!session?.user) return unauthorized("Not logged in");

  const state = crypto.randomBytes(24).toString("hex");
  return {
    statusCode: 302,
    headers: {
      Location: getNitradoOAuthUrl(state)
    },
    multiValueHeaders: {
      "Set-Cookie": [buildNitradoOauthStateCookie(state)]
    },
    body: ""
  };
};
