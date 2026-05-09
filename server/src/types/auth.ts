export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface RefreshResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
}

export interface TokenPayload {
  id: number;
  email: string;
  name: string;
}

