import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {LoginRequest, TokenPayload} from '@/types/auth';
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
    res.status(400).json({success: false, message: '이메일과 비밀번호를 입력해주세요'});
    return;
  }

  try {
    const result = await authService.login(email, password);

    if (!result.success) {
      res.status(result.status || 401).json({success: false, message: result.message});
      return;
    }

    // Refresh Token은 HttpOnly 쿠키로 내려줌
    res.cookie('refreshToken', result.refreshToken, getCookieOptions());

    res.json({
      success: true,
      message: '로그인 성공',
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    res.status(500).json({success: false, message: (error as Error).message});
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const jwtSecret = authService.getJwtSecret();
  if (!jwtSecret) {
    res.status(500).json({success: false, message: '서버 설정 오류: JWT_SECRET이 필요합니다'});
    return;
  }

  try {
    const cookies = parseCookies(req.headers.cookie);
    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({success: false, message: '갱신 토큰이 없습니다'});
      return;
    }

    const payload = jwt.verify(refreshToken, jwtSecret) as TokenPayload;
    const user = await authRepository.findByIdAndEmail(payload.id, payload.email);

    if (!user) {
      res.status(401).json({success: false, message: '사용자를 찾을 수 없습니다'});
      return;
    }

    const accessToken = authService.signAccessToken(user);

    res.json({success: true, accessToken});
  } catch (error) {
    res.status(401).json({success: false, message: '세션이 만료되었습니다'});
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('refreshToken', getCookieOptions());
  res.json({success: true, message: '로그아웃되었습니다'});
};

