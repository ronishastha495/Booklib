import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';

// Pages & Components
import Landing from './pages/Landing';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Home from './pages/Home';
import BookDetail from './pages/BookDetail';
import BookList from './pages/BookList';
import BookForm from './components/admin/AddBookForm';
import Cart from './pages/Cart';
import Catalog from './pages/admin/Catalog';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffDashboard from './pages/staff/StaffDash';
import Orders from './pages/Orders'; 
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import NavBar from './components/common/navbar'; // Make sure to import NavBar

// Services
import authService from './services/authService';

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <OrderProvider>
              {/* NavBar will be shown on all routes */}
              {/* <NavBar /> */}
              
              <main className="min-h-screen bg-gray-50">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<LoginForm />} />
                  <Route path="/register" element={<RegisterForm />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/books/:id" element={<BookDetail />} />
                  <Route path="/booklist" element={<BookList />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/userdashboard" element={<UserDashboard />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/orders" element={<Orders />} />
                  </Route>

                  {/* Staff Protected Routes */}
                  <Route 
                    element={
                      <ProtectedRoute allowedRoles={['staff', 'admin']} />
                    }
                  >
                    <Route path="/staffdash" element={<StaffDashboard />} />
                    <Route path="/catalog" element={<Catalog />} />
                  </Route>

                  {/* Admin Protected Routes */}
                  <Route 
                    element={
                      <ProtectedRoute allowedRoles={['admin']} />
                    }
                  >
                    <Route path="/admindash" element={<AdminDashboard />} />
                    <Route path="/addbook" element={<BookForm />} />
                  </Route>

                  {/* Fallback Route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Toast notifications */}
              <Toaster 
                position="top-right" 
                richColors 
                closeButton
                duration={4000}
              />
            </OrderProvider>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;