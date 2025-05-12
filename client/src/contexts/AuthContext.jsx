import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    const initializeAuth = () => {
      const user = authService.getUser();
      setAuth({
        user,
        isAuthenticated: !!user,
        loading: false
      });
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const user = authService.getUser();
      setAuth({
        user,
        isAuthenticated: true,
        loading: false
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setAuth({
      user: null,
      isAuthenticated: false,
      loading: false
    });
  };

  return (
    <AuthContext.Provider value={{
      ...auth,
      login,
      logout
    }}>
      {!auth.loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};