import { formatMoney } from "../../lib/format";

export default function ShopCard({ item, onAdd }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
      <div className="aspect-square bg-zinc-900">
        {item?.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-base font-semibold">{item.name}</h3>
          <p className="text-sm text-zinc-400">{formatMoney(item.price)}</p>
        </div>
        <button
          onClick={() => onAdd?.(item)}
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black hover:bg-zinc-200"
        >
          Добавить в корзину
        </button>
      </div>
    </article>
  );
}
