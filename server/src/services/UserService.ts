import {UserRepository} from "@/repositories/UserRepository";
import {User} from "@/types/user";
import {UnitOfWork} from "@/uow/UnifOrWork";
import {AppError} from "@/errors/AppError";
import {PasswordService} from "./PasswordService";

export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly uow: UnitOfWork,
    private readonly passwordService: PasswordService,
  ) {
  }

  /**
   * 사용자 생성
   * @param user
   * @return 성공 여부
   */
  async createUser(user: User): Promise<boolean> {
    try {
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
        throw AppError.internal("트랜잭션 활성화 실패", "TRANSACTION_NOT_ACTIVE");
      }

      try {
        // 이메일 중복 확인
        const exists = await this.repository.existsByEmail(this.uow, user.email);
        if (exists) {
          throw AppError.conflict('이미 존재하는 이메일입니다.', 'EMAIL_ALREADY_EXISTS');
        }

        // 사용자 저장
        const rst = await this.repository.save(this.uow, user);
        if (!rst) {
          throw AppError.notFound('저장할 데이터가 없습니다.', 'USER_SAVE_NO_DATA');
        }

        // 트랜잭션 커밋
        await this.uow.commit();
        return true;

      } catch (dbError) {
        // Repository 또는 UnitOfWork 에러 처리
        if (this.uow.isTransactionActive()) {
          await this.uow.rollback();
        }

        // AppError
        if (dbError instanceof AppError) {
          throw dbError;
        }

        // 기타 DB 에러
        throw AppError.internal('사용자 저장 중 오류 발생', 'USER_SAVE_FAILED');
      }

    } catch (error) {
      // 트랜잭션이 여전히 활성화되어 있으면 롤백
      if (this.uow.isTransactionActive()) {
        await this.uow.rollback();
      }

      // AppError는 그대로 전파
      if (error instanceof AppError) {
        throw error;
      }

      // 예상치 못한 에러
      throw AppError.internal((error as Error).message || '사용자 생성 중 오류 발생', 'USER_CREATE_FAILED');
    }
  }
}