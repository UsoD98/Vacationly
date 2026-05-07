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
const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User 관련 API 호출 모음
export const userService = {
  getUsers: async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    return data.data || [];
  },

  createUser: async (userData: UserInput) => {
    const { data } = await api.post('/users', userData);
    return data;
  },

  updateUser: async ({ id, userData }: { id: number; userData: UserInput }) => {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  },

  deleteUser: async (id: number) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};
