import { api } from './api';

export function withSlug(path, slug) {
  const joiner = String(path).includes('?') ? '&' : '?';
  return `${path}${joiner}slug=${encodeURIComponent(slug || '')}`;
}

export async function loadAdminSettings(slug) {
  return api(withSlug('admin-settings-get', slug));
}

export async function saveAdminSettings(slug, settings = {}) {
  return api('admin-settings-save', {
    method: 'POST',
    body: JSON.stringify({ slug, settings, ...settings }),
  });
}

export function unpackSettings(payload = {}) {
  return payload.settings || payload.config || payload.guildSettings || payload.guild_settings || payload || {};
}

export async function loadAdminList(endpoint, slug, key) {
  const payload = await api(withSlug(endpoint, slug));
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload)) return payload;
  return [];
}

export async function postAdmin(endpoint, slug, data = {}) {
  return api(endpoint, {
    method: 'POST',
    body: JSON.stringify({ slug, ...data }),
  });
}

export async function uploadAdminFile(endpoint, slug, file, extra = {}) {
  const form = new FormData();
  form.append('slug', slug);
  form.append('file', file);
  Object.entries(extra).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value);
  });

  return api(endpoint, {
    method: 'POST',
    body: form,
  });
}

export function getField(raw = {}, names = [], fallback = '') {
  for (const name of names) {
    if (raw?.[name] !== undefined && raw?.[name] !== null) return raw[name];
  }
  return fallback;
}
