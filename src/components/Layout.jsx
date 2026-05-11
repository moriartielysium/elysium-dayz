import { Link, NavLink } from 'react-router-dom';
import { siteConfig } from '../config';

const navItems = [
  { to: '/', label: 'Главная' },
  { to: '/donate', label: 'Пополнение' },
  { to: '/oferta', label: 'Оферта' },
  { to: '/refund', label: 'Возврат' },
  { to: '/privacy', label: 'Политика' },
  { to: '/contacts', label: 'Контакты' },
];

export function Layout({ children, compact = false }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(239,27,36,0.22),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(247,183,51,0.14),transparent_30%),#07080d] text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/65 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/30 bg-red-600/15 text-xl font-black text-red-500 shadow-glow">
              EB
            </div>
            <div>
              <div className="text-lg font-black tracking-[0.22em] text-white">{siteConfig.shortName}</div>
              <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">DAYZ SERVER</div>
            </div>
          </Link>

          <nav className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:justify-end md:overflow-visible md:pb-0">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-red-600 text-white shadow-glow'
                      : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className={compact ? 'mx-auto max-w-5xl px-4 py-10 md:px-6' : 'mx-auto max-w-7xl px-4 py-10 md:px-6'}>{children}</main>

      <footer className="border-t border-white/10 bg-black/50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-zinc-400 md:grid-cols-[1.5fr_1fr_1fr] md:px-6">
          <div>
            <div className="mb-2 text-base font-bold text-white">{siteConfig.projectName}</div>
            <p>
              Пополнение внутреннего баланса Discord-сообщества. Баланс используется только внутри проекта и не является денежными средствами.
            </p>
          </div>
          <div>
            <div className="mb-2 font-semibold text-white">Документы</div>
            <div className="flex flex-col gap-1">
              <Link to="/oferta" className="hover:text-white">Публичная оферта</Link>
              <Link to="/privacy" className="hover:text-white">Политика конфиденциальности</Link>
              <Link to="/refund" className="hover:text-white">Возврат и отмена</Link>
            </div>
          </div>
          <div>
            <div className="mb-2 font-semibold text-white">Поддержка</div>
            <a className="block hover:text-white" href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>
            <a className="block hover:text-white" href={siteConfig.discordUrl} target="_blank" rel="noreferrer">Discord-сервер</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function SectionTitle({ eyebrow, title, children }) {
  return (
    <div className="mb-8 max-w-3xl">
      {eyebrow ? <div className="mb-2 text-sm font-bold uppercase tracking-[0.28em] text-red-400">{eyebrow}</div> : null}
      <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">{title}</h1>
      {children ? <p className="mt-4 text-base leading-7 text-zinc-300 md:text-lg">{children}</p> : null}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return <div className={`rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 ${className}`}>{children}</div>;
}

export function DocPage({ title, children }) {
  return (
    <Layout compact>
      <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 md:p-10">
        <h1 className="mb-6 text-3xl font-black text-white md:text-4xl">{title}</h1>
        <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-white">
          {children}
        </div>
      </article>
    </Layout>
  );
}
