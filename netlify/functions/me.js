import { ok, unauthorized } from "./_shared/response.js";
import { getSessionFromEvent } from "./_shared/session.js";
import { isSuperAdmin } from "./_shared/access.js";

export const handler = async (event) => {
  const session = getSessionFromEvent(event);
  if (!session?.user) {
    return unauthorized("Not logged in");
  }

  return ok({
    ok: true,
    user: session.user,
    guilds: session.guilds || [],
    isSuperAdmin: isSuperAdmin(session.user.id)
  });
};
