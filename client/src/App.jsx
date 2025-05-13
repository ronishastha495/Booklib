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
import StaffDashboard from './pages/staff/StaffDashboard'

function App() {
  const [initializing, setInitializing] = useState(true);
  const { auth, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      setInitializing(false);
    }
  }, [loading]);

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
              <Route path="/dashboard" element={<UserDashboard />} />
            </Route>

            {/* Staff routes */}
            <Route element={<ProtectedRoute staffOnly />}>
              <Route path="/staff" element={<StaffDashboard />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/admindash/*" element={<AdminDashboard />} />
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