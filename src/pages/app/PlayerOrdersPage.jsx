import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlayerLayout from "../../components/layout/PlayerLayout";
import LinkRequiredGate from "../../components/common/LinkRequiredGate";
import { api } from "../../lib/api";
import { getGuildNav, normalizeGuildSlug } from "../../lib/player";
import { formatMoney } from "../../lib/format";

function formatNumber(value) { return new Intl.NumberFormat("ru-RU").format(Number(value || 0)); }

export default function PlayerOrdersPage() {
  const params = useParams() || {};
  const safeSlug = normalizeGuildSlug(params.slug);
  const nav = getGuildNav(safeSlug);
  const [state, setState] = useState({ loading: true, error: "", linked: true, data: null });
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [meData, profileData, data] = await Promise.all([
          api("me"),
          api(`player/profile?slug=${encodeURIComponent(safeSlug)}`),
          api(`player/orders?slug=${encodeURIComponent(safeSlug)}`),
        ]);
        if (!active) return;
        setMe(meData);
        setProfile(profileData?.profile || null);
        setState({ loading: false, error: "", linked: true, data });
      } catch (error) {
        if (!active) return;
        if (String(error.message || "").toLowerCase().includes("link required")) {
          setState({ loading: false, error: "", linked: false, data: null });
          return;
        }
        setState({ loading: false, error: error.message || "Не удалось загрузить заказы", linked: true, data: null });
      }
    })();
    return () => { active = false; };
  }, [safeSlug]);

  const orders = state.data?.orders || [];

  return (
    <PlayerLayout title="Заказы" subtitle="История покупок" nav={nav} me={me} profile={profile} slug={safeSlug}>
      {state.loading ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-400">Загрузка...</div> : null}
      {!state.loading && !state.linked ? <LinkRequiredGate /> : null}
      {!state.loading && state.error ? <div className="rounded-2xl border border-red-900 bg-red-950/40 p-6 text-red-300">{state.error}</div> : null}
      {!state.loading && state.linked && !state.error ? (
        <div className="space-y-3">
          {orders.map((item) => (
            <div key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">{item.itemName || item.item_name || "Товар"}</div>
                  <div className="mt-1 text-sm text-zinc-400">Заказ #{item.id} · {item.status}</div>
                </div>
                <div className="text-right text-sm text-zinc-300">{formatMoney(item.pricePaid || item.price_paid, item.currencyName || state.data?.currencyName || state.data?.currency)}</div>
              </div>
              <div className="mt-2 text-xs text-zinc-500">Создан: {item.createdAt || item.created_at || "—"}</div>
            </div>
          ))}
          {!orders.length ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-500">Покупок пока нет.</div> : null}
        </div>
      ) : null}
    </PlayerLayout>
  );
}
