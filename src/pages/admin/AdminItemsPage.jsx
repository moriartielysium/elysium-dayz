import { useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { getAdminNav } from "../../lib/admin";

export default function AdminItemsPage() {
  const { slug = "elysium" } = useParams();
  const nav = getAdminNav(slug);

  return (
    <AdminLayout title="Товары" subtitle="Таблица товаров" nav={nav}>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
        Здесь будет раздел: Товары.
      </div>
    </AdminLayout>
  );
}
