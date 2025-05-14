import React, { useState, useEffect } from 'react';
import { FaEye, FaTimes, FaClock } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOrder } from '../contexts/OrderContext';
import { toast } from 'sonner';

const accent = "#a9895a"; // muted brown accent

const OrderHistory = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { orders, loading, fetchOrders, cancelUserOrder } = useOrder();
  const [currentDateTime, setCurrentDateTime] = useState('');
  const currentUser = auth?.user?.email || 'Guest';

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
    if (!auth?.user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [auth, navigate, fetchOrders]);

  const handleCancelOrder = async (orderId) => {
    try {
      await cancelUserOrder(orderId, "Customer cancelled the order");
      toast.success('Order cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  // Gentle badge colors
  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-[#f5e9d4] text-[#a9895a] border border-[#e5ccb5]';
      case 'confirmed':
        return 'bg-[#ede6d6] text-[#7c5e3c] border border-[#e5ccb5]';
      case 'readyforpickup':
        return 'bg-[#e3d5c3] text-[#7c5e3c] border border-[#e5ccb5]';
      case 'completed':
        return 'bg-[#f5f0dc] text-[#a9895a] border border-[#e5ccb5]';
      case 'cancelled':
        return 'bg-[#f8e0e0] text-[#c97b63] border border-[#e5ccb5]';
      default:
        return 'bg-[#ede6d6] text-[#7c5e3c] border border-[#e5ccb5]';
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
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5e4] to-[#f5e9d4] font-serif">
      {/* DateTime Header */}
      <div className="bg-[#ede6d6] text-[#7c5e3c] py-2 px-4 border-b border-[#e5ccb5] shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div>📚 {currentDateTime}</div>
          <div>👤 {currentUser}</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#7c5e3c]">Order History</h1>
          <div className="flex gap-4">
            <Link
              to="/dashboard"
              className="bg-[#f5e9d4] text-[#7c5e3c] px-4 py-2 rounded-full border border-[#e5ccb5] hover:bg-[#ede6d6] transition font-semibold"
            >
              Back to Dashboard
            </Link>
            <Link
              to="/books"
              className="bg-[#a9895a] text-white px-4 py-2 rounded-full border border-[#e5ccb5] hover:bg-[#7c5e3c] hover:text-white transition font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#fff8f0] shadow rounded-2xl p-6 text-center border border-[#e5ccb5]">
            <h2 className="text-xl font-semibold text-[#a9895a] mb-4">No Orders Found</h2>
            <p className="text-[#7c5e3c] mb-4">You haven't placed any orders yet.</p>
            <Link
              to="/books"
              className="inline-block bg-[#a9895a] text-white px-6 py-2 rounded-full border border-[#e5ccb5] hover:bg-[#7c5e3c] hover:text-white transition font-semibold"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-[#fff8f0] shadow rounded-2xl overflow-hidden border border-[#e5ccb5]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#ede6d6]">
                <thead className="bg-[#f5e9d4]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#a9895a] uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#a9895a] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#a9895a] uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#a9895a] uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#a9895a] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#a9895a] uppercase tracking-wider">Confirmation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#a9895a] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#fff8f0] divide-y divide-[#ede6d6]">
                  {orders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-[#f5e9d4] transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7c5e3c]">{order.claimCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#a9895a]">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#a9895a]">{order.items.length} items</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7c5e3c]">₹{order.finalTotal.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-[#7c5e3c]">
                            Sent to {auth?.user?.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/order/${order.orderId}`}
                            className="text-[#a9895a] hover:text-[#c97b63] transition"
                          >
                            <FaEye className="h-5 w-5" />
                          </Link>
                          {order.status.toLowerCase() === 'pending' && (
                            <button
                              onClick={() => handleCancelOrder(order.orderId)}
                              className="text-[#c97b63] hover:text-[#a9895a] transition"
                              title="Cancel Order"
                            >
                              <FaTimes className="h-5 w-5" />
                            </button>
                          )}
                          {['confirmed', 'readyforpickup'].includes(order.status.toLowerCase()) && (
                            <span className="text-[#7c5e3c]">
                              <FaClock className="h-5 w-5" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;