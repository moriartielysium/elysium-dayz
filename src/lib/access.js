export function canUsePlayerZone(access) {
  return Boolean(access?.isLinked);
}

export function canUseAdminZone(access) {
  return Boolean(access?.isSuperAdmin || access?.isGuildAdmin);
}
