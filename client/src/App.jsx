// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import BookAdmin from './components/admin/AdminPage';
import BookList from './pages/BookList';
import { useEffect, useState } from 'react';
import authService from './services/authService';
import ErrorBoundary from './components/ErrorBoundary';
import { CartProvider } from './contexts/CartContext';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getUser();
        setUserRole(user?.role || null);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Wrap your components with ErrorBoundary */}
            <Route path="/admindash" element={
              <ErrorBoundary>
                <BookAdmin />
              </ErrorBoundary>
            } />
            <Route path="/books" element={<BookList />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
