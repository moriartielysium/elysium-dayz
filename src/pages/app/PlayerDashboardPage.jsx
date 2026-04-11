import React, { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { getPlayerOrders, getPlayerStats, getPlayerWallet } from "../../lib/player";

function StatCard({ title, value, subtitle }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
      {subtitle ? <div style={styles.cardSubtitle}>{subtitle}</div> : null}
    </div>
  );
}

export default function PlayerDashboardPage() {
  const outlet = useOutletContext() || {};
  const slug = outlet.slug || "elysium";
  const me = outlet.me || null;
  const profile = outlet.profile || null;
  const authChecked = outlet.authChecked ?? true;

  useEffect(() => {
    if (!authChecked) return;

    let mounted = true;
    setError("");

    Promise.allSettled([
      getPlayerStats(slug),
      getPlayerWallet(slug),
      getPlayerOrders(slug),
    ]).then((items) => {
      if (!mounted) return;

      const [statsRes, walletRes, ordersRes] = items;

      if (statsRes.status === "fulfilled") setStats(statsRes.value);
      if (walletRes.status === "fulfilled") setWallet(walletRes.value);
      if (ordersRes.status === "fulfilled") setOrders(ordersRes.value);

      const firstError = items.find((x) => x.status === "rejected");
      if (firstError) setError(firstError.reason?.message || "API request failed");
    });

    return () => { mounted = false; };
  }, [slug, authChecked]);

  const kd = useMemo(() => {
    const kills = Number(stats?.kills || 0);
    const deaths = Number(stats?.deaths || 0);
    if (!deaths) return kills.toFixed(2);
    return (kills / deaths).toFixed(2);
  }, [stats]);

  const totalOrders = Array.isArray(orders?.items) ? orders.items.length : Array.isArray(orders) ? orders.length : 0;
  const balance = wallet?.balance ?? wallet?.wallet?.balance ?? 0;

  return (
    <div>
      <div style={styles.hero}>
        <div>
          <h2 style={styles.heading}>Главная</h2>
          <div style={styles.subheading}>Добро пожаловать в кабинет игрока</div>
        </div>
        <div style={styles.quickActions}>
          <Link to={`/app/${slug}/shop`} style={styles.primaryBtn}>Открыть магазин</Link>
          <Link to="/" style={styles.secondaryBtn}>Назад на сайт</Link>
        </div>
      </div>

      {error ? <div style={styles.error}>{error}</div> : null}

      <div style={styles.grid}>
        <StatCard title="Баланс" value={balance} subtitle="Игровая валюта" />
        <StatCard title="Киллы" value={stats?.kills ?? 0} subtitle={`K/D ${kd}`} />
        <StatCard title="Смерти" value={stats?.deaths ?? 0} subtitle={`Урон ${stats?.damage ?? 0}`} />
        <StatCard title="Заказы" value={totalOrders} subtitle={profile?.psn_name ? `PSN ${profile.psn_name}` : "Привяжи аккаунт через /link"} />
      </div>

      <div style={styles.infoWrap}>
        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Профиль</h3>
          <div style={styles.row}><span>Discord:</span><strong>{me?.user?.global_name || me?.user?.username || "—"}</strong></div>
          <div style={styles.row}><span>PSN:</span><strong>{profile?.psn_name || profile?.normalized_psn_name || "не найден"}</strong></div>
          <div style={styles.row}><span>Link:</span><strong>{profile?.psn_name ? "подключен" : "не найден"}</strong></div>
        </div>

        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Быстрые переходы</h3>
          <div style={styles.links}>
            <Link to={`/app/${slug}/stats`} style={styles.linkBtn}>Статистика</Link>
            <Link to={`/app/${slug}/profile`} style={styles.linkBtn}>Профиль</Link>
            <Link to={`/app/${slug}/orders`} style={styles.linkBtn}>Заказы</Link>
            <Link to={`/app/${slug}/shop`} style={styles.linkBtn}>Магазин</Link>
            <Link to={`/app/${slug}/clan`} style={styles.linkBtn}>Клан</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  hero: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 22, flexWrap: "wrap" },
  heading: { color: "#fff", margin: 0, fontSize: 32, fontWeight: 800 },
  subheading: { color: "rgba(255,255,255,0.55)", marginTop: 4 },
  quickActions: { display: "flex", gap: 10, flexWrap: "wrap" },
  primaryBtn: { textDecoration: "none", color: "#fff", background: "#4b63d1", padding: "10px 14px", borderRadius: 10 },
  secondaryBtn: { textDecoration: "none", color: "#fff", background: "rgba(255,255,255,0.08)", padding: "10px 14px", borderRadius: 10 },
  error: { background: "#5f0f0f", color: "#fff", padding: 14, borderRadius: 12, marginBottom: 18, border: "1px solid rgba(255,255,255,0.08)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginBottom: 22 },
  card: { background: "#0d0f14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 18 },
  cardTitle: { color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 8 },
  cardValue: { color: "#fff", fontSize: 32, fontWeight: 800 },
  cardSubtitle: { color: "rgba(255,255,255,0.5)", marginTop: 8, fontSize: 13 },
  infoWrap: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16 },
  panel: { background: "#0d0f14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 18 },
  panelTitle: { color: "#fff", marginTop: 0 },
  row: { display: "flex", justifyContent: "space-between", gap: 14, marginBottom: 10, color: "rgba(255,255,255,0.8)" },
  links: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 },
  linkBtn: { textDecoration: "none", color: "#fff", background: "rgba(255,255,255,0.06)", padding: "12px 14px", borderRadius: 10, textAlign: "center" },
};
