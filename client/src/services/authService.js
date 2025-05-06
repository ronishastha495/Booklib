import api from './api';

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, refreshToken, expiration } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tokenExpiration', expiration);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Login failed';
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Registration failed';
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token available');
      const response = await api.post('/auth/refresh', { refreshToken });
      const { token, refreshToken: newRefreshToken, expiration } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('tokenExpiration', expiration);
      return response.data;
    } catch (error) {
      localStorage.clear();
      throw error.response?.data || 'Token refresh failed';
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiration');
  },

  getToken: () => localStorage.getItem('token'),
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('tokenExpiration');
    return token && expiration && new Date(expiration) > new Date();
  }
};

export default authService;