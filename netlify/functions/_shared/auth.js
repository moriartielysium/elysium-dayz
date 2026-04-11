export function getDiscordOAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    scope: "identify guilds",
    state
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
  const body = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI
  });

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error_description || payload?.error || "Discord token exchange failed");
  }

  return payload;
}

export async function fetchDiscordUser(accessToken) {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "Discord user fetch failed");
  }

  return payload;
}

export async function fetchDiscordGuilds(accessToken) {
  const response = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "Discord guilds fetch failed");
  }

  return Array.isArray(payload) ? payload : [];
}
