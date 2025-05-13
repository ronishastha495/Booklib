import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, ShoppingCart, LogOut, Package, History } from "lucide-react";
import authService from "../services/authService";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Update date/time every second
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formatted = now.getUTCFullYear() + '-' +
        String(now.getUTCMonth() + 1).padStart(2, '0') + '-' +
        String(now.getUTCDate()).padStart(2, '0') + ' ' +
        String(now.getUTCHours()).padStart(2, '0') + ':' +
        String(now.getUTCMinutes()).padStart(2, '0') + ':' +
        String(now.getUTCSeconds()).padStart(2, '0');
      setCurrentDateTime(formatted);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    console.log('Token:', localStorage.getItem('token'));
    console.log('User Role:', localStorage.getItem('userRole'));
    console.log('Raw user data in localStorage:', localStorage.getItem('user'));

    try {
      const rawUserData = localStorage.getItem('user');
      if (rawUserData) {
        console.log('Parsed user data:', JSON.parse(rawUserData));
      } else {
        console.log('No user data in localStorage');
      }
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
    }

    const fetchUserData = () => {
      try {
        if (!authService.isAuthenticated()) {
          console.log("No authentication token found, redirecting to login");
          navigate("/login");
          return;
        }

        const userData = authService.getUser();
        console.log("User data retrieved from authService:", userData);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* DateTime Header */}
      <div className="bg-gray-800 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-sm">
            Current Date and Time (UTC): {currentDateTime}
          </div>
          <div className="text-sm">
            Current User's Login: {user?.email || 'Guest'}
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
            Welcome {user?.name || user?.username || user?.email?.split('@')[0] || ''}!
          </h1>

          <div className="bg-white rounded-lg shadow p-6 mb-8 max-w-md">
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
          <div className="bg-white rounded-lg shadow p-6 max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Stats</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-700">--</div>
                <div className="text-sm text-gray-600">Books</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-700">--</div>
                <div className="text-sm text-gray-600">Cart Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-700">--</div>
                <div className="text-sm text-gray-600">Orders</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;