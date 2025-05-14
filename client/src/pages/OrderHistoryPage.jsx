import React, { useState, useEffect } from 'react';
import { FaEye, FaTimesCircle, FaClock } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import api from '../services/api';

const OrderHistoryPage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    if (!auth?.token) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get('/Order');
        setOrders(response.data);
      } catch {
        toast.error('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    const updateDateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      setCurrentDateTime(formatted);
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, [auth, navigate]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.post(`/Order/${orderId}/cancel`, "User requested cancellation", {
        headers: { 'Content-Type': 'application/json' },
      });
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: 'Cancelled' } : o))
      );
      toast.success('Order cancelled successfully');
    } catch {
      toast.error('Failed to cancel order');
    }
  };

  const getStatusBadgeClass = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold border ";
    switch (status.toLowerCase()) {
      case 'pending':
        return base + "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 'confirmed':
        return base + "bg-blue-100 text-blue-800 border-blue-300";
      case 'readyforpickup':
        return base + "bg-green-100 text-green-800 border-green-300";
      case 'completed':
        return base + "bg-purple-100 text-purple-800 border-purple-300";
      case 'cancelled':
        return base + "bg-red-100 text-red-800 border-red-300";
      default:
        return base + "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5e4] font-serif">
        <div className="w-12 h-12 border-4 border-[#a9895a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5e4] to-[#f5e9d4] font-serif p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center text-[#7c5e3c]">
        <div>📚 {currentDateTime}</div>
        <div>👤 {auth?.user?.email || 'Guest'}</div>
      </div>

      <h1 className="text-3xl font-bold text-[#7c5e3c] max-w-7xl mx-auto mb-8">Order History</h1>

      {orders.length === 0 ? (
        <div className="max-w-7xl mx-auto bg-[#fff8f0] rounded-2xl shadow p-8 border border-[#e5ccb5] text-center text-[#a9895a]">
          <p className="mb-4">You have no orders yet.</p>
          <Link
            to="/books"
            className="inline-block px-6 py-2 rounded-full bg-[#a9895a] text-white hover:bg-[#7c5e3c] transition"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto bg-[#fff8f0] rounded-2xl shadow overflow-x-auto border border-[#e5ccb5]">
          <table className="min-w-full divide-y divide-[#ede6d6]">
            <thead className="bg-[#f5e9d4] text-[#a9895a]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Confirmation</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#fff8f0] divide-y divide-[#ede6d6] text-[#7c5e3c]">
              {orders.map((order) => (
                <tr key={order.orderId} className="hover:bg-[#f5e9d4] transition">
                  <td className="px-6 py-4 whitespace-nowrap">{order.claimCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.items.length} items</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{order.finalTotal.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadgeClass(order.status)}>{order.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-1 text-sm">
                    <FaClock />
                    Sent to {auth?.user?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm flex items-center gap-3">
                    <Link
                      to={`/order/${order.orderId}`}
                      className="hover:text-[#a9895a]"
                      title="View Details"
                    >
                      <FaEye />
                    </Link>
                    {order.status.toLowerCase() === 'pending' && (
                      <button
                        onClick={() => handleCancelOrder(order.orderId)}
                        className="hover:text-[#c97b63]"
                        title="Cancel Order"
                      >
                        <FaTimesCircle />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;