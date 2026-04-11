import { Link } from "react-router-dom";

export default function MobileBottomNav({ items = [] }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950 px-3 py-2 lg:hidden">
      <div className="grid grid-cols-5 gap-2">
        {items.slice(0, 5).map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="rounded-xl px-2 py-2 text-center text-xs text-zinc-300 hover:bg-zinc-900"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
