import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../lib/api';
import { loginWithDiscord } from '../../lib/auth';
import { getAdminNav } from '../../lib/admin';

const EMPTY_SETTINGS = {
  currencyName: '$',
  playtimeReward: 500,
  killReward: 0,
  statusChannelId: '',
  linkChannelId: '',
  economyLogChannelId: '',
};

export default function AdminEconomyPage() {
  const { slug } = useParams();
  const nav = useMemo(() => getAdminNav(slug), [slug]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState(null);
  const [form, setForm] = useState(EMPTY_SETTINGS);
  const [channels, setChannels] = useState([]);
  const [channelPickerEnabled, setChannelPickerEnabled] = useState(false);
  const [channelsLoaded, setChannelsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const payload = await api(`admin-economy-settings?slug=${encodeURIComponent(slug)}`);
        if (cancelled) return;
        setMeta({ guildId: payload.guildId, displayName: payload.displayName, slug: payload.slug });
        setForm({ ...EMPTY_SETTINGS, ...(payload.settings || {}) });
        setChannels(payload.channels || []);
        setChannelPickerEnabled(Boolean(payload.channelPickerEnabled));
        setChannelsLoaded(Boolean(payload.channelsLoaded));
      } catch (err) {
        if (cancelled) return;
        if (err?.status === 401) {
          setError('Сначала войди как администратор через Discord.');
        } else {
          setError(err?.message || 'Не удалось загрузить настройки экономики');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      const payload = await api('admin-economy-settings', {
        method: 'POST',
        body: JSON.stringify({
          slug,
          currencyName: form.currencyName,
          playtimeReward: Number(form.playtimeReward || 0),
          killReward: Number(form.killReward || 0),
          statusChannelId: form.statusChannelId,
          linkChannelId: form.linkChannelId,
          economyLogChannelId: form.economyLogChannelId,
        }),
      });
      setForm({ ...EMPTY_SETTINGS, ...(payload.settings || {}) });
    } catch (err) {
      if (err?.status === 401) {
        setError('Сессия администратора истекла. Войди заново через Discord.');
      } else {
        setError(err?.message || 'Не удалось сохранить экономику');
      }
    } finally {
      setSaving(false);
    }
  }

  function ChannelField({ label, value, fieldName, placeholder }) {
    const showSelect = channelPickerEnabled && channels.length > 0;
    return (
      <label className="grid gap-2">
        <span className="text-sm text-zinc-300">{label}</span>
        {showSelect ? (
          <select
            value={value || ''}
            onChange={(event) => setField(fieldName, event.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none"
          >
            <option value="">Не выбрано</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                #{channel.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={value || ''}
            onChange={(event) => setField(fieldName, event.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            placeholder={placeholder}
          />
        )}
      </label>
    );
  }

  return (
    <AdminLayout title="Экономика" subtitle={`Сервер: ${meta?.displayName || slug}`} nav={nav}>
      {loading ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">Загрузка экономики...</div> : null}

      {!loading && error ? <div className="mb-4 rounded-2xl border border-red-900 bg-red-950/50 p-4 text-red-200">{error}</div> : null}

      {!loading && error && error.includes('Discord') ? (
        <div className="mb-6">
          <button
            onClick={() => loginWithDiscord('/admin/select-server')}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Войти как администратор через Discord
          </button>
        </div>
      ) : null}

      {!loading && !error ? (
        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-xl font-semibold">Настройки валюты сервера</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Эти значения применяются только к выбранному Discord-серверу. У каждого сервера в панели
              может быть своя валюта, свои награды и свои каналы для команд бота.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm text-zinc-300">Название валюты</span>
                <input
                  value={form.currencyName || ''}
                  onChange={(event) => setField('currencyName', event.target.value)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                  placeholder="Например: $"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-zinc-300">Награда за 1 час игры</span>
                <input
                  type="number"
                  min="0"
                  value={form.playtimeReward ?? 0}
                  onChange={(event) => setField('playtimeReward', event.target.value)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-zinc-300">Награда за убийство</span>
                <input
                  type="number"
                  min="0"
                  value={form.killReward ?? 0}
                  onChange={(event) => setField('killReward', event.target.value)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-xl font-semibold">Каналы Discord</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Укажи каналы, в которых бот должен принимать команды и публиковать служебные сообщения.
              {channelPickerEnabled && channelsLoaded ? ' Бот-токен задан, поэтому список каналов загружен автоматически.' : ''}
              {channelPickerEnabled && !channelsLoaded ? ' Бот-токен задан, но список каналов пока не удалось загрузить — можно ввести ID вручную.' : ''}
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ChannelField label="Канал для /status" value={form.statusChannelId} fieldName="statusChannelId" placeholder="Discord channel ID" />
              <ChannelField label="Канал для /link" value={form.linkChannelId} fieldName="linkChannelId" placeholder="Discord channel ID" />
              <ChannelField label="Канал логов экономики" value={form.economyLogChannelId} fieldName="economyLogChannelId" placeholder="Discord channel ID" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {saving ? 'Сохранение...' : 'Сохранить экономику'}
            </button>
          </div>
        </form>
      ) : null}
    </AdminLayout>
  );
}
