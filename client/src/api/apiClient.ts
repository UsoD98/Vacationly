import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const rawServerUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
const apiBaseUrl = rawServerUrl.replace(/\/?api\/?$/, '').replace(/\/$/, '');

const apiClient = axios.create({
  baseURL: apiBaseUrl, // 환경변수로 관리하는 게 좋음
  withCredentials: true, // Refresh Token 쿠키 사용 시 필요
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Access Token 만료 시 Refresh Token으로 갱신 로직
    const requestUrl = String(error.config?.url || '');
    const isAuthEndpoint = requestUrl.includes('/api/auth/login')
      || requestUrl.includes('/api/auth/refresh')
      || requestUrl.includes('/api/auth/logout');

    if (error.response?.status === 401 && !isAuthEndpoint && !error.config?._retry) {
      try {
        error.config._retry = true;
        const refreshResponse = await axios.post(
          `${apiBaseUrl}/api/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = refreshResponse.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);

        // 실패했던 요청 다시 시도
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(error.config);
      } catch (refreshError) {
        useAuthStore.getState().clear();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
