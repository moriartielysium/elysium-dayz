import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { api } from "../../lib/api";

function ServiceCard({ service, onBind, binding }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-2 text-lg font-semibold">{service.serverName || `Service ${service.serviceId}`}</div>
      <div className="space-y-1 text-sm text-zinc-400">
        <div>Service ID: {service.serviceId}</div>
        <div>Тип: {service.serviceType || "—"}</div>
        <div>Синхронизация: {service.lastSyncedAt || "—"}</div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs ${service.isBoundToCurrentGuild ? "bg-emerald-950 text-emerald-300" : "bg-zinc-900 text-zinc-300"}`}>
          {service.isBoundToCurrentGuild ? "Подключен к этому серверу" : service.boundGuildId ? `Подключен к guild ${service.boundGuildId}` : "Не привязан"}
        </span>
        <button
          onClick={() => onBind(service.serviceId)}
          disabled={binding}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {binding ? "Подключение..." : "Подключить"}
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { slug } = useParams();
  const nav = [
    { label: "Dashboard", to: `/admin/${slug}` },
    { label: "Настройки", to: `/admin/${slug}/settings` },
    { label: "Кланы", to: `/admin/${slug}/clans` },
    { label: "Категории", to: `/admin/${slug}/categories` },
    { label: "Товары", to: `/admin/${slug}/items` },
    { label: "Заказы", to: `/admin/${slug}/orders` },
    { label: "Медиа", to: `/admin/${slug}/media` },
    { label: "Доступ", to: `/admin/${slug}/access` }
  ];

  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [binding, setBinding] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const accessPayload = await api(`guild-access?slug=${encodeURIComponent(slug)}`);
      setAccess(accessPayload);
      if (!accessPayload.canUseAdminZone) {
        setLoading(false);
        return;
      }
      const nitradoPayload = await api(`admin-nitrado-account?slug=${encodeURIComponent(slug)}`);
      setData(nitradoPayload);
    } catch (err) {
      setError(err.message || "Не удалось загрузить панель");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [slug]);

  async function handleBind(serviceId) {
    try {
      setBinding(true);
      await api("admin-nitrado-bind", {
        method: "POST",
        body: JSON.stringify({ slug, serviceId })
      });
      await load();
    } catch (err) {
      setError(err.message || "Не удалось подключить сервис");
    } finally {
      setBinding(false);
    }
  }

  return (
    <AdminLayout title="Админка" subtitle={`Сервер: ${slug}`} nav={nav}>
      {loading ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">Загрузка...</div> : null}

      {!loading && error ? <div className="mb-4 rounded-2xl border border-red-900 bg-red-950/50 p-4 text-red-200">{error}</div> : null}

      {!loading && access && !access.canUseAdminZone ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          У тебя нет доступа к админке этого сервера.
        </div>
      ) : null}

      {!loading && access?.canUseAdminZone && !data?.connected ? (
        <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div>
            <h2 className="text-xl font-semibold">Подключение Nitrado</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Подключи Nitrado аккаунт, и сайт автоматически подтянет доступные services и даст привязать их к текущему серверу.
            </p>
          </div>
          <div>
            <a
              href="/api/nitrado-login"
              className="inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Подключить Nitrado
            </a>
          </div>
        </div>
      ) : null}

      {!loading && data?.connected ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-xl font-semibold">Nitrado аккаунт подключен</h2>
            <div className="mt-3 text-sm text-zinc-400">
              <div>Аккаунт: {data.account?.accountLabel || "—"}</div>
              <div>Token type: {data.account?.tokenType || "—"}</div>
              <div>Обновлено: {data.account?.updatedAt || "—"}</div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Доступные игровые серверы</h3>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(data.services || []).map((service) => (
                <ServiceCard key={service.serviceId} service={service} onBind={handleBind} binding={binding} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
