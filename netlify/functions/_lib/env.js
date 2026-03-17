function getEnv(name, required = true) {
  const value = process.env[name];
  if (required && (!value || !value.trim())) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function getConfig() {
  return {
    discordClientId: getEnv("DISCORD_CLIENT_ID"),
    discordClientSecret: getEnv("DISCORD_CLIENT_SECRET"),
    discordRedirectUri: getEnv("DISCORD_REDIRECT_URI"),
    botClientId: getEnv("BOT_CLIENT_ID"),
    sessionSecret: getEnv("SESSION_SECRET"),
    databaseUrl: getEnv("DATABASE_URL"),
    siteUrl: getEnv("SITE_URL")
  };
}

module.exports = { getEnv, getConfig };
