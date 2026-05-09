import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '@/types/auth';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ success: false, message: '토큰이 없습니다' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ success: false, message: 'JWT_SECRET이 설정되지 않았습니다' });
      return;
    }

    req.user = jwt.verify(token, secret) as TokenPayload;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: '유효하지 않은 토큰입니다' });
  }
}

export default authMiddleware;

