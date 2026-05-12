import {UserRepository} from '@/repositories/UserRepository';
import {CreateUserRequest, UpdateUserRequest, User} from '@/types/user';
import {UnitOfWork} from "@/uow/UnifOrWork";
import {AppError} from "@/errors/AppError";
import {DbError} from "@/errors/DbError";
import {PasswordService} from "./PasswordService";
import {VacationService} from "@/services/VacationService";
import {getCurrentDateTime, setDateTime} from "@/utils/date";
import {isValidEmail} from "@/utils/email";
import {isValidDate} from "@/utils/date";

export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly uow: UnitOfWork,
    private readonly passwordService: PasswordService,
    private readonly vacationService: VacationService,
  ) {
  }

  /**
   * 사용자 생성
   * @param req
   * @return 성공 여부
   */
  async createUser(req: Partial<CreateUserRequest>): Promise<boolean> {
    try {
      // 입력 검증
      const validatedData = this.validateCreateUserInput(req);

      const user: User = {
        id: 0,
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
        hire_date: setDateTime(validatedData.hire_date),
        created_at: getCurrentDateTime(),
        del_flag: 0,
      };

      // 비밀번호 존재 확인
      if (!user.password) {
        throw AppError.badRequest('비밀번호가 필요합니다', 'PASSWORD_REQUIRED');
      }

      // 비밀번호 암호화
      user.password = await this.passwordService.hashPassword(user.password);

      // 트랜잭션 시작
      await this.uow.begin();

      // 트랜잭션 활성화 확인
      if (!this.uow.isTransactionActive()) {
        throw AppError.internal('트랜잭션 활성화 실패', 'TRANSACTION_NOT_ACTIVE');
      }

      // 이메일 중복 확인
      const exists = await this.repository.existsByEmail(this.uow, user.email);
      if (exists) {
        throw AppError.conflict('이미 존재하는 이메일입니다.', 'EMAIL_ALREADY_EXISTS');
      }

      // 사용자 저장
      const userId = await this.repository.save(this.uow, user);
      if (!userId) {
        throw AppError.notFound('저장할 데이터가 없습니다.', 'USER_SAVE_NO_DATA');
      }

      // 초기 휴가 정보 저장
      const vacationAvailable = validatedData.vacation_available ?? 0;
      const vacation = {
        user_id: userId,
        vacation_year: new Date().getFullYear(),
        vacation_available: vacationAvailable,
        created_at: getCurrentDateTime(),
      };

      await this.vacationService.createInitVacation(this.uow, vacation);

      // 트랜잭션 커밋
      await this.uow.commit();
      return true;
    } catch (error) {
      if (this.uow.isTransactionActive()) {
        await this.uow.rollback();
      }

      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof DbError) {
        throw error;
      }

      throw AppError.internal((error as Error).message || '사용자 생성 중 오류 발생', 'USER_CREATE_FAILED');
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      return await this.repository.findAll();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof DbError) {
        throw error;
      }

      throw AppError.internal((error as Error).message || '사용자 목록 조회 중 오류 발생', 'USER_LIST_FAILED');
    }
  }

  async getUserById(id: number): Promise<User> {
    this.assertValidId(id);

    try {
      const user = await this.repository.findById(id);
      if (!user) {
        throw AppError.notFound('사용자를 찾을 수 없습니다.', 'USER_NOT_FOUND');
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof DbError) {
        throw error;
      }

      throw AppError.internal((error as Error).message || '사용자 조회 중 오류 발생', 'USER_FIND_FAILED');
    }
  }

  async updateUser(id: number, req: Partial<UpdateUserRequest>): Promise<boolean> {
    this.assertValidId(id);

    try {
      const validatedData = this.validateUpdateUserInput(req);

      const existing = await this.repository.findById(id);
      if (!existing) {
        throw AppError.notFound('사용자를 찾을 수 없습니다.', 'USER_NOT_FOUND');
      }

      if (validatedData.email) {
        const duplicate = await this.repository.findByEmail(validatedData.email, id);
        if (duplicate) {
          throw AppError.conflict('이미 존재하는 이메일입니다.', 'EMAIL_ALREADY_EXISTS');
        }
      }

      const updateData: Partial<User> = {};

      if (validatedData.name !== undefined) {
        updateData.name = validatedData.name;
      }

      if (validatedData.email !== undefined) {
        updateData.email = validatedData.email;
      }

      if (validatedData.password !== undefined) {
        updateData.password = await this.passwordService.hashPassword(validatedData.password);
      }

      if (validatedData.hire_date !== undefined) {
        updateData.hire_date = setDateTime(validatedData.hire_date);
      }

      const updated = await this.repository.update(id, updateData);
      if (!updated) {
        throw AppError.notFound('수정할 데이터가 없습니다.', 'USER_UPDATE_NO_DATA');
      }

      return true;
    } catch (error) {
      if (this.uow.isTransactionActive()) {
        await this.uow.rollback();
      }

      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof DbError) {
        throw error;
      }

      throw AppError.internal((error as Error).message || '사용자 수정 중 오류 발생', 'USER_UPDATE_FAILED');
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    this.assertValidId(id);

    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw AppError.notFound('사용자를 찾을 수 없습니다.', 'USER_NOT_FOUND');
      }

      const deleted = await this.repository.softDelete(id);
      if (!deleted) {
        throw AppError.notFound('삭제할 데이터가 없습니다.', 'USER_DELETE_NO_DATA');
      }

      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof DbError) {
        throw error;
      }

      throw AppError.internal((error as Error).message || '사용자 삭제 중 오류 발생', 'USER_DELETE_FAILED');
    }
  }

  private validateCreateUserInput(data: Partial<CreateUserRequest>): {
    name: string;
    email: string;
    password: string;
    hire_date: string;
    vacation_available?: number;
  } {
    const {name, email, password, hire_date, vacation_available} = data;

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

    if (vacation_available !== undefined && (typeof vacation_available !== 'number' || Number.isNaN(vacation_available) || vacation_available < 0)) {
      throw AppError.badRequest('올해 연차는 0 이상의 숫자여야 합니다', 'INVALID_VACATION_AVAILABLE');
    }

    return {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      hire_date,
      vacation_available,
    };
  }

  private validateUpdateUserInput(data: Partial<UpdateUserRequest>): {
    name?: string;
    email?: string;
    password?: string;
    hire_date?: string;
  } {
    const result: {
      name?: string;
      email?: string;
      password?: string;
      hire_date?: string;
    } = {};

    const {name, email, password, hire_date} = data;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        throw AppError.badRequest('이름은 빈 문자열일 수 없습니다', 'INVALID_NAME');
      }
      result.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !isValidEmail(email)) {
        throw AppError.badRequest('유효하지 않은 이메일 형식입니다', 'INVALID_EMAIL');
      }
      result.email = email.trim().toLowerCase();
    }

    if (password !== undefined) {
      if (typeof password !== 'string') {
        throw AppError.badRequest('비밀번호 형식이 올바르지 않습니다', 'INVALID_PASSWORD');
      }

      if (password.trim().length > 0 && password.trim().length < 6) {
        throw AppError.badRequest('비밀번호는 최소 6자 이상이어야 합니다', 'INVALID_PASSWORD');
      }

      if (password.trim().length >= 6) {
        result.password = password;
      }
    }

    if (hire_date !== undefined) {
      if (typeof hire_date !== 'string' || !isValidDate(hire_date)) {
        throw AppError.badRequest('유효하지 않은 날짜 형식입니다', 'INVALID_HIRE_DATE');
      }
      result.hire_date = hire_date;
    }

    if (Object.keys(result).length === 0) {
      throw AppError.badRequest('수정할 데이터가 없습니다.', 'USER_UPDATE_NO_DATA');
    }

    return result;
  }

  private assertValidId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw AppError.badRequest('유효한 사용자 ID가 아닙니다.', 'INVALID_USER_ID');
    }
  }
}