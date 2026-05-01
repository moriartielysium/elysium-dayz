import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

const LandingPage = lazy(() => import('../pages/public/LandingPage'));
const GuildPublicPage = lazy(() => import('../pages/public/GuildPublicPage'));
const GuildClansPage = lazy(() => import('../pages/public/GuildClansPage'));

const PlayerDashboardPage = lazy(() => import('../pages/app/PlayerDashboardPage'));
const PlayerProfilePage = lazy(() => import('../pages/app/PlayerProfilePage'));
const PlayerStatsPage = lazy(() => import('../pages/app/PlayerStatsPage'));
const PlayerAchievementsPage = lazy(() => import('../pages/app/PlayerAchievementsPage'));
const PlayerShopPage = lazy(() => import('../pages/app/PlayerShopPage'));
const PlayerCartPage = lazy(() => import('../pages/app/PlayerCartPage'));
const PlayerOrdersPage = lazy(() => import('../pages/app/PlayerOrdersPage'));
const PlayerClanPage = lazy(() => import('../pages/app/PlayerClanPage'));

const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminSystemsPage = lazy(() => import('../pages/admin/AdminSystemsPage'));
const AdminEconomyPage = lazy(() => import('../pages/admin/AdminEconomyPage'));
const AdminRewardsPage = lazy(() => import('../pages/admin/AdminRewardsPage'));
const AdminKillfeedPage = lazy(() => import('../pages/admin/AdminKillfeedPage'));
const AdminMapPage = lazy(() => import('../pages/admin/AdminMapPage'));
const AdminAdmFeedPage = lazy(() => import('../pages/admin/AdminAdmFeedPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));
const AdminZonesPage = lazy(() => import('../pages/admin/AdminZonesPage'));
const AdminClansPage = lazy(() => import('../pages/admin/AdminClansPage'));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'));
const AdminItemsPage = lazy(() => import('../pages/admin/AdminItemsPage'));
const AdminItemEditPage = lazy(() => import('../pages/admin/AdminItemEditPage'));
const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage'));
const AdminMediaPage = lazy(() => import('../pages/admin/AdminMediaPage'));
const AdminAccessPage = lazy(() => import('../pages/admin/AdminAccessPage'));
const AdminSelectServerPage = lazy(() => import('../pages/admin/AdminSelectServerPage'));

function Page({ children }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black p-8 text-zinc-400">Загрузка страницы...</div>}>
      {children}
    </Suspense>
  );
}

const router = createBrowserRouter([
  { path: '/', element: <Page><LandingPage /></Page> },
  { path: '/servers/:slug', element: <Page><GuildPublicPage /></Page> },
  { path: '/servers/:slug/clans', element: <Page><GuildClansPage /></Page> },

  { path: '/app/:slug', element: <Page><PlayerDashboardPage /></Page> },
  { path: '/app/:slug/profile', element: <Page><PlayerProfilePage /></Page> },
  { path: '/app/:slug/stats', element: <Page><PlayerStatsPage /></Page> },
  { path: '/app/:slug/achievements', element: <Page><PlayerAchievementsPage /></Page> },
  { path: '/app/:slug/shop', element: <Page><PlayerShopPage /></Page> },
  { path: '/app/:slug/cart', element: <Page><PlayerCartPage /></Page> },
  { path: '/app/:slug/orders', element: <Page><PlayerOrdersPage /></Page> },
  { path: '/app/:slug/clan', element: <Page><PlayerClanPage /></Page> },

  { path: '/admin/select-server', element: <Page><AdminSelectServerPage /></Page> },
  { path: '/admin/:slug', element: <Page><AdminDashboardPage /></Page> },
  { path: '/admin/:slug/systems', element: <Page><AdminSystemsPage /></Page> },
  { path: '/admin/:slug/economy', element: <Page><AdminEconomyPage /></Page> },
  { path: '/admin/:slug/rewards', element: <Page><AdminRewardsPage /></Page> },
  { path: '/admin/:slug/killfeed', element: <Page><AdminKillfeedPage /></Page> },
  { path: '/admin/:slug/map', element: <Page><AdminMapPage /></Page> },
  { path: '/admin/:slug/adm-feed', element: <Page><AdminAdmFeedPage /></Page> },
  { path: '/admin/:slug/zones', element: <Page><AdminZonesPage /></Page> },
  { path: '/admin/:slug/settings', element: <Page><AdminSettingsPage /></Page> },
  { path: '/admin/:slug/clans', element: <Page><AdminClansPage /></Page> },
  { path: '/admin/:slug/categories', element: <Page><AdminCategoriesPage /></Page> },
  { path: '/admin/:slug/items', element: <Page><AdminItemsPage /></Page> },
  { path: '/admin/:slug/items/:id', element: <Page><AdminItemEditPage /></Page> },
  { path: '/admin/:slug/orders', element: <Page><AdminOrdersPage /></Page> },
  { path: '/admin/:slug/media', element: <Page><AdminMediaPage /></Page> },
  { path: '/admin/:slug/access', element: <Page><AdminAccessPage /></Page> },
]);

export default router;
