import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { Alert, Card, DangerButton, Field, PrimaryButton, SecondaryButton, TextInput } from '../../components/admin/AdminForm';
import { getAdminNav } from '../../lib/admin';
import { getField, loadAdminList, postAdmin } from '../../lib/adminResources';

const EMPTY = { discordUserId: '', roleId: '', note: '' };

export default function AdminAccessPage() {
  const { slug } = useParams();
  const nav = useMemo(() => getAdminNav(slug), [slug]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      setRows(await loadAdminList('admin-access-list', slug, 'access'));
    } catch (err) {
      setError(err?.message || 'Не удалось загрузить доступ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [slug]);

  async function submit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setNotice('');
      await postAdmin('admin-access-create', slug, form);
      setNotice('Доступ добавлен.');
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err?.message || 'Не удалось добавить доступ');
    } finally {
      setSaving(false);
    }
  }

  async function remove(row) {
    const id = getField(row, ['id', 'accessId', 'access_id', 'discordUserId', 'discord_user_id'], '');
    if (!window.confirm('Удалить этот доступ?')) return;
    try {
      setSaving(true);
      setError('');
      setNotice('');
      await postAdmin('admin-access-delete', slug, { id, accessId: id, discordUserId: id });
      setNotice('Доступ удалён.');
      await load();
    } catch (err) {
      setError(err?.message || 'Не удалось удалить доступ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout title="Доступ" subtitle="Guild admins и роли доступа" nav={nav}>
      <div className="space-y-6">
        {error ? <Alert>{error}</Alert> : null}
        {notice ? <Alert type="success">{notice}</Alert> : null}
        <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
          <Card>
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Администраторы</h2><SecondaryButton onClick={load} disabled={loading}>{loading ? 'Загрузка...' : 'Обновить'}</SecondaryButton></div>
            {!rows.length && !loading ? <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-black p-6 text-sm text-zinc-500">Доступы пока не добавлены.</div> : null}
            {!!rows.length ? <div className="mt-5 divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800">{rows.map((row, index) => <div key={getField(row, ['id', 'accessId', 'discordUserId', 'discord_user_id'], index)} className="flex flex-col gap-3 bg-black/30 p-4 md:flex-row md:items-center md:justify-between"><div><div className="font-medium text-white">{getField(row, ['name', 'username', 'discordName', 'discord_name'], 'Администратор')}</div><div className="text-sm text-zinc-500">User: {getField(row, ['discordUserId', 'discord_user_id'], '—')} · Role: {getField(row, ['roleId', 'role_id'], '—')}</div></div><DangerButton onClick={() => remove(row)} disabled={saving}>Удалить</DangerButton></div>)}</div> : null}
          </Card>
          <Card>
            <h2 className="text-xl font-semibold">Добавить доступ</h2>
            <form onSubmit={submit} className="mt-5 grid gap-4">
              <Field label="Discord User ID"><TextInput value={form.discordUserId} onChange={(v) => setForm((f) => ({ ...f, discordUserId: v }))} placeholder="можно пустым, если используешь роль" /></Field>
              <Field label="Discord Role ID"><TextInput value={form.roleId} onChange={(v) => setForm((f) => ({ ...f, roleId: v }))} placeholder="можно пустым, если используешь user id" /></Field>
              <Field label="Заметка"><TextInput value={form.note} onChange={(v) => setForm((f) => ({ ...f, note: v }))} /></Field>
              <PrimaryButton type="submit" disabled={saving}>{saving ? 'Сохранение...' : 'Добавить'}</PrimaryButton>
            </form>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
