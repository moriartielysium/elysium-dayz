import { getDiscordOAuthUrl } from "./_shared/auth.js";

export const handler = async () => {
  return {
    statusCode: 302,
    headers: {
      Location: getDiscordOAuthUrl()
    },
    body: ""
  };
};
