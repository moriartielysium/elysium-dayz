import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { api } from "../../lib/api";
import { getAdminNav } from "../../lib/admin";
import { loginWithDiscord } from "../../lib/auth";

export default function AdminDashboardPage() {
  const { slug } = useParams();
  const nav = getAdminNav(slug);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [apiToken, setApiToken] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const payload = await api(`admin-nitrado-account?slug=${encodeURIComponent(slug)}`);
      setData(payload);
    } catch (err) {
      setError(err.message || "Не удалось загрузить панель");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [slug]);

  async function handleConnect(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await api("admin-nitrado-connect", {
        method: "POST",
        body: JSON.stringify({
          slug,
          serviceId: String(serviceId).trim(),
          apiToken: String(apiToken).trim(),
        }),
      });
      setApiToken("");
      await load();
    } catch (err) {
      setError(err.message || "Не удалось подключить сервер");
    } finally {
      setSaving(false);
    }
  }

  async function handleRefresh() {
    try {
      setSaving(true);
      setError("");
      await api("admin-nitrado-refresh", {
        method: "POST",
        body: JSON.stringify({ slug }),
      });
      await load();
    } catch (err) {
      setError(err.message || "Не удалось обновить данные");
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect() {
    const confirmed = window.confirm("Отключить текущий Nitrado сервер от этой панели?");
    if (!confirmed) return;
    try {
      setSaving(true);
      setError("");
      await api("admin-nitrado-disconnect", {
        method: "POST",
        body: JSON.stringify({ slug }),
      });
      await load();
    } catch (err) {
      setError(err.message || "Не удалось отключить сервер");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout title="Админка" subtitle={`Сервер: ${slug}`} nav={nav}>
      {loading ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">Загрузка...</div> : null}

      {!loading && error ? <div className="mb-4 rounded-2xl border border-red-900 bg-red-950/50 p-4 text-red-200">{error}</div> : null}

      {!loading && error === "Not logged in" ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-xl font-semibold">Требуется вход через Discord</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Админка теперь требует активную Discord-сессию. Сначала войди через Discord, потом открывай настройки сервера.
          </p>
          <button
            onClick={loginWithDiscord}
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Войти через Discord
          </button>
        </div>
      ) : null}

      {!loading && !error && !data?.connected ? (
        <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div>
            <h2 className="text-xl font-semibold">Подключение Nitrado вручную</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Вставь <span className="font-medium text-zinc-200">Service ID</span> и{" "}
              <span className="font-medium text-zinc-200">API Token</span> от своего Nitrado аккаунта.
              После проверки сайт сохранит подключение и начнет работать с этим сервером.
            </p>
          </div>

          <form className="grid gap-4 md:max-w-xl" onSubmit={handleConnect}>
            <label className="grid gap-2">
              <span className="text-sm text-zinc-300">Service ID</span>
              <input
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500"
                placeholder="Например: 12345678"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-zinc-300">Nitrado API Token</span>
              <input
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500"
                placeholder="Вставь токен сюда"
                required
              />
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving || !serviceId || !apiToken}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                {saving ? "Подключение..." : "Подключить сервер"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {!loading && data?.connected ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Nitrado сервер подключен</h2>
                <div className="mt-3 space-y-1 text-sm text-zinc-400">
                  <div>Service ID: {data.serviceId || "—"}</div>
                  <div>Имя сервера: {data.serverName || "—"}</div>
                  <div>Тип: {data.serviceType || "—"}</div>
                  <div>Токен: {data.tokenLast4 ? `****${data.tokenLast4}` : "—"}</div>
                  <div>Обновлено: {data.updatedAt || "—"}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={saving}
                  className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700 disabled:opacity-60"
                >
                  {saving ? "Обновление..." : "Обновить"}
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={saving}
                  className="rounded-xl bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
                >
                  Отключить
                </button>
              </div>
            </div>
          </div>

          {data.details ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="mb-3 text-lg font-semibold">Данные сервера</h3>
              <pre className="overflow-auto rounded-xl bg-zinc-900 p-4 text-xs text-zinc-300">
                {JSON.stringify(data.details, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </AdminLayout>
  );
}
