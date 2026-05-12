import express, {Express, NextFunction, Request, Response} from 'express';
import cors, {CorsOptions} from 'cors';
import 'dotenv/config';
import userRoutes from './routes/user';
import authRoutes from '@/routes/auth';
import vacationRoutes from '@/routes/vacation';
import {AppError} from '@/errors/AppError';
import {DbError} from '@/errors/DbError';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
// ALLOWED_ORIGINS가 JSON 배열/CSV/단일 문자열 어떤 형태로 와도 처리합니다.
const normalizeOrigins = (value?: string): string[] => {
  if (!value) {
    return ['http://localhost:5173'];
  }

  const trimmed = value.trim();

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed)
        ? parsed.map((origin) => String(origin).trim()).filter(Boolean)
        : [String(parsed).trim()].filter(Boolean);
    } catch (error) {
      // JSON 파싱 실패 시 아래 CSV/단일 문자열 로직으로 처리
    }
  }

  return trimmed
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const allowedOrigins = normalizeOrigins(process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL);

const corsOptions: CorsOptions = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

corsOptions.origin = (requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
    return callback(null, true);
  }

  return callback(new Error(`CORS policy does not allow access from origin: ${requestOrigin}`));
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// 라우트
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vacation', vacationRoutes);

// 헬스 체크 엔드포인트
app.get('/api/health', (req: Request, res: Response) => {
  res.json({status: 'OK', message: 'Server is running'});
});

// 404 처리
app.use((req: Request, res: Response) => {
  res.status(404).json({success: false, message: 'Route not found'});
});

// 전역 에러 처리 미들웨어
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  // AppError 처리
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  if (err instanceof DbError) {
    return res.status(500).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // 예상치 못한 에러
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET    /api/users       - 모든 사용자 조회');
  console.log('  GET    /api/users/:id   - 특정 사용자 조회');
  console.log('  POST   /api/users       - 사용자 생성');
  console.log('  PUT    /api/users/:id   - 사용자 수정');
  console.log('  DELETE /api/users/:id   - 사용자 삭제');
});


