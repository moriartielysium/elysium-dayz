import { ok, badRequest, serverError } from './_shared/response.js';
import { parseJsonBody } from './_shared/validation.js';
import { cleanSettingsInput, resolveGuildFromEvent, saveStoredSettings } from './_shared/admin-data.js';

export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return badRequest('POST method is required');
    const body = parseJsonBody(event);
    if (!body) return badRequest('Invalid JSON body');

    const meta = await resolveGuildFromEvent(event, body);
    const settings = await saveStoredSettings({
      guildId: meta.guildId,
      slug: meta.slug,
      patch: cleanSettingsInput(body),
    });

    return ok({
      ok: true,
      guildId: meta.guildId,
      slug: meta.slug,
      displayName: meta.displayName,
      settings,
    });
  } catch (error) {
    if (error.statusCode === 400) return badRequest(error.message);
    if (error.statusCode === 404) return badRequest(error.message);
    console.error('admin-settings-save error:', error);
    return serverError(error.message || 'Failed to save admin settings');
  }
};
