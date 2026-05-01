export function Card({ children, className = '' }) {
  return <div className={`rounded-2xl border border-zinc-800 bg-zinc-950 p-6 ${className}`}>{children}</div>;
}

export function Alert({ children, type = 'error' }) {
  const cls = type === 'success'
    ? 'border-emerald-900 bg-emerald-950/40 text-emerald-100'
    : type === 'warning'
      ? 'border-amber-900 bg-amber-950/30 text-amber-100'
      : 'border-red-900 bg-red-950/50 text-red-200';
  return <div className={`rounded-2xl border p-4 text-sm ${cls}`}>{children}</div>;
}

export function Field({ label, hint, children }) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between gap-3 text-sm text-zinc-300">
        <span>{label}</span>
        {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export function TextInput({ value, onChange, placeholder, required = false }) {
  return (
    <input
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
    />
  );
}

export function NumberInput({ value, onChange, min, step = '1', placeholder, required = false }) {
  return (
    <input
      type="number"
      min={min}
      step={step}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
    />
  );
}

export function SelectInput({ value, onChange, children }) {
  return (
    <select
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none"
    >
      {children}
    </select>
  );
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-black/40 p-4">
      <input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 accent-indigo-600" />
      <span>
        <span className="block text-sm font-medium text-zinc-100">{label}</span>
        {hint ? <span className="mt-1 block text-xs text-zinc-500">{hint}</span> : null}
      </span>
    </label>
  );
}

export function PrimaryButton({ children, disabled = false, type = 'button', onClick }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">
      {children}
    </button>
  );
}

export function SecondaryButton({ children, disabled = false, type = 'button', onClick }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-900 disabled:opacity-60">
      {children}
    </button>
  );
}

export function DangerButton({ children, disabled = false, type = 'button', onClick }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className="rounded-xl border border-red-900/70 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-950/40 disabled:opacity-60">
      {children}
    </button>
  );
}
