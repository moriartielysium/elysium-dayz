import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlayerLayout from "../../components/layout/PlayerLayout";
import LinkRequiredGate from "../../components/common/LinkRequiredGate";
import { api } from "../../lib/api";
import { getGuildNav, normalizeGuildSlug } from "../../lib/player";
function formatNumber(value) { return new Intl.NumberFormat("ru-RU").format(Number(value || 0)); }
export default function PlayerStatsPage() {
  const { slug } = useParams();
  const safeSlug = normalizeGuildSlug(slug);
  const nav = getGuildNav(safeSlug);
  const [state, setState] = useState({ loading: true, error: "", linked: true, data: null });
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api(`player/stats?slug=${encodeURIComponent(safeSlug)}`);
        if (!active) return;
        setState({ loading: false, error: "", linked: true, data });
      } catch (error) {
        if (!active) return;
        if (String(error.message || "").toLowerCase().includes("link required")) {
          setState({ loading: false, error: "", linked: false, data: null });
          return;
        }
        setState({ loading: false, error: error.message || "Не удалось загрузить статистику", linked: true, data: null });
      }
    })();
    return () => { active = false; };
  }, [safeSlug]);
  const stats = state.data?.stats || {};
  return (<PlayerLayout title="Статистика" subtitle="Игровые показатели" nav={nav}>{state.loading ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-400">Загрузка...</div> : null}{!state.loading && !state.linked ? <LinkRequiredGate /> : null}{!state.loading && state.error ? <div className="rounded-2xl border border-red-900 bg-red-950/40 p-6 text-red-300">{state.error}</div> : null}{!state.loading && state.linked && !state.error ? <><div className="grid gap-4 md:grid-cols-4"><div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"><div className="text-zinc-500 text-sm">Kills</div><div className="mt-2 text-2xl font-bold">{formatNumber(stats.kills)}</div></div><div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"><div className="text-zinc-500 text-sm">Deaths</div><div className="mt-2 text-2xl font-bold">{formatNumber(stats.deaths)}</div></div><div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"><div className="text-zinc-500 text-sm">Damage</div><div className="mt-2 text-2xl font-bold">{formatNumber(stats.damage)}</div></div><div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"><div className="text-zinc-500 text-sm">Builds</div><div className="mt-2 text-2xl font-bold">{formatNumber(stats.builds)}</div></div></div><div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-300"><div><span className="text-zinc-500">Любимое оружие:</span> {stats.favoriteWeapon || "—"}</div><div className="mt-2"><span className="text-zinc-500">Плейтайм:</span> {formatNumber(Math.floor((stats.playtimeSeconds || 0) / 3600))} ч</div></div></> : null}</PlayerLayout>);
}
