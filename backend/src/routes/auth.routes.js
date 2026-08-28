import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';

const router = Router();

// POST /api/auth/register — đăng ký tài khoản mới
router.post('/register', register);

// POST /api/auth/login — đăng nhập, trả về JWT token
router.post('/login', login);

export default router;
