import prisma from '../../prisma/db.js';
import { getIO } from '../sockets/socket.js';

const emitProjectEvent = (projectId, eventName, payload) => {
  try {
    const io = getIO();
    if (projectId) {
      io.to(`project-${projectId}`).emit(eventName, payload);
    }
  } catch (error) {
    // Socket.io chưa khởi tạo trong môi trường test
  }
};

// Lấy danh sách project của user hiện tại
const getProjects = async (userId) => {
  return prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
  });
};

// Lấy chi tiết 1 project, kèm danh sách task bên trong
const getProjectById = async (projectId, userId) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    include: { tasks: true },
  });

  if (!project) {
    const error = new Error('Không tìm thấy project hoặc bạn không có quyền truy cập');
    error.statusCode = 404;
    throw error;
  }

  return project;
};

// Tạo project mới, gán ownerId là user hiện tại
const createProject = async ({ name }, userId) => {
  if (!name) {
    const error = new Error('Tên project không được để trống');
    error.statusCode = 400;
    throw error;
  }

  const createdProject = await prisma.project.create({
    data: { name, ownerId: userId },
  });

  emitProjectEvent(createdProject.id, 'project:created', createdProject);

  return createdProject;
};

// Cập nhật project — chỉ owner mới được sửa
const updateProject = async (projectId, data, userId) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
  });

  if (!existingProject) {
    const error = new Error('Không tìm thấy project hoặc bạn không có quyền sửa');
    error.statusCode = 404;
    throw error;
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: { name: data.name },
  });

  emitProjectEvent(projectId, 'project:updated', updatedProject);

  return updatedProject;
};

// Xóa project — chỉ owner mới được xóa (task/comment bên trong tự xóa theo nhờ onDelete: Cascade)
const deleteProject = async (projectId, userId) => {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
  });

  if (!existingProject) {
    const error = new Error('Không tìm thấy project hoặc bạn không có quyền xóa');
    error.statusCode = 404;
    throw error;
  }

  const deletedProject = await prisma.project.delete({ where: { id: projectId } });

  emitProjectEvent(projectId, 'project:deleted', {
    id: deletedProject.id,
    deletedAt: new Date().toISOString(),
  });

  return deletedProject;
};

export default {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
