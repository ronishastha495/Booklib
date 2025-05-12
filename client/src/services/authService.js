import axios from 'axios';

const API_URL = 'http://localhost:5259/api/auth';

// Create an axios instance with default headers
const api = axios.create({
  baseURL: API_URL
});

// Add request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const authService = {
  // Login function to authenticate user
  // ... rest of the file remains the same ...

async login(email, password, role = 'Member') {
  try {
    const response = await axios.post(`${API_URL}/login`, { 
      email, 
      password, 
      role 
    });
    
    if (!response.data?.token) {
      throw new Error('Login response missing token');
    }
    
    // Store auth data atomically
    const userData = {
      ...response.data,
      email: response.data.email || email,
    };
    
    localStorage.setItem('token', response.data.token);
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    localStorage.setItem('userRole', response.data.role || 'Member');
    localStorage.setItem('user', JSON.stringify(userData));
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
},

// ... rest of the file remains the same ...
  // Register function
  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Logout function
  // In your authService.js file, update the logout function:

logout() {
    // Clear all auth-related items
    const itemsToRemove = [
        'token',
        'refreshToken',
        'userRole',
        'user'
    ];
    
    itemsToRemove.forEach(item => {
        localStorage.removeItem(item);
    });
    
    // Clear any authentication headers
    if (api.defaults.headers) {
        delete api.defaults.headers['Authorization'];
    }
    
    console.log('User logged out, localStorage cleared');
},
  // Get current user from localStorage
  getUser() {
    try {
      const user = localStorage.getItem('user');
      if (!user) {
        console.log('No user found in localStorage');
        return null;
      }
      
      const userData = JSON.parse(user);
      console.log('User data retrieved from localStorage:', userData);
      return userData;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  },

  // Get user profile from API
  async getUserProfile() {
    try {
      const token = this.getToken();
      
      if (!token) {
        console.error('No authentication token found');
        return this.getUser(); // Fall back to localStorage
      }
      
      const response = await api.get(`${API_URL}/profile`);
      console.log('User profile fetched from API:', response.data);
      
      // Update localStorage with the latest data
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error.response?.data || error.message);
      // Fall back to cached user data
      return this.getUser();
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get user role
  getUserRole() {
    return localStorage.getItem('userRole') || 'Member';
  },

  // Get token from localStorage
  getToken() {
    return localStorage.getItem('token');
  },
  
  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await api.put(`${API_URL}/profile`, userData);
      
      // Update user data in localStorage
      const currentUser = this.getUser();
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post(`${API_URL}/refresh-token`, { 
        refreshToken 
      });
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error.response?.data || error.message);
      // If refresh token fails, logout the user
      this.logout();
      throw error;
    }
  }
};

export default authService;