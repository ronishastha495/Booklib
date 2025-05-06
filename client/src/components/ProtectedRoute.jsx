import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getUser();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while fetching user
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role.toLowerCase() === 'admin') {
    return <Navigate to="/bookadmin" replace />;
  }

  if (user.role.toLowerCase() === 'user' || user.role.toLowerCase() === 'member') {
    return <Outlet />; // Render dashboard or other protected routes
  }

  // Fallback for unrecognized roles
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;