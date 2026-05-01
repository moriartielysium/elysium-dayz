import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PlayerLayout from '../../components/layout/PlayerLayout';
import ShopGrid from '../../components/shop/ShopGrid';
import CartDrawer from '../../components/shop/CartDrawer';
import { useCartStore } from '../../stores/cartStore';
import { api } from '../../lib/api';
import { getGuildNav, normalizeGuildSlug } from '../../lib/player';

export default function PlayerShopPage() {
  const params = useParams() || {};
  const safeSlug = normalizeGuildSlug(params.slug);
  const nav = getGuildNav(safeSlug);
  const addItem = useCartStore((state) => state.addItem);
  const [state, setState] = useState({ loading: true, error: '', items: [], currencyName: '$' });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const payload = await api(`shop/items?slug=${encodeURIComponent(safeSlug)}`);
        if (!active) return;
        setState({
          loading: false,
          error: '',
          items: payload.items || [],
          currencyName: payload.currencyName || payload.currency || '$',
        });
      } catch (error) {
        if (!active) return;
        setState({ loading: false, error: error.message || 'Не удалось загрузить магазин', items: [], currencyName: '$' });
      }
    })();

    return () => {
      active = false;
    };
  }, [safeSlug]);

  return (
    <PlayerLayout title="Магазин" subtitle="Покупка предметов за внутриигровую валюту" nav={nav} slug={safeSlug}>
      {state.loading ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-400">Загрузка магазина...</div> : null}
      {state.error ? <div className="mb-4 rounded-2xl border border-red-900 bg-red-950/40 p-6 text-red-300">{state.error}</div> : null}
      {!state.loading && !state.error ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
          <ShopGrid items={state.items} onAdd={addItem} currencyName={state.currencyName} />
          <CartDrawer currencyName={state.currencyName} />
        </div>
      ) : null}
    </PlayerLayout>
  );
}
