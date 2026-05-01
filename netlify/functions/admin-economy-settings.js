import { ok, badRequest, serverError } from './_shared/response.js';
import { parseJsonBody } from './_shared/validation.js';
import { resolveGuildFromEvent, fetchDiscordChannels, saveStoredSettings } from './_shared/admin-data.js';
import { loadEconomySettings, saveEconomySettings } from './_shared/economy-db.js';

export const handler = async (event) => {
  try {
    const body = event.httpMethod === 'POST' ? parseJsonBody(event) : {};
    if (event.httpMethod === 'POST' && !body) return badRequest('Invalid JSON body');

    const meta = await resolveGuildFromEvent(event, body || {});

    if (event.httpMethod === 'POST') {
      const settings = await saveEconomySettings(meta.guildId, body);

      // Дублируем в web_admin_settings только для старых страниц панели, но источник истины теперь bot DB: guild_economy_settings.
      await saveStoredSettings({
        guildId: meta.guildId,
        slug: meta.slug,
        patch: {
          currencyName: settings.currencyName,
          playtimeReward: settings.playtimeReward,
          killReward: settings.killReward,
          statusChannelId: settings.statusChannelId,
          linkChannelId: settings.linkChannelId,
          economyLogChannelId: settings.economyLogChannelId,
        },
      }).catch(() => null);

      return ok({ ok: true, guildId: meta.guildId, slug: meta.slug, displayName: meta.displayName, settings });
    }

    const settings = await loadEconomySettings(meta.guildId);
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
    if (error.statusCode === 400 || error.statusCode === 404) return badRequest(error.message);
    console.error('admin-economy-settings error:', error);
    return serverError(error.message || 'Failed to load economy settings');
  }
};
