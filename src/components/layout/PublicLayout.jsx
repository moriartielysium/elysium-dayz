import Header from "./Header";

export default function PublicLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header title={title} subtitle={subtitle} />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
