import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlayerLayout from "../../components/layout/PlayerLayout";
import LinkRequiredGate from "../../components/common/LinkRequiredGate";
import { api } from "../../lib/api";
import { getGuildNav } from "../../lib/player";
function formatNumber(value) {
  return new Intl.NumberFormat("ru-RU").format(Number(value || 0));
}

function formatHours(seconds) {
  const hrs = Math.floor((Number(seconds || 0)) / 3600);
  return `${hrs} ч`;
}

export default function PlayerDashboardPage() {
  const { slug } = useParams();
  const nav = getGuildNav(slug || "demo");
  const [state, setState] = useState({ loading: true, error: "", linked: true, profile: null, stats: null, wallet: null, orders: null });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [profile, stats, wallet, orders] = await Promise.all([
          api(`player/profile?slug=${encodeURIComponent(slug)}`),
          api(`player/stats?slug=${encodeURIComponent(slug)}`),
          api(`player/wallet?slug=${encodeURIComponent(slug)}`),
          api(`player/orders?slug=${encodeURIComponent(slug)}`),
        ]);
        if (!active) return;
        setState({ loading: false, error: "", linked: true, profile, stats, wallet, orders });
      } catch (error) {
        if (!active) return;
        if (String(error.message || "").toLowerCase().includes("link required")) {
          setState({ loading: false, error: "", linked: false, profile: null, stats: null, wallet: null, orders: null });
          return;
        }
        setState({ loading: false, error: error.message || "Не удалось загрузить кабинет", linked: true, profile: null, stats: null, wallet: null, orders: null });
      }
    })();
    return () => { active = false; };
  }, [slug]);

  return (
    <PlayerLayout title="Кабинет игрока" subtitle="Баланс, статистика и заказы" nav={nav}>
      {state.loading ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-400">Загрузка...</div> : null}
      {!state.loading && !state.linked ? <LinkRequiredGate /> : null}
      {!state.loading && state.error ? <div className="rounded-2xl border border-red-900 bg-red-950/40 p-6 text-red-300">{state.error}</div> : null}
      {!state.loading && state.linked && !state.error ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="text-sm text-zinc-400">Баланс</div>
              <div className="mt-2 text-3xl font-bold">{formatNumber(state.wallet?.wallet?.balance)}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="text-sm text-zinc-400">Киллы</div>
              <div className="mt-2 text-3xl font-bold">{formatNumber(state.stats?.stats?.kills)}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="text-sm text-zinc-400">Смерти</div>
              <div className="mt-2 text-3xl font-bold">{formatNumber(state.stats?.stats?.deaths)}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="text-sm text-zinc-400">Плейтайм</div>
              <div className="mt-2 text-3xl font-bold">{formatHours(state.stats?.stats?.playtimeSeconds)}</div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="text-lg font-semibold">Профиль</div>
              <div className="mt-3 space-y-2 text-sm text-zinc-300">
                <div><span className="text-zinc-500">PSN:</span> {state.profile?.profile?.psnName || "—"}</div>
                <div><span className="text-zinc-500">Nitrado:</span> {state.profile?.profile?.nitradoName || "—"}</div>
                <div><span className="text-zinc-500">Аккаунт:</span> {state.profile?.profile?.nitradoAccount || "—"}</div>
                <div><span className="text-zinc-500">Любимое оружие:</span> {state.stats?.stats?.favoriteWeapon || "—"}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="text-lg font-semibold">Последние заказы</div>
              <div className="mt-3 space-y-3 text-sm">
                {(state.orders?.orders || []).slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                    <div className="font-medium">{item.itemName}</div>
                    <div className="mt-1 text-zinc-400">#{item.id} · {item.status} · {formatNumber(item.pricePaid)}</div>
                  </div>
                ))}
                {!(state.orders?.orders || []).length ? <div className="text-zinc-500">Заказов пока нет.</div> : null}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </PlayerLayout>
  );
}
