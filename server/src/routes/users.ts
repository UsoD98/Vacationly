import { Router } from 'express';
import * as userController from '@/controllers/userController';
import authMiddleware from '@/middleware/authMiddleware';

const router = Router();

// 회원가입 (공개 엔드포인트)
router.post('/', userController.createUser);

// 보호된 엔드포인트
// 모든 사용자 조회
router.get('/', userController.getAllUsers);
// 특정 사용자 조회
router.get('/:id', userController.getUserById);
// 사용자 수정
router.put('/:id', userController.updateUser);
// 사용자 삭제
router.delete('/:id', authMiddleware, userController.deleteUser);

export default router;

