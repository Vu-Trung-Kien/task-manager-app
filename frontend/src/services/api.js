import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // đổi khớp port backend của bạn
});

// Interceptor — tự động gắn token vào header của MỌI request, không cần lặp lại thủ công
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor — nếu token hết hạn (401), tự động đăng xuất và về trang login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
