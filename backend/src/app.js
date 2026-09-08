import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
//import taskRoutes from './routes/task.routes.js';

import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

// ============================================
// Middleware chung
// ============================================
app.use(cors());               // cho phép frontend gọi API từ domain khác
app.use(express.json());       // parse JSON body từ request
app.use(morgan('dev'));        // log mỗi request ra console (method, url, status, thời gian)

// ============================================
// Health check — kiểm tra server có sống không
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server đang chạy' });
});

// ============================================
// Routes
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
//app.use('/api/tasks', taskRoutes);

// ============================================
// Xử lý route không tồn tại (404)
// ============================================
app.use((req, res) => {
  res.status(404).json({ message: 'Route không tồn tại' });
});

// ============================================
// Middleware xử lý lỗi tập trung — đặt CUỐI CÙNG
// ============================================
app.use(errorMiddleware);

export default app;
