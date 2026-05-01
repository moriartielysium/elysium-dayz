export function getAdminNav(slug) {
  const safeSlug = slug || 'elysium';
  return [
    { label: 'Dashboard', to: `/admin/${safeSlug}` },
    { label: 'Системы', to: `/admin/${safeSlug}/systems` },
    { label: 'Экономика', to: `/admin/${safeSlug}/economy` },
    { label: 'Награды', to: `/admin/${safeSlug}/rewards` },
    { label: 'Killfeed', to: `/admin/${safeSlug}/killfeed` },
    { label: 'Live Map', to: `/admin/${safeSlug}/map` },
    { label: 'ADM Feed', to: `/admin/${safeSlug}/adm-feed` },
    { label: 'Зоны', to: `/admin/${safeSlug}/zones` },
    { label: 'Настройки', to: `/admin/${safeSlug}/settings` },
    { label: 'Кланы', to: `/admin/${safeSlug}/clans` },
    { label: 'Категории', to: `/admin/${safeSlug}/categories` },
    { label: 'Товары', to: `/admin/${safeSlug}/items` },
    { label: 'Заказы', to: `/admin/${safeSlug}/orders` },
    { label: 'Медиа', to: `/admin/${safeSlug}/media` },
    { label: 'Доступ', to: `/admin/${safeSlug}/access` },
  ];
}
