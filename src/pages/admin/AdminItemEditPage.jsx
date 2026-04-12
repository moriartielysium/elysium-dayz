import AdminLayout from "../../components/layout/AdminLayout";

const nav = [{ label: "Dashboard", to: "/admin/demo" }, { label: "Настройки", to: "/admin/demo/settings" }, { label: "Кланы", to: "/admin/demo/clans" }, { label: "Категории", to: "/admin/demo/categories" }, { label: "Товары", to: "/admin/demo/items" }, { label: "Заказы", to: "/admin/demo/orders" }, { label: "Медиа", to: "/admin/demo/media" }, { label: "Доступ", to: "/admin/demo/access" }];

export default function AdminItemEditPage() {
  return (
    <AdminLayout title="Редактирование товара" subtitle="Форма редактирования" nav={nav}>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
        Здесь будет раздел: Редактирование товара.
      </div>
    </AdminLayout>
  );
}
