export function requireMethod(event, method) {
  return event.httpMethod === method;
}

export function parseJsonBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return null;
  }
}
