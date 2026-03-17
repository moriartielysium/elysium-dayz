const crypto = require("crypto");
const cookie = require("cookie");
const { query } = require("./db");
const { getConfig } = require("./env");
const config = getConfig();
const SESSION_COOKIE = "elysium_dashboard_session";
const OAUTH_STATE_COOKIE = "elysium_oauth_state";

function sign(value) {
  return crypto.createHmac("sha256", config.sessionSecret).update(value).digest("hex");
}
function makeCookie(name, value, options = {}) {
  return cookie.serialize(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    ...options
  });
}
function parseCookies(event) { return cookie.parse(event.headers.cookie || ""); }
function generateId(bytes = 32) { return crypto.randomBytes(bytes).toString("hex"); }

async function createSession(user, tokenData) {
  const sessionId = generateId(24);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  await query(
    `insert into dashboard_sessions
      (session_id, user_id, username, avatar, access_token, refresh_token, created_at, expires_at)
      values ($1, $2, $3, $4, $5, $6, now(), $7)`,
    [sessionId, user.id, user.username, user.avatar || null, tokenData.access_token || null, tokenData.refresh_token || null, expiresAt]
  );
  const signed = `${sessionId}.${sign(sessionId)}`;
  return makeCookie(SESSION_COOKIE, signed, { maxAge: 60 * 60 * 24 * 7 });
}

async function getSession(event) {
  const cookies = parseCookies(event);
  const raw = cookies[SESSION_COOKIE];
  if (!raw) return null;
  const [sessionId, signature] = raw.split(".");
  if (!sessionId || !signature || sign(sessionId) !== signature) return null;
  const result = await query(`select session_id, user_id, username, avatar, access_token, refresh_token, expires_at from dashboard_sessions where session_id = $1 limit 1`, [sessionId]);
  const row = result.rows[0];
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  return {
    sessionId: row.session_id,
    user: { id: row.user_id, username: row.username, avatar: row.avatar },
    accessToken: row.access_token,
    refreshToken: row.refresh_token
  };
}

function createStateCookie(state) { return makeCookie(OAUTH_STATE_COOKIE, state, { maxAge: 60 * 10 }); }
function getStateFromCookies(event) { const cookies = parseCookies(event); return cookies[OAUTH_STATE_COOKIE] || null; }
function clearStateCookie() { return makeCookie(OAUTH_STATE_COOKIE, "", { maxAge: 0 }); }
function clearSessionCookie() { return makeCookie(SESSION_COOKIE, "", { maxAge: 0 }); }

module.exports = { createSession, getSession, createStateCookie, getStateFromCookies, clearStateCookie, clearSessionCookie, generateId };
