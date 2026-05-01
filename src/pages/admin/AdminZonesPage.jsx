import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { loginWithDiscord } from '../../lib/auth';
import { getAdminNav } from '../../lib/admin';
import {
  createZone,
  deleteZone,
  loadZonesAdmin,
  normalizeSettings,
  normalizeZone,
  saveZoneSettings,
  updateZone,
} from '../../lib/zones';

const EMPTY_ZONE = {
  id: '',
  name: '',
  description: '',
  centerX: '',
  centerZ: '',
  radius: 150,
  captureSeconds: 300,
  rewardAmount: 0,
  color: '#f59e0b',
  enabled: true,
};

const EMPTY_SETTINGS = {
  enabled: true,
  announceChannelId: '',
  eventLogChannelId: '',
  defaultCaptureSeconds: 300,
  defaultRewardAmount: 0,
  minPlayersToCapture: 1,
  tickSeconds: 30,
};

function numberOrEmpty(value) {
  if (value === undefined || value === null || value === '') return '';
  const number = Number(value);
  return Number.isFinite(number) ? number : '';
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function toZoneForm(zone) {
  if (!zone) return EMPTY_ZONE;
  const normalized = normalizeZone(zone.raw || zone);
  return {
    id: normalized.id || '',
    name: normalized.name || '',
    description: normalized.description || '',
    centerX: numberOrEmpty(normalized.centerX),
    centerZ: numberOrEmpty(normalized.centerZ),
    radius: numberOrEmpty(normalized.radius),
    captureSeconds: numberOrEmpty(normalized.captureSeconds),
    rewardAmount: numberOrEmpty(normalized.rewardAmount),
    color: normalized.color || '#f59e0b',
    enabled: Boolean(normalized.enabled),
  };
}

function statLabel(value, fallback = '—') {
  if (value === undefined || value === null || value === '') return fallback;
  return value;
}

export default function AdminZonesPage() {
  const { slug } = useParams();
  const nav = useMemo(() => getAdminNav(slug), [slug]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [meta, setMeta] = useState(null);
  const [zones, setZones] = useState([]);
  const [events, setEvents] = useState([]);
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [form, setForm] = useState(EMPTY_ZONE);

  const isEditing = Boolean(form.id);

  async function load() {
    try {
      setLoading(true);
      setError('');
      setNotice('');
      const payload = await loadZonesAdmin(slug);
      setMeta(payload.meta || null);
      setSettings({ ...EMPTY_SETTINGS, ...normalizeSettings(payload.settings || {}) });
      setZones(payload.zones || []);
      setEvents(payload.events || []);
    } catch (err) {
      if (err?.status === 401) {
        setError('Сначала войди как администратор через Discord и выбери сервер.');
      } else if (err?.status === 403) {
        setError('У тебя нет доступа к управлению зонами этого Discord-сервера.');
      } else if (err?.status === 404 || err?.status === 405 || err?.status === 501) {
        setError('Backend API зон не найден. Проверь, что app/routes/zones.py подключен в app/main.py и backend отдаёт /api/zones или /zones через прокси сайта.');
      } else {
        setError(err?.message || 'Не удалось загрузить зоны');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function safeLoad() {
      try {
        setLoading(true);
        setError('');
        setNotice('');
        const payload = await loadZonesAdmin(slug);
        if (cancelled) return;
        setMeta(payload.meta || null);
        setSettings({ ...EMPTY_SETTINGS, ...normalizeSettings(payload.settings || {}) });
        setZones(payload.zones || []);
        setEvents(payload.events || []);
      } catch (err) {
        if (cancelled) return;
        if (err?.status === 401) {
          setError('Сначала войди как администратор через Discord и выбери сервер.');
        } else if (err?.status === 403) {
          setError('У тебя нет доступа к управлению зонами этого Discord-сервера.');
        } else if (err?.status === 404 || err?.status === 405 || err?.status === 501) {
          setError('Backend API зон не найден. Проверь, что app/routes/zones.py подключен в app/main.py и backend отдаёт /api/zones или /zones через прокси сайта.');
        } else {
          setError(err?.message || 'Не удалось загрузить зоны');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    safeLoad();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  function setZoneField(fieldName, value) {
    setForm((current) => ({ ...current, [fieldName]: value }));
  }

  function setSettingsField(fieldName, value) {
    setSettings((current) => ({ ...current, [fieldName]: value }));
  }

  function resetForm() {
    setForm({
      ...EMPTY_ZONE,
      captureSeconds: settings.defaultCaptureSeconds || EMPTY_ZONE.captureSeconds,
      rewardAmount: settings.defaultRewardAmount || EMPTY_ZONE.rewardAmount,
    });
  }

  async function handleSaveSettings(event) {
    event.preventDefault();
    try {
      setSavingSettings(true);
      setError('');
      setNotice('');
      await saveZoneSettings(slug, settings);
      setNotice('Настройки Zone Control сохранены.');
      await load();
    } catch (err) {
      setError(err?.message || 'Не удалось сохранить настройки зон');
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleSaveZone(event) {
    event.preventDefault();

    if (!String(form.name || '').trim()) {
      setError('Укажи название зоны.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setNotice('');
      if (isEditing) {
        await updateZone(slug, form.id, form);
        setNotice(`Зона «${form.name}» обновлена.`);
      } else {
        await createZone(slug, form);
        setNotice(`Зона «${form.name}» создана.`);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err?.message || 'Не удалось сохранить зону');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteZone(zone) {
    const confirmed = window.confirm(`Удалить зону «${zone.name || zone.id}»?`);
    if (!confirmed) return;

    try {
      setSaving(true);
      setError('');
      setNotice('');
      await deleteZone(slug, zone.id);
      setNotice(`Зона «${zone.name || zone.id}» удалена.`);
      if (form.id === zone.id) resetForm();
      await load();
    } catch (err) {
      setError(err?.message || 'Не удалось удалить зону');
    } finally {
      setSaving(false);
    }
  }

  const enabledZones = zones.filter((zone) => zone.enabled).length;

  return (
    <AdminLayout title="Зоны" subtitle={`Zone Control: ${meta?.displayName || slug}`} nav={nav}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-amber-900/60 bg-amber-950/20 p-5 text-sm text-amber-100/90">
          <div className="font-semibold text-amber-100">Управление зонами перенесено в личный кабинет.</div>
          <div className="mt-2 text-amber-100/75">
            Эта страница использует backend API Zone Control и не добавляет slash-команды Discord. Временную команду <code className="rounded bg-black/30 px-1.5 py-0.5">.zone</code> можно оставить как аварийный вариант до проверки панели.
          </div>
        </div>

        {loading ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">Загрузка зон...</div> : null}

        {!loading && error ? <div className="rounded-2xl border border-red-900 bg-red-950/50 p-4 text-red-200">{error}</div> : null}
        {!loading && notice ? <div className="rounded-2xl border border-emerald-900 bg-emerald-950/40 p-4 text-emerald-100">{notice}</div> : null}

        {!loading && error && error.includes('Discord') ? (
          <div>
            <button
              onClick={() => loginWithDiscord('/admin/select-server')}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Войти как администратор через Discord
            </button>
          </div>
        ) : null}

        {!loading && !error ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="text-sm text-zinc-400">Всего зон</div>
                <div className="mt-2 text-3xl font-bold text-white">{zones.length}</div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="text-sm text-zinc-400">Активные зоны</div>
                <div className="mt-2 text-3xl font-bold text-white">{enabledZones}</div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="text-sm text-zinc-400">Zone Control</div>
                <div className={settings.enabled ? 'mt-2 text-3xl font-bold text-emerald-300' : 'mt-2 text-3xl font-bold text-zinc-400'}>
                  {settings.enabled ? 'Вкл' : 'Выкл'}
                </div>
              </div>
            </div>

            <form className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6" onSubmit={handleSaveSettings}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Общие настройки Zone Control</h2>
                  <p className="mt-2 max-w-3xl text-sm text-zinc-400">
                    Настройки применяются к выбранному Discord/Nitrado серверу. ID каналов можно оставить пустыми, если объявления и логи обрабатываются ботом отдельно.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-black px-3 py-2 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.enabled)}
                    onChange={(event) => setSettingsField('enabled', event.target.checked)}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  Zone Control включён
                </label>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Канал объявлений" hint="Discord channel ID">
                  <TextInput value={settings.announceChannelId} onChange={(value) => setSettingsField('announceChannelId', value)} placeholder="Например: 1234567890" />
                </Field>
                <Field label="Канал логов событий" hint="Discord channel ID">
                  <TextInput value={settings.eventLogChannelId} onChange={(value) => setSettingsField('eventLogChannelId', value)} placeholder="Например: 1234567890" />
                </Field>
                <Field label="Время захвата по умолчанию" hint="секунды">
                  <NumberInput min="1" value={settings.defaultCaptureSeconds} onChange={(value) => setSettingsField('defaultCaptureSeconds', value)} />
                </Field>
                <Field label="Награда по умолчанию" hint="валюта сервера">
                  <NumberInput min="0" value={settings.defaultRewardAmount} onChange={(value) => setSettingsField('defaultRewardAmount', value)} />
                </Field>
                <Field label="Минимум игроков" hint="для захвата">
                  <NumberInput min="1" value={settings.minPlayersToCapture} onChange={(value) => setSettingsField('minPlayersToCapture', value)} />
                </Field>
                <Field label="Интервал проверки" hint="секунды">
                  <NumberInput min="5" value={settings.tickSeconds} onChange={(value) => setSettingsField('tickSeconds', value)} />
                </Field>
              </div>

              <div className="mt-5">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                  {savingSettings ? 'Сохранение...' : 'Сохранить настройки'}
                </button>
              </div>
            </form>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Список зон</h2>
                    <p className="mt-2 text-sm text-zinc-400">Создавай и редактируй точки захвата без новых slash-команд.</p>
                  </div>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-900"
                  >
                    Новая зона
                  </button>
                </div>

                {!zones.length ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-black p-6 text-sm text-zinc-400">
                    Зон пока нет. Заполни форму справа и нажми «Создать зону».
                  </div>
                ) : null}

                {!!zones.length ? (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-800">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-zinc-800 text-sm">
                        <thead className="bg-black/60 text-left text-xs uppercase tracking-wide text-zinc-500">
                          <tr>
                            <th className="px-4 py-3">Зона</th>
                            <th className="px-4 py-3">Координаты</th>
                            <th className="px-4 py-3">Радиус</th>
                            <th className="px-4 py-3">Захват</th>
                            <th className="px-4 py-3">Статус</th>
                            <th className="px-4 py-3 text-right">Действия</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 bg-zinc-950">
                          {zones.map((zone) => (
                            <tr key={zone.id || zone.name} className="align-top">
                              <td className="px-4 py-4">
                                <div className="flex items-start gap-3">
                                  <span className="mt-1 h-3 w-3 rounded-full border border-white/20" style={{ background: zone.color || '#f59e0b' }} />
                                  <div>
                                    <div className="font-medium text-white">{zone.name || 'Без названия'}</div>
                                    {zone.description ? <div className="mt-1 max-w-xs text-xs text-zinc-500">{zone.description}</div> : null}
                                    {zone.ownerName ? <div className="mt-1 text-xs text-amber-300">Владелец: {zone.ownerName}</div> : null}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-zinc-300">X {statLabel(zone.centerX)} / Z {statLabel(zone.centerZ)}</td>
                              <td className="px-4 py-4 text-zinc-300">{statLabel(zone.radius)} м</td>
                              <td className="px-4 py-4 text-zinc-300">
                                <div>{statLabel(zone.captureSeconds)} сек.</div>
                                <div className="text-xs text-zinc-500">Награда: {statLabel(zone.rewardAmount, 0)}</div>
                              </td>
                              <td className="px-4 py-4">
                                <span className={zone.enabled ? 'rounded-full bg-emerald-950 px-2.5 py-1 text-xs text-emerald-200' : 'rounded-full bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400'}>
                                  {zone.enabled ? 'Активна' : 'Выключена'}
                                </span>
                                {zone.lastCapturedAt ? <div className="mt-2 text-xs text-zinc-500">{formatDate(zone.lastCapturedAt)}</div> : null}
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setForm(toZoneForm(zone))}
                                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-zinc-900"
                                  >
                                    Редактировать
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteZone(zone)}
                                    disabled={saving}
                                    className="rounded-lg border border-red-900/70 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-950/40 disabled:opacity-60"
                                  >
                                    Удалить
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </div>

              <form className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6" onSubmit={handleSaveZone}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">{isEditing ? 'Редактирование зоны' : 'Новая зона'}</h2>
                    <p className="mt-2 text-sm text-zinc-400">Координаты указываются по карте DayZ: X и Z, радиус — в метрах.</p>
                  </div>
                  {isEditing ? (
                    <button type="button" onClick={resetForm} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-900">
                      Сброс
                    </button>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-4">
                  <Field label="Название зоны">
                    <TextInput value={form.name} onChange={(value) => setZoneField('name', value)} placeholder="Например: Airfield" required />
                  </Field>
                  <Field label="Описание">
                    <textarea
                      value={form.description}
                      onChange={(event) => setZoneField('description', event.target.value)}
                      className="min-h-24 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                      placeholder="Короткая заметка для админов"
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="X">
                      <NumberInput value={form.centerX} onChange={(value) => setZoneField('centerX', value)} placeholder="1234.5" step="0.01" required />
                    </Field>
                    <Field label="Z">
                      <NumberInput value={form.centerZ} onChange={(value) => setZoneField('centerZ', value)} placeholder="6789.0" step="0.01" required />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Радиус" hint="метры">
                      <NumberInput min="1" value={form.radius} onChange={(value) => setZoneField('radius', value)} required />
                    </Field>
                    <Field label="Время захвата" hint="секунды">
                      <NumberInput min="1" value={form.captureSeconds} onChange={(value) => setZoneField('captureSeconds', value)} required />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Награда" hint="валюта сервера">
                      <NumberInput min="0" value={form.rewardAmount} onChange={(value) => setZoneField('rewardAmount', value)} />
                    </Field>
                    <Field label="Цвет на карте">
                      <input
                        type="color"
                        value={form.color || '#f59e0b'}
                        onChange={(event) => setZoneField('color', event.target.value)}
                        className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-1"
                      />
                    </Field>
                  </div>

                  <label className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-black px-3 py-2 text-sm text-zinc-200">
                    <input
                      type="checkbox"
                      checked={Boolean(form.enabled)}
                      onChange={(event) => setZoneField('enabled', event.target.checked)}
                      className="h-4 w-4 accent-indigo-600"
                    />
                    Зона активна
                  </label>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
                  >
                    {saving ? 'Сохранение...' : isEditing ? 'Сохранить зону' : 'Создать зону'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-900 disabled:opacity-60"
                  >
                    Очистить
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="text-xl font-semibold">Последние события</h2>
              <p className="mt-2 text-sm text-zinc-400">Если backend отдаёт события из zone_control_events, они появятся здесь.</p>

              {!events.length ? (
                <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-black p-6 text-sm text-zinc-400">Событий пока нет.</div>
              ) : (
                <div className="mt-5 divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800">
                  {events.slice(0, 20).map((event) => (
                    <div key={event.id || `${event.type}-${event.createdAt}`} className="grid gap-2 bg-black/40 p-4 text-sm md:grid-cols-[180px_1fr_180px]">
                      <div className="text-zinc-500">{formatDate(event.createdAt)}</div>
                      <div>
                        <div className="font-medium text-zinc-100">{event.zoneName || event.type}</div>
                        <div className="mt-1 text-zinc-400">{event.message || 'Событие Zone Control'}</div>
                      </div>
                      <div className="text-zinc-400 md:text-right">{event.playerName || '—'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between gap-3 text-sm text-zinc-300">
        <span>{label}</span>
        {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, required = false }) {
  return (
    <input
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
    />
  );
}

function NumberInput({ value, onChange, min, step = '1', placeholder, required = false }) {
  return (
    <input
      type="number"
      min={min}
      step={step}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
    />
  );
}
