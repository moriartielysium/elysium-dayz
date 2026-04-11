import React from "react";
import { Link, useParams } from "react-router-dom";
import { resolveSlug, discordAvatarUrl } from "../../lib/player";

export default function Header({ me, profile }) {
  const { slug: rawSlug } = useParams();
  const slug = resolveSlug(rawSlug);
  const avatar = discordAvatarUrl(me?.user);

  return (
    <header style={styles.header}>
      <div>
        <h1 style={styles.title}>Кабинет игрока</h1>
        <div style={styles.subtitle}>Баланс, статистика и заказы</div>
      </div>

      <div style={styles.actions}>
        <Link to="/" style={styles.secondaryBtn}>На сайт</Link>
        <Link to={`/app/${slug}`} style={styles.secondaryBtn}>Главная кабинета</Link>
        <button
          type="button"
          style={styles.dangerBtn}
          onClick={async () => {
            await fetch("/api/auth-logout", { method: "POST", credentials: "include" });
            window.location.href = "/";
          }}
        >
          Выйти
        </button>

        <div style={styles.identity}>
          {avatar ? <img src={avatar} alt="" style={styles.avatar} /> : <div style={styles.avatarFallback}>D</div>}
          <div>
            <div style={styles.name}>{me?.user?.global_name || me?.user?.username || "Игрок"}</div>
            <div style={styles.meta}>PSN: {profile?.psn_name || profile?.normalized_psn_name || "не привязан"}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    padding: "16px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "#0b0b0f",
    position: "sticky",
    top: 0,
    zIndex: 20,
  },
  title: { margin: 0, color: "#fff", fontSize: 34, fontWeight: 800 },
  subtitle: { color: "rgba(255,255,255,0.55)", marginTop: 4 },
  actions: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" },
  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    color: "#fff",
    textDecoration: "none",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  dangerBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    color: "#fff",
    background: "#8f1d1d",
    border: "1px solid rgba(255,255,255,0.08)",
    cursor: "pointer",
  },
  identity: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: "8px 12px",
    minWidth: 210,
  },
  avatar: { width: 42, height: 42, borderRadius: "50%", objectFit: "cover" },
  avatarFallback: {
    width: 42, height: 42, borderRadius: "50%", background: "#333", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
  },
  name: { color: "#fff", fontWeight: 700 },
  meta: { color: "rgba(255,255,255,0.65)", fontSize: 13 },
};
