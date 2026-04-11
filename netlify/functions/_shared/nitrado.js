const NITRADO_AUTH_URL = "https://oauth.nitrado.net/oauth/v2/auth";
const NITRADO_TOKEN_URL = "https://oauth.nitrado.net/oauth/v2/token";
const NITRADO_API_BASE = "https://api.nitrado.net";

export function getNitradoOAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.NITRADO_CLIENT_ID,
    redirect_uri: process.env.NITRADO_REDIRECT_URI,
    response_type: "code",
    scope: "service",
    state
  });

  return `${NITRADO_AUTH_URL}?${params.toString()}`;
}

export async function exchangeNitradoCodeForToken(code) {
  const body = new URLSearchParams({
    client_id: process.env.NITRADO_CLIENT_ID,
    client_secret: process.env.NITRADO_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.NITRADO_REDIRECT_URI
  });

  const response = await fetch(NITRADO_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error_description || payload?.error || "Nitrado token exchange failed");
  }
  return payload;
}

export async function fetchNitradoServices(accessToken) {
  const response = await fetch(`${NITRADO_API_BASE}/services`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json"
    }
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Failed to fetch Nitrado services");
  }

  const services = payload?.data?.services;
  return Array.isArray(services) ? services : [];
}

export function extractNitradoServerName(service) {
  const details = typeof service?.details === "object" && service?.details ? service.details : {};
  return (
    details.server_name ||
    details.name ||
    service?.comment ||
    service?.type_human ||
    service?.type ||
    `Nitrado Service ${service?.id || "unknown"}`
  );
}
