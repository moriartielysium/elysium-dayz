const ADMINISTRATOR = BigInt(0x8);
const MANAGE_GUILD = BigInt(0x20);
function hasManageAccess(permissions) {
  try {
    const value = BigInt(permissions);
    return (value & ADMINISTRATOR) === ADMINISTRATOR || (value & MANAGE_GUILD) === MANAGE_GUILD;
  } catch {
    return false;
  }
}
module.exports = { hasManageAccess };
