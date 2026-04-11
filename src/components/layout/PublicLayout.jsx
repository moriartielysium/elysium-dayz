import Header from "./Header";

export default function PublicLayout({ title, subtitle, children, actions = null }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header title={title} subtitle={subtitle} actions={actions} />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
