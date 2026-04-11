import { getDb } from "./db.js";

export async function writeAuditLog({ guildId = null, actorDiscordUserId, actionType, targetType, targetId = null, payload = null }) {
  const db = getDb();
  await db.execute(
    `
      INSERT INTO audit_logs (
        guild_id,
        actor_discord_user_id,
        action_type,
        target_type,
        target_id,
        payload_json,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `,
    [
      guildId,
      String(actorDiscordUserId),
      actionType,
      targetType,
      targetId,
      payload ? JSON.stringify(payload) : null
    ]
  );
}
