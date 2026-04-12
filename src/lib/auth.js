import { api, buildApiUrl } from './api';

export function loginWithDiscord(nextPath = '/') {
  const cleanNext = typeof nextPath === 'string' && nextPath.startsWith('/') ? nextPath : '/';
  const query = cleanNext ? `?next=${encodeURIComponent(cleanNext)}` : '';
  window.location.href = buildApiUrl(`auth-login${query}`);
}

export async function logout() {
  return api('auth-logout', { method: 'POST' });
}

export async function getMe() {
  return api('me');
}
