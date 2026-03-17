function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}
function ok(body, extraHeaders = {}) { return json(200, body, extraHeaders); }
function badRequest(message = "Bad request") { return json(400, { ok: false, error: message }); }
function unauthorized(message = "Unauthorized") { return json(401, { ok: false, error: message }); }
function forbidden(message = "Forbidden") { return json(403, { ok: false, error: message }); }
function serverError(message = "Internal server error") { return json(500, { ok: false, error: message }); }
function redirect(location, cookies = []) {
  const headers = { Location: location, "Cache-Control": "no-store" };
  if (cookies.length) headers["Set-Cookie"] = cookies;
  return { statusCode: 302, headers, body: "" };
}
module.exports = { json, ok, badRequest, unauthorized, forbidden, serverError, redirect };
