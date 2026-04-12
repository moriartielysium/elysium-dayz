import { resolveSlug } from "./player";

export function getAdminNav(rawSlug) {
  const slug = resolveSlug(rawSlug);
  return [
    { label: "Dashboard", to: `/admin/${slug}` },
    { label: "Экономика", to: `/admin/${slug}/economy` },
    { label: "Настройки", to: `/admin/${slug}/settings` },
    { label: "Кланы", to: `/admin/${slug}/clans` },
    { label: "Категории", to: `/admin/${slug}/categories` },
    { label: "Товары", to: `/admin/${slug}/items` },
    { label: "Заказы", to: `/admin/${slug}/orders` },
    { label: "Медиа", to: `/admin/${slug}/media` },
    { label: "Доступ", to: `/admin/${slug}/access` }
  ];
}
