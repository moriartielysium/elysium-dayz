import { ok, badRequest } from "./_shared/response.js";
import { resolveGuildBySlug } from "./_shared/access.js";

export const handler = async (event) => {
  const slug = event.queryStringParameters?.slug;
  if (!slug) return badRequest("slug is required");

  const guild = await resolveGuildBySlug(slug);
  if (!guild) return badRequest("guild not found");

  return ok({ ok: true, guild });
};
