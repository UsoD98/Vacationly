import { create } from 'zustand';
import type { AuthUser, RefreshResponse } from '@/types/auth';

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  setAccessToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
  setSession: (token: string, user: AuthUser) => void;
  hydrate: () => Promise<void>;
  clear: () => void;
}

const API_BASE_URL = (import.meta.env.VITE_SERVER_URL || 'http://localhost:3000')
  .replace(/\/?api\/?$/, '')
  .replace(/\/$/, '');

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded = normalized + (padding ? '='.repeat(4 - padding) : '');

  return atob(padded);
};

const decodeUserFromAccessToken = (token: string): AuthUser | null => {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) {
      return null;
    }

    const payload = JSON.parse(decodeBase64Url(payloadPart)) as Partial<AuthUser>;
    if (
      typeof payload.id !== 'number' ||
      typeof payload.name !== 'string' ||
      typeof payload.email !== 'string'
    ) {
      return null;
    }

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
    };
  } catch {
    return null;
  }
};

const applySession = (set: (partial: Partial<AuthState>) => void, token: string, user: AuthUser) => {
  try {
    localStorage.removeItem('auth');
  } catch {
    // ignore storage access issues
  }

  set({ accessToken: token, user, isHydrated: true });
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isHydrated: false,

  setAccessToken: (token) => {
    try {
      localStorage.removeItem('auth');
    } catch {
      // ignore storage access issues
    }

    set({ accessToken: token, isHydrated: true });
  },

  setUser: (user) => {
    try {
      localStorage.removeItem('auth');
    } catch {
      // ignore storage access issues
    }

    set({ user, isHydrated: true });
  },

  setSession: (token, user) => {
    applySession(set, token, user);
  },

  hydrate: async () => {
    try {
      try {
        localStorage.removeItem('auth');
      } catch {
        // ignore storage access issues
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        set({ accessToken: null, user: null, isHydrated: true });
        return;
      }

      const data = (await response.json()) as RefreshResponse;
      if (!data.success || !data.data?.accessToken) {
        set({ accessToken: null, user: null, isHydrated: true });
        return;
      }

      const user = decodeUserFromAccessToken(data.data.accessToken);
      if (!user) {
        set({ accessToken: null, user: null, isHydrated: true });
        return;
      }

      applySession(set, data.data.accessToken, user);
    } catch {
      set({ accessToken: null, user: null, isHydrated: true });
    }
  },

  clear: () => {
    try {
      localStorage.removeItem('auth');
    } catch {
      // ignore storage access issues
    }

    set({ accessToken: null, user: null, isHydrated: true });
  },
}));
