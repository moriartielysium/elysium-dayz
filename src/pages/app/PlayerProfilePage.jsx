import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlayerLayout from "../../components/layout/PlayerLayout";
import LinkRequiredGate from "../../components/common/LinkRequiredGate";
import { api } from "../../lib/api";
import { getGuildNav, normalizeGuildSlug } from "../../lib/player";

export default function PlayerProfilePage() {
  const params = useParams() || {};
  const safeSlug = normalizeGuildSlug(params.slug);
  const nav = getGuildNav(safeSlug);
  const [state, setState] = useState({ loading: true, error: "", linked: true, data: null });
  const [me, setMe] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [meData, data] = await Promise.all([
          api("me"),
          api(`player/profile?slug=${encodeURIComponent(safeSlug)}`),
        ]);
        if (!active) return;
        setMe(meData);
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
  }, [safeSlug]);

  const profile = state.data?.profile || null;

  return (
    <PlayerLayout title="Профиль" subtitle="Discord, PSN и связка аккаунта" nav={nav} me={me} profile={profile} slug={safeSlug}>
      {state.loading ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-400">Загрузка...</div> : null}
      {!state.loading && !state.linked ? <LinkRequiredGate /> : null}
      {!state.loading && state.error ? <div className="rounded-2xl border border-red-900 bg-red-950/40 p-6 text-red-300">{state.error}</div> : null}
      {!state.loading && state.linked && !state.error ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
            <div><span className="text-zinc-500">PSN:</span> {profile?.psnName || profile?.psn_name || "—"}</div>
            <div><span className="text-zinc-500">Нормализованное имя:</span> {profile?.normalizedPsnName || profile?.normalized_psn_name || "—"}</div>
            <div><span className="text-zinc-500">Player ID:</span> {profile?.playerId || profile?.player_id || "—"}</div>
            <div><span className="text-zinc-500">Nitrado name:</span> {profile?.nitradoName || profile?.nitrado_name || "—"}</div>
            <div><span className="text-zinc-500">Nitrado account:</span> {profile?.nitradoAccount || profile?.nitrado_account || "—"}</div>
            <div><span className="text-zinc-500">Привязка создана:</span> {profile?.linkedAt || profile?.linked_at || "—"}</div>
          </div>
        </div>
      ) : null}
    </PlayerLayout>
  );
}
