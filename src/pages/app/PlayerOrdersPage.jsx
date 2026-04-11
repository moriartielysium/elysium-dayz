import PlayerLayout from "../../components/layout/PlayerLayout";

const nav = [{ label: "Главная", to: "/app/demo" }, { label: "Магазин", to: "/app/demo/shop" }, { label: "Заказы", to: "/app/demo/orders" }, { label: "Профиль", to: "/app/demo/profile" }, { label: "Клан", to: "/app/demo/clan" }];

export default function PlayerOrdersPage() {
  return (
    <PlayerLayout title="Заказы" subtitle="История заказов игрока" nav={nav}>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
        Здесь будет список заказов.
      </div>
    </PlayerLayout>
  );
}
