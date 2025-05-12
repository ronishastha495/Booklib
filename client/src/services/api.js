import axios from 'axios';
import authService from './authService';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5259/api',
});

// Add request interceptor
api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await authService.refreshToken();
        return api(originalRequest);
      } catch (refreshError) {
        authService.logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;