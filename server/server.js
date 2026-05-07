const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors(process.env.CLIENIT_URL));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트
app.use('/api/users', userRoutes);

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

