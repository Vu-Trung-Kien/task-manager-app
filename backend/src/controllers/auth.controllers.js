import authService from '../services/auth.service.js';

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      const error = new Error('Vui lòng nhập đầy đủ email, password, name');
      error.statusCode = 400;
      throw error;
    }

    const user = await authService.registerUser({ email, password, name });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Vui lòng nhập email và password');
      error.statusCode = 400;
      throw error;
    }

    const { token, user } = await authService.loginUser({ email, password });
    res.status(200).json({ token, user });
  } catch (error) {
    next(error);
  }
};

export { register, login };
