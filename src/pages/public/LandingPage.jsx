import { useEffect, useMemo, useState } from "react";
import PublicLayout from "../../components/layout/PublicLayout";
import { getMe, loginWithDiscord, logout } from "../../lib/auth";
import { getAvailableGuilds } from "../../lib/guild";

function ActionButton({ href, onClick, children, secondary = false }) {
  const className = secondary
    ? "inline-flex rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-900"
    : "inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500";

  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export default function LandingPage() {
  const [me, setMe] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const mePayload = await getMe();
        if (cancelled) return;
        setMe(mePayload);
        const guildPayload = await getAvailableGuilds();
        if (cancelled) return;
        setGuilds(guildPayload.guilds || []);
      } catch {
        if (!cancelled) {
          setMe(null);
          setGuilds([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const primaryGuild = useMemo(() => guilds[0] || { slug: "elysium", displayName: "Elysium" }, [guilds]);

  const headerActions = me?.user ? (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <div className="text-sm font-medium text-white">{me.user.global_name || me.user.username}</div>
        <div className="text-xs text-zinc-400">{me.isSuperAdmin ? "Super-admin" : "Авторизован"}</div>
      </div>
      <ActionButton href={`/admin/${primaryGuild.slug}`}>Админка</ActionButton>
      <ActionButton secondary onClick={() => logout().then(() => window.location.reload())}>
        Выйти
      </ActionButton>
    </div>
  ) : (
    <ActionButton onClick={loginWithDiscord}>Войти через Discord</ActionButton>
  );

  return (
    <PublicLayout title="Elysium Web" subtitle="Мультисерверный кабинет и магазин" actions={headerActions}>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-2 text-lg font-semibold">Вход через Discord</h2>
            <p className="mb-4 text-sm text-zinc-400">После входа и /link игрок получает доступ к кабинету и магазину.</p>
            <div className="flex flex-wrap gap-3">
              {!me?.user ? <ActionButton onClick={loginWithDiscord}>Войти через Discord</ActionButton> : null}
              <ActionButton href={`/servers/${primaryGuild.slug}`} secondary>
                Открыть сервер
              </ActionButton>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-2 text-lg font-semibold">Мультисерверная архитектура</h2>
            <p className="mb-4 text-sm text-zinc-400">Каждый Discord guild работает в своем контексте.</p>
            <div className="flex flex-wrap gap-3">
              <ActionButton href={`/admin/${primaryGuild.slug}`}>Открыть админку</ActionButton>
              <ActionButton href={`/app/${primaryGuild.slug}`} secondary>
                Кабинет игрока
              </ActionButton>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h3 className="mb-3 text-lg font-semibold">Доступные серверы</h3>
          {loading ? <div className="text-sm text-zinc-400">Загрузка...</div> : null}
          {!loading && !guilds.length ? (
            <div className="text-sm text-zinc-400">Пока серверы не определены автоматически. Можно открыть основной slug: <code>/admin/elysium</code></div>
          ) : null}
          {!!guilds.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {guilds.map((guild) => (
                <div key={guild.slug} className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <div className="text-lg font-semibold">{guild.displayName}</div>
                  <div className="mt-1 text-sm text-zinc-400">{guild.shortDescription || guild.slug}</div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <ActionButton href={`/servers/${guild.slug}`} secondary>
                      Публичная страница
                    </ActionButton>
                    <ActionButton href={`/admin/${guild.slug}`}>Админка</ActionButton>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
        </div>
      </div>
    </PublicLayout>
  );
}
