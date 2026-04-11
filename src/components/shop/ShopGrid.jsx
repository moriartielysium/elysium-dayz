import ShopCard from "./ShopCard";

export default function ShopGrid({ items = [], onAdd }) {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {items.map((item) => (
        <ShopCard key={item.id} item={item} onAdd={onAdd} />
      ))}
    </div>
  );
}
