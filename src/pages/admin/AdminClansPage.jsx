import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { Alert, Card, Field, NumberInput, PrimaryButton, SecondaryButton, TextInput } from '../../components/admin/AdminForm';
import { getAdminNav } from '../../lib/admin';
import { getField, loadAdminList, postAdmin } from '../../lib/adminResources';

export default function AdminClansPage() {
  const { slug } = useParams();
  const nav = useMemo(() => getAdminNav(slug), [slug]);
  const [clans, setClans] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      setClans(await loadAdminList('admin-clans-list', slug, 'clans'));
    } catch (err) {
      setError(err?.message || 'Не удалось загрузить кланы');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [slug]);

  function edit(row) {
    setEditing({
      id: getField(row, ['id', 'clanId', 'clan_id'], ''),
      name: getField(row, ['name'], ''),
      leader: getField(row, ['leader'], ''),
      points: getField(row, ['points'], 0),
      colorHex: getField(row, ['colorHex', 'color_hex'], '#f59e0b'),
      imageUrl: getField(row, ['imageUrl', 'image_url'], ''),
    });
  }

  async function submit(event) {
    event.preventDefault();
    if (!editing) return;
    try {
      setSaving(true);
      setError('');
      setNotice('');
      await postAdmin('admin-clans-update', slug, { clan: editing, ...editing });
      setNotice('Клан обновлён.');
      setEditing(null);
      await load();
    } catch (err) {
      setError(err?.message || 'Не удалось обновить клан');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout title="Кланы" subtitle="Управление кланами сервера" nav={nav}>
      <div className="space-y-6">
        {error ? <Alert>{error}</Alert> : null}
        {notice ? <Alert type="success">{notice}</Alert> : null}
        <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
          <Card>
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Кланы</h2><SecondaryButton onClick={load} disabled={loading}>{loading ? 'Загрузка...' : 'Обновить'}</SecondaryButton></div>
            {!clans.length && !loading ? <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-black p-6 text-sm text-zinc-500">Кланов пока нет.</div> : null}
            {!!clans.length ? <div className="mt-5 grid gap-3 md:grid-cols-2">{clans.map((row, index) => <button key={getField(row, ['id', 'clan_id'], index)} onClick={() => edit(row)} className="rounded-2xl border border-zinc-800 bg-black/40 p-4 text-left hover:border-indigo-800"><div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full" style={{ background: getField(row, ['colorHex', 'color_hex'], '#f59e0b') }} /><div className="font-medium text-white">{getField(row, ['name'], 'Без названия')}</div></div><div className="mt-2 text-sm text-zinc-400">Лидер: {getField(row, ['leader'], '—')}</div><div className="mt-1 text-sm text-amber-300">Очки: {getField(row, ['points'], 0)}</div></button>)}</div> : null}
          </Card>
          <Card>
            <h2 className="text-xl font-semibold">Редактирование</h2>
            {!editing ? <div className="mt-5 text-sm text-zinc-500">Выбери клан слева.</div> : <form onSubmit={submit} className="mt-5 grid gap-4"><Field label="Название"><TextInput value={editing.name} onChange={(v) => setEditing((e) => ({ ...e, name: v }))} /></Field><Field label="Лидер"><TextInput value={editing.leader} onChange={(v) => setEditing((e) => ({ ...e, leader: v }))} /></Field><Field label="Очки"><NumberInput value={editing.points} onChange={(v) => setEditing((e) => ({ ...e, points: v }))} /></Field><Field label="Цвет"><input type="color" value={editing.colorHex || '#f59e0b'} onChange={(event) => setEditing((e) => ({ ...e, colorHex: event.target.value }))} className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-1" /></Field><Field label="Картинка"><TextInput value={editing.imageUrl} onChange={(v) => setEditing((e) => ({ ...e, imageUrl: v }))} /></Field><PrimaryButton type="submit" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить клан'}</PrimaryButton></form>}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
