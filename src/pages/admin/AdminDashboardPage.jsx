import AdminLayout from "../../components/layout/AdminLayout";

const nav = [{ label: "Dashboard", to: "/admin/demo" }, { label: "Настройки", to: "/admin/demo/settings" }, { label: "Кланы", to: "/admin/demo/clans" }, { label: "Категории", to: "/admin/demo/categories" }, { label: "Товары", to: "/admin/demo/items" }, { label: "Заказы", to: "/admin/demo/orders" }, { label: "Медиа", to: "/admin/demo/media" }, { label: "Доступ", to: "/admin/demo/access" }];

export default function AdminDashboardPage() {
  return (
    <AdminLayout title="Админка" subtitle="Сводка по серверу" nav={nav}>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">Игроки</div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">Товары</div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">Заказы</div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">Кланы</div>
      </div>
    </AdminLayout>
  );
}
