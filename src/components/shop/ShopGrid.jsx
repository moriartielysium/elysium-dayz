import ShopCard from './ShopCard';

export default function ShopGrid({ items = [], onAdd, currencyName = '' }) {
  if (!items.length) {
    return <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-500">Товары пока не добавлены.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {items.map((item) => (
        <ShopCard key={item.id} item={item} onAdd={onAdd} currencyName={currencyName} />
      ))}
    </div>
  );
}
