import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    // Token được gửi qua header: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Không tìm thấy token, vui lòng đăng nhập');
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];

    // Verify token — nếu sai hoặc hết hạn, jwt.verify sẽ tự throw lỗi
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gắn thông tin user đã decode vào req, dùng cho các controller phía sau
    req.user = decoded; // { id, email }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      error.statusCode = 401;
      error.message = 'Token không hợp lệ';
    } else if (error.name === 'TokenExpiredError') {
      error.statusCode = 401;
      error.message = 'Token đã hết hạn, vui lòng đăng nhập lại';
    }
    next(error);
  }
};

export default authMiddleware;
