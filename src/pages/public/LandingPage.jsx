import PublicLayout from "../../components/layout/PublicLayout";

export default function LandingPage() {
  return (
    <PublicLayout title="Elysium Web" subtitle="Мультисерверный кабинет и магазин">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-2 text-lg font-semibold">Вход через Discord</h2>
          <p className="text-sm text-zinc-400">После входа и /link игрок получает доступ к кабинету и магазину.</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-2 text-lg font-semibold">Мультисерверная архитектура</h2>
          <p className="text-sm text-zinc-400">Каждый Discord guild работает в своем контексте.</p>
        </div>
      </div>
    </PublicLayout>
  );
}
