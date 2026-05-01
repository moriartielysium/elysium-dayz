import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ items = [] }) {
  const location = useLocation();

  return (
    <aside className="hidden max-h-[calc(100vh-93px)] w-72 shrink-0 overflow-y-auto border-r border-zinc-800 bg-zinc-950 p-4 lg:block">
      <nav className="space-y-1">
        {items.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={active
                ? "block rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
                : "block rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
