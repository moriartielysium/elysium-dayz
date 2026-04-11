import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";

export default function PlayerLayout({ title, subtitle, children, nav = [] }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header title={title} subtitle={subtitle} />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar items={nav} />
        <main className="min-w-0 flex-1 px-4 py-6 pb-24 lg:pb-6">{children}</main>
      </div>
      <MobileBottomNav items={nav} />
    </div>
  );
}
