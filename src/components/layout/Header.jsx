export default function Header({ title, subtitle, actions = null }) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 px-4 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          {subtitle ? <p className="text-sm text-zinc-400">{subtitle}</p> : null}
        </div>
        <div>{actions}</div>
      </div>
    </header>
  );
}
