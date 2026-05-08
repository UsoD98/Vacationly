export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  hire_date?: string;
  created_at?: string;
  del_flag?: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  hire_date: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  hire_date?: string;
}

export interface UserResponse {
  success: boolean;
  message?: string;
  data?: User | User[];
}

export interface GetUsersResponse {
  success: boolean;
  data?: User[];
}

export interface GetUserByIdResponse {
  success: boolean;
  data?: User;
}

