import {AuthRepository} from "@/repositories/AuthRepository";
import jwt from 'jsonwebtoken';
import {TokenPayload} from '@/types/auth';
import {AppError} from '@/errors/AppError';
import {DbError} from '@/errors/DbError';
import {PasswordService} from "@/services/PasswordService";

export class AuthService {
  constructor(private authRepository: AuthRepository, private passwordService: PasswordService) {
  }

  getJwtSecret = (): string | null => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return null;
    }
    return secret;
  };

  public signAccessToken(user: any) {
    const secret = this.getJwtSecret();
    if (!secret) throw AppError.internal('JWT_SECRET is not configured', 'JWT_SECRET_NOT_CONFIGURED');

    return jwt.sign({id: user.id, email: user.email, name: user.name} as TokenPayload, secret, {
      expiresIn: '15m',
    });
  }

  public signRefreshToken(user: any) {
    const secret = this.getJwtSecret();
    if (!secret) throw AppError.internal('JWT_SECRET is not configured', 'JWT_SECRET_NOT_CONFIGURED');

    return jwt.sign({id: user.id, email: user.email, name: user.name} as TokenPayload, secret, {
      expiresIn: '7d',
    });
  }

  public async login(email: string, password: string) {
    try {
      const user = await this.authRepository.findByEmail(email);
      if (!user) return {success: false, status: 401, message: '이메일 또는 비밀번호가 올바르지 않습니다'};

      // NOTE: 현재는 평문 비교입니다. 실제 서비스에서는 bcrypt 등으로 암호화/검증 필요합니다.
      if (!await this.passwordService.comparePassword(password, user.password)) return {
        success: false,
        status: 401,
        message: '이메일 또는 비밀번호가 올바르지 않습니다'
      };

      const accessToken = this.signAccessToken(user);
      const refreshToken = this.signRefreshToken(user);

      return {
        success: true,
        accessToken,
        refreshToken,
        user: {id: user.id, name: user.name, email: user.email},
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof DbError) {
        throw error;
      }

      throw AppError.internal((error as Error).message || '로그인 처리 중 오류가 발생했습니다', 'AUTH_LOGIN_FAILED');
    }
  }

  public async findByIdAndEmail(id: number, email: string) {
    return this.authRepository.findByIdAndEmail(id, email);
  }
}