import { Navigate, Outlet, useLocation } from 'react-router-dom';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const ProtectedRoute = ({ adminOnly = false, staffOnly = false }) => {
  const location = useLocation();
  const { auth, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!auth?.token) {
    toast.error("Please login to access this feature");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const userRole = auth.role?.toLowerCase();

  // For admin routes
  if (adminOnly && userRole !== 'admin') {
  const userRole = auth.role?.toLowerCase();

  // For admin routes
  if (adminOnly && userRole !== 'admin') {
    toast.error("Admin access required");
    return <Navigate to="/dashboard" replace />;
  }

  // For staff routes
  if (staffOnly && userRole !== 'staff' && userRole !== 'admin') {
    toast.error("Staff access required");
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;