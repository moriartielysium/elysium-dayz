import { ok, badRequest, unauthorized, serverError } from './_shared/response.js';
import { getSessionFromEvent } from './_shared/session.js';
import { resolveGuildBySlug } from './_shared/access.js';
import { getDb } from './_shared/db.js';
import { loadEconomySettings, loadLinkedPlayer, publicEconomyPayload } from './_shared/economy-db.js';

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

    const db = getDb();
    let row = null;
    if (player?.player_id) {
      const [rows] = await db.execute(
        `
          SELECT kills, deaths, damage, builds
          FROM player_stats
          WHERE player_id = ?
          LIMIT 1
        `,
        [String(player.player_id)]
      );
      row = rows[0] || null;
    }

    const economy = await loadEconomySettings(guild.guild_id);
    return ok({
      ok: true,
      guildId: String(guild.guild_id),
      ...publicEconomyPayload(economy),
      stats: {
        kills: Number(row?.kills || 0),
        deaths: Number(row?.deaths || 0),
        damage: Number(row?.damage || 0),
        builds: Number(row?.builds || 0),
        playtimeSeconds: 0,
        favoriteWeapon: '',
      },
    });
  } catch (error) {
    console.error('player-stats error:', error);
    return serverError(error.message || 'Failed to load stats');
  }
};
