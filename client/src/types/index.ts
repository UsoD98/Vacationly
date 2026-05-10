export * from './auth';
export * from './api';
export * from './user';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
