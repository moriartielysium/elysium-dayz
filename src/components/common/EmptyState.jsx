export default function EmptyState({ title = "Пусто" }) {
  return <div className="p-6 text-sm text-zinc-400">{title}</div>;
}
