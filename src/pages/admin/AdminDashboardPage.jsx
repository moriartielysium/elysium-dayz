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
        <div>Привязка: {service.isBoundToCurrentGuild ? "к этому серверу" : service.boundGuildId ? `guild ${service.boundGuildId}` : "нет"}</div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs ${service.isBoundToCurrentGuild ? "bg-emerald-950 text-emerald-300" : "bg-zinc-900 text-zinc-300"}`}>
          {service.isBoundToCurrentGuild ? "Подключен" : "Доступен"}
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
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [binding, setBinding] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError("");
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

  async function handleNitradoLogout() {
    try {
      await api("nitrado-logout", { method: "POST" });
      window.location.reload();
    } catch (err) {
      setError(err.message || "Не удалось выйти из Nitrado");
    }
  }

  return (
    <AdminLayout title="Админка" subtitle={`Сервер: ${slug}`} nav={nav}>
      {loading ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">Загрузка...</div> : null}
      {!loading && error ? <div className="mb-4 rounded-2xl border border-red-900 bg-red-950/50 p-4 text-red-200">{error}</div> : null}

      {!loading && !data?.connected ? (
        <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div>
            <h2 className="text-xl font-semibold">Вход для администраторов</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Войди через Nitrado, предоставь доступ приложению и после этого сайт автоматически загрузит доступные игровые серверы.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`/api/nitrado-login?slug=${encodeURIComponent(slug)}`}
              className="inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Войти через Nitrado
            </a>
          </div>
        </div>
      ) : null}

      {!loading && data?.connected ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Nitrado аккаунт подключен</h2>
                <div className="mt-3 text-sm text-zinc-400">
                  <div>Аккаунт: {data.account?.accountLabel || "—"}</div>
                  <div>Token type: {data.account?.tokenType || "—"}</div>
                  <div>Доступно services: {(data.services || []).length}</div>
                </div>
              </div>
              <button
                onClick={handleNitradoLogout}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-900"
              >
                Отключить Nitrado
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Доступные игровые серверы</h3>
            {(data.services || []).length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(data.services || []).map((service) => (
                  <ServiceCard key={service.serviceId} service={service} onBind={handleBind} binding={binding} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
                В текущем Nitrado-аккаунте не найдено доступных игровых services.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
