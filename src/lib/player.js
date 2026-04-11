import { api } from "./api";

export function normalizeGuildSlug(slug) {
  const value = String(slug || "").trim().toLowerCase();
  if (!value || value === "demo") return "elysium";
  return value;
}

export function getGuildNav(slug) {
  const safeSlug = normalizeGuildSlug(slug);
  return [
    { label: "Главная", to: `/app/${safeSlug}` },
    { label: "Статистика", to: `/app/${safeSlug}/stats` },
    { label: "Профиль", to: `/app/${safeSlug}/profile` },
    { label: "Заказы", to: `/app/${safeSlug}/orders` },
    { label: "Магазин", to: `/app/${safeSlug}/shop` },
    { label: "Клан", to: `/app/${safeSlug}/clan` },
  ];
}

export async function loadPlayerDashboard(slug) {
  const safeSlug = normalizeGuildSlug(slug);
  const [profile, stats, wallet, orders] = await Promise.all([
    api(`player/profile?slug=${encodeURIComponent(safeSlug)}`),
    api(`player/stats?slug=${encodeURIComponent(safeSlug)}`),
    api(`player/wallet?slug=${encodeURIComponent(safeSlug)}`),
    api(`player/orders?slug=${encodeURIComponent(safeSlug)}`),
  ]);
  return { profile, stats, wallet, orders };
}
