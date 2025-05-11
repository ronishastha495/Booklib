import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.getUser();
        setAuth(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
        setAuth(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password, role) => {
    const response = await authService.login(email, password, role);
    setAuth(await authService.getUser());
    return response;
  };

  const logout = () => {
    authService.logout();
    setAuth(null);
  };

  const value = {
    auth,
    loading,
    login,
    logout,
    isAuthenticated: !!auth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};