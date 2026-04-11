export default function Header({ title, subtitle, actions = null, identity = null }) {
  const avatarUrl = identity?.avatarUrl || null;
  const discordName = identity?.discordName || "";
  const psnName = identity?.psnName || "";

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 px-4 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          {subtitle ? <p className="text-sm text-zinc-400">{subtitle}</p> : null}
        </div>

        <div className="flex items-center gap-3">
          {identity ? (
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={discordName || "Discord avatar"}
                  className="h-10 w-10 rounded-full border border-zinc-700 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-sm text-zinc-300">
                  {(discordName || psnName || "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">{discordName || "Игрок"}</div>
                <div className="truncate text-xs text-zinc-400">PSN: {psnName || "не привязан"}</div>
              </div>
            </div>
          ) : null}

          <div>{actions}</div>
        </div>
      </div>
    </header>
  );
}
