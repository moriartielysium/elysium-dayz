import { useMemo } from "react";
import { useParams } from "react-router-dom";
import PlayerLayout from "../../components/layout/PlayerLayout";
import ShopGrid from "../../components/shop/ShopGrid";
import CartDrawer from "../../components/shop/CartDrawer";
import { useCartStore } from "../../stores/cartStore";
import { getPlayerNav, normalizeSlug } from "../../lib/nav";

const sampleItems = [
  { id: 1, name: "Батарея 9В", price: 1200, image: "" },
  { id: 2, name: "Набор отмычек", price: 800, image: "" },
  { id: 3, name: "Охотничий нож", price: 2000, image: "" },
  { id: 4, name: "Лом", price: 800, image: "" }
];

export default function PlayerShopPage() {
  const params = useParams();
  const slug = useMemo(() => normalizeSlug(params?.slug), [params?.slug]);
  const nav = useMemo(() => getPlayerNav(slug), [slug]);
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
