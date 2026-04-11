import PlayerLayout from "../../components/layout/PlayerLayout";

const nav = [{ label: "Главная", to: "/app/demo" }, { label: "Магазин", to: "/app/demo/shop" }, { label: "Заказы", to: "/app/demo/orders" }, { label: "Профиль", to: "/app/demo/profile" }, { label: "Клан", to: "/app/demo/clan" }];

export default function PlayerProfilePage() {
  return (
    <PlayerLayout title="Профиль" subtitle="Discord, PSN, link status" nav={nav}>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
        Здесь будет профиль игрока и статус привязки /link.
      </div>
    </PlayerLayout>
  );
}
