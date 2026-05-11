ELYSIUM DAYZ static site with Robokassa payment buttons

Before deploy edit:
/assets/config.js

Set:
apiBaseUrl: public FastAPI backend URL, example https://api.elysium-dayz.site
guildSlug: slug from web_guild_settings, example elysium
.discordUrl: your real Discord invite

Netlify settings for this static version:
Build command: empty
Publish directory: .
Base directory: empty

Robokassa URLs:
Success URL: https://elysium-dayz.site/pay/success/
Fail URL: https://elysium-dayz.site/pay/fail/
Result URL: https://api.elysium-dayz.site/payments/robokassa/result
