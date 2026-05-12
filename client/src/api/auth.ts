import apiClient from '@/api/apiClient.ts';
import type { AuthRequest, AuthResponse, RefreshResponse } from '@/types/auth.ts';

export const authApi = {
  login: async (payload: AuthRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      '/api/auth/login',
      payload,
    );
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  refresh: async (): Promise<RefreshResponse> => {
    const { data } = await apiClient.post<RefreshResponse>(
      '/api/auth/refresh',
      {},
      { withCredentials: true },
    );
    return data;
  },
};
