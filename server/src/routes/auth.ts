import {Router} from 'express';
import {AuthController} from '@/controllers/AuthController';
import {AuthRepository} from '@/repositories/AuthRepository';
import {AuthService} from '@/services/AuthService';
import {PasswordService} from '@/services/PasswordService';

const authRepository = new AuthRepository();
const passwordService = new PasswordService();
const authService = new AuthService(authRepository, passwordService);
const authController = new AuthController(authService);

const router = Router();

router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;

