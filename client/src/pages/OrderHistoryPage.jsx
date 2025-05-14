import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaClock, FaCheckCircle, FaTimesCircle, FaBoxOpen, FaStar } from 'react-icons/fa';
import { toast } from 'sonner';
import api from '../services/api';
import OrderDetailsModal from '../pages/OrderDetailsModal';
import reviewService from '../services/reviewService';

const OrderHistoryPage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userReviews, setUserReviews] = useState([]); // Initialize as empty array

  useEffect(() => {
    if (!auth?.token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch orders
        const orderResponse = await api.get('/Order');
        setOrders(orderResponse.data);
        
        // Fetch user's reviews - ensure it's an array
        const reviewResponse = await reviewService.getUserReviews();
        setUserReviews(Array.isArray(reviewResponse) ? reviewResponse : []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load order history or reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth, navigate]); // Remove the conditional fetching based on array lengths

  // Check if user has reviewed a book
  const hasReviewedBook = (bookId) => {
    // Make sure userReviews is an array before calling .some()
    return Array.isArray(userReviews) && userReviews.some((review) => review.bookId === bookId);
  };

  const calculateTotalQuantity = (items) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'confirmed':
        return <FaClock className="text-blue-500" />;
      case 'readyforpickup':
        return <FaBoxOpen className="text-green-500" />;
      case 'completed':
        return <FaCheckCircle className="text-green-600" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    try {
      await api.post(`/Order/${orderId}/cancel`, "User requested cancellation", {
        headers: { 'Content-Type': 'application/json' },
      });
      setOrders(orders.map((order) => (order.orderId === orderId ? { ...order, status: 'Cancelled' } : order)));
      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error(typeof error.response?.data === 'string' ? error.response.data : 'Failed to cancel order');
    }
  };

  const handleReviewBook = (bookId) => {
    navigate(`/books/${bookId}?review=true`);
  };

  const formatItemsText = (items) => {
    const totalQuantity = calculateTotalQuantity(items);
    const uniqueItemCount = items.length;
    if (uniqueItemCount === 1) {
      const item = items[0];
      return item.quantity === 1 ? '1 item' : `${item.quantity} ${item.bookTitle}`;
    }
    return `${totalQuantity} items (${uniqueItemCount} titles)`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Order History</h1>
          <button
            onClick={() => navigate('/books')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Continue Shopping
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Orders Found</h2>
            <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/books')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.claimCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.items.map((item) => (
                        <div key={item.bookId} className="flex items-center justify-between mb-2">
                          <span>{item.quantity} x {item.bookTitle}</span>
                          {order.status.toLowerCase() === 'completed' && (
  <button
    onClick={() => navigate(`/books/${item.bookId}/review`, { 
      state: { orderId: order.orderId } 
    })}
    disabled={hasReviewedBook(item.bookId, order.orderId)}
    className={`ml-2 text-yellow-600 hover:text-yellow-800 ${
      hasReviewedBook(item.bookId, order.orderId) ? 'opacity-50 cursor-not-allowed' : ''
    }`}
    title={hasReviewedBook(item.bookId, order.orderId) ? 'Already Reviewed This Purchase' : 'Write a Review'}
  >
    <FaStar className="h-5 w-5" />
  </button>

                          )}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{order.finalTotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-2">{getStatusIcon(order.status)}</div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <FaEye className="h-5 w-5" />
                        </button>
                        {['Pending', 'Confirmed'].includes(order.status) && (
                          <button
                            onClick={() => handleCancelOrder(order.orderId)}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel Order"
                          >
                            <FaTimesCircle className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default OrderHistoryPage;