// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect, useState } from 'react';
import authService from './services/authService';
import ErrorBoundary from './components/ErrorBoundary';
import { CartProvider } from './contexts/CartContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import BookDetail from './pages/BookDetails';
import BookList from './pages/BookList';
import BookForm from './components/admin/AddBookForm'
import Cart from './pages/Cart';
import Catalog from './pages/admin/Catalog';
import { Car } from 'e-react';

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
          <Route path="/addbook" element={<BookForm />} />
          <Route path="/bookdetail" element={<BookDetail />} />
          <Route path="/booklist" element={<BookList />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/catalog" element={<Catalog />} />



          {/* <Route path="/admin" element={<AdminDashboard />} /> */}
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Wrap your components with ErrorBoundary */}
            <Route path="/admindash" element={
              <ErrorBoundary>
                <AdminDashboard />
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
