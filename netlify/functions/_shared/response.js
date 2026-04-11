export function json(statusCode, payload) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  };
}

export function ok(payload = {}) {
  return json(200, payload);
}

export function badRequest(message = "Bad request") {
  return json(400, { ok: false, error: message });
}

export function unauthorized(message = "Unauthorized") {
  return json(401, { ok: false, error: message });
}

export function forbidden(message = "Forbidden") {
  return json(403, { ok: false, error: message });
}

export function serverError(message = "Internal server error") {
  return json(500, { ok: false, error: message });
}
