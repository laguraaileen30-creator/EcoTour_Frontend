// Attaches the logged-in user's token to every request sent to the EcoTour API,
// and signs the user out when the server reports the session has expired.
import { API_ORIGIN } from './catalog';

const originalFetch = window.fetch.bind(window);

const isApiRequest = (input) => {
  const url = typeof input === 'string' ? input : input?.url || '';
  return url.startsWith(API_ORIGIN) && !url.includes('/api/v1/auth/');
};

window.fetch = async (input, init = {}) => {
  if (!isApiRequest(input)) return originalFetch(input, init);

  let token = null;
  try { token = localStorage.getItem('token'); } catch (e) { /* storage unavailable */ }

  const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined) || {});
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);

  const response = await originalFetch(input, { ...init, headers });

  // Expired or tampered session: clear it and send the user to login (once)
  if (response.status === 401 && token) {
    const body = await response.clone().json().catch(() => ({}));
    if (body.code === 'TOKEN_INVALID') {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) { /* ignore */ }
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login?session=expired');
      }
    }
  }
  return response;
};
