import { useMemo } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { getAdminNav } from "../../lib/admin";

export default function AdminItemEditPage() {
  const { slug } = useParams();
  const nav = useMemo(() => getAdminNav(slug), [slug]);

  return (
    <AdminLayout title="Редактирование товара" subtitle="Параметры выбранной позиции" nav={nav}>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
        Здесь будет раздел: Редактирование товара.
      </div>
    </AdminLayout>
  );
}
