import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  user: { id: number; name: string; email: string } | null;
  isHydrated: boolean;
  setAccessToken: (token: string) => void;
  setUser: (user: { id: number; name: string; email: string }) => void;
  hydrate: () => void;
  clear: () => void;
}

const STORAGE_KEY = 'auth';

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isHydrated: false,

  setAccessToken: (token) => {
    set({ accessToken: token });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: token }));
  },

  setUser: (user) => {
    set({ user });
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, user }));
  },

  hydrate: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { accessToken, user } = JSON.parse(stored);
      set({ accessToken, user, isHydrated: true });
    } else {
      set({ isHydrated: true });
    }
  },

  clear: () => {
    set({ accessToken: null, user: null });
    localStorage.removeItem(STORAGE_KEY);
  },
}));
