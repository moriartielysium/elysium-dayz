import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AdminLayout({ title, subtitle, children, nav = [] }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header title={title} subtitle={subtitle} />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar items={nav} />
        <main className="min-w-0 flex-1 px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
