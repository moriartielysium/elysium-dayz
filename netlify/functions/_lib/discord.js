const { getConfig } = require("./env");
const config = getConfig();

async function exchangeCodeForToken(code) {
  const params = new URLSearchParams({
    client_id: config.discordClientId,
    client_secret: config.discordClientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: config.discordRedirectUri
  });
  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });
  if (!response.ok) throw new Error(`Discord token exchange failed: ${response.status} ${await response.text()}`);
  return response.json();
}
async function getCurrentUser(accessToken) {
  const response = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(`Discord getCurrentUser failed: ${response.status} ${await response.text()}`);
  return response.json();
}
async function getUserGuilds(accessToken) {
  const response = await fetch("https://discord.com/api/users/@me/guilds", { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(`Discord getUserGuilds failed: ${response.status} ${await response.text()}`);
  return response.json();
}
function buildAvatarUrl(user) {
  if (!user.avatar) return null;
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
}
function buildAuthorizeUrl(state) {
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", config.discordClientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", config.discordRedirectUri);
  url.searchParams.set("scope", "identify guilds");
  url.searchParams.set("state", state);
  return url.toString();
}
module.exports = { exchangeCodeForToken, getCurrentUser, getUserGuilds, buildAvatarUrl, buildAuthorizeUrl };
