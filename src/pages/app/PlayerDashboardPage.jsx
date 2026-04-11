import PlayerLayout from "../../components/layout/PlayerLayout";

const nav = [{ label: "Главная", to: "/app/demo" }, { label: "Магазин", to: "/app/demo/shop" }, { label: "Заказы", to: "/app/demo/orders" }, { label: "Профиль", to: "/app/demo/profile" }, { label: "Клан", to: "/app/demo/clan" }];

export default function PlayerDashboardPage() {
  return (
    <PlayerLayout title="Кабинет игрока" subtitle="Баланс, статистика, заказы" nav={nav}>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="text-sm text-zinc-400">Баланс</div>
          <div className="mt-2 text-3xl font-bold">13502001</div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="text-sm text-zinc-400">Активные заказы</div>
          <div className="mt-2 text-3xl font-bold">0</div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="text-sm text-zinc-400">Клан</div>
          <div className="mt-2 text-xl font-semibold">—</div>
        </div>
      </div>
    </PlayerLayout>
  );
}
