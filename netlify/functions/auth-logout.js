import { clearOauthStateCookie, clearSessionCookie } from "./_shared/session.js";

export const handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    multiValueHeaders: {
      "Set-Cookie": [clearSessionCookie(), clearOauthStateCookie()]
    },
    body: JSON.stringify({ ok: true })
  };
};
