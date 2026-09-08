import taskService from '../services/task.service.js';

// GET /api/tasks?projectId=xxx
const getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const tasks = await taskService.getTasksByProject(projectId, req.user.id);
    res.status(200).json(tasks);
  } catch (error) {
    next(error); // đẩy lỗi cho error middleware xử lý tập trung
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user.id);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body, req.user.id);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user.id);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id, req.user.id);
    res.status(204).send(); // 204 No Content — xóa thành công, không trả body
  } catch (error) {
    next(error);
  }
};

export {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
