import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasksByProject,
  updateTask
} from '../controllers/task.controllers.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createTaskSchema, updateTaskSchema } from '../validators/task.validator.js';

const router = Router();

// Mọi route task đều yêu cầu đăng nhập
router.use(authMiddleware);

// GET /api/tasks?projectId=xxx — lấy danh sách task theo project
router.get('/', getTasksByProject);

// GET /api/tasks/:id — lấy chi tiết 1 task
router.get('/:id', getTaskById);

// POST /api/tasks — tạo task mới
router.post('/', validate(createTaskSchema), createTask);

// PUT /api/tasks/:id — cập nhật task (VD: đổi status)
router.put('/:id', validate(updateTaskSchema), updateTask);

// DELETE /api/tasks/:id — xóa task
router.delete('/:id', deleteTask);

export default router;
