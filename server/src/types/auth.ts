import type { ApiResponse } from './api';

export interface LoginRequest {
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

export interface TokenPayload {
  id: number;
  email: string;
  name: string;
}



