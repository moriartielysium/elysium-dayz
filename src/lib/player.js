import { api } from './api';

export function resolveSlug(rawSlug) {
  if (!rawSlug || rawSlug === 'demo') return 'elysium';
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
  return api('me');
}

export async function getPlayerProfile(slug) {
  return api(`player/profile?slug=${encodeURIComponent(resolveSlug(slug))}`);
}

export async function getPlayerStats(slug) {
  return api(`player/stats?slug=${encodeURIComponent(resolveSlug(slug))}`);
}

export async function getPlayerWallet(slug) {
  return api(`player/wallet?slug=${encodeURIComponent(resolveSlug(slug))}`);
}

export async function getPlayerOrders(slug) {
  return api(`player/orders?slug=${encodeURIComponent(resolveSlug(slug))}`);
}

export function discordAvatarUrl(user) {
  if (!user?.id || !user?.avatar) return '';
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
}
