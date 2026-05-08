export * from './auth';
export * from './user';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
