// Middleware factory — nhận vào 1 zod schema, trả về middleware tương ứng
// Cách dùng: router.post('/register', validate(registerSchema), register)
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors,
    });
  }

  // Gán lại req.body bằng data đã được Zod parse (đảm bảo đúng type, đã trim...)
  req.body = result.data;
  next();
};

export default validate;
