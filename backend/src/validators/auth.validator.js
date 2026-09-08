import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Password phải có ít nhất 6 ký tự'),
  name: z.string().min(1, 'Tên không được để trống'),
});

const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(1, 'Password không được để trống'),
});

export { registerSchema, loginSchema };
