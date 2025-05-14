import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, ShoppingCart, LogOut, Package, History, Heart } from "lucide-react";
import authService from "../services/authService";

const accent = "#a9895a"; // muted brown accent

const UserDashboard = () => {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate("/login");
          return;
        }
        const userData = authService.getUser();
        if (!userData) {
          navigate("/login");
          return;
        }
        setUser(userData);
      } catch {
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

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.name || user.username || (user.email ? user.email.split('@')[0] : '') || 'User';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5e4] font-serif">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#a9895a] border-t-transparent rounded-full mx-auto animate-spin"></div>
          <p className="mt-3 text-[#a9895a] font-serif">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f5e4] to-[#f5e9d4] font-serif">
      {/* DateTime Header */}
      <div className="bg-[#ede6d6] text-[#7c5e3c] py-2 px-4 border-b border-[#e5ccb5] shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div>📚 {currentDateTime}</div>
          <div>👤 {user?.email || 'Guest'}</div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 bg-[#fff8f0] border-r border-[#e5ccb5] flex flex-col py-8 px-4">
          <div className="mb-10">
            <span className="text-2xl font-bold text-[#a9895a] font-serif">Booklib</span>
          </div>
          <nav className="flex flex-col gap-2 flex-1">
            <Link
              to="/books"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[#f5e9d4] text-[#7c5e3c] font-medium transition"
            >
              <BookOpen size={18} /> Books
            </Link>
            <Link
              to="/cart"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[#f5e9d4] text-[#7c5e3c] font-medium transition"
            >
              <ShoppingCart size={18} /> Cart
            </Link>
            <Link
              to="/order/history"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[#f5e9d4] text-[#7c5e3c] font-medium transition"
            >
              <Package size={18} /> Orders
            </Link>
            <Link
              to="/notifications"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[#f5e9d4] text-[#7c5e3c] font-medium transition"
            >
              <History size={18} />  Notifications
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[#f5e9d4] text-[#7c5e3c] font-medium transition"
            >
              <Heart size={18} /> Wishlist
            </Link>
          </nav>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 mt-10 px-3 py-2 rounded bg-[#f5e9d4] hover:bg-[#ede6d6] text-[#7c5e3c] font-medium transition"
          >
            <LogOut size={18} /> Sign out
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10">
          <h1 className="text-3xl font-bold text-[#7c5e3c] mb-6">
            Welcome {getUserDisplayName()}!
          </h1>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="bg-[#fff8f0] rounded-lg shadow p-6 col-span-full lg:col-span-2 border border-[#e5ccb5]">
              <div className="flex items-center mb-4">
                <div className="bg-[#f5e9d4] rounded-full p-3 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={accent}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-[#7c5e3c]">Profile</h2>
              </div>
              <div className="space-y-2 text-[#7c5e3c]">
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
            <div className="bg-[#fff8f0] rounded-lg shadow p-6 border border-[#e5ccb5]">
              <h2 className="text-xl font-semibold text-[#7c5e3c] mb-4">Quick Stats</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-[#f5e9d4] p-4 rounded-lg flex items-center justify-between">
                  <span className="text-[#7c5e3c]">Books</span>
                  <span className="text-xl font-bold text-[#a9895a]">--</span>
                </div>
                <div className="bg-[#f5e9d4] p-4 rounded-lg flex items-center justify-between">
                  <span className="text-[#7c5e3c]">Cart Items</span>
                  <span className="text-xl font-bold text-[#a9895a]">--</span>
                </div>
                <div className="bg-[#f5e9d4] p-4 rounded-lg flex items-center justify-between">
                  <span className="text-[#7c5e3c]">Orders</span>
                  <span className="text-xl font-bold text-[#a9895a]">--</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;