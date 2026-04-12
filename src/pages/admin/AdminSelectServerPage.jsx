import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { api } from '../../lib/api';
import { getMe, loginWithDiscord, logout } from '../../lib/auth';

function DiscordServerIcon({ guild }) {
  const iconUrl = guild?.icon && guild?.guildId
    ? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.png?size=128`
    : '';

  if (iconUrl) {
    return <img src={iconUrl} alt={guild.name} className="h-12 w-12 rounded-2xl border border-zinc-800 object-cover" />;
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-lg font-semibold text-zinc-300">
      {String(guild?.name || 'S').slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function AdminSelectServerPage() {
  const [me, setMe] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyGuildId, setBusyGuildId] = useState('');
  const [connected, setConnected] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const mePayload = await getMe();
        if (cancelled) return;
        setMe(mePayload);
        const guildPayload = await api('discord-owned-guilds');
        if (cancelled) return;
        setGuilds(guildPayload.guilds || []);
      } catch (err) {
        if (!cancelled) {
          setMe(null);
          setGuilds([]);
          setError(err?.message || 'Не удалось загрузить Discord-серверы');
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

  const actions = me?.user ? (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <div className="text-sm font-medium text-white">{me.user.global_name || me.user.username}</div>
        <div className="text-xs text-zinc-400">Владелец Discord-сервера</div>
      </div>
      <button
        onClick={() => logout().then(() => window.location.reload())}
        className="inline-flex rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-900"
      >
        Выйти
      </button>
    </div>
  ) : null;

  async function handleConnect(guild) {
    try {
      setBusyGuildId(guild.guildId);
      setError('');
      const payload = await api('admin-guild-connect', {
        method: 'POST',
        body: JSON.stringify({
          guildId: guild.guildId,
          guildName: guild.name,
          icon: guild.icon || null,
        }),
      });
      setConnected(payload);
    } catch (err) {
      setError(err?.message || 'Не удалось подготовить сервер для админки');
    } finally {
      setBusyGuildId('');
    }
  }

  const infoCard = useMemo(() => {
    if (!connected) return null;
    return (
      <div className="rounded-2xl border border-emerald-900 bg-emerald-950/40 p-6">
        <h2 className="text-xl font-semibold text-white">Сервер подготовлен</h2>
        <div className="mt-3 space-y-1 text-sm text-emerald-100/90">
          <div>Discord сервер: {connected.displayName}</div>
          <div>Slug панели: {connected.slug}</div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={connected.inviteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Пригласить бота на этот сервер
          </a>
          <Link
            to={`/admin/${connected.slug}`}
            className="inline-flex rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-900"
          >
            Перейти к настройке
          </Link>
        </div>
      </div>
    );
  }, [connected]);

  return (
    <PublicLayout
      title="Админ-подключение Discord"
      subtitle="Выбери сервер, где ты владелец, и подготовь панель управления"
      actions={actions}
    >
      <div className="space-y-6">
        {!me?.user && !loading ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-xl font-semibold">Вход для администратора</h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Сначала войди через Discord. После входа сайт покажет только те Discord-серверы, где ты владелец.
              Затем ты выберешь сервер, пригласишь туда бота и перейдёшь к настройке Nitrado и экономики.
            </p>
            <div className="mt-5">
              <button
                onClick={() => loginWithDiscord('/admin/select-server')}
                className="inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Войти как администратор через Discord
              </button>
            </div>
          </div>
        ) : null}

        {loading ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">Загрузка серверов Discord...</div> : null}

        {error ? <div className="rounded-2xl border border-red-900 bg-red-950/50 p-4 text-red-200">{error}</div> : null}

        {infoCard}

        {me?.user ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Твои Discord-серверы</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Ниже показаны только серверы, где твой аккаунт является владельцем. Выбери нужный сервер,
                чтобы создать для него отдельную панель, свою экономику и свои настройки.
              </p>
            </div>

            {!guilds.length ? (
              <div className="rounded-2xl border border-zinc-800 bg-black p-5 text-sm text-zinc-400">
                Discord не вернул серверы владельца. Проверь, что ты действительно владелец сервера,
                а в Discord OAuth у приложения включены scope <code>identify</code> и <code>guilds</code>.
              </div>
            ) : null}

            {!!guilds.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {guilds.map((guild) => (
                  <div key={guild.guildId} className="rounded-2xl border border-zinc-800 bg-black p-4">
                    <div className="flex items-start gap-4">
                      <DiscordServerIcon guild={guild} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-lg font-semibold text-white">{guild.name}</div>
                        <div className="mt-1 text-xs text-zinc-500">ID: {guild.guildId}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleConnect(guild)}
                        disabled={busyGuildId === guild.guildId}
                        className="inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
                      >
                        {busyGuildId === guild.guildId ? 'Подготовка...' : 'Выбрать сервер'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </PublicLayout>
  );
}
