import { ok, badRequest, serverError } from './_shared/response.js';
import { parseJsonBody } from './_shared/validation.js';
import { loadZoneBundle, saveZoneSettingsForEvent } from './_shared/zones-db.js';

export const handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const bundle = await loadZoneBundle(event);
      return ok({ ok: true, guildId: bundle.guildId, slug: bundle.slug, displayName: bundle.displayName, settings: bundle.settings });
    }

    if (event.httpMethod !== 'POST' && event.httpMethod !== 'PUT' && event.httpMethod !== 'PATCH') {
      return badRequest('POST method is required');
    }

    const body = parseJsonBody(event);
    if (!body) return badRequest('Invalid JSON body');
    const bundle = await saveZoneSettingsForEvent(event, body);
    return ok({ ok: true, guildId: bundle.guildId, slug: bundle.slug, displayName: bundle.displayName, settings: bundle.settings, zones: bundle.zones, events: bundle.events });
  } catch (error) {
    if (error.statusCode === 400) return badRequest(error.message);
    if (error.statusCode === 404) return badRequest(error.message);
    console.error('admin-zones-settings error:', error);
    return serverError(error.message || 'Zone Control settings request failed');
  }
};
