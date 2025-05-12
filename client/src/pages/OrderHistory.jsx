import React, { useState, useEffect } from 'react';
import { FaEye, FaTimes, FaClock } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOrder } from '../contexts/OrderContext';
import { toast } from 'sonner';

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
      console.error('Failed to cancel order:', error);
      toast.error('Failed to cancel order');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'readyforpickup':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* DateTime Header */}
      <div className="bg-gray-800 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-sm">
            Current Date and Time (UTC): {currentDateTime}
          </div>
          <div className="text-sm">
            Current User's Login: {currentUser}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
          <div className="flex gap-4">
            <Link
              to="/dashboard"
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
            >
              Back to Dashboard
            </Link>
            <Link
              to="/books"
              className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">No Orders Found</h2>
            <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
            <Link
              to="/books"
              className="inline-block bg-amber-500 text-white px-6 py-2 rounded-md hover:bg-amber-600 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.claimCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.items.length} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{order.finalTotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/order/${order.orderId}`}
                            className="text-amber-600 hover:text-amber-900"
                          >
                            <FaEye className="h-5 w-5" />
                          </Link>
                          {order.status.toLowerCase() === 'pending' && (
                            <button
                              onClick={() => handleCancelOrder(order.orderId)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTimes className="h-5 w-5" />
                            </button>
                          )}
                          {['confirmed', 'readyforpickup'].includes(order.status.toLowerCase()) && (
                            <span className="text-blue-600">
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