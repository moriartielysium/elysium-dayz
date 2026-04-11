const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://api.elysium-dayz.site').replace(/\/$/, '');

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function buildApiUrl(path = '') {
  return `${API_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
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
