import bcrypt from 'bcrypt';
import {AppError} from "@/errors/AppError";

export class PasswordService {

  /**
   * bcrypt salt rounds (복잡도)
   * @private
   */
  private readonly saltRounds = 10;

  /**
   * 사용자가 입력한 비밀번호를 bcrypt로 해시화
   * @param password
   */
  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      throw AppError.internal('비밀번호 암호화 중 오류 발생', 'PASSWORD_HASH_FAILED');
    }
  }

  /**
   * 사용자가 입력한 비밀번호와 저장된 해시된 비밀번호를 비교
   * @param password
   * @param hashedPassword
   */
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw AppError.internal('비밀번호 검증 중 오류 발생', 'PASSWORD_COMPARE_FAILED');
    }
  }
}

