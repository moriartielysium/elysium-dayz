import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { api } from "../../lib/api";
import { getAdminNav, normalizeSlug } from "../../lib/nav";

function ManualConnectCard({ slug, onConnected }) {
  const [serviceId, setServiceId] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api("admin-manual-nitrado-connect", {
        method: "POST",
        body: JSON.stringify({ slug, serviceId, apiToken }),
      });
      setServiceId("");
      setApiToken("");
      await onConnected?.();
    } catch (err) {
      setError(err.message || "Не удалось подключить сервер");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      <div>
        <h2 className="text-xl font-semibold">Подключение Nitrado вручную</h2>
        <p className="mt-2 text-sm text-zinc-400">Вставь Service ID и API Token от своего Nitrado аккаунта. После проверки сайт сохранит подключение и начнет работать с этим сервером.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-900 bg-red-950/50 p-3 text-sm text-red-200">{error}</div> : null}
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-2 block text-sm text-zinc-300">Service ID</label>
          <input value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-[#05224a] px-4 py-3 text-white outline-none" placeholder="Например: 18524065" />
        </div>
        <div>
          <label className="mb-2 block text-sm text-zinc-300">Nitrado API Token</label>
          <input type="password" value={apiToken} onChange={(e) => setApiToken(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-[#05224a] px-4 py-3 text-white outline-none" placeholder="Вставь токен" />
        </div>
        <button disabled={submitting} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">{submitting ? "Подключение..." : "Подключить сервер"}</button>
      </form>
    </div>
  );
}

export default function AdminDashboardPage() {
  const params = useParams();
  const navigate = useNavigate();
  const slug = useMemo(() => normalizeSlug(params?.slug), [params?.slug]);
  const nav = useMemo(() => getAdminNav(slug), [slug]);

  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const accessPayload = await api(`guild-access?slug=${encodeURIComponent(slug)}`);
      setAccess(accessPayload);
      if (!accessPayload.canUseAdminZone) return;
      const nitradoPayload = await api(`admin-nitrado-account?slug=${encodeURIComponent(slug)}`);
      setData(nitradoPayload);
    } catch (err) {
      setError(err.message || "Не удалось загрузить панель");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params?.slug !== slug) {
      navigate(`/admin/${slug}`, { replace: true });
      return;
    }
    load();
  }, [slug, params?.slug]);

  return (
    <AdminLayout title="Админка" subtitle={`Сервер: ${slug}`} nav={nav}>
      {loading ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">Загрузка...</div> : null}
      {!loading && error ? <div className="mb-4 rounded-2xl border border-red-900 bg-red-950/50 p-4 text-red-200">{error}</div> : null}
      {!loading && access && !access.canUseAdminZone ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">У тебя нет доступа к админке этого сервера.</div> : null}
      {!loading && access?.canUseAdminZone && !data?.connected ? <ManualConnectCard slug={slug} onConnected={load} /> : null}
      {!loading && data?.connected ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="mb-2 text-2xl font-semibold">Nitrado сервер подключен</div>
            <div className="space-y-1 text-sm text-zinc-300">
              <div>Service ID: {data.service?.serviceId || data.account?.serviceId || "—"}</div>
              <div>Имя сервера: {data.service?.serverName || data.account?.serverName || "—"}</div>
              <div>Тип: {data.service?.serviceType || data.account?.serviceType || "—"}</div>
              <div>Token: {data.account?.maskedToken || data.account?.tokenMasked || "***"}</div>
              <div>Обновлено: {data.account?.updatedAt || data.service?.updatedAt || "—"}</div>
            </div>
          </div>
          {data.service?.detailsJson || data.account?.detailsJson ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-3 text-xl font-semibold">Данные сервера</div>
              <pre className="overflow-auto rounded-xl bg-zinc-900 p-4 text-xs text-zinc-300">{JSON.stringify(data.service?.detailsJson || data.account?.detailsJson, null, 2)}</pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </AdminLayout>
  );
}
