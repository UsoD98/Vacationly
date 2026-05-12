export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | object;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface RequestError extends Error {
  status?: number;
  data?: any;
}

