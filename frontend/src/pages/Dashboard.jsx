import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

const emptyTask = { title: '', description: '' };

const formatDate = (date) => new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
}).format(new Date(date));

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [comments, setComments] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [commentContent, setCommentContent] = useState('');
  const [editingProject, setEditingProject] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState('');
  const [editingTaskForm, setEditingTaskForm] = useState(emptyTask);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const selectedProject = projects.find((project) => project.id === selectedProjectId);
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const showError = (error, fallback) => setMessage({ type: 'error', text: getErrorMessage(error, fallback) });

  const loadProjects = async (projectId = '') => {
    try {
      const response = await api.get('/projects');
      const nextProjects = response.data;
      setProjects(nextProjects);
      const nextProjectId = nextProjects.some((project) => project.id === projectId)
        ? projectId : nextProjects[0]?.id || '';
      setSelectedProjectId(nextProjectId);
    } catch (error) { showError(error, 'Không thể tải danh sách project'); }
    finally { setLoading(false); }
  };

  const loadTasks = async (projectId) => {
    if (!projectId) { setTasks([]); setSelectedTaskId(''); return; }
    try {
      const response = await api.get('/tasks', { params: { projectId } });
      setTasks(response.data); setSelectedTaskId(response.data[0]?.id || '');
    } catch (error) { showError(error, 'Không thể tải danh sách task'); }
  };

  const loadComments = async (taskId) => {
    if (!taskId) { setComments([]); return; }
    try {
      const response = await api.get('/comment', { params: { taskId } }); setComments(response.data);
    } catch (error) { showError(error, 'Không thể tải comment'); }
  };

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { loadTasks(selectedProjectId); }, [selectedProjectId]);
  useEffect(() => { loadComments(selectedTaskId); }, [selectedTaskId]);

  const handleCreateProject = async (event) => {
    event.preventDefault(); if (!projectName.trim()) return;
    try {
      const response = await api.post('/projects', { name: projectName.trim() });
      setProjectName(''); setMessage({ type: 'success', text: 'Đã tạo project mới' }); await loadProjects(response.data.id);
    } catch (error) { showError(error, 'Không thể tạo project'); }
  };

  const handleUpdateProject = async (event) => {
    event.preventDefault();
    try {
      await api.put(`/projects/${selectedProjectId}`, { name: projectName.trim() });
      setEditingProject(false); setMessage({ type: 'success', text: 'Đã cập nhật project' }); await loadProjects(selectedProjectId);
    } catch (error) { showError(error, 'Không thể cập nhật project'); }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(`Xóa project "${selectedProject?.name}" và toàn bộ task bên trong?`)) return;
    try { await api.delete(`/projects/${selectedProjectId}`); setMessage({ type: 'success', text: 'Đã xóa project' }); await loadProjects(); }
    catch (error) { showError(error, 'Không thể xóa project'); }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault(); if (!taskForm.title.trim()) return;
    try {
      const response = await api.post('/tasks', { ...taskForm, title: taskForm.title.trim(), projectId: selectedProjectId });
      setTaskForm(emptyTask); setTasks((current) => [response.data, ...current]); setSelectedTaskId(response.data.id); setMessage({ type: 'success', text: 'Đã tạo task mới' });
    } catch (error) { showError(error, 'Không thể tạo task'); }
  };

  const handleUpdateTask = async (event, taskId) => {
    event.preventDefault();
    try {
      const response = await api.put(`/tasks/${taskId}`, editingTaskForm);
      setTasks((current) => current.map((task) => task.id === taskId ? { ...task, ...response.data } : task)); setEditingTaskId(''); setMessage({ type: 'success', text: 'Đã cập nhật task' });
    } catch (error) { showError(error, 'Không thể cập nhật task'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Xóa task này và toàn bộ comment bên trong?')) return;
    try {
      await api.delete(`/tasks/${taskId}`); const remaining = tasks.filter((task) => task.id !== taskId); setTasks(remaining); setSelectedTaskId(remaining[0]?.id || ''); setMessage({ type: 'success', text: 'Đã xóa task' });
    } catch (error) { showError(error, 'Không thể xóa task'); }
  };

  const handleCreateComment = async (event) => {
    event.preventDefault(); if (!commentContent.trim()) return;
    try {
      const response = await api.post('/comment', { content: commentContent.trim(), taskId: selectedTaskId }); setComments((current) => [...current, response.data]); setCommentContent('');
    } catch (error) { showError(error, 'Không thể tạo comment'); }
  };

  const handleDeleteComment = async (commentId) => {
    try { await api.delete(`/comment/${commentId}`); setComments((current) => current.filter((comment) => comment.id !== commentId)); }
    catch (error) { showError(error, 'Không thể xóa comment'); }
  };

  return (
    <main className="dashboard-shell">
      <header className="topbar"><div><span className="eyebrow">WORKSPACE</span><h1>Task board</h1></div><div className="profile"><span>{user?.name}</span><button className="button button-ghost" onClick={logout}>Đăng xuất</button></div></header>
      {message.text && <div className={`notice ${message.type}`}>{message.text}<button onClick={() => setMessage({ type: '', text: '' })}>×</button></div>}
      {loading ? <div className="empty-state">Đang tải workspace...</div> : (
        <section className="workspace-grid">
          <aside className="panel project-panel"><div className="panel-heading"><div><span className="eyebrow">PROJECTS</span><h2>Dự án của bạn</h2></div><span className="count">{projects.length}</span></div><form className="inline-form" onSubmit={handleCreateProject}><input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Tên project mới" aria-label="Tên project mới" /><button className="button button-primary" type="submit">+</button></form><div className="project-list">{projects.length === 0 ? <p className="muted">Chưa có project nào.</p> : projects.map((project) => <button className={`project-item ${project.id === selectedProjectId ? 'active' : ''}`} key={project.id} onClick={() => { setSelectedProjectId(project.id); setEditingProject(false); }}><span>{project.name}</span><small>{formatDate(project.createdAt)}</small></button>)}</div></aside>
          <section className="panel task-panel">{!selectedProject ? <div className="empty-state"><strong>Bắt đầu với một project</strong><span>Tạo project ở cột bên trái để quản lý task.</span></div> : <><div className="panel-heading"><div>{editingProject ? <form className="edit-heading" onSubmit={handleUpdateProject}><input value={projectName} onChange={(event) => setProjectName(event.target.value)} autoFocus /><button className="text-button" type="submit">Lưu</button></form> : <><span className="eyebrow">PROJECT</span><h2>{selectedProject.name}</h2></>}</div><div className="actions">{!editingProject && <button className="button button-ghost" onClick={() => { setProjectName(selectedProject.name); setEditingProject(true); }}>Sửa tên</button>}<button className="button button-danger" onClick={handleDeleteProject}>Xóa</button></div></div><form className="task-create" onSubmit={handleCreateTask}><input value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} placeholder="Tiêu đề task mới" aria-label="Tiêu đề task mới" /><input value={taskForm.description} onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })} placeholder="Mô tả ngắn (không bắt buộc)" aria-label="Mô tả task mới" /><button className="button button-primary" type="submit">Thêm task</button></form><div className="task-list">{tasks.length === 0 ? <div className="empty-state"><strong>Project này chưa có task</strong><span>Tạo task đầu tiên bằng biểu mẫu phía trên.</span></div> : tasks.map((task) => <article className={`task-card ${task.id === selectedTaskId ? 'selected' : ''}`} key={task.id} onClick={() => setSelectedTaskId(task.id)}>{editingTaskId === task.id ? <form onSubmit={(event) => handleUpdateTask(event, task.id)} onClick={(event) => event.stopPropagation()}><input value={editingTaskForm.title} onChange={(event) => setEditingTaskForm({ ...editingTaskForm, title: event.target.value })} /><textarea value={editingTaskForm.description} onChange={(event) => setEditingTaskForm({ ...editingTaskForm, description: event.target.value })} /><select value={editingTaskForm.status} onChange={(event) => setEditingTaskForm({ ...editingTaskForm, status: event.target.value })}><option value="TODO">TODO</option><option value="IN_PROGRESS">IN PROGRESS</option><option value="DONE">DONE</option></select><div className="task-actions"><button className="button button-primary" type="submit">Lưu</button><button className="button button-ghost" type="button" onClick={() => setEditingTaskId('')}>Hủy</button></div></form> : <><div className="task-title-row"><h3>{task.title}</h3><span className={`status status-${task.status.toLowerCase()}`}>{task.status.replace('_', ' ')}</span></div><p>{task.description || 'Không có mô tả'}</p><div className="task-meta"><span>{formatDate(task.createdAt)}</span><span>{task.comments?.length || 0} comment</span><div className="task-actions"><button className="text-button" onClick={(event) => { event.stopPropagation(); setEditingTaskId(task.id); setEditingTaskForm({ title: task.title, description: task.description || '', status: task.status }); }}>Sửa</button><button className="text-button danger-text" onClick={(event) => { event.stopPropagation(); handleDeleteTask(task.id); }}>Xóa</button></div></div></>}</article>)}</div></>}</section>
          <aside className="panel comment-panel"><div className="panel-heading"><div><span className="eyebrow">DISCUSSION</span><h2>Comments</h2></div></div>{selectedTask ? <><div className="selected-task"><span>Đang xem task</span><strong>{selectedTask.title}</strong></div><form className="comment-form" onSubmit={handleCreateComment}><textarea value={commentContent} onChange={(event) => setCommentContent(event.target.value)} placeholder="Viết comment..." aria-label="Nội dung comment" /><button className="button button-primary" type="submit">Gửi comment</button></form><div className="comment-list">{comments.length === 0 ? <p className="muted">Chưa có comment nào.</p> : comments.map((comment) => <div className="comment" key={comment.id}><p>{comment.content}</p><div><small>{formatDate(comment.createdAt)}</small><button className="text-button danger-text" onClick={() => handleDeleteComment(comment.id)}>Xóa</button></div></div>)}</div></> : <div className="empty-state"><strong>Chọn một task</strong><span>Comment của task sẽ hiển thị ở đây.</span></div>}</aside>
        </section>
      )}
    </main>
  );
};

export default Dashboard;
