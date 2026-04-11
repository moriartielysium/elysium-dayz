import { Link } from "react-router-dom";

export default function Sidebar({ items = [] }) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-zinc-800 bg-zinc-950 p-4 lg:block">
      <nav className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="block rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
