import { useMemo } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { getAdminNav, normalizeSlug } from "../../lib/nav";

export default function AdminMediaPage() {
  const params = useParams();
  const slug = useMemo(() => normalizeSlug(params?.slug), [params?.slug]);
  const nav = useMemo(() => getAdminNav(slug), [slug]);

  return (
    <AdminLayout title="Медиа" subtitle="Загрузка и библиотека файлов" nav={nav}>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
        Здесь будет раздел: Медиа.
      </div>
    </AdminLayout>
  );
}
