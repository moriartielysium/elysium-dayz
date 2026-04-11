export function getDiscordOAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    scope: "identify guilds"
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

/**
 * TODO:
 * здесь нужно добавить реальные вызовы Discord OAuth:
 * - exchangeCodeForToken(code)
 * - fetchDiscordUser(accessToken)
 * - fetchDiscordGuilds(accessToken)
 */
export async function exchangeCodeForToken() {
  throw new Error("Discord token exchange not implemented yet");
}

export async function fetchDiscordUser() {
  throw new Error("Discord user fetch not implemented yet");
}

export async function fetchDiscordGuilds() {
  throw new Error("Discord guilds fetch not implemented yet");
}
