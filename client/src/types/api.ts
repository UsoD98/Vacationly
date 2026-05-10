/**
 * 클라이언트-서버 API 응답 표준 포맷
 * 모든 API 응답은 이 형식을 따릅니다.
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
  statusCode?: number;
}

export interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  code?: string;
  statusCode?: number;
}
