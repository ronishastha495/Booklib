import axios from 'axios';

const API_URL = 'http://localhost:5259/api/auth'; // Adjust to your backend URL

const authService = {
  // Login function to authenticate user
  async login(email, password) {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data; // Returns token, refreshToken, expiration, role
  },

  // Logout function
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  // Get current user by calling /api/auth/user endpoint
  async getUser() {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    try {
      const response = await axios.get(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Returns UserDto { id, email, firstName, lastName, role, createdAt }
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token; // Returns true if token exists, false otherwise
  },

  // Refresh token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return null;
    }
    try {
      const response = await axios.post(`${API_URL}/refresh`, { refreshToken });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  },

  // Get token from localStorage
  getToken() {
    return localStorage.getItem('token');
  },
};

export default authService;