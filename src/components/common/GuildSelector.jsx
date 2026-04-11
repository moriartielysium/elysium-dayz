export default function GuildSelector({ guilds = [], onSelect }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {guilds.map((guild) => (
        <button
          key={guild.guildId}
          onClick={() => onSelect?.(guild)}
          className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-left hover:border-brand-500"
        >
          <div className="text-base font-semibold">{guild.displayName}</div>
          <div className="text-sm text-zinc-400">{guild.slug}</div>
        </button>
      ))}
    </div>
  );
}
