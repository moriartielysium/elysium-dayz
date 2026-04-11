import cookie from "cookie";

const SESSION_COOKIE = "elysium_session";

export function getSessionFromEvent(event) {
  const raw = event.headers?.cookie || event.headers?.Cookie || "";
  const parsed = cookie.parse(raw || "");
  const rawValue = parsed[SESSION_COOKIE];
  if (!rawValue) return null;

  try {
    return JSON.parse(Buffer.from(rawValue, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export function buildSessionCookie(session) {
  const value = Buffer.from(JSON.stringify(session), "utf-8").toString("base64");
  return cookie.serialize(SESSION_COOKIE, value, {
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
