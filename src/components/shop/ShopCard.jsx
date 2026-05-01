import { formatMoney } from '../../lib/format';

export default function ShopCard({ item, onAdd, currencyName = '' }) {
  const currency = item?.currencyName || item?.currency_name || currencyName;
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
      <div className="aspect-square bg-zinc-900">
        {item?.image || item?.imageUrl || item?.image_url ? (
          <img src={item.image || item.imageUrl || item.image_url} alt={item.name} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-base font-semibold">{item.name}</h3>
          {item.description ? <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{item.description}</p> : null}
          <p className="mt-2 text-sm text-zinc-400">{formatMoney(item.price, currency)}</p>
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
