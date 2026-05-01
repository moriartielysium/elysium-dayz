import { ok, badRequest, serverError } from './_shared/response.js';
import { parseJsonBody } from './_shared/validation.js';
import { resolveGuildFromEvent, loadStoredSettings, saveStoredSettings, fetchDiscordChannels, toInt } from './_shared/admin-data.js';

const DEFAULTS = {
  currencyName: 'Coins',
  playtimeReward: 500,
  killReward: 0,
  statusChannelId: '',
  linkChannelId: '',
  economyLogChannelId: '',
};

function economyPatch(body = {}) {
  return {
    currencyName: String(body.currencyName ?? DEFAULTS.currencyName),
    playtimeReward: toInt(body.playtimeReward, DEFAULTS.playtimeReward),
    killReward: toInt(body.killReward, DEFAULTS.killReward),
    statusChannelId: String(body.statusChannelId || ''),
    linkChannelId: String(body.linkChannelId || ''),
    economyLogChannelId: String(body.economyLogChannelId || ''),
  };
}

export const handler = async (event) => {
  try {
    const body = event.httpMethod === 'POST' ? parseJsonBody(event) : {};
    if (event.httpMethod === 'POST' && !body) return badRequest('Invalid JSON body');

    const meta = await resolveGuildFromEvent(event, body || {});

    if (event.httpMethod === 'POST') {
      const current = await loadStoredSettings(meta.guildId);
      const settings = await saveStoredSettings({
        guildId: meta.guildId,
        slug: meta.slug,
        patch: economyPatch({ ...current, ...body }),
      });
      return ok({ ok: true, guildId: meta.guildId, slug: meta.slug, displayName: meta.displayName, settings: { ...DEFAULTS, ...settings } });
    }

    const settings = await loadStoredSettings(meta.guildId);
    const channelState = await fetchDiscordChannels(meta.guildId);
    return ok({
      ok: true,
      guildId: meta.guildId,
      slug: meta.slug,
      displayName: meta.displayName,
      settings: { ...DEFAULTS, ...settings },
      ...channelState,
    });
  } catch (error) {
    if (error.statusCode === 400) return badRequest(error.message);
    if (error.statusCode === 404) return badRequest(error.message);
    console.error('admin-economy-settings error:', error);
    return serverError(error.message || 'Failed to load economy settings');
  }
};
