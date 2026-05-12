export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly code?: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * 400 Bad Request 에러 생성
   * @param message
   * @param code
   */
  static badRequest(message: string, code?: string): AppError {
    return new AppError(400, message, code);
  }

  /**
   * 404 Not Found 에러 생성
   * @param message
   * @param code
   */
  static notFound(message: string, code?: string): AppError {
    return new AppError(404, message, code);
  }

  /**
   * 409 Conflict 에러 생성
   * @param message
   * @param code
   */
  static conflict(message: string, code?: string): AppError {
    return new AppError(409, message, code);
  }

  /**
   * 500 Internal Server Error 에러 생성
   * @param message
   * @param code
   */
  static internal(message: string, code?: string): AppError {
    return new AppError(500, message, code);
  }
}

