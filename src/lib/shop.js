import { apiGet } from "./player";

export async function getShopCategories(slug) {
  return apiGet(`/api/shop/categories?slug=${encodeURIComponent(slug)}`);
}

export async function getShopItems(slug, categoryId = null) {
  const query = categoryId ? `&category_id=${encodeURIComponent(categoryId)}` : "";
  return apiGet(`/api/shop/items?slug=${encodeURIComponent(slug)}${query}`);
}

export async function buyShopItem(slug, itemId) {
  const res = await fetch(`/api/shop/buy`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, itemId }),
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    data = null;
  }

  if (!res.ok) {
    const message = data?.detail || data?.error || data?.message || "Не удалось выполнить покупку";
    throw new Error(message);
  }

  return data;
}
