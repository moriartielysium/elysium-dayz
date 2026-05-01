import { ok, badRequest, serverError } from './_shared/response.js';
import { resolveGuildFromEvent, loadStoredSettings } from './_shared/admin-data.js';

export const handler = async (event) => {
  try {
    const meta = await resolveGuildFromEvent(event);
    const settings = await loadStoredSettings(meta.guildId);
    const serviceId = String(settings.nitradoServiceId || '').trim();
    const connected = Boolean(settings.nitradoConnected && serviceId);

    return ok({
      ok: true,
      connected,
      guildId: meta.guildId,
      slug: meta.slug,
      displayName: meta.displayName,
      serviceId,
      serverName: settings.nitradoServerName || settings.displayName || meta.displayName || '',
      serviceType: settings.nitradoServiceType || 'DayZ',
      tokenLast4: settings.nitradoTokenLast4 || '',
      updatedAt: settings.nitradoUpdatedAt || '',
      details: settings.nitradoDetails || null,
      account: connected ? { serviceId, serverName: settings.nitradoServerName || meta.displayName || '' } : null,
      services: connected ? [{ serviceId, serverName: settings.nitradoServerName || meta.displayName || '', isBoundToCurrentGuild: true }] : [],
    });
  } catch (error) {
    if (error.statusCode === 400) return badRequest(error.message);
    if (error.statusCode === 404) return badRequest(error.message);
    console.error('admin-nitrado-account error:', error);
    return serverError(error.message || 'Failed to load Nitrado account');
  }
};
