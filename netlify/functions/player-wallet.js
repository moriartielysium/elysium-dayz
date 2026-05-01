import { ok, badRequest, unauthorized, serverError } from './_shared/response.js';
import { getSessionFromEvent } from './_shared/session.js';
import { resolveGuildBySlug } from './_shared/access.js';
import { loadEconomySettings, loadWallet, publicEconomyPayload } from './_shared/economy-db.js';

export const handler = async (event) => {
  try {
    const session = getSessionFromEvent(event);
    if (!session?.user) return unauthorized('Not logged in');

    const slug = event.queryStringParameters?.slug;
    if (!slug) return badRequest('slug is required');

    const guild = await resolveGuildBySlug(slug);
    if (!guild) return badRequest('guild not found');

    const [wallet, economy] = await Promise.all([
      loadWallet(guild.guild_id, session.user.id),
      loadEconomySettings(guild.guild_id),
    ]);

    return ok({
      ok: true,
      guildId: String(guild.guild_id),
      ...publicEconomyPayload(economy),
      balance: wallet.balance,
      wallet,
    });
  } catch (error) {
    console.error('player-wallet error:', error);
    return serverError(error.message || 'Failed to load wallet');
  }
};
