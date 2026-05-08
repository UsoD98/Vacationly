import apiClient from '@/api/apiClient.ts';

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

// User 관련 API 호출 모음
export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const { data } = await apiClient.get('/api/users');
    return data.data || [];
  },

  createUser: async (userData: UserInput) => {
    // 회원가입은 토큰 없이 호출 가능
    const { data } = await apiClient.post('/api/users', userData);
    return data;
  },

  updateUser: async ({ id, userData }: { id: number; userData: UserInput }) => {
    const { data } = await apiClient.put(`/api/users/${id}`, userData);
    return data;
  },

  deleteUser: async (id: number) => {
    const { data } = await apiClient.delete(`/api/users/${id}`);
    return data;
  },
};
