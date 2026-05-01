import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { Alert, Card, Field, NumberInput, PrimaryButton, TextInput, Toggle } from '../../components/admin/AdminForm';
import { getAdminNav } from '../../lib/admin';
import { getField, loadAdminList, postAdmin } from '../../lib/adminResources';

export default function AdminItemEditPage() {
  const { slug, id } = useParams();
  const nav = useMemo(() => getAdminNav(slug), [slug]);
  const [form, setForm] = useState(null);
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
        const items = await loadAdminList('admin-items-list', slug, 'items');
        const row = items.find((item) => String(getField(item, ['id', 'itemId', 'item_id'], '')) === String(id));
        if (!cancelled) setForm(row ? {
          id,
          name: getField(row, ['name', 'title'], ''),
          description: getField(row, ['description', 'desc'], ''),
          price: getField(row, ['price', 'amount'], 0),
          categoryId: getField(row, ['categoryId', 'category_id'], ''),
          imageUrl: getField(row, ['imageUrl', 'image_url'], ''),
          command: getField(row, ['command', 'giveCommand', 'give_command'], ''),
          enabled: getField(row, ['enabled', 'is_enabled', 'active'], true) !== false,
        } : { id, name: '', description: '', price: 0, categoryId: '', imageUrl: '', command: '', enabled: true });
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Не удалось загрузить товар');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug, id]);

  async function submit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setNotice('');
      await postAdmin('admin-items-update', slug, { item: form, ...form });
      setNotice('Товар сохранён.');
    } catch (err) {
      setError(err?.message || 'Не удалось сохранить товар');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout title="Редактирование товара" subtitle={`Параметры позиции #${id}`} nav={nav}>
      <div className="space-y-6">
        {loading ? <Card className="text-sm text-zinc-400">Загрузка товара...</Card> : null}
        {error ? <Alert>{error}</Alert> : null}
        {notice ? <Alert type="success">{notice}</Alert> : null}
        {form ? <Card><form onSubmit={submit} className="grid gap-4"><Field label="Название"><TextInput value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} /></Field><Field label="Описание"><TextInput value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Цена"><NumberInput min="0" value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} /></Field><Field label="Категория ID"><TextInput value={form.categoryId} onChange={(v) => setForm((f) => ({ ...f, categoryId: v }))} /></Field></div><Field label="Изображение"><TextInput value={form.imageUrl} onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))} /></Field><Field label="Команда выдачи"><TextInput value={form.command} onChange={(v) => setForm((f) => ({ ...f, command: v }))} /></Field><Toggle checked={form.enabled} onChange={(v) => setForm((f) => ({ ...f, enabled: v }))} label="Товар включён" /><PrimaryButton type="submit" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</PrimaryButton></form></Card> : null}
      </div>
    </AdminLayout>
  );
}
