import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { Alert, Card, Field, NumberInput, PrimaryButton, SecondaryButton, TextInput, Toggle } from '../../components/admin/AdminForm';
import { getAdminNav } from '../../lib/admin';
import { getField, loadAdminList, postAdmin } from '../../lib/adminResources';

const EMPTY = { id: '', name: '', description: '', price: 0, categoryId: '', imageUrl: '', command: '', enabled: true };

export default function AdminItemsPage() {
  const { slug } = useParams();
  const nav = useMemo(() => getAdminNav(slug), [slug]);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const [itemsList, categoriesList] = await Promise.all([
        loadAdminList('admin-items-list', slug, 'items'),
        loadAdminList('admin-categories-list', slug, 'categories').catch(() => []),
      ]);
      setItems(itemsList);
      setCategories(categoriesList);
    } catch (err) {
      setError(err?.message || 'Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [slug]);

  function edit(row) {
    setForm({
      id: getField(row, ['id', 'itemId', 'item_id'], ''),
      name: getField(row, ['name', 'title'], ''),
      description: getField(row, ['description', 'desc'], ''),
      price: getField(row, ['price', 'amount'], 0),
      categoryId: getField(row, ['categoryId', 'category_id'], ''),
      imageUrl: getField(row, ['imageUrl', 'image_url', 'image'], ''),
      command: getField(row, ['command', 'giveCommand', 'give_command'], ''),
      enabled: getField(row, ['enabled', 'is_enabled', 'active'], true) !== false,
    });
  }

  async function submit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setNotice('');
      const endpoint = form.id ? 'admin-items-update' : 'admin-items-create';
      await postAdmin(endpoint, slug, { item: form, ...form });
      setNotice(form.id ? 'Товар обновлён.' : 'Товар создан.');
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err?.message || 'Не удалось сохранить товар');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout title="Товары" subtitle="Управление товарами магазина" nav={nav}>
      <div className="space-y-6">
        {error ? <Alert>{error}</Alert> : null}
        {notice ? <Alert type="success">{notice}</Alert> : null}
        <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Товары</h2>
              <SecondaryButton onClick={load} disabled={loading}>{loading ? 'Загрузка...' : 'Обновить'}</SecondaryButton>
            </div>
            {!items.length && !loading ? <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-black p-6 text-sm text-zinc-500">Товаров пока нет.</div> : null}
            {!!items.length ? (
              <div className="mt-5 overflow-x-auto rounded-2xl border border-zinc-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-black/60 text-left text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-4 py-3">Товар</th><th className="px-4 py-3">Цена</th><th className="px-4 py-3">Категория</th><th className="px-4 py-3 text-right">Действия</th></tr></thead>
                  <tbody className="divide-y divide-zinc-800">
                    {items.map((row, index) => <tr key={getField(row, ['id', 'itemId', 'item_id'], index)}><td className="px-4 py-3"><div className="font-medium text-white">{getField(row, ['name', 'title'], 'Без названия')}</div><div className="text-xs text-zinc-500">{getField(row, ['description', 'desc'], '')}</div></td><td className="px-4 py-3 text-zinc-300">{getField(row, ['price', 'amount'], 0)}</td><td className="px-4 py-3 text-zinc-300">{getField(row, ['categoryName', 'category_name', 'category'], '—')}</td><td className="px-4 py-3 text-right"><SecondaryButton onClick={() => edit(row)}>Редактировать</SecondaryButton></td></tr>)}
                  </tbody>
                </table>
              </div>
            ) : null}
          </Card>
          <Card>
            <h2 className="text-xl font-semibold">{form.id ? 'Редактировать товар' : 'Новый товар'}</h2>
            <form onSubmit={submit} className="mt-5 grid gap-4">
              <Field label="Название"><TextInput required value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} /></Field>
              <Field label="Описание"><TextInput value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Цена"><NumberInput min="0" value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} /></Field>
                <Field label="Категория ID"><TextInput value={form.categoryId} onChange={(v) => setForm((f) => ({ ...f, categoryId: v }))} placeholder={categories[0] ? String(getField(categories[0], ['id', 'category_id'], '')) : ''} /></Field>
              </div>
              <Field label="URL изображения"><TextInput value={form.imageUrl} onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))} /></Field>
              <Field label="Команда выдачи / payload"><TextInput value={form.command} onChange={(v) => setForm((f) => ({ ...f, command: v }))} placeholder="опционально" /></Field>
              <Toggle checked={form.enabled} onChange={(v) => setForm((f) => ({ ...f, enabled: v }))} label="Товар включён" />
              <div className="flex flex-wrap gap-3">
                <PrimaryButton type="submit" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</PrimaryButton>
                {form.id ? <Link className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-900" to={`/admin/${slug}/items/${form.id}`}>Полная карточка</Link> : null}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
