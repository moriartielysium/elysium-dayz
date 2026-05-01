import { ok, badRequest, serverError } from './_shared/response.js';
import { parseJsonBody } from './_shared/validation.js';
import { resolveGuildFromEvent, loadStoredSettings, saveStoredSettings } from './_shared/admin-data.js';

export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return badRequest('POST method is required');
    const body = parseJsonBody(event) || {};
    const meta = await resolveGuildFromEvent(event, body);
    const current = await loadStoredSettings(meta.guildId);
    const settings = await saveStoredSettings({
      guildId: meta.guildId,
      slug: meta.slug,
      patch: { nitradoUpdatedAt: new Date().toISOString() },
    });
    return ok({ ok: true, connected: Boolean(current.nitradoConnected), settings });
  } catch (error) {
    if (error.statusCode === 400) return badRequest(error.message);
    console.error('admin-nitrado-refresh error:', error);
    return serverError(error.message || 'Failed to refresh Nitrado');
  }
};
