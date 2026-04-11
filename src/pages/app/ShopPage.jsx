import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getShopCategories, getShopItems, buyShopItem } from "../../lib/shop";
import { getPlayerWallet } from "../../lib/player";

export default function ShopPage() {
  const outlet = useOutletContext() || {};
  const slug = outlet.slug || "elysium";

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0 });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadAll(categoryId = selectedCategory) {
    setLoading(true);
    setError("");
    try {
      const [catRes, itemRes, walletRes] = await Promise.all([
        getShopCategories(slug),
        getShopItems(slug, categoryId),
        getPlayerWallet(slug),
      ]);
      setCategories(catRes.categories || []);
      setItems(itemRes.items || []);
      setWallet(walletRes.wallet || { balance: walletRes.balance || 0 });
    } catch (e) {
      setError(e.message || "Не удалось загрузить магазин");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll(selectedCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, selectedCategory]);

  async function onBuy(item) {
    setBuyingId(item.id);
    setError("");
    setNotice("");
    try {
      const result = await buyShopItem(slug, item.id);
      setNotice(`Покупка оформлена: ${result.itemName}. Списано ${result.pricePaid}. Остаток ${result.balanceAfter}.`);
      await loadAll(selectedCategory);
    } catch (e) {
      setError(e.message || "Не удалось купить товар");
    } finally {
      setBuyingId(null);
    }
  }

  const balance = wallet?.balance ?? 0;

  return (
    <div>
      <div style={styles.hero}>
        <div>
          <h2 style={styles.title}>Магазин</h2>
          <div style={styles.sub}>Покупки через сайт со списанием игровой валюты</div>
        </div>
        <div style={styles.balance}>Баланс: <strong>{balance}</strong></div>
      </div>

      {error ? <div style={styles.error}>{error}</div> : null}
      {notice ? <div style={styles.notice}>{notice}</div> : null}

      <div style={styles.categoryRow}>
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          style={{...styles.categoryBtn, background: selectedCategory == null ? "#4b63d1" : "rgba(255,255,255,0.08)"}}
        >
          Все
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            style={{...styles.categoryBtn, background: selectedCategory === cat.id ? "#4b63d1" : "rgba(255,255,255,0.08)"}}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? <div style={styles.loading}>Загрузка магазина...</div> : null}

      {!loading && (
        <div style={styles.grid}>
          {items.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.imageWrap}>
                {item.image_url ? <img src={item.image_url} alt="" style={styles.image} /> : <div style={styles.imageFallback}>ITEM</div>}
              </div>
              <div style={styles.name}>{item.name || `Товар #${item.id}`}</div>
              <div style={styles.desc}>{item.description || "Описание скоро появится"}</div>
              <div style={styles.bottom}>
                <div style={styles.price}>{Number(item.price || 0)}</div>
                <button
                  type="button"
                  disabled={buyingId === item.id || Number(item.price || 0) > balance}
                  onClick={() => onBuy(item)}
                  style={styles.buyBtn}
                >
                  {buyingId === item.id ? "Покупаем..." : "Купить"}
                </button>
              </div>
            </div>
          ))}
          {!items.length ? <div style={styles.empty}>Товаров пока нет.</div> : null}
        </div>
      )}
    </div>
  );
}

const styles = {
  hero: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 18, flexWrap: "wrap" },
  title: { margin: 0, color: "#fff", fontSize: 32, fontWeight: 800 },
  sub: { color: "rgba(255,255,255,0.6)", marginTop: 4 },
  balance: { color: "#fff", background: "rgba(255,255,255,0.08)", padding: "10px 14px", borderRadius: 12 },
  error: { background: "#5f0f0f", color: "#fff", padding: 14, borderRadius: 12, marginBottom: 18 },
  notice: { background: "#113f1e", color: "#d5ffd8", padding: 14, borderRadius: 12, marginBottom: 18 },
  categoryRow: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 },
  categoryBtn: { color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", cursor: "pointer" },
  loading: { color: "#fff", padding: 18, background: "#0d0f14", borderRadius: 16 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 },
  card: { background: "#0d0f14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 16 },
  imageWrap: { height: 160, borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  imageFallback: { color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: 1 },
  name: { color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 6 },
  desc: { color: "rgba(255,255,255,0.6)", minHeight: 44, marginBottom: 12, fontSize: 14 },
  bottom: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  price: { color: "#fff", fontSize: 22, fontWeight: 800 },
  buyBtn: { border: "none", borderRadius: 10, padding: "10px 14px", background: "#4b63d1", color: "#fff", cursor: "pointer" },
  empty: { color: "rgba(255,255,255,0.6)", padding: 20 },
};
