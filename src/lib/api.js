const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function buildApiUrl(path = '') {
  const clean = String(path).replace(/^\/+/, '');
  if (/^https?:\/\//i.test(API_BASE_URL)) {
    return `${API_BASE_URL}/${clean}`;
  }
  return `${API_BASE_URL}/${clean}`.replace(/([^:]\/)(\/+)/g, '$1/');
}

export async function api(path, options = {}) {
  const response = await fetch(buildApiUrl(path), {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(payload?.detail || payload?.error || payload?.message || 'API request failed');
  }

  return payload;
}
