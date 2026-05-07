const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
// CORS: 여러 도메인을 허용하려면 쉼표로 연결된 ALLOWED_ORIGINS를 사용하거나
// CLIENT_URL 환경변수를 사용합니다.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : process.env.CLIENT_URL
  ? [process.env.CLIENT_URL]
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: allowedOrigins
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트
app.use('/api/users', userRoutes);

// DB 연결 테스트 (디버깅용)
// 사용 후 제거하거나 DEBUG_DB 환경변수로 제어하세요.
const pool = require('./config/dbConfig');
app.get('/api/dbtest', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT 1 AS ok');
    conn.release();
    res.json({ success: true, message: 'DB 연결 성공', data: rows });
  } catch (err) {
    console.error('DB 연결 오류:', err);
    const resp = { success: false, message: err.message };
    if (process.env.DEBUG_DB === 'true' || process.env.NODE_ENV !== 'production') {
      resp.error = err.stack;
    }
    res.status(500).json(resp);
  }
});

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 처리
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// 에러 처리
app.use((err, req, res, next) => {
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

