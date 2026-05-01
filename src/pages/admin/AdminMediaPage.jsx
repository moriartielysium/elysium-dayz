import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { Alert, Card, Field, PrimaryButton, TextInput } from '../../components/admin/AdminForm';
import { getAdminNav } from '../../lib/admin';
import { uploadAdminFile } from '../../lib/adminResources';

export default function AdminMediaPage() {
  const { slug } = useParams();
  const nav = useMemo(() => getAdminNav(slug), [slug]);
  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState('media');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [result, setResult] = useState(null);

  async function submit(event) {
    event.preventDefault();
    if (!file) {
      setError('Выбери файл для загрузки.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      setNotice('');
      const payload = await uploadAdminFile('admin-media-upload', slug, file, { folder });
      setResult(payload);
      setNotice('Файл загружен.');
      setFile(null);
    } catch (err) {
      setError(err?.message || 'Не удалось загрузить файл');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout title="Медиа" subtitle="Файлы, баннеры и изображения" nav={nav}>
      <div className="space-y-6">
        {error ? <Alert>{error}</Alert> : null}
        {notice ? <Alert type="success">{notice}</Alert> : null}
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <Card>
            <h2 className="text-xl font-semibold">Загрузка файла</h2>
            <form onSubmit={submit} className="mt-5 grid gap-4">
              <Field label="Папка"><TextInput value={folder} onChange={setFolder} placeholder="media / banners / shop" /></Field>
              <Field label="Файл">
                <input type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900 px-4 py-6 text-sm text-zinc-300" />
              </Field>
              <PrimaryButton type="submit" disabled={saving}>{saving ? 'Загрузка...' : 'Загрузить'}</PrimaryButton>
            </form>
          </Card>
          <Card>
            <h2 className="text-xl font-semibold">Последний результат</h2>
            {result ? <pre className="mt-5 overflow-auto rounded-xl bg-black p-4 text-xs text-zinc-300">{JSON.stringify(result, null, 2)}</pre> : <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-black p-6 text-sm text-zinc-500">После загрузки backend вернёт URL/путь файла.</div>}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
