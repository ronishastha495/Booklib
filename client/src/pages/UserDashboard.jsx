import React, { useEffect, useState, useContext, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, ShoppingCart, LogOut, Package, Bell, History, Heart } from "lucide-react";
import authService from "../services/authService";
import { OrderContext } from '../contexts/OrderContext';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notifications } = useContext(OrderContext);

  // Memoize the unread notifications check to prevent unnecessary re-renders
  const hasUnreadNotifications = useMemo(() => {
    return notifications.some(notification => !notification.isRead);
  }, [notifications]);

  // Optimized datetime update with better formatting
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        timeZone: 'UTC',
        hour12: false
      };
      
      setCurrentDateTime(now.toLocaleString('en-US', options) + ' UTC');
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle authentication and user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          console.log("No authentication token found, redirecting to login");
          navigate("/login");
          return;
        }

        const userData = authService.getUser();
        
        if (!userData) {
          console.log("No user data found, redirecting to login");
          navigate("/login");
          return;
        }

        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  // User-friendly name display
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.name || user.username || (user.email ? user.email.split('@')[0] : '') || 'User';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto animate-spin"></div>
          <p className="mt-3 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* DateTime Header */}
      <div className="bg-gray-800 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-sm">
            Current Date and Time: {currentDateTime}
          </div>
          <div className="text-sm">
            Current User: {user?.email || 'Guest'}
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r flex flex-col py-8 px-4">
          <div className="mb-10">
            <span className="text-2xl font-bold text-indigo-700">BookLib</span>
          </div>
          <nav className="flex flex-col gap-2 flex-1">
            <Link
              to="/books"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-indigo-50 text-gray-700 font-medium transition"
            >
              <BookOpen size={18} /> Books
            </Link>
            <Link
              to="/cart"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-indigo-50 text-gray-700 font-medium transition"
            >
              <ShoppingCart size={18} /> Cart
            </Link>
            <Link
              to="/order/history"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-indigo-50 text-gray-700 font-medium transition"
            >
              <Package size={18} /> Orders
            </Link>
            <Link
              to="/orders/history"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-indigo-50 text-gray-700 font-medium transition"
            >
              <History size={18} /> Order History
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-indigo-50 text-gray-700 font-medium transition"
            >
              <Heart size={18} /> Wishlist
            </Link>
            <Link
              to="/notifications"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-indigo-50 text-gray-700 font-medium transition relative"
            >
              <Bell size={18} />
              Notifications
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </Link>
          </nav>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 mt-10 px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
          >
            <LogOut size={18} /> Sign out
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Welcome {getUserDisplayName()}!
          </h1>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow p-6 col-span-full lg:col-span-2">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-indigo-700"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Your Profile</h2>
              </div>
              <div className="space-y-2 text-gray-700">
                <p>
                  <span className="font-semibold">Name:</span> {user?.name || user?.username || user?.firstName || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {user?.email || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Role:</span> {user?.role || authService.getUserRole() || 'Member'}
                </p>
                <p>
                  <span className="font-semibold">Member since:</span>{" "}
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Stats</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg flex items-center justify-between">
                  <span className="text-gray-700">Books</span>
                  <span className="text-xl font-bold text-indigo-700">--</span>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg flex items-center justify-between">
                  <span className="text-gray-700">Cart Items</span>
                  <span className="text-xl font-bold text-indigo-700">--</span>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg flex items-center justify-between">
                  <span className="text-gray-700">Orders</span>
                  <span className="text-xl font-bold text-indigo-700">--</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default React.memo(UserDashboard);