/**
 * 클라이언트-서버 API 응답 표준 포맷
 * 모든 API 응답은 이 형식을 따릅니다.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
  statusCode?: number;
}

export interface ApiErrorResponse extends ApiResponse<undefined> {
  code: string;
}

