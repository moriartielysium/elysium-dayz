import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { Alert, Card, Field, PrimaryButton, SecondaryButton, TextInput, Toggle } from '../../components/admin/AdminForm';
import { getAdminNav } from '../../lib/admin';
import { getField, loadAdminList, postAdmin } from '../../lib/adminResources';

const EMPTY = { id: '', name: '', description: '', imageUrl: '', sortOrder: 0, enabled: true };

export default function AdminCategoriesPage() {
  const { slug } = useParams();
  const nav = useMemo(() => getAdminNav(slug), [slug]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      setItems(await loadAdminList('admin-categories-list', slug, 'categories'));
    } catch (err) {
      setError(err?.message || 'Не удалось загрузить категории');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [slug]);

  function edit(row) {
    setForm({
      id: getField(row, ['id', 'categoryId', 'category_id'], ''),
      name: getField(row, ['name', 'title'], ''),
      description: getField(row, ['description', 'desc'], ''),
      imageUrl: getField(row, ['imageUrl', 'image_url', 'image'], ''),
      sortOrder: getField(row, ['sortOrder', 'sort_order', 'position'], 0),
      enabled: getField(row, ['enabled', 'is_enabled', 'active'], true) !== false,
    });
  }

  async function submit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setNotice('');
      const endpoint = form.id ? 'admin-categories-update' : 'admin-categories-create';
      await postAdmin(endpoint, slug, { category: form, ...form });
      setNotice(form.id ? 'Категория обновлена.' : 'Категория создана.');
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err?.message || 'Не удалось сохранить категорию');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout title="Категории" subtitle="Структура магазина и каталога" nav={nav}>
      <div className="space-y-6">
        {error ? <Alert>{error}</Alert> : null}
        {notice ? <Alert type="success">{notice}</Alert> : null}
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Категории</h2>
              <SecondaryButton onClick={load} disabled={loading}>{loading ? 'Загрузка...' : 'Обновить'}</SecondaryButton>
            </div>
            {!items.length && !loading ? <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-black p-6 text-sm text-zinc-500">Категорий пока нет.</div> : null}
            {!!items.length ? (
              <div className="mt-5 overflow-x-auto rounded-2xl border border-zinc-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-black/60 text-left text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-4 py-3">Название</th><th className="px-4 py-3">Статус</th><th className="px-4 py-3 text-right">Действия</th></tr></thead>
                  <tbody className="divide-y divide-zinc-800">
                    {items.map((row, index) => <tr key={getField(row, ['id', 'categoryId', 'category_id'], index)}><td className="px-4 py-3"><div className="font-medium text-white">{getField(row, ['name', 'title'], 'Без названия')}</div><div className="text-xs text-zinc-500">{getField(row, ['description', 'desc'], '')}</div></td><td className="px-4 py-3 text-zinc-300">{getField(row, ['enabled', 'is_enabled', 'active'], true) === false ? 'Выкл' : 'Вкл'}</td><td className="px-4 py-3 text-right"><SecondaryButton onClick={() => edit(row)}>Редактировать</SecondaryButton></td></tr>)}
                  </tbody>
                </table>
              </div>
            ) : null}
          </Card>
          <Card>
            <h2 className="text-xl font-semibold">{form.id ? 'Редактировать' : 'Новая категория'}</h2>
            <form onSubmit={submit} className="mt-5 grid gap-4">
              <Field label="Название"><TextInput required value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} /></Field>
              <Field label="Описание"><TextInput value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} /></Field>
              <Field label="URL изображения"><TextInput value={form.imageUrl} onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))} /></Field>
              <Toggle checked={form.enabled} onChange={(v) => setForm((f) => ({ ...f, enabled: v }))} label="Категория включена" />
              <PrimaryButton type="submit" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</PrimaryButton>
            </form>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
