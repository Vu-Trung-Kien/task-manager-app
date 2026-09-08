import { Router } from 'express';
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from '../controllers/project.controllers.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// Mọi route project đều yêu cầu đăng nhập
router.use(authMiddleware);

// GET /api/projects — lấy danh sách project của user hiện tại
router.get('/', getProjects);

// GET /api/projects/:id — lấy chi tiết 1 project
router.get('/:id', getProjectById);

// POST /api/projects — tạo project mới
router.post('/', createProject);

// PUT /api/projects/:id — cập nhật project
router.put('/:id', updateProject);

// DELETE /api/projects/:id — xóa project
router.delete('/:id', deleteProject);

export default router;
