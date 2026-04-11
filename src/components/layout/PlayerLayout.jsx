import React from "react";
import { NavLink } from "react-router-dom";
import Header from "./Header";

export default function PlayerLayout({
  title = "Кабинет игрока",
  subtitle = "",
  nav = {},
  me = null,
  profile = null,
  slug = "elysium",
  children,
}) {
  const links = [
    { label: "Главная", to: nav.dashboard || `/app/${slug}` },
    { label: "Статистика", to: nav.stats || `/app/${slug}/stats` },
    { label: "Профиль", to: nav.profile || `/app/${slug}/profile` },
    { label: "Заказы", to: nav.orders || `/app/${slug}/orders` },
    { label: "Магазин", to: nav.shop || `/app/${slug}/shop` },
    { label: "Клан", to: nav.clan || `/app/${slug}/clan` },
  ];

  return (
    <div style={styles.page}>
      <Header me={me} profile={profile} slug={slug} title={title} subtitle={subtitle} />
      <div style={styles.body}>
        <aside style={styles.sidebar}>
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === (nav.dashboard || `/app/${slug}`)}
              style={({ isActive }) => ({
                ...styles.navLink,
                background: isActive ? "rgba(255,255,255,0.10)" : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.85)",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </aside>
        <main style={styles.main}>{children}</main>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#050507" },
  body: { display: "grid", gridTemplateColumns: "240px 1fr", gap: 0, maxWidth: 1400, margin: "0 auto" },
  sidebar: {
    padding: 24,
    borderRight: "1px solid rgba(255,255,255,0.08)",
    minHeight: "calc(100vh - 90px)",
  },
  navLink: {
    display: "block",
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: 10,
    marginBottom: 8,
  },
  main: { padding: 20 },
};
