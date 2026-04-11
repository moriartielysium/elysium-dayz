import { api } from "./api";

export function getGuildNav(slug) {
  return [
    { label: "Главная", to: `/app/${slug}` },
    { label: "Статистика", to: `/app/${slug}/stats` },
    { label: "Профиль", to: `/app/${slug}/profile` },
    { label: "Заказы", to: `/app/${slug}/orders` },
    { label: "Магазин", to: `/app/${slug}/shop` },
    { label: "Клан", to: `/app/${slug}/clan` },
  ];
}

export async function loadPlayerDashboard(slug) {
  const [profile, stats, wallet, orders] = await Promise.all([
    api(`player/profile?slug=${encodeURIComponent(slug)}`),
    api(`player/stats?slug=${encodeURIComponent(slug)}`),
    api(`player/wallet?slug=${encodeURIComponent(slug)}`),
    api(`player/orders?slug=${encodeURIComponent(slug)}`),
  ]);
  return { profile, stats, wallet, orders };
}
