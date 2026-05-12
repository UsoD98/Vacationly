import type { ApiResponse } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  hire_date?: string;
  created_at?: string;
  del_flag?: number;
  vacation_available?: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  hire_date: string;
  vacation_available?: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  hire_date?: string;
  vacation_available?: number;
}

export type UserResponse = ApiResponse<User | User[]>;

export type GetUsersResponse = ApiResponse<User[]>;

export type GetUserByIdResponse = ApiResponse<User>;


