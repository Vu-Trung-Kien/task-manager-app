// Middleware xử lý lỗi tập trung — bắt mọi lỗi được next(error) từ controller
const errorMiddleware = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi server, vui lòng thử lại sau';

  res.status(statusCode).json({
    success: false,
    message,
    // Chỉ trả stack trace khi đang phát triển, không lộ ra production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorMiddleware;
