import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { Alert, Card, PrimaryButton, Toggle } from '../../components/admin/AdminForm';
import { getAdminNav } from '../../lib/admin';
import { loadAdminSettings, saveAdminSettings, unpackSettings } from '../../lib/adminResources';

const SYSTEMS = [
  { key: 'economyEnabled', title: 'Экономика', path: 'economy', hint: 'Баланс игроков, награды за убийства и playtime.' },
  { key: 'shopEnabled', title: 'Шоп', path: 'items', hint: 'Категории, товары, заказы и выдача покупок.' },
  { key: 'killfeedEnabled', title: 'Killfeed', path: 'killfeed', hint: 'Парсинг убийств и публикация в Discord.' },
  { key: 'playtimeRewardsEnabled', title: 'Playtime Rewards', path: 'rewards', hint: 'Автоматические награды за активность.' },
  { key: 'liveMapEnabled', title: 'Live Player Map', path: 'map', hint: 'Карта Chernarus и точки игроков.' },
  { key: 'nitradoAdmFeedEnabled', title: 'Nitrado ADM Live Feed', path: 'adm-feed', hint: 'Онлайн-лог ADM без ручной перезагрузки.' },
  { key: 'zoneControlEnabled', title: 'Zone Control', path: 'zones', hint: 'Зоны контроля через сайт вместо slash-команд.' },
];

export default function AdminSystemsPage() {
  const { slug } = useParams();
  const nav = useMemo(() => getAdminNav(slug), [slug]);
  const [settings, setSettings] = useState({});
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
        if (!cancelled) setSettings(unpackSettings(payload));
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Не удалось загрузить настройки систем');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  function setField(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError('');
      setNotice('');
      await saveAdminSettings(slug, settings);
      setNotice('Настройки систем сохранены.');
    } catch (err) {
      setError(err?.message || 'Не удалось сохранить настройки систем');
    } finally {
      setSaving(false);
    }
  }

  const enabledCount = SYSTEMS.filter((item) => settings[item.key] !== false).length;

  return (
    <AdminLayout title="Системы" subtitle={`Все модули ELYSIUM BOT: ${slug}`} nav={nav}>
      <div className="space-y-6">
        {loading ? <Card className="text-sm text-zinc-400">Загрузка систем...</Card> : null}
        {error ? <Alert>{error}</Alert> : null}
        {notice ? <Alert type="success">{notice}</Alert> : null}

        {!loading ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <div className="text-sm text-zinc-500">Подключено модулей</div>
                <div className="mt-2 text-3xl font-bold text-white">{enabledCount}/{SYSTEMS.length}</div>
              </Card>
              <Card>
                <div className="text-sm text-zinc-500">Discord slash-команды</div>
                <div className="mt-2 text-3xl font-bold text-emerald-300">Не тратим</div>
                <div className="mt-2 text-xs text-zinc-500">Zone Control работает через кабинет.</div>
              </Card>
              <Card>
                <div className="text-sm text-zinc-500">Скорость сайта</div>
                <div className="mt-2 text-3xl font-bold text-indigo-300">Lazy routes</div>
                <div className="mt-2 text-xs text-zinc-500">Админ-разделы грузятся отдельно.</div>
              </Card>
            </div>

            <Card>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Включение систем</h2>
                  <p className="mt-2 max-w-3xl text-sm text-zinc-400">
                    Это центральная страница для модулей бота. Значения сохраняются через существующий backend endpoint <code className="rounded bg-black px-1.5 py-0.5">admin-settings-save</code>; если backend использует другие имена полей, они всё равно остаются в JSON настроек и не ломают текущие системы.
                  </p>
                </div>
                <PrimaryButton onClick={handleSave} disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить всё'}</PrimaryButton>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {SYSTEMS.map((item) => (
                  <div key={item.key} className="rounded-2xl border border-zinc-800 bg-black/40 p-4">
                    <Toggle
                      checked={settings[item.key] !== false}
                      onChange={(value) => setField(item.key, value)}
                      label={item.title}
                      hint={item.hint}
                    />
                    <Link className="mt-3 inline-flex text-sm text-indigo-300 hover:text-indigo-200" to={`/admin/${slug}/${item.path}`}>
                      Открыть настройки →
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
