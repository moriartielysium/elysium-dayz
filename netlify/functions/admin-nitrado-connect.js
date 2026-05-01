import { ok, badRequest, serverError } from './_shared/response.js';
import { parseJsonBody } from './_shared/validation.js';
import { resolveGuildFromEvent, saveStoredSettings } from './_shared/admin-data.js';

export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return badRequest('POST method is required');
    const body = parseJsonBody(event);
    if (!body) return badRequest('Invalid JSON body');
    const serviceId = String(body.serviceId || '').trim();
    const apiToken = String(body.apiToken || '').trim();
    if (!serviceId) return badRequest('serviceId is required');
    if (!apiToken) return badRequest('apiToken is required');

    const meta = await resolveGuildFromEvent(event, body);
    const settings = await saveStoredSettings({
      guildId: meta.guildId,
      slug: meta.slug,
      patch: {
        nitradoConnected: true,
        nitradoServiceId: serviceId,
        nitradoTokenLast4: apiToken.slice(-4),
        nitradoUpdatedAt: new Date().toISOString(),
      },
    });

    return ok({ ok: true, connected: true, settings });
  } catch (error) {
    if (error.statusCode === 400) return badRequest(error.message);
    console.error('admin-nitrado-connect error:', error);
    return serverError(error.message || 'Failed to connect Nitrado');
  }
};
