import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const role = localStorage.getItem('userRole');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        return { token, user, role };
      }
      return null;
    } catch (error) {
      console.error('Auth initialization error:', error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const handleLogout = useCallback(() => {
    try {
      // Clear all auth-related data
      authService.logout();
      setAuth(null);
      
      // Clear user-specific cart data
      const userId = auth?.user?.id || auth?.user?.email;
      if (userId) {
        localStorage.removeItem(`bookshopCart_${userId}`);
      }
      
      // Force navigation to home page
      navigate('/', { replace: true });
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  }, [auth?.user, navigate]);

// Update your handleLogin function in AuthProvider.js
const handleLogin = async (email, password) => {
  try {
    setLoading(true);
    const response = await authService.login(email, password);
    
    if (!response?.token) {
      throw new Error('Login failed: No token received');
    }

    const authData = {
      token: response.token,
      user: {
        id: response.id,
        email: response.email || email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
      },
      role: response.role
    };
    
    // Save auth data
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    localStorage.setItem('userRole', response.role);
    
    setAuth(authData);

    // Navigate based on role
    const userRole = response.role?.toLowerCase();
    switch (userRole) {
      case 'admin':
        navigate('/admindash');
        break;
      case 'staff':
        navigate('/staff');
        break;
      default:
        navigate('/dashboard');
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    toast.error(error.response?.data?.message || 'Login failed');
    throw error;
  } finally {
    setLoading(false);
  }
};
 useEffect(() => {
  const validateAuth = async () => {
    if (!auth?.token) {
      setLoading(false);
      return;
    }

    try {
      const userData = authService.getUser();
      if (userData) {
        // Only update if data has changed
        if (JSON.stringify(auth.user) !== JSON.stringify(userData)) {
          setAuth(prev => ({
            ...prev,
            user: userData
          }));
        }
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Auth validation failed:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  validateAuth();
}, [auth?.token]); // Only depend on token changes
  return (
    <AuthContext.Provider value={{
      auth,
      loading,
      login: handleLogin,
      logout: handleLogout,
      isAuthenticated: !!auth?.token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;