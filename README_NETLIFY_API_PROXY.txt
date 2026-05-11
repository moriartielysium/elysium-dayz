ELYSIUM DAYZ — Netlify API proxy for Bot-Hosting backend

This static site includes _redirects:
/api/*  http://prem-eu2.bot-hosting.net:20626/:splat  200

After deploying to Netlify, check:
https://elysium-dayz.site/api/health
https://elysium-dayz.site/api/payments/packages

Robokassa technical settings with this proxy:
Result URL:  https://elysium-dayz.site/api/payments/robokassa/result
Method:      POST
Success URL: https://elysium-dayz.site/pay/success/
Method:      GET
Fail URL:    https://elysium-dayz.site/pay/fail/
Method:      GET

Backend .env values:
FRONTEND_URL=https://elysium-dayz.site
API_BASE_URL=https://elysium-dayz.site/api
DISCORD_REDIRECT_URI=https://elysium-dayz.site/api/auth-callback
COOKIE_DOMAIN=.elysium-dayz.site
COOKIE_SECURE=true
COOKIE_SAMESITE=none
