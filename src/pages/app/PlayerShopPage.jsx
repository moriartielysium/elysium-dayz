import PlayerLayout from "../../components/layout/PlayerLayout";
import ShopGrid from "../../components/shop/ShopGrid";
import CartDrawer from "../../components/shop/CartDrawer";
import { useCartStore } from "../../stores/cartStore";

const nav = [{ label: "Главная", to: "/app/demo" }, { label: "Магазин", to: "/app/demo/shop" }, { label: "Заказы", to: "/app/demo/orders" }, { label: "Профиль", to: "/app/demo/profile" }, { label: "Клан", to: "/app/demo/clan" }];
const sampleItems = [
  {
    "id": 1,
    "name": "Батарея 9В",
    "price": 1200,
    "image": ""
  },
  {
    "id": 2,
    "name": "Набор отмычек",
    "price": 800,
    "image": ""
  },
  {
    "id": 3,
    "name": "Охотничий нож",
    "price": 2000,
    "image": ""
  },
  {
    "id": 4,
    "name": "Лом",
    "price": 800,
    "image": ""
  }
];

export default function PlayerShopPage() {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <PlayerLayout title="Магазин" subtitle="Покупка предметов за внутриигровую валюту" nav={nav}>
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <ShopGrid items={sampleItems} onAdd={addItem} />
        <CartDrawer />
      </div>
    </PlayerLayout>
  );
}
