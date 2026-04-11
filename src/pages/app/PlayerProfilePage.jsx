import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlayerLayout from "../../components/layout/PlayerLayout";
import LinkRequiredGate from "../../components/common/LinkRequiredGate";
import { api } from "../../lib/api";
import { getGuildNav } from "../../lib/player";
export default function PlayerProfilePage() {
  const { slug } = useParams();
  const nav = getGuildNav(slug || "demo");
  const [state, setState] = useState({ loading: true, error: "", linked: true, data: null });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api(`player/profile?slug=${encodeURIComponent(slug)}`);
        if (!active) return;
        setState({ loading: false, error: "", linked: true, data });
      } catch (error) {
        if (!active) return;
        if (String(error.message || "").toLowerCase().includes("link required")) {
          setState({ loading: false, error: "", linked: false, data: null });
          return;
        }
        setState({ loading: false, error: error.message || "Не удалось загрузить профиль", linked: true, data: null });
      }
    })();
    return () => { active = false; };
  }, [slug]);

  return (
    <PlayerLayout title="Профиль" subtitle="Discord, PSN и связка аккаунта" nav={nav}>
      {state.loading ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-400">Загрузка...</div> : null}
      {!state.loading && !state.linked ? <LinkRequiredGate /> : null}
      {!state.loading && state.error ? <div className="rounded-2xl border border-red-900 bg-red-950/40 p-6 text-red-300">{state.error}</div> : null}
      {!state.loading && state.linked && !state.error ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
            <div><span className="text-zinc-500">PSN:</span> {state.data?.profile?.psnName || "—"}</div>
            <div><span className="text-zinc-500">Нормализованное имя:</span> {state.data?.profile?.normalizedPsnName || "—"}</div>
            <div><span className="text-zinc-500">Player ID:</span> {state.data?.profile?.playerId || "—"}</div>
            <div><span className="text-zinc-500">Nitrado name:</span> {state.data?.profile?.nitradoName || "—"}</div>
            <div><span className="text-zinc-500">Nitrado account:</span> {state.data?.profile?.nitradoAccount || "—"}</div>
            <div><span className="text-zinc-500">Привязка создана:</span> {state.data?.profile?.linkedAt || "—"}</div>
          </div>
        </div>
      ) : null}
    </PlayerLayout>
  );
}
