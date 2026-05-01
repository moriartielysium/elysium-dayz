import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { Alert, Card, Field, NumberInput, PrimaryButton, TextInput, Toggle } from '../../components/admin/AdminForm';
import { getAdminNav } from '../../lib/admin';
import { loadAdminSettings, saveAdminSettings, unpackSettings } from '../../lib/adminResources';

const CONFIGS = {
  rewards: {
    title: 'Награды',
    subtitle: 'Playtime rewards и автоматические выплаты',
    defaults: { playtimeRewardsEnabled: true, playtimeRewardMinutes: 60, playtimeRewardAmount: 500, rewardChannelId: '', rewardLogChannelId: '' },
    toggles: [['playtimeRewardsEnabled', 'Playtime Rewards включены', 'Бот выдаёт награды за активность игроков.']],
    fields: [
      ['playtimeRewardMinutes', 'Период награды', 'мин', 'number'],
      ['playtimeRewardAmount', 'Сумма награды', 'валюта', 'number'],
      ['rewardChannelId', 'Канал уведомлений', 'Discord channel ID', 'text'],
      ['rewardLogChannelId', 'Канал логов', 'Discord channel ID', 'text'],
    ],
  },
  killfeed: {
    title: 'Killfeed',
    subtitle: 'Настройки публикации убийств и событий боя',
    defaults: { killfeedEnabled: true, killfeedChannelId: '', killfeedWebhookUrl: '', killfeedBatchSeconds: 5, killfeedIncludeDistance: true, killfeedIncludeWeapon: true },
    toggles: [
      ['killfeedEnabled', 'Killfeed включён', 'Публиковать события убийств.'],
      ['killfeedIncludeDistance', 'Показывать дистанцию', 'Добавлять расстояние убийства, если backend его видит.'],
      ['killfeedIncludeWeapon', 'Показывать оружие', 'Добавлять оружие/предмет из ADM лога.'],
    ],
    fields: [
      ['killfeedChannelId', 'Канал Killfeed', 'Discord channel ID', 'text'],
      ['killfeedWebhookUrl', 'Webhook URL', 'можно оставить пустым', 'text'],
      ['killfeedBatchSeconds', 'Задержка пачки', 'сек', 'number'],
    ],
  },
  map: {
    title: 'Live Player Map',
    subtitle: 'Карта и точки игроков DayZ',
    defaults: { liveMapEnabled: true, mapRefreshSeconds: 15, mapImageUrl: '', mapChannelId: '', mapShowOfflinePlayers: false, mapKeepHistoryMinutes: 10 },
    toggles: [
      ['liveMapEnabled', 'Live Map включена', 'Отображать игроков на карте в кабинете.'],
      ['mapShowOfflinePlayers', 'Показывать недавно вышедших', 'Оставлять точки игроков на карте короткое время после выхода.'],
    ],
    fields: [
      ['mapRefreshSeconds', 'Обновление карты', 'сек', 'number'],
      ['mapKeepHistoryMinutes', 'История точек', 'мин', 'number'],
      ['mapImageUrl', 'URL карты', 'или локальный asset', 'text'],
      ['mapChannelId', 'Канал карты', 'Discord channel ID', 'text'],
    ],
  },
  adm: {
    title: 'ADM Feed',
    subtitle: 'Nitrado ADM live feed и парсинг событий',
    defaults: { nitradoAdmFeedEnabled: true, admFeedRefreshSeconds: 5, admFeedChannelId: '', admFeedLogChannelId: '', admFilterChat: false, admFilterPositions: false },
    toggles: [
      ['nitradoAdmFeedEnabled', 'ADM live feed включён', 'Бот читает ADM лог Nitrado.'],
      ['admFilterChat', 'Фильтровать чат', 'Не показывать лишний чат в техническом feed.'],
      ['admFilterPositions', 'Фильтровать позиции', 'Снижает нагрузку, если позиции нужны только карте.'],
    ],
    fields: [
      ['admFeedRefreshSeconds', 'Период чтения ADM', 'сек', 'number'],
      ['admFeedChannelId', 'Канал ADM feed', 'Discord channel ID', 'text'],
      ['admFeedLogChannelId', 'Канал технических логов', 'Discord channel ID', 'text'],
    ],
  },
};

export default function AdminFeatureSettingsPage({ type }) {
  const config = CONFIGS[type] || CONFIGS.rewards;
  const { slug } = useParams();
  const nav = useMemo(() => getAdminNav(slug), [slug]);
  const [form, setForm] = useState(config.defaults);
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
        if (!cancelled) setForm({ ...config.defaults, ...unpackSettings(payload) });
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Не удалось загрузить настройки');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug, type]);

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
    <AdminLayout title={config.title} subtitle={config.subtitle} nav={nav}>
      <div className="space-y-6">
        {loading ? <Card className="text-sm text-zinc-400">Загрузка...</Card> : null}
        {error ? <Alert>{error}</Alert> : null}
        {notice ? <Alert type="success">{notice}</Alert> : null}
        {!loading ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <h2 className="text-xl font-semibold">Переключатели</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {config.toggles.map(([key, label, hint]) => (
                  <Toggle key={key} checked={form[key] !== false} onChange={(value) => setField(key, value)} label={label} hint={hint} />
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold">Параметры</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {config.fields.map(([key, label, hint, kind]) => (
                  <Field key={key} label={label} hint={hint}>
                    {kind === 'number'
                      ? <NumberInput min="0" value={form[key]} onChange={(value) => setField(key, value)} />
                      : <TextInput value={form[key]} onChange={(value) => setField(key, value)} />}
                  </Field>
                ))}
              </div>
            </Card>

            <PrimaryButton type="submit" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</PrimaryButton>
          </form>
        ) : null}
      </div>
    </AdminLayout>
  );
}
