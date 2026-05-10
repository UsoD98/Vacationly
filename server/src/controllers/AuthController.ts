import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {LoginRequest, TokenPayload, AuthResponse, RefreshResponse} from '@/types/auth';
import {AuthRepository} from '@/repositories/AuthRepository';
import {AuthService} from '@/services/AuthService';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
  path: '/',
});

// repository / service 인스턴스 생성
const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

const parseCookies = (cookieHeader = ''): Record<string, string> =>
  cookieHeader.split(';').reduce((acc: Record<string, string>, cookiePart) => {
    const [name, ...rest] = cookiePart.trim().split('=');

    if (!name) {
      return acc;
    }

    acc[name] = decodeURIComponent(rest.join('=') || '');
    return acc;
  }, {});

export const login = async (req: Request, res: Response): Promise<void> => {
  const {email, password} = req.body as LoginRequest;
  if (!email || !password) {
    const response: AuthResponse = {
      success: false,
      message: '이메일과 비밀번호를 입력해주세요',
      code: 'MISSING_CREDENTIALS',
    };
    res.status(400).json(response);
    return;
  }

  try {
    const result = await authService.login(email, password);

    if (!result.success || !result.accessToken) {
      const response: AuthResponse = {
        success: false,
        message: result.message,
        code: 'LOGIN_FAILED',
      };
      res.status(result.status || 401).json(response);
      return;
    }

    // Refresh Token은 HttpOnly 쿠키로 내려줌
    res.cookie('refreshToken', result.refreshToken, getCookieOptions());

    const response: AuthResponse = {
      success: true,
      message: '로그인 성공',
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    };
    res.json(response);
  } catch (error) {
    const response: AuthResponse = {
      success: false,
      message: (error as Error).message,
      code: 'INTERNAL_SERVER_ERROR',
    };
    res.status(500).json(response);
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const jwtSecret = authService.getJwtSecret();
  if (!jwtSecret) {
    const response: RefreshResponse = {
      success: false,
      message: '서버 설정 오류: JWT_SECRET이 필요합니다',
      code: 'SERVER_CONFIG_ERROR',
    };
    res.status(500).json(response);
    return;
  }

  try {
    const cookies = parseCookies(req.headers.cookie);
    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      const response: RefreshResponse = {
        success: false,
        message: '갱신 토큰이 없습니다',
        code: 'MISSING_REFRESH_TOKEN',
      };
      res.status(401).json(response);
      return;
    }

    const payload = jwt.verify(refreshToken, jwtSecret) as TokenPayload;
    const user = await authRepository.findByIdAndEmail(payload.id, payload.email);

    if (!user) {
      const response: RefreshResponse = {
        success: false,
        message: '사용자를 찾을 수 없습니다',
        code: 'USER_NOT_FOUND',
      };
      res.status(401).json(response);
      return;
    }

    const accessToken = authService.signAccessToken(user);

    const response: RefreshResponse = {
      success: true,
      data: { accessToken },
    };
    res.json(response);
  } catch (error) {
    const response: RefreshResponse = {
      success: false,
      message: '세션이 만료되었습니다',
      code: 'SESSION_EXPIRED',
    };
    res.status(401).json(response);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('refreshToken', getCookieOptions());
  const response = {
    success: true,
    message: '로그아웃되었습니다',
  };
  res.json(response);
};

