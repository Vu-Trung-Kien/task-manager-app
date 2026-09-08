import prisma from '../../prisma/db.js';

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

  return prisma.task.create({
    data: { title, description, projectId },
  });
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

  return prisma.task.update({
    where: { id: taskId },
    data,
  });
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

  return prisma.task.delete({ where: { id: taskId } });
};

export default {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
