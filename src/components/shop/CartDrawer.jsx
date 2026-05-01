import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { api } from '../../lib/api';
import { formatMoney } from '../../lib/format';

export default function CartDrawer({ currencyName = '' }) {
  const { slug } = useParams();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0), [items]);

  async function checkout() {
    try {
      setSaving(true);
      setError('');
      setMessage('');
      const payload = await api(`shop/order-create?slug=${encodeURIComponent(slug)}`, {
        method: 'POST',
        body: JSON.stringify({ slug, items: items.map((item) => ({ id: item.id, quantity: item.quantity || 1 })) }),
      });
      clear();
      setMessage(`Заказ #${payload.orderId} создан. Остаток: ${formatMoney(payload.balanceAfter, payload.currencyName || currencyName)}`);
    } catch (err) {
      setError(err?.message || 'Не удалось оформить заказ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="text-base font-semibold text-white">Корзина</div>
      {!items.length ? <div className="mt-3 text-sm text-zinc-400">Корзина пустая.</div> : null}
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-zinc-800 bg-black/30 p-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium text-zinc-100">{item.name}</div>
                <div className="text-zinc-500">x{item.quantity || 1} · {formatMoney(item.price, item.currencyName || currencyName)}</div>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-xs text-red-300 hover:text-red-200">Убрать</button>
            </div>
          </div>
        ))}
      </div>
      {items.length ? (
        <>
          <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4 text-sm">
            <span className="text-zinc-400">Итого</span>
            <strong className="text-zinc-100">{formatMoney(total, currencyName)}</strong>
          </div>
          <button
            onClick={checkout}
            disabled={saving}
            className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {saving ? 'Оформление...' : 'Оформить заказ'}
          </button>
        </>
      ) : null}
      {message ? <div className="mt-3 rounded-xl border border-emerald-900 bg-emerald-950/30 p-3 text-xs text-emerald-200">{message}</div> : null}
      {error ? <div className="mt-3 rounded-xl border border-red-900 bg-red-950/40 p-3 text-xs text-red-200">{error}</div> : null}
    </div>
  );
}
