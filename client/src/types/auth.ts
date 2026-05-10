import type { ApiResponse } from './api';

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken?: string;
  user?: AuthUser;
}

export type AuthResponse = ApiResponse<AuthResponseData>;

export type RefreshResponse = ApiResponse<{ accessToken: string }>;
