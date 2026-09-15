import prisma from '../../prisma/db.js';
import { getIO } from '../sockets/socket.js';

const emitProjectTaskEvent = (projectId, eventName, payload) => {
  try {
    const io = getIO();
    io.to(`project-${projectId}`).emit(eventName, payload);
  } catch (error) {
    // Socket.io có thể chưa khởi tạo ở một số test hoặc môi trường không chạy server
  }
};

// Lấy danh sách task theo project, kèm kiểm tra project thuộc về đúng user
const getTasksByProject = async (projectId, userId) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
  });

  if (!project) {
    const error = new Error('Không tìm thấy project hoặc bạn không có quyền truy cập');
    error.statusCode = 404;
    throw error;
  }

  return prisma.task.findMany({
    where: { projectId },
    include: { comments: true },
    orderBy: { createdAt: 'desc' },
  });
};

const getTaskById = async (taskId, userId) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: { ownerId: userId }, // đảm bảo task thuộc project của đúng user
    },
    include: { comments: true },
  });

  if (!task) {
    const error = new Error('Không tìm thấy task');
    error.statusCode = 404;
    throw error;
  }

  return task;
};

const createTask = async ({ title, description, projectId }, userId) => {
  // Kiểm tra project có thuộc về user không trước khi tạo task
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
  });

  if (!project) {
    const error = new Error('Không tìm thấy project hoặc bạn không có quyền truy cập');
    error.statusCode = 404;
    throw error;
  }

  const createdTask = await prisma.task.create({
    data: { title, description, projectId },
  });

  emitProjectTaskEvent(projectId, 'task:created', createdTask);

  return createdTask;
};

const updateTask = async (taskId, data, userId) => {
  // findFirst trước để đảm bảo đúng quyền sở hữu, tránh sửa task của người khác
  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, project: { ownerId: userId } },
  });

  if (!existingTask) {
    const error = new Error('Không tìm thấy task hoặc bạn không có quyền sửa');
    error.statusCode = 404;
    throw error;
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data,
  });

  emitProjectTaskEvent(existingTask.projectId, 'task:updated', updatedTask);

  return updatedTask;
};

const deleteTask = async (taskId, userId) => {
  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, project: { ownerId: userId } },
  });

  if (!existingTask) {
    const error = new Error('Không tìm thấy task hoặc bạn không có quyền xóa');
    error.statusCode = 404;
    throw error;
  }

  const deletedTask = await prisma.task.delete({ where: { id: taskId } });

  emitProjectTaskEvent(existingTask.projectId, 'task:deleted', {
    id: deletedTask.id,
    projectId: deletedTask.projectId,
    deletedAt: new Date().toISOString(),
  });

  return deletedTask;
};

export default {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
