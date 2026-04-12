import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { api } from "../../lib/api";
import { getAdminNav } from "../../lib/admin";

const emptyForm = {
  currencyName: "Coins",
  playtimeReward: 0,
  killReward: 0,
  statusChannelId: "",
  linkChannelId: "",
  economyLogChannelId: ""
};

function NumberField({ label, value, onChange, min = 0, helper }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-zinc-200">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(Number(event.target.value || 0))}
        className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
      />
      {helper ? <span className="text-xs text-zinc-500">{helper}</span> : null}
    </label>
  );
}

function ChannelSelect({ label, value, onChange, channels = [], helper }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-zinc-200">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none"
      >
        <option value="">Не выбрано</option>
        {channels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            #{channel.name}
          </option>
        ))}
      </select>
      {helper ? <span className="text-xs text-zinc-500">{helper}</span> : null}
    </label>
  );
}

function ManualChannelField({ label, value, onChange }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-zinc-200">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D+/g, ""))}
        className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
        placeholder="Discord channel ID"
      />
    </label>
  );
}

export default function AdminEconomyPage() {
  const { slug = "elysium" } = useParams();
  const nav = useMemo(() => getAdminNav(slug), [slug]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [channels, setChannels] = useState([]);
  const [channelPickerEnabled, setChannelPickerEnabled] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const payload = await api(`admin-economy-settings?slug=${encodeURIComponent(slug)}`);
      setForm({ ...emptyForm, ...(payload?.settings || {}) });
      setChannels(payload?.channels || []);
      setChannelPickerEnabled(Boolean(payload?.channelPickerEnabled));
    } catch (err) {
      setError(err.message || "Не удалось загрузить экономику сервера");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [slug]);

  async function handleSave(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const payload = await api("admin-economy-settings", {
        method: "POST",
        body: JSON.stringify({ slug, ...form }),
      });
      setForm({ ...emptyForm, ...(payload?.settings || form) });
      setSuccess("Настройки экономики сохранены");
    } catch (err) {
      setError(err.message || "Не удалось сохранить настройки экономики");
    } finally {
      setSaving(false);
    }
  }

  const channelSelectAvailable = channelPickerEnabled && channels.length > 0;

  return (
    <AdminLayout title="Экономика сервера" subtitle={`Управление наградами и каналами для ${slug}`} nav={nav}>
      {loading ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">Загрузка...</div> : null}

      {!loading && error ? (
        <div className="mb-4 rounded-2xl border border-red-900 bg-red-950/50 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {!loading ? (
        <form onSubmit={handleSave} className="space-y-6">
          {success ? (
            <div className="rounded-2xl border border-emerald-900 bg-emerald-950/50 p-4 text-sm text-emerald-200">
              {success}
            </div>
          ) : null}

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-xl font-semibold text-white">Награды и валюта</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Эти значения записываются прямо в общую базу бота. Для каждого Discord-сервера они хранятся отдельно по `guild_id`.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-200">Название валюты</span>
                <input
                  value={form.currencyName}
                  onChange={(event) => setForm((prev) => ({ ...prev, currencyName: event.target.value.slice(0, 50) }))}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                  placeholder="Например: Credits"
                />
              </label>

              <NumberField
                label="Награда за убийство"
                value={form.killReward}
                onChange={(value) => setForm((prev) => ({ ...prev, killReward: value }))}
                helper="Сколько игрок получает валюты за kill:player"
              />

              <NumberField
                label="Награда за полный час игры"
                value={form.playtimeReward}
                onChange={(value) => setForm((prev) => ({ ...prev, playtimeReward: value }))}
                helper="Сколько начисляется за каждые 3600 секунд онлайн"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-xl font-semibold text-white">Каналы Discord</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Можно выбрать каналы прямо с сайта. Для загрузки списка каналов web backend должен знать токен Discord-бота.
            </p>

            {!channelPickerEnabled ? (
              <div className="mt-4 rounded-xl border border-amber-900 bg-amber-950/40 p-4 text-sm text-amber-200">
                Список каналов сейчас недоступен, потому что в backend не задан `DISCORD_BOT_TOKEN`. Ниже всё равно можно вручную ввести ID каналов.
              </div>
            ) : null}

            {channelPickerEnabled && !channels.length ? (
              <div className="mt-4 rounded-xl border border-zinc-800 bg-black p-4 text-sm text-zinc-400">
                Бот не вернул список каналов. Обычно это значит, что бот ещё не приглашён на этот Discord-сервер или у него нет доступа к чтению каналов.
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {channelSelectAvailable ? (
                <>
                  <ChannelSelect
                    label="Канал для /status"
                    value={form.statusChannelId}
                    onChange={(value) => setForm((prev) => ({ ...prev, statusChannelId: value }))}
                    channels={channels}
                    helper="Игроки смогут использовать /status только в этом канале"
                  />
                  <ChannelSelect
                    label="Канал для /link"
                    value={form.linkChannelId}
                    onChange={(value) => setForm((prev) => ({ ...prev, linkChannelId: value }))}
                    channels={channels}
                    helper="Опционально: ограничить использование /link одним каналом"
                  />
                  <ChannelSelect
                    label="Канал логов экономики"
                    value={form.economyLogChannelId}
                    onChange={(value) => setForm((prev) => ({ ...prev, economyLogChannelId: value }))}
                    channels={channels}
                    helper="Сюда бот сможет писать награды, выдачи и другие события экономики"
                  />
                </>
              ) : (
                <>
                  <ManualChannelField
                    label="ID канала для /status"
                    value={form.statusChannelId}
                    onChange={(value) => setForm((prev) => ({ ...prev, statusChannelId: value }))}
                  />
                  <ManualChannelField
                    label="ID канала для /link"
                    value={form.linkChannelId}
                    onChange={(value) => setForm((prev) => ({ ...prev, linkChannelId: value }))}
                  />
                  <ManualChannelField
                    label="ID канала логов экономики"
                    value={form.economyLogChannelId}
                    onChange={(value) => setForm((prev) => ({ ...prev, economyLogChannelId: value }))}
                  />
                </>
              )}
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {saving ? "Сохранение..." : "Сохранить экономику"}
            </button>
            <button
              type="button"
              onClick={load}
              disabled={saving}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800 disabled:opacity-60"
            >
              Обновить данные
            </button>
          </div>
        </form>
      ) : null}
    </AdminLayout>
  );
}
