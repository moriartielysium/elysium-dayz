import cookie from "cookie";
import crypto from "node:crypto";

const SESSION_COOKIE = "elysium_session";
const OAUTH_STATE_COOKIE = "elysium_oauth_state";
const NITRADO_OAUTH_STATE_COOKIE = "elysium_nitrado_oauth_state";

function base64urlEncode(input) {
  return Buffer.from(input, "utf-8").toString("base64url");
}

function base64urlDecode(input) {
  return Buffer.from(input, "base64url").toString("utf-8");
}

function getSecret() {
  const secret = process.env.SESSION_SECRET || "";
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }
  return secret;
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function pack(value) {
  const encoded = base64urlEncode(JSON.stringify(value));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

function unpack(raw) {
  if (!raw || !raw.includes(".")) return null;
  const [encoded, signature] = raw.split(".");
  if (!encoded || !signature) return null;
  if (sign(encoded) !== signature) return null;

  try {
    return JSON.parse(base64urlDecode(encoded));
  } catch {
    return null;
  }
}

export function getCookies(event) {
  const raw = event.headers?.cookie || event.headers?.Cookie || "";
  return cookie.parse(raw || "");
}

export function getSessionFromEvent(event) {
  const cookies = getCookies(event);
  const raw = cookies[SESSION_COOKIE];
  return unpack(raw);
}

export function buildSessionCookie(session) {
  return cookie.serialize(SESSION_COOKIE, pack(session), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export function clearSessionCookie() {
  return cookie.serialize(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });
}

export function buildOauthStateCookie(state) {
  return cookie.serialize(OAUTH_STATE_COOKIE, pack({ state }), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10
  });
}

export function getOauthStateFromEvent(event) {
  const cookies = getCookies(event);
  const raw = cookies[OAUTH_STATE_COOKIE];
  const payload = unpack(raw);
  return payload?.state || null;
}

export function clearOauthStateCookie() {
  return cookie.serialize(OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });
}

export function buildNitradoOauthStateCookie(state) {
  return cookie.serialize(NITRADO_OAUTH_STATE_COOKIE, pack({ state }), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10
  });
}

export function getNitradoOauthStateFromEvent(event) {
  const cookies = getCookies(event);
  const raw = cookies[NITRADO_OAUTH_STATE_COOKIE];
  const payload = unpack(raw);
  return payload?.state || null;
}

export function clearNitradoOauthStateCookie() {
  return cookie.serialize(NITRADO_OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });
}
