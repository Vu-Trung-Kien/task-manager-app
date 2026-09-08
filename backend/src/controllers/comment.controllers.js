import commentService from '../services/comment.service.js';

// GET /api/comments?taskId=xxx
const getCommentsByTask = async (req, res, next) => {
  try {
    const { taskId } = req.query;
    const comments = await commentService.getCommentsByTask(taskId, req.user.id);
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

// POST /api/comments
const createComment = async (req, res, next) => {
  try {
    const comment = await commentService.createComment(req.body, req.user.id);
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/comments/:id
const deleteComment = async (req, res, next) => {
  try {
    await commentService.deleteComment(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { getCommentsByTask, createComment, deleteComment };
