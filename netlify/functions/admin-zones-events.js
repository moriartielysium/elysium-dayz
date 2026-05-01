import { ok, badRequest, serverError } from './_shared/response.js';
import { loadZoneBundle } from './_shared/zones-db.js';

export const handler = async (event) => {
  try {
    const bundle = await loadZoneBundle(event);
    return ok({ ok: true, guildId: bundle.guildId, slug: bundle.slug, displayName: bundle.displayName, events: bundle.events });
  } catch (error) {
    if (error.statusCode === 400) return badRequest(error.message);
    if (error.statusCode === 404) return badRequest(error.message);
    console.error('admin-zones-events error:', error);
    return serverError(error.message || 'Zone Control events request failed');
  }
};
