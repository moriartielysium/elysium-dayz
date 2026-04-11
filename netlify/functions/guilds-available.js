import { ok, unauthorized } from "./_shared/response.js";
import { getSessionFromEvent } from "./_shared/session.js";

export const handler = async (event) => {
  const session = getSessionFromEvent(event);
  if (!session?.user) return unauthorized("Not logged in");

  return ok({
    ok: true,
    guilds: session.guilds || []
  });
};
