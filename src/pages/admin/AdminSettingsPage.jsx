import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { Alert, Card, Field, NumberInput, PrimaryButton, TextInput, Toggle } from '../../components/admin/AdminForm';
import { getAdminNav } from '../../lib/admin';
import { loadAdminSettings, saveAdminSettings, unpackSettings } from '../../lib/adminResources';

const DEFAULTS = {
  displayName: '',
  nitradoServiceId: '',
  nitradoServerName: '',
  mainGuildId: '',
  cacheTtlSeconds: 30,
  dashboardRefreshSeconds: 60,
  mapRefreshSeconds: 15,
  admFeedRefreshSeconds: 5,
  enableFastRefresh: true,
  reduceHeavyRequests: true,
};

export default function AdminSettingsPage() {
  const { slug } = useParams();
  const nav = useMemo(() => getAdminNav(slug), [slug]);
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const payload = await loadAdminSettings(slug);
        if (!cancelled) setForm({ ...DEFAULTS, ...unpackSettings(payload) });
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Не удалось загрузить настройки');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setNotice('');
      await saveAdminSettings(slug, form);
      setNotice('Настройки сохранены.');
    } catch (err) {
      setError(err?.message || 'Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout title="Настройки" subtitle="Основные параметры сервера, Nitrado и скорости панели" nav={nav}>
      <div className="space-y-6">
        {loading ? <Card className="text-sm text-zinc-400">Загрузка настроек...</Card> : null}
        {error ? <Alert>{error}</Alert> : null}
        {notice ? <Alert type="success">{notice}</Alert> : null}

        {!loading ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Card>
              <h2 className="text-xl font-semibold">Сервер</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Название в кабинете"><TextInput value={form.displayName} onChange={(v) => setField('displayName', v)} placeholder="ELYSIUM DAYZ SERVER [PS]" /></Field>
                <Field label="Discord Guild ID"><TextInput value={form.mainGuildId} onChange={(v) => setField('mainGuildId', v)} placeholder="1234567890" /></Field>
                <Field label="Nitrado Service ID"><TextInput value={form.nitradoServiceId} onChange={(v) => setField('nitradoServiceId', v)} placeholder="service_id" /></Field>
                <Field label="Имя Nitrado сервера"><TextInput value={form.nitradoServerName} onChange={(v) => setField('nitradoServerName', v)} placeholder="DayZ PS server" /></Field>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold">Быстродействие сайта</h2>
              <p className="mt-2 text-sm text-zinc-400">Эти интервалы уменьшают лишние запросы к backend/Nitrado и ускоряют загрузку кабинета.</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Кэш API" hint="сек"><NumberInput min="5" value={form.cacheTtlSeconds} onChange={(v) => setField('cacheTtlSeconds', v)} /></Field>
                <Field label="Обновление Dashboard" hint="сек"><NumberInput min="15" value={form.dashboardRefreshSeconds} onChange={(v) => setField('dashboardRefreshSeconds', v)} /></Field>
                <Field label="Обновление Live Map" hint="сек"><NumberInput min="5" value={form.mapRefreshSeconds} onChange={(v) => setField('mapRefreshSeconds', v)} /></Field>
                <Field label="Обновление ADM Feed" hint="сек"><NumberInput min="2" value={form.admFeedRefreshSeconds} onChange={(v) => setField('admFeedRefreshSeconds', v)} /></Field>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Toggle checked={form.enableFastRefresh !== false} onChange={(v) => setField('enableFastRefresh', v)} label="Быстрые обновления" hint="Подгружать только изменённые данные, когда backend это поддерживает." />
                <Toggle checked={form.reduceHeavyRequests !== false} onChange={(v) => setField('reduceHeavyRequests', v)} label="Меньше тяжёлых запросов" hint="Не грузить карту/ADM/заказы на страницах, где они не нужны." />
              </div>
            </Card>

            <PrimaryButton type="submit" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить настройки'}</PrimaryButton>
          </form>
        ) : null}
      </div>
    </AdminLayout>
  );
}
