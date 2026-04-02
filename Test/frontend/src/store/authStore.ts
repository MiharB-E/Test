import { create } from 'zustand';
import { login as apiLogin, register as apiRegister, User } from '../services/auth';
import api, { setAccessToken, registerLogoutCallback } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  authLoading: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    last_name: string;
    invite_code?: string;
    group_name?: string;
  }) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setToken: (token: string) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function _restoreUser(): User | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function _persistUser(user: User | null): void {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => {
  // Register the logout callback so the axios interceptor can trigger it
  // without creating a circular module dependency.
  registerLogoutCallback(() => get().logout());

  return {
    user: _restoreUser(),
    token: null,          // access token lives in memory only – never persisted
    authLoading: true,    // true until the first loadUser() resolves
    loading: false,
    error: null,

    setToken: (token: string) => {
      setAccessToken(token);
      set({ token });
    },

    login: async (email, password) => {
      set({ loading: true, error: null });
      try {
        const response = await apiLogin(email, password);

        setAccessToken(response.access_token);
        _persistUser(response.user);

        set({ user: response.user, token: response.access_token, loading: false });
        return true;
      } catch (error: unknown) {
        const detail = (error as any)?.response?.data?.detail ?? 'Login failed';
        set({ error: detail, loading: false });
        return false;
      }
    },

    register: async (data) => {
      set({ loading: true, error: null });
      try {
        await apiRegister(data);
        set({ loading: false });
      } catch (error: unknown) {
        const detail = (error as any)?.response?.data?.detail ?? 'Registration failed';
        set({ error: detail, loading: false });
      }
    },

    logout: () => {
      // Fire-and-forget: tell the server to revoke the refresh token
      api.post('/logout').catch(() => {});
      setAccessToken(null);
      _persistUser(null);
      set({ user: null, token: null });
    },

    loadUser: async () => {
      set({ authLoading: true });
      try {
        // Exchange the HttpOnly refresh-token cookie for a new access token
        const { data } = await api.post<{ access_token: string }>('/refresh');
        setAccessToken(data.access_token);
        const user = _restoreUser();
        set({ token: data.access_token, user, authLoading: false });
      } catch {
        // No valid refresh token – user is logged out
        setAccessToken(null);
        _persistUser(null);
        set({ token: null, user: null, authLoading: false });
      }
    },
  };
});
