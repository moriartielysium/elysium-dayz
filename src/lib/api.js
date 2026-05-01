const RAW_API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/.netlify/functions';
const API_BASE_URL = (RAW_API_BASE_URL === '/api' ? '/.netlify/functions' : RAW_API_BASE_URL).replace(/\/$/, '');
const BOT_API_BASE_URL = (import.meta.env.VITE_BOT_API_BASE_URL || '/api').replace(/\/$/, '');

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getBotApiBaseUrl() {
  return BOT_API_BASE_URL;
}

export function buildUrl(baseUrl, path = '') {
  const clean = String(path).replace(/^\/+/, '');
  if (!clean) return baseUrl || '/';
  if (/^https?:\/\//i.test(clean)) return clean;
  if (/^https?:\/\//i.test(baseUrl)) return `${baseUrl}/${clean}`;
  return `${baseUrl}/${clean}`.replace(/([^:]\/)(\/+)/g, '$1/');
}

export function buildApiUrl(path = '') {
  return buildUrl(API_BASE_URL, path);
}

export function buildBotApiUrl(path = '') {
  return buildUrl(BOT_API_BASE_URL, path);
}

function isFormData(value) {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

async function request(url, path, options = {}) {
  const { headers = {}, body, ...rest } = options;
  const finalHeaders = { ...headers };

  if (body !== undefined && !isFormData(body) && !finalHeaders['Content-Type'] && !finalHeaders['content-type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    credentials: 'include',
    ...rest,
    headers: finalHeaders,
    body,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json().catch(() => null) : await response.text().catch(() => '');

  if (!response.ok) {
    const error = new Error(payload?.detail || payload?.error || payload?.message || `API request failed (${response.status})`);
    error.status = response.status;
    error.payload = payload;
    error.path = path;
    error.url = url;
    throw error;
  }

  return payload;
}

export async function api(path, options = {}) {
  return request(buildApiUrl(path), path, options);
}

export async function botApi(path, options = {}) {
  return request(buildBotApiUrl(path), path, options);
}
