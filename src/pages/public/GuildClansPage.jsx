import PublicLayout from "../../components/layout/PublicLayout";

export default function GuildClansPage() {
  return (
    <PublicLayout title="Кланы" subtitle="Публичный список кланов">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
        Здесь будет список кланов.
      </div>
    </PublicLayout>
  );
}
