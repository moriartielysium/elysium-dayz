import { ok, badRequest, serverError } from './_shared/response.js';
import { parseJsonBody } from './_shared/validation.js';
import { resolveGuildFromEvent, saveStoredSettings } from './_shared/admin-data.js';

export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return badRequest('POST method is required');
    const body = parseJsonBody(event) || {};
    const meta = await resolveGuildFromEvent(event, body);
    const settings = await saveStoredSettings({
      guildId: meta.guildId,
      slug: meta.slug,
      patch: {
        nitradoConnected: false,
        nitradoServiceId: '',
        nitradoServerName: '',
        nitradoTokenLast4: '',
        nitradoUpdatedAt: new Date().toISOString(),
      },
    });
    return ok({ ok: true, connected: false, settings });
  } catch (error) {
    if (error.statusCode === 400) return badRequest(error.message);
    console.error('admin-nitrado-disconnect error:', error);
    return serverError(error.message || 'Failed to disconnect Nitrado');
  }
};
