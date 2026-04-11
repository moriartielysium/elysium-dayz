import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import { getMe, getPlayerProfile, resolveSlug } from "../../lib/player";

export default function PlayerLayout() {
  const params = useParams();
  const rawSlug = params?.slug || "elysium";
  const slug = resolveSlug(rawSlug);
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (rawSlug !== slug) {
      navigate(`/app/${slug}`, { replace: true });
      return;
    }

    let mounted = true;

    Promise.allSettled([getMe(), getPlayerProfile(slug)])
      .then((results) => {
        if (!mounted) return;

        if (results[0].status === "fulfilled") setMe(results[0].value);
        if (results[1].status === "fulfilled") setProfile(results[1].value);
      })
      .finally(() => {
        if (mounted) setAuthChecked(true);
      });

    return () => {
      mounted = false;
    };
  }, [rawSlug, slug, navigate]);

  const links = [
    { label: "Главная", to: `/app/${slug}` },
    { label: "Статистика", to: `/app/${slug}/stats` },
    { label: "Профиль", to: `/app/${slug}/profile` },
    { label: "Заказы", to: `/app/${slug}/orders` },
    { label: "Магазин", to: `/app/${slug}/shop` },
    { label: "Клан", to: `/app/${slug}/clan` },
  ];

  return (
    <div style={styles.page}>
      <Header me={me} profile={profile} slug={slug} />

      <div style={styles.body}>
        <aside style={styles.sidebar}>
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === `/app/${slug}`}
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

        <main style={styles.main}>
          <Outlet context={{ slug, me, profile, authChecked }} />
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#050507" },
  body: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: 0,
    maxWidth: 1400,
    margin: "0 auto",
  },
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