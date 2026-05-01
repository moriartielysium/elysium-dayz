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

function isFormData(value) {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

export async function api(path, options = {}) {
  const { headers = {}, body, ...rest } = options;
  const finalHeaders = { ...headers };

  if (body !== undefined && !isFormData(body) && !finalHeaders['Content-Type'] && !finalHeaders['content-type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(buildApiUrl(path), {
    credentials: 'include',
    ...rest,
    headers: finalHeaders,
    body,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(payload?.detail || payload?.error || payload?.message || 'API request failed');
    error.status = response.status;
    error.payload = payload;
    error.path = path;
    throw error;
  }

  return payload;
}
