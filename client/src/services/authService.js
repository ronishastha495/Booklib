import axios from 'axios';

const API_URL = 'http://localhost:5259/api/auth';

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const authService = {
  // Login user and store tokens
  async login(email, password, role = 'Member') {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password, role });

      if (!response.data?.token) {
        throw new Error('Login response missing token');
      }

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

  // Register a new user
  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Logout the user and clear localStorage
  logout() {
    const itemsToRemove = ['token', 'refreshToken', 'userRole', 'user'];
    itemsToRemove.forEach(item => localStorage.removeItem(item));

    // Clear auth header for future API calls
    if (api.defaults.headers) {
      delete api.defaults.headers['Authorization'];
    }

    console.log('User logged out, localStorage cleared');
},
  async getUserProfile() {
    try {
      // Instead of making an API call, just return the cached user data
      const userData = this.getUser();
      if (!userData) {
        throw new Error('No user data found');
      }
      return userData;
    } catch (error) {
      console.error('Error getting user profile:', error.message);
      throw error;
    }
  },

  // Modify getUser to include role information
  getUser() {
    try {
      const user = localStorage.getItem('user');
      const role = localStorage.getItem('userRole');
      
      if (!user) {
        return null;
      }
      const userData = JSON.parse(user);
      return {
        ...userData,
        role: role || userData.role || 'Member'
      };
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
      console.log('No authentication token found');
      return this.getUser();
    }
    
    // Return cached user if profile endpoint doesn't exist
    try {
      const response = await api.get(`${API_URL}/me`);
      console.log('User profile fetched from API:', response.data);
      
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('Profile endpoint not found, using cached data');
        return this.getUser();
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error);
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
      const response = await api.put('/me', userData);
      const currentUser = this.getUser();
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      throw error;
    }
  },

  // Refresh the token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_URL}/refresh-token`, { refreshToken });

      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      }

      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error.response?.data || error.message);
      this.logout(); // logout on refresh failure
      throw error;
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
  }
};

export default authService;
