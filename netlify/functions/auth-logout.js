const { clearSessionCookie } = require("./_lib/session");
const { redirect } = require("./_lib/response");
const { getConfig } = require("./_lib/env");

const config = getConfig();

exports.handler = async () => {
  return redirect(`${config.siteUrl}/`, [clearSessionCookie()]);
};
