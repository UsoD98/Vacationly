import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'dotenv/config';
import pool from '@/config/dbConfig';
import userRoutes from '@/routes/users';
import authRoutes from '@/routes/auth';
import { ApiResponse } from '@/types';

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

const corsOptions = {
  origin(requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy does not allow access from origin: ${requestOrigin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// DB 연결 테스트 (디버깅용)
// 사용 후 제거하거나 DEBUG_DB 환경변수로 제어하세요.
app.get('/api/dbtest', async (req: Request, res: Response) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT 1 AS ok');
    conn.release();
    res.json({
      success: true,
      message: 'DB 연결 성공',
      data: rows,
    });
  } catch (err) {
    console.error('DB 연결 오류:', err);
    const resp: any = {
      success: false,
      message: (err as Error).message,
    };
    if (process.env.DEBUG_DB === 'true' || process.env.NODE_ENV !== 'production') {
      resp.error = (err as Error).stack;
    }
    res.status(500).json(resp);
  }
});

// 헬스 체크 엔드포인트
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 처리
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// 에러 처리
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
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


