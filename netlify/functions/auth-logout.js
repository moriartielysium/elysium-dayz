import { ok } from "./_shared/response.js";
import { clearSessionCookie } from "./_shared/session.js";

export const handler = async () => {
  return {
    ...ok({ ok: true }),
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearSessionCookie()
    }
  };
};
