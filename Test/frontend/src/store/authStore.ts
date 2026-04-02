import { create } from 'zustand';
import { login as apiLogin, register as apiRegister, User } from '../services/auth';
import api from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    invite_code?: string;
    group_name?: string;
  }) => Promise<void>;
  logout: () => void;
  loadUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  })(),
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await apiLogin(email, password);

      // Guardar token
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // ✅ Aplicar token inmediatamente a axios
      api.defaults.headers.common.Authorization = `Bearer ${response.access_token}`;

      set({ user: response.user, token: response.access_token, loading: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Login failed', loading: false });
      return false;
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      await apiRegister(data);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Registration failed', loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common.Authorization;
    set({ user: null, token: null });
  },

  loadUser: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      set({ token, user: JSON.parse(user) });
    }
  },
}));