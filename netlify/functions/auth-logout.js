const { clearSessionCookie, clearStateCookie } = require("./_lib/session");
const { redirect } = require("./_lib/response");
const { getConfig } = require("./_lib/env");
const config = getConfig();
exports.handler = async () => redirect(`${config.siteUrl}/`, [clearSessionCookie(), clearStateCookie()]);
