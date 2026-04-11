export async function apiGet(path) {
  const res = await fetch(path, { credentials: "include" });
  let data = null;

  try {
    data = await res.json();
  } catch (_) {
    data = null;
  }

  if (!res.ok) {
    const message = data?.detail || data?.error || data?.message || "API request failed";
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export function resolveSlug(rawSlug) {
  if (!rawSlug || rawSlug === "demo") return "elysium";
  return rawSlug;
}

export function normalizeGuildSlug(rawSlug) {
  return resolveSlug(rawSlug);
}

export function getGuildNav(rawSlug) {
  const slug = resolveSlug(rawSlug);
  return {
    dashboard: `/app/${slug}`,
    stats: `/app/${slug}/stats`,
    profile: `/app/${slug}/profile`,
    orders: `/app/${slug}/orders`,
    shop: `/app/${slug}/shop`,
    clan: `/app/${slug}/clan`,
  };
}

export async function getMe() {
  return apiGet(`/api/me`);
}

export async function getPlayerProfile(slug) {
  return apiGet(`/api/player/profile?slug=${encodeURIComponent(resolveSlug(slug))}`);
}

export async function getPlayerStats(slug) {
  return apiGet(`/api/player/stats?slug=${encodeURIComponent(resolveSlug(slug))}`);
}

export async function getPlayerWallet(slug) {
  return apiGet(`/api/player/wallet?slug=${encodeURIComponent(resolveSlug(slug))}`);
}

export async function getPlayerOrders(slug) {
  return apiGet(`/api/player/orders?slug=${encodeURIComponent(resolveSlug(slug))}`);
}

export function discordAvatarUrl(user) {
  if (!user?.id || !user?.avatar) return "";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
}