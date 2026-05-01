import { api } from './api';
import { resolveSlug } from './player';

export async function getShopCategories(slug) {
  return api(`shop/categories?slug=${encodeURIComponent(resolveSlug(slug))}`);
}

export async function getShopItems(slug, categoryId = null) {
  const query = categoryId ? `&category_id=${encodeURIComponent(categoryId)}` : '';
  return api(`shop/items?slug=${encodeURIComponent(resolveSlug(slug))}${query}`);
}

export async function buyShopItem(slug, itemId) {
  return api(`shop/order-create?slug=${encodeURIComponent(resolveSlug(slug))}`, {
    method: 'POST',
    body: JSON.stringify({ slug: resolveSlug(slug), itemId }),
  });
}
