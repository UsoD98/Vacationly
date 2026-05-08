export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  accessToken: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface RefreshResponse {
  success: boolean;
  accessToken: string;
}

