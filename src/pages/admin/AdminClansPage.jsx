import { useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { getAdminNav } from "../../lib/admin";

export default function AdminClansPage() {
  const { slug = "elysium" } = useParams();
  const nav = getAdminNav(slug);

  return (
    <AdminLayout title="Кланы" subtitle="Управление кланами" nav={nav}>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
        Здесь будет раздел: Кланы.
      </div>
    </AdminLayout>
  );
}
