import { Routes, Route, Navigate } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import AdminDashboard from './pages/admin/AdminDashboard';
import BookDetail from './pages/BookDetail';
import BookList from './pages/BookList';
import UserDashboard from './pages/UserDashboard';
import BookForm from './components/admin/AddBookForm';
import Cart from './pages/Cart';
import Catalog from './pages/admin/Catalog';
import { useAuth } from './contexts/AuthContext';
import OrderHistory from './pages/OrderHistory';
function App() {
  const [initializing, setInitializing] = useState(true);
  const { auth, loading } = useAuth();


  const notify = () => {
    toast('This is a quick message!', {
      id: 'only-one-toast', // ensures single message box
      duration: 3000,       // quick timeout (2 seconds)
    });
  };

  useEffect(() => {
    const checkInitialAuth = () => {
      try {
        console.log('App initialization - Auth status:', {
          hasToken: !!auth?.token,
          role: auth?.role || 'none',
          hasUser: !!auth?.user,
          userId: auth?.user?.id || 'none'
        });
      } catch (error) {
        console.error('Initial auth check failed:', error);
      } finally {
        setInitializing(false);
      }
    };

    if (!loading) {
      checkInitialAuth();
    }
  }, [auth, loading]);

  if (loading || initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <CartProvider>
        <OrderProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/books" element={<BookList />} />
          
          {/* Protected Member routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/orders" element={<OrderHistory />} />

            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route 
              path="/dashboard" 
              element={
                auth?.role?.toLowerCase() === 'admin' 
                  ? <Navigate to="/admindash" replace /> 
                  : <UserDashboard />
              } 
            />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admindash" element={<AdminDashboard />} />
            <Route path="/admin/books/add" element={<BookForm />} />
            <Route path="/admin/catalog" element={<Catalog />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </OrderProvider>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;