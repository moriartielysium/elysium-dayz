import { createBrowserRouter } from "react-router-dom";

import LandingPage from "../pages/public/LandingPage";
import GuildPublicPage from "../pages/public/GuildPublicPage";
import GuildClansPage from "../pages/public/GuildClansPage";

import PlayerDashboardPage from "../pages/app/PlayerDashboardPage";
import PlayerProfilePage from "../pages/app/PlayerProfilePage";
import PlayerStatsPage from "../pages/app/PlayerStatsPage";
import PlayerAchievementsPage from "../pages/app/PlayerAchievementsPage";
import PlayerShopPage from "../pages/app/PlayerShopPage";
import PlayerCartPage from "../pages/app/PlayerCartPage";
import PlayerOrdersPage from "../pages/app/PlayerOrdersPage";
import PlayerClanPage from "../pages/app/PlayerClanPage";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminEconomyPage from "../pages/admin/AdminEconomyPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";
import AdminClansPage from "../pages/admin/AdminClansPage";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import AdminItemsPage from "../pages/admin/AdminItemsPage";
import AdminItemEditPage from "../pages/admin/AdminItemEditPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";
import AdminMediaPage from "../pages/admin/AdminMediaPage";
import AdminAccessPage from "../pages/admin/AdminAccessPage";
import AdminSelectServerPage from "../pages/admin/AdminSelectServerPage";

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/servers/:slug", element: <GuildPublicPage /> },
  { path: "/servers/:slug/clans", element: <GuildClansPage /> },

  { path: "/app/:slug", element: <PlayerDashboardPage /> },
  { path: "/app/:slug/profile", element: <PlayerProfilePage /> },
  { path: "/app/:slug/stats", element: <PlayerStatsPage /> },
  { path: "/app/:slug/achievements", element: <PlayerAchievementsPage /> },
  { path: "/app/:slug/shop", element: <PlayerShopPage /> },
  { path: "/app/:slug/cart", element: <PlayerCartPage /> },
  { path: "/app/:slug/orders", element: <PlayerOrdersPage /> },
  { path: "/app/:slug/clan", element: <PlayerClanPage /> },

  { path: "/admin/select-server", element: <AdminSelectServerPage /> },
  { path: "/admin/:slug", element: <AdminDashboardPage /> },
  { path: "/admin/:slug/economy", element: <AdminEconomyPage /> },
  { path: "/admin/:slug/settings", element: <AdminSettingsPage /> },
  { path: "/admin/:slug/clans", element: <AdminClansPage /> },
  { path: "/admin/:slug/categories", element: <AdminCategoriesPage /> },
  { path: "/admin/:slug/items", element: <AdminItemsPage /> },
  { path: "/admin/:slug/items/:id", element: <AdminItemEditPage /> },
  { path: "/admin/:slug/orders", element: <AdminOrdersPage /> },
  { path: "/admin/:slug/media", element: <AdminMediaPage /> },
  { path: "/admin/:slug/access", element: <AdminAccessPage /> }
]);

export default router;
