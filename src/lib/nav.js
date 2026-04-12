
export function normalizeSlug(rawSlug, fallback = "elysium") {
  const value = String(rawSlug || "").trim();
  if (!value || value.toLowerCase() === "demo" || value.toLowerCase() === "undefined" || value.toLowerCase() === "null") {
    return fallback;
  }
  return value;
}

export function getPlayerNav(rawSlug) {
  const slug = normalizeSlug(rawSlug);
  return [
    { label: "Главная", to: `/app/${slug}` },
    { label: "Статистика", to: `/app/${slug}/stats` },
    { label: "Профиль", to: `/app/${slug}/profile` },
    { label: "Заказы", to: `/app/${slug}/orders` },
    { label: "Магазин", to: `/app/${slug}/shop` },
    { label: "Клан", to: `/app/${slug}/clan` },
  ];
}

export function getAdminNav(rawSlug) {
  const slug = normalizeSlug(rawSlug);
  return [
    { label: "Dashboard", to: `/admin/${slug}` },
    { label: "Настройки", to: `/admin/${slug}/settings` },
    { label: "Кланы", to: `/admin/${slug}/clans` },
    { label: "Категории", to: `/admin/${slug}/categories` },
    { label: "Товары", to: `/admin/${slug}/items` },
    { label: "Заказы", to: `/admin/${slug}/orders` },
    { label: "Медиа", to: `/admin/${slug}/media` },
    { label: "Доступ", to: `/admin/${slug}/access` },
  ];
}
