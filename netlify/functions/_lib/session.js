const crypto = require("crypto");
const cookie = require("cookie");
const { getConfig } = require("./env");

const config = getConfig();
const SESSION_COOKIE = "elysium_dashboard_session";
const OAUTH_STATE_COOKIE = "elysium_oauth_state";

function sign(value) {
  return crypto
    .createHmac("sha256", config.sessionSecret)
    .update(value)
    .digest("hex");
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

function parseCookies(event) {
  const raw =
    event?.headers?.cookie ||
    event?.headers?.Cookie ||
    "";

  return cookie.parse(raw);
}

function generateId(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

function encodeSession(payload) {
  const json = JSON.stringify(payload);
  const base64 = Buffer.from(json, "utf8").toString("base64url");
  const signature = sign(base64);
  return `${base64}.${signature}`;
}

function decodeSession(raw) {
  if (!raw) return null;

  const [base64, signature] = raw.split(".");
  if (!base64 || !signature) return null;
  if (sign(base64) !== signature) return null;

  try {
    const json = Buffer.from(base64, "base64url").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function createSession(user, tokenData) {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7;

  const payload = {
    user: {
      id: user.id,
      username: user.username,
      avatar: user.avatar || null
    },
    accessToken: tokenData?.access_token || null,
    refreshToken: tokenData?.refresh_token || null,
    exp: expiresAt
  };

  const value = encodeSession(payload);

  return makeCookie(SESSION_COOKIE, value, {
    maxAge: 60 * 60 * 24 * 7
  });
}

async function getSession(event) {
  const cookies = parseCookies(event);
  const raw = cookies[SESSION_COOKIE];
  const payload = decodeSession(raw);

  if (!payload) return null;
  if (!payload.exp || payload.exp < Date.now()) return null;

  return {
    user: payload.user,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken
  };
}

function createStateCookie(state) {
  return makeCookie(OAUTH_STATE_COOKIE, state, {
    maxAge: 60 * 10
  });
}

function getStateFromCookies(event) {
  const cookies = parseCookies(event);
  return cookies[OAUTH_STATE_COOKIE] || null;
}

function clearStateCookie() {
  return makeCookie(OAUTH_STATE_COOKIE, "", {
    maxAge: 0
  });
}

function clearSessionCookie() {
  return makeCookie(SESSION_COOKIE, "", {
    maxAge: 0
  });
}

module.exports = {
  createSession,
  getSession,
  createStateCookie,
  getStateFromCookies,
  clearStateCookie,
  clearSessionCookie,
  generateId
};
