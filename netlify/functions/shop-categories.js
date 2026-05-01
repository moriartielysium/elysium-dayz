import { ok, badRequest, serverError } from './_shared/response.js';
import { resolveGuildBySlug } from './_shared/access.js';
import { getDb } from './_shared/db.js';

export const handler = async (event) => {
  try {
    const slug = event.queryStringParameters?.slug;
    if (!slug) return badRequest('slug is required');

    const guild = await resolveGuildBySlug(slug);
    if (!guild) return badRequest('guild not found');

    const db = getDb();
    const [rows] = await db.execute(
      `
        SELECT id, parent_id, name, slug, description, sort_order, is_enabled
        FROM shop_categories
        WHERE guild_id = ? AND is_enabled = 1
        ORDER BY sort_order ASC, name ASC
      `,
      [String(guild.guild_id)]
    );

    return ok({
      ok: true,
      guildId: String(guild.guild_id),
      categories: rows.map((row) => ({
        id: String(row.id),
        parentId: row.parent_id ? String(row.parent_id) : null,
        parent_id: row.parent_id ? String(row.parent_id) : null,
        name: row.name,
        slug: row.slug,
        description: row.description || '',
        sortOrder: Number(row.sort_order || 0),
        sort_order: Number(row.sort_order || 0),
      })),
    });
  } catch (error) {
    console.error('shop-categories error:', error);
    return serverError(error.message || 'Failed to load categories');
  }
};
