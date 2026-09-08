import { Router } from 'express';
import { login, register } from '../controllers/auth.controllers.js';
import validate from '../middlewares/validate.middleware.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';

const router = Router();

// POST /api/auth/register — đăng ký tài khoản mới
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login — đăng nhập, trả về JWT token
router.post('/login', validate(loginSchema), login);

export default router;
