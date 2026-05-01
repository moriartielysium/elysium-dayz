import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { Alert, Card, PrimaryButton, SecondaryButton, SelectInput } from '../../components/admin/AdminForm';
import { getAdminNav } from '../../lib/admin';
import { getField, loadAdminList, postAdmin } from '../../lib/adminResources';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

export default function AdminOrdersPage() {
  const { slug } = useParams();
  const nav = useMemo(() => getAdminNav(slug), [slug]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [statusById, setStatusById] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const list = await loadAdminList('admin-orders-list', slug, 'orders');
      setOrders(list);
      setStatusById(Object.fromEntries(list.map((row, index) => [getField(row, ['id', 'orderId', 'order_id'], index), getField(row, ['status'], 'pending')])));
    } catch (err) {
      setError(err?.message || 'Не удалось загрузить заказы');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [slug]);

  async function updateStatus(orderId) {
    try {
      setSavingId(orderId);
      setError('');
      setNotice('');
      await postAdmin('admin-orders-status', slug, { orderId, order_id: orderId, status: statusById[orderId] });
      setNotice('Статус заказа обновлён.');
      await load();
    } catch (err) {
      setError(err?.message || 'Не удалось обновить статус');
    } finally {
      setSavingId('');
    }
  }

  async function refund(orderId) {
    if (!window.confirm('Вернуть средства по заказу?')) return;
    try {
      setSavingId(orderId);
      setError('');
      setNotice('');
      await postAdmin('admin-orders-refund', slug, { orderId, order_id: orderId });
      setNotice('Возврат выполнен.');
      await load();
    } catch (err) {
      setError(err?.message || 'Не удалось выполнить возврат');
    } finally {
      setSavingId('');
    }
  }

  return (
    <AdminLayout title="Заказы" subtitle="Заказы игроков и статусы выдачи" nav={nav}>
      <div className="space-y-6">
        {error ? <Alert>{error}</Alert> : null}
        {notice ? <Alert type="success">{notice}</Alert> : null}
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Список заказов</h2>
            <SecondaryButton onClick={load} disabled={loading}>{loading ? 'Загрузка...' : 'Обновить'}</SecondaryButton>
          </div>
          {!orders.length && !loading ? <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-black p-6 text-sm text-zinc-500">Заказов пока нет.</div> : null}
          {!!orders.length ? (
            <div className="mt-5 overflow-x-auto rounded-2xl border border-zinc-800">
              <table className="min-w-full text-sm">
                <thead className="bg-black/60 text-left text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-4 py-3">Заказ</th><th className="px-4 py-3">Игрок</th><th className="px-4 py-3">Сумма</th><th className="px-4 py-3">Дата</th><th className="px-4 py-3">Статус</th><th className="px-4 py-3 text-right">Действия</th></tr></thead>
                <tbody className="divide-y divide-zinc-800">
                  {orders.map((row, index) => {
                    const id = getField(row, ['id', 'orderId', 'order_id'], index);
                    return <tr key={id} className="align-top"><td className="px-4 py-3"><div className="font-medium text-white">#{id}</div><div className="text-xs text-zinc-500">{getField(row, ['itemName', 'item_name', 'item'], '—')}</div></td><td className="px-4 py-3 text-zinc-300">{getField(row, ['playerName', 'player_name', 'discordName', 'discord_name', 'user'], '—')}</td><td className="px-4 py-3 text-zinc-300">{getField(row, ['price', 'amount', 'total'], 0)}</td><td className="px-4 py-3 text-zinc-400">{formatDate(getField(row, ['createdAt', 'created_at'], ''))}</td><td className="px-4 py-3"><SelectInput value={statusById[id]} onChange={(value) => setStatusById((s) => ({ ...s, [id]: value }))}><option value="pending">pending</option><option value="paid">paid</option><option value="delivered">delivered</option><option value="cancelled">cancelled</option><option value="refunded">refunded</option></SelectInput></td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><PrimaryButton onClick={() => updateStatus(id)} disabled={savingId === id}>{savingId === id ? '...' : 'Статус'}</PrimaryButton><SecondaryButton onClick={() => refund(id)} disabled={savingId === id}>Возврат</SecondaryButton></div></td></tr>;
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>
      </div>
    </AdminLayout>
  );
}
