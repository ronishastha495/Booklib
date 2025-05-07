import { Navigate, Outlet, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = () => {
  const location = useLocation();
  const user = authService.getUser();
  
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  // Check if user is on the correct route based on role
  const userRole = user.role?.toLowerCase();
  
  // For admin users
  if (userRole === 'admin' && !location.pathname.startsWith('/admindash')) {
    return <Navigate to="/admindash" replace />;
  }
  
  // For regular users (members)
  if ((userRole === 'user' || userRole === 'member') && 
      !location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If user is on the correct route, render the component
  return <Outlet />;
};

export default ProtectedRoute;