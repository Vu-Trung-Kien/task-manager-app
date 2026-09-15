import prisma from '../../prisma/db.js';
import { getIO } from '../sockets/socket.js';

const emitProjectCommentEvent = (projectId, eventName, payload) => {
  try {
    const io = getIO();
    if (projectId) {
      io.to(`project-${projectId}`).emit(eventName, payload);
    }
  } catch (error) {
    // Socket.io chưa khởi tạo trong môi trường test
  }
};

// Kiểm tra task có thuộc về user hiện tại không (qua project.ownerId)
const checkTaskOwnership = async (taskId, userId) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { ownerId: userId } },
  });

  if (!task) {
    const error = new Error('Không tìm thấy task hoặc bạn không có quyền truy cập');
    error.statusCode = 404;
    throw error;
  }

  return task;
};

// Lấy danh sách comment theo task
const getCommentsByTask = async (taskId, userId) => {
  await checkTaskOwnership(taskId, userId);

  return prisma.comment.findMany({
    where: { taskId },
    orderBy: { createdAt: 'asc' },
  });
};

// Tạo comment mới trong 1 task
const createComment = async ({ content, taskId }, userId) => {
  if (!content) {
    const error = new Error('Nội dung comment không được để trống');
    error.statusCode = 400;
    throw error;
  }

  const task = await checkTaskOwnership(taskId, userId);

  const createdComment = await prisma.comment.create({
    data: { content, taskId },
  });

  emitProjectCommentEvent(task.projectId, 'comment:created', {
    ...createdComment,
    taskId,
    projectId: task.projectId,
  });

  return createdComment;
};

// Xóa comment — kiểm tra comment đó thuộc task của đúng user
const deleteComment = async (commentId, userId) => {
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      task: { project: { ownerId: userId } },
    },
    include: { task: true },
  });

  if (!comment) {
    const error = new Error('Không tìm thấy comment hoặc bạn không có quyền xóa');
    error.statusCode = 404;
    throw error;
  }

  const deletedComment = await prisma.comment.delete({ where: { id: commentId } });

  emitProjectCommentEvent(comment.task.projectId, 'comment:deleted', {
    id: deletedComment.id,
    taskId: deletedComment.taskId,
    projectId: comment.task.projectId,
    deletedAt: new Date().toISOString(),
  });

  return deletedComment;
};

export default {
  getCommentsByTask,
  createComment,
  deleteComment,
};
