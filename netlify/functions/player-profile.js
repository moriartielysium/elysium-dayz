import { ok, badRequest, unauthorized, serverError } from './_shared/response.js';
import { getSessionFromEvent } from './_shared/session.js';
import { resolveGuildBySlug } from './_shared/access.js';
import { loadEconomySettings, loadLinkedPlayer, loadWallet, publicEconomyPayload } from './_shared/economy-db.js';

export const handler = async (event) => {
  try {
    const session = getSessionFromEvent(event);
    if (!session?.user) return unauthorized('Not logged in');

    const slug = event.queryStringParameters?.slug;
    if (!slug) return badRequest('slug is required');

    const guild = await resolveGuildBySlug(slug);
    if (!guild) return badRequest('guild not found');

    const { link, player } = await loadLinkedPlayer(guild.guild_id, session.user.id);
    if (!link) return badRequest('link required');

    const [wallet, economy] = await Promise.all([
      loadWallet(guild.guild_id, session.user.id),
      loadEconomySettings(guild.guild_id),
    ]);

    return ok({
      ok: true,
      guildId: String(guild.guild_id),
      ...publicEconomyPayload(economy),
      profile: {
        discordUserId: String(session.user.id),
        psnName: link.psn_name,
        psn_name: link.psn_name,
        normalizedPsnName: link.normalized_psn_name,
        normalized_psn_name: link.normalized_psn_name,
        linkedAt: link.created_at,
        linked_at: link.created_at,
        playerId: player?.player_id ? String(player.player_id) : null,
        player_id: player?.player_id ? String(player.player_id) : null,
        nitradoName: player?.nitrado_name || link.psn_name,
        nitrado_name: player?.nitrado_name || link.psn_name,
        nitradoAccount: player?.nitrado_account || '',
        nitrado_account: player?.nitrado_account || '',
        balance: wallet.balance,
      },
      wallet,
    });
  } catch (error) {
    console.error('player-profile error:', error);
    return serverError(error.message || 'Failed to load player profile');
  }
};
