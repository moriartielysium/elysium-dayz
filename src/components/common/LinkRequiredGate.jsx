export default function LinkRequiredGate() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="mb-2 text-lg font-semibold">Нужна привязка аккаунта</h2>
      <p className="text-sm text-zinc-400">
        Чтобы пользоваться личным кабинетом и магазином, сначала сделай /link в Discord.
      </p>
    </div>
  );
}
