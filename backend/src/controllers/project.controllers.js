import projectService from '../services/project.service.js';

// GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getProjects(req.user.id);
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user.id);
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user.id);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.user.id);
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
