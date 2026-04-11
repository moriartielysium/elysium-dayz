import { getDb } from "./_shared/db.js";
import { encryptText } from "./_shared/crypto.js";
import { exchangeNitradoCodeForToken, fetchNitradoServices, extractNitradoServerName } from "./_shared/nitrado.js";
import {
  clearNitradoOauthStateCookie,
  getNitradoOauthStateFromEvent,
  getSessionFromEvent
} from "./_shared/session.js";
import { badRequest, serverError, unauthorized } from "./_shared/response.js";

export const handler = async (event) => {
  try {
    const session = getSessionFromEvent(event);
    if (!session?.user) return unauthorized("Not logged in");

    const code = event.queryStringParameters?.code;
    const state = event.queryStringParameters?.state;
    if (!code) return badRequest("Missing OAuth code");
    if (!state) return badRequest("Missing OAuth state");

    const savedState = getNitradoOauthStateFromEvent(event);
    if (!savedState || savedState !== state) {
      return badRequest("Nitrado OAuth state mismatch");
    }

    const tokenPayload = await exchangeNitradoCodeForToken(code);
    const accessToken = tokenPayload?.access_token;
    if (!accessToken) return serverError("Missing Nitrado access token");

    const services = await fetchNitradoServices(accessToken);
    const db = getDb();

    const expiresAt = tokenPayload?.expires_in
      ? new Date(Date.now() + Number(tokenPayload.expires_in) * 1000)
      : null;

    await db.execute(
      `
        INSERT INTO web_nitrado_accounts (
          discord_user_id,
          account_label,
          access_token_enc,
          refresh_token_enc,
          token_type,
          expires_at,
          is_active
        ) VALUES (?, ?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE
          account_label = VALUES(account_label),
          access_token_enc = VALUES(access_token_enc),
          refresh_token_enc = VALUES(refresh_token_enc),
          token_type = VALUES(token_type),
          expires_at = VALUES(expires_at),
          is_active = 1,
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        String(session.user.id),
        session.user.global_name || session.user.username,
        encryptText(accessToken),
        tokenPayload?.refresh_token ? encryptText(tokenPayload.refresh_token) : null,
        tokenPayload?.token_type || "Bearer",
        expiresAt ? expiresAt.toISOString().slice(0, 19).replace("T", " ") : null
      ]
    );

    const [accountRows] = await db.execute(
      `SELECT id FROM web_nitrado_accounts WHERE discord_user_id = ? LIMIT 1`,
      [String(session.user.id)]
    );
    const accountId = accountRows[0]?.id;

    if (accountId) {
      for (const service of services) {
        await db.execute(
          `
            INSERT INTO web_nitrado_services (
              nitrado_account_id,
              service_id,
              service_type,
              server_name,
              details_json,
              is_active,
              last_synced_at
            ) VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE
              nitrado_account_id = VALUES(nitrado_account_id),
              service_type = VALUES(service_type),
              server_name = VALUES(server_name),
              details_json = VALUES(details_json),
              is_active = 1,
              last_synced_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          `,
          [
            accountId,
            String(service.id),
            service.type || null,
            extractNitradoServerName(service),
            JSON.stringify(service)
          ]
        );
      }
    }

    return {
      statusCode: 302,
      headers: {
        Location: "/admin/elysium"
      },
      multiValueHeaders: {
        "Set-Cookie": [clearNitradoOauthStateCookie()]
      },
      body: ""
    };
  } catch (error) {
    console.error("nitrado-callback error:", error);
    return serverError(error.message || "Nitrado OAuth callback failed");
  }
};
