import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000';
const API_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // needed for the HttpOnly refresh-token cookie
});

// ── Access-token injection ────────────────────────────────────────────────────

let _accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// ── Logout callback (registered by authStore to avoid circular imports) ───────

let _onLogout: (() => void) | null = null;

export function registerLogoutCallback(cb: () => void): void {
  _onLogout = cb;
}

// ── Automatic token refresh on 401 ───────────────────────────────────────────

let _isRefreshing = false;
const _pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function _drainQueue(error: unknown, token: string | null): void {
  _pendingQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token as string);
  });
  _pendingQueue.length = 0;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (_isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        _pendingQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers['Authorization'] = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    _isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${API_URL}/refresh`,
        {},
        { withCredentials: true },
      );
      const newToken: string = data.access_token;
      setAccessToken(newToken);
      _drainQueue(null, newToken);
      original.headers['Authorization'] = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshError) {
      _drainQueue(refreshError, null);
      setAccessToken(null);
      _onLogout?.();
      return Promise.reject(refreshError);
    } finally {
      _isRefreshing = false;
    }
  },
);

export default api;
