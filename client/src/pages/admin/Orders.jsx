import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, CheckCircle, XCircle } from 'react-feather';
import { toast } from 'sonner';
import { useBookContext } from '../../contexts/BookContext';
// import OrderService from '../../services/OrderService';
// import StockService from '../../services/StockService';

const Orders = () => {
  const { books, fetchAllBooks } = useBookContext();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await OrderService.getAllOrders(); // Fetch all orders
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load orders');
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.memberName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = async (id, status) => {
    try {
      const updatedOrder = await OrderService.updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? updatedOrder : o)));
      if (status === 'Completed') {
        const order = orders.find((o) => o.id === id);
        const booksToUpdate = order.items.map((item) => ({
          bookId: item.bookId,
          quantity: item.quantity,
          stockQuantity: books.find((b) => b.bookId === item.bookId)?.stockQuantity || 0,
        }));
        await StockService.fulfillOrder(id, booksToUpdate);
        await fetchAllBooks();
      }
      toast.success(`Order ${status} successfully!`);
    } catch (err) {
      toast.error(`Failed to update order status: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-500 animate-pulse">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-red-500 bg-red-50 p-4 rounded-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-indigo-600" />
              Staff Order Management
            </h3>
            <div className="relative mt-4 sm:mt-0 w-full sm:w-80">
              <input
                type="text"
                placeholder="Search by Order ID or Member..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-all duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.memberName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'Confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      {order.status === 'Pending' && (
                        <>
                          <button
                            className="inline-flex items-center px-4 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-105"
                            onClick={() => handleStatusUpdate(order.id, 'Confirmed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </button>
                          <button
                            className="inline-flex items-center px-4 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-sm hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transform transition-all duration-200 hover:scale-105"
                            onClick={() => handleStatusUpdate(order.id, 'Cancelled')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </button>
                        </>
                      )}
                      {order.status === 'Confirmed' && (
                        <button
                          className="inline-flex items-center px-4 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-sm hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transform transition-all duration-200 hover:scale-105"
                          onClick={() => handleStatusUpdate(order.id, 'Completed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </button>
                      )}
                      {order.status !== 'Cancelled' && order.status !== 'Pending' && order.status !== 'Completed' && (
                        <button
                          className="inline-flex items-center px-4 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-sm hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transform transition-all duration-200 hover:scale-105"
                          onClick={() => handleStatusUpdate(order.id, 'Cancelled')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;