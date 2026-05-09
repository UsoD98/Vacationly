import {AuthRepository} from "@/repositories/AuthRepository";
import jwt from 'jsonwebtoken';
import {TokenPayload} from '@/types/auth';

export class AuthService {
  constructor(private authRepository: AuthRepository) {
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
    if (!secret) throw new Error('JWT_SECRET is not configured');

    return jwt.sign({id: user.id, email: user.email, name: user.name} as TokenPayload, secret, {
      expiresIn: '15m',
    });
  }

  public signRefreshToken(user: any) {
    const secret = this.getJwtSecret();
    if (!secret) throw new Error('JWT_SECRET is not configured');

    return jwt.sign({id: user.id, email: user.email, name: user.name} as TokenPayload, secret, {
      expiresIn: '7d',
    });
  }

  public async login(email: string, password: string) {
    const user = await this.authRepository.findByEmail(email);
    if (!user) return {success: false, status: 401, message: '이메일 또는 비밀번호가 올바르지 않습니다'};

    // NOTE: 현재는 평문 비교입니다. 실제 서비스에서는 bcrypt 등으로 암호화/검증 필요합니다.
    if (user.password !== password) return {success: false, status: 401, message: '이메일 또는 비밀번호가 올바르지 않습니다'};

    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);

    return {
      success: true,
      accessToken,
      refreshToken,
      user: {id: user.id, name: user.name, email: user.email},
    };
  }
}