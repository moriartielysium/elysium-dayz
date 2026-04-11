import PublicLayout from "../../components/layout/PublicLayout";

export default function GuildPublicPage() {
  return (
    <PublicLayout title="Сервер" subtitle="Публичная страница сервера">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
        Здесь будет публичная витрина сервера.
      </div>
    </PublicLayout>
  );
}
