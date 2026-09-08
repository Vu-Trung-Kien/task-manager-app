import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma/db.js';

const SALT_ROUNDS = 10;

const registerUser = async ({ email, password, name }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    const error = new Error('Email đã được sử dụng');
    error.statusCode = 409; // Conflict
    throw error;
  }

  const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, name, hashPassword },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      // KHÔNG select hashPassword — tránh trả password (dù đã hash) về client
    },
  });

  return user;
};

const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const error = new Error('Email hoặc mật khẩu không đúng');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.hashPassword);

  if (!isPasswordValid) {
    const error = new Error('Email hoặc mật khẩu không đúng');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
};

export default { registerUser, loginUser };
