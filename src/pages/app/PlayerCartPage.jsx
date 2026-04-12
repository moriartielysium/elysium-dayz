import PlayerLayout from "../../components/layout/PlayerLayout";
import CheckoutSummary from "../../components/shop/CheckoutSummary";

const nav = [{ label: "Главная", to: "/app/demo" }, { label: "Магазин", to: "/app/demo/shop" }, { label: "Заказы", to: "/app/demo/orders" }, { label: "Профиль", to: "/app/demo/profile" }, { label: "Клан", to: "/app/demo/clan" }];

export default function PlayerCartPage() {
  return (
    <PlayerLayout title="Корзина" subtitle="Подтверждение заказа" nav={nav}>
      <CheckoutSummary />
    </PlayerLayout>
  );
}
