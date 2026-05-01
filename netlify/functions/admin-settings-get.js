import { ok, badRequest, serverError } from './_shared/response.js';
import { resolveGuildFromEvent, loadStoredSettings, fetchDiscordChannels } from './_shared/admin-data.js';

export const handler = async (event) => {
  try {
    const meta = await resolveGuildFromEvent(event);
    const settings = await loadStoredSettings(meta.guildId);
    const channelState = await fetchDiscordChannels(meta.guildId);

    return ok({
      ok: true,
      guildId: meta.guildId,
      slug: meta.slug,
      displayName: meta.displayName,
      settings,
      ...channelState,
    });
  } catch (error) {
    if (error.statusCode === 400) return badRequest(error.message);
    if (error.statusCode === 404) return badRequest(error.message);
    console.error('admin-settings-get error:', error);
    return serverError(error.message || 'Failed to load admin settings');
  }
};
