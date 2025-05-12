import axios from 'axios';

const API_URL = 'http://localhost:5259/api/auth'; // Make sure this matches your backend URL

const authService = {
  // Login function to authenticate user
  async login(email, password) {
    const response = await axios.post(`${API_URL}/login`, { 
      email, 
      password, 
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // Register function
  async register(userData) {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  },

  // Logout function
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get user role
  getUserRole() {
    return localStorage.getItem('userRole');
  },

  // Get token from localStorage
  getToken() {
    return localStorage.getItem('token');
  },
};

export default authService;