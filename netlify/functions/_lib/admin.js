const { getEnv } = require("./env");

function getSuperAdminIds() {
  const raw = process.env.SUPER_ADMIN_IDS || "";
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function isSuperAdmin(userId) {
  if (!userId) return false;
  return getSuperAdminIds().includes(String(userId));
}

module.exports = {
  getSuperAdminIds,
  isSuperAdmin
};
