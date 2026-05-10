import {Request, Response} from 'express';
import {UserService} from "@/services/UserService";
import {CreateUserRequest, User, UserResponse} from "@/types/user";
import {getCurrentDateTime, isValidDate, setDateTime} from "@/utils/date";
import {AppError} from "@/errors/AppError";
import {isValidEmail} from "@/utils/email";

export class UserController {
  constructor(private readonly service: UserService) {
  }

  /**
   * 사용자 생성
   * @param req
   * @param res
   */
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      // 입력 검증
      const validatedData = this.validateCreateUserInput(req.body);

      const user: User = {
        id: 0,
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
        hire_date: setDateTime(validatedData.hire_date),
        created_at: getCurrentDateTime(),
        del_flag: 0,
      };

      const rst: boolean = await this.service.createUser(user);
      if (rst) {
        const response: UserResponse = {
          success: true,
          message: '회원가입에 성공했습니다',
        };
        res.status(201).json(response);
      } else {
        throw AppError.badRequest('사용자 저장에 실패했습니다.', 'USER_SAVE_FAILED');
      }
    } catch (error) {
      // AppError 처리
      if (error instanceof AppError) {
        const response: UserResponse = {
          success: false,
          message: error.message,
          code: error.code,
        };
        res.status(error.statusCode).json(response);
        return;
      }

      // 예상치 못한 에러 처리
      const message = (error as Error).message || '회원가입 중 오류가 발생했습니다';
      const response: UserResponse = {
        success: false,
        message,
        code: 'INTERNAL_SERVER_ERROR',
      };
      res.status(500).json(response);
    }
  };

  private validateCreateUserInput(data: Partial<CreateUserRequest>): {
    name: string;
    email: string;
    password: string;
    hire_date: string
  } {
    const {name, email, password, hire_date} = data;

    // 필수 필드 검증
    if (!name || !email || !password || !hire_date) {
      throw AppError.badRequest('필수 필드를 입력해주세요 (name, email, password, hire_date)', 'MISSING_REQUIRED_FIELDS');
    }

    // 문자열 검증
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw AppError.badRequest('이름은 빈 문자열일 수 없습니다', 'INVALID_NAME');
    }

    if (typeof email !== 'string' || !isValidEmail(email)) {
      throw AppError.badRequest('유효하지 않은 이메일 형식입니다', 'INVALID_EMAIL');
    }

    if (typeof password !== 'string' || password.length < 6) {
      throw AppError.badRequest('비밀번호는 최소 6자 이상이어야 합니다', 'INVALID_PASSWORD');
    }

    if (typeof hire_date !== 'string' || !isValidDate(hire_date)) {
      throw AppError.badRequest('유효하지 않은 날짜 형식입니다', 'INVALID_HIRE_DATE');
    }

    return {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      hire_date,
    };
  }
}