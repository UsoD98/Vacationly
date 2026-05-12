export class DbError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'DbError';
    Object.setPrototypeOf(this, DbError.prototype);
  }

  static from(
    error: unknown,
    message = '데이터베이스 처리 중 오류가 발생했습니다',
    code = 'DB_ERROR',
  ): DbError {
    if (error instanceof DbError) {
      return error;
    }

    const detail = error instanceof Error && error.message ? `: ${error.message}` : '';
    return new DbError(`${message}${detail}`, code);
  }
}

