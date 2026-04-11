import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlayerLayout from "../../components/layout/PlayerLayout";
import LinkRequiredGate from "../../components/common/LinkRequiredGate";
import { api } from "../../lib/api";
import { getGuildNav, normalizeGuildSlug } from "../../lib/player";
function formatNumber(value) {
  return new Intl.NumberFormat("ru-RU").format(Number(value || 0));
}
function formatHours(seconds) {
  const hrs = Math.floor((Number(seconds || 0)) / 3600);
  return `${hrs} ч`;
}
export default function PlayerDashboardPage() {
  const { slug } = useParams();
  const safeSlug = normalizeGuildSlug(slug);
  const nav = getGuildNav(safeSlug);
  const [state, setState] = useState({ loading: true, error: "", linked: true, profile: null, stats: null, wallet: null, orders: null });
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [profile, stats, wallet, orders] = await Promise.all([
          api(`player/profile?slug=${encodeURIComponent(safeSlug)}`),
          api(`player/stats?slug=${encodeURIComponent(safeSlug)}`),
          api(`player/wallet?slug=${encodeURIComponent(safeSlug)}`),
          api(`player/orders?slug=${encodeURIComponent(safeSlug)}`),
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
  }, [safeSlug]);
  return (
    <PlayerLayout title="Кабинет игрока" subtitle="Баланс, статистика и заказы" nav={nav}>
      {state.loading ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-400">Загрузка...</div> : null}
      {!state.loading && !state.linked ? <LinkRequiredGate /> : null}
      {!state.loading && state.error ? <div className="rounded-2xl border border-red-900 bg-red-950/40 p-6 text-red-300">{state.error}</div> : null}
      {!state.loading && state.linked && !state.error ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"><div className="text-sm text-zinc-400">Баланс</div><div className="mt-2 text-3xl font-bold">{formatNumber(state.wallet?.wallet?.balance)}</div></div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"><div className="text-sm text-zinc-400">Киллы</div><div className="mt-2 text-3xl font-bold">{formatNumber(state.stats?.stats?.kills)}</div></div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"><div className="text-sm text-zinc-400">Смерти</div><div className="mt-2 text-3xl font-bold">{formatNumber(state.stats?.stats?.deaths)}</div></div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"><div className="text-sm text-zinc-400">Плейтайм</div><div className="mt-2 text-3xl font-bold">{formatHours(state.stats?.stats?.playtimeSeconds)}</div></div>
          </div>
        </>
      ) : null}
    </PlayerLayout>
  );
}
