import PlayerLayout from "../../components/layout/PlayerLayout";

const nav = [{ label: "Главная", to: "/app/demo" }, { label: "Магазин", to: "/app/demo/shop" }, { label: "Заказы", to: "/app/demo/orders" }, { label: "Профиль", to: "/app/demo/profile" }, { label: "Клан", to: "/app/demo/clan" }];

export default function PlayerStatsPage() {
  return (
    <PlayerLayout title="Статистика" subtitle="Игровые показатели" nav={nav}>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">Kills</div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">Deaths</div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">Damage</div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">Builds</div>
      </div>
    </PlayerLayout>
  );
}
