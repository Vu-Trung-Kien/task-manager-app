import { Router } from 'express';
import {
  createComment,
  deleteComment,
  getCommentsByTask,
} from '../controllers/comment.controllers.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

// GET /api/comments?taskId=xxx — lấy danh sách comment theo task
router.get('/', getCommentsByTask);

// POST /api/comments — tạo comment mới
router.post('/', createComment);

// DELETE /api/comments/:id — xóa comment
router.delete('/:id', deleteComment);

export default router;
