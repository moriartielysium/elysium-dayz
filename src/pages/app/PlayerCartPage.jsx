import { useMemo } from "react";
import { useParams } from "react-router-dom";
import PlayerLayout from "../../components/layout/PlayerLayout";
import { getPlayerNav, normalizeSlug } from "../../lib/nav";

export default function PlayerCartPage() {
  const params = useParams();
  const slug = useMemo(() => normalizeSlug(params?.slug), [params?.slug]);
  const nav = useMemo(() => getPlayerNav(slug), [slug]);

  return (
    <PlayerLayout title="Корзина" subtitle="Подготовка заказа" nav={nav}>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
        Здесь будет раздел: Корзина.
      </div>
    </PlayerLayout>
  );
}
