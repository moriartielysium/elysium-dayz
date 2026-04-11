export default function StatusBadge({ children }) {
  return (
    <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-300">
      {children}
    </span>
  );
}
