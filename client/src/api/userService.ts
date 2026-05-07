import axios from 'axios';

// 기존 About.tsx에 있던 인터페이스를 이동
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  hire_date: string;
  created_at: string;
  del_flag: number;
}

// 생성/수정 시 사용할 타입 (id, 생성일 등 제외)
export type UserInput = Omit<User, 'id' | 'created_at' | 'del_flag'>;

// Axios 인스턴스 생성
// VITE_SERVER_URL은 백엔드 "origin"만 넣는 것을 권장합니다.
// 예: https://vacationly-tpki.onrender.com
// 혹시 /api까지 들어와도 중복 호출(/api/api/...)이 되지 않도록 정규화합니다.
const rawServerUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
const apiBaseUrl = rawServerUrl.replace(/\/?api\/?$/, '').replace(/\/$/, '');

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User 관련 API 호출 모음
export const userService = {
  getUsers: async (): Promise<User[]> => {
    const { data } = await api.get('/api/users');
    return data.data || [];
  },

  createUser: async (userData: UserInput) => {
    const { data } = await api.post('/api/users', userData);
    return data;
  },

  updateUser: async ({ id, userData }: { id: number; userData: UserInput }) => {
    const { data } = await api.put(`/api/users/${id}`, userData);
    return data;
  },

  deleteUser: async (id: number) => {
    const { data } = await api.delete(`/api/users/${id}`);
    return data;
  },
};
