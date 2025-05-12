import { useState } from 'react';
import { Eye, CheckCircle, XCircle, Search } from 'lucide-react';
import { useOrder } from '../../contexts/OrderContext'; // Adjust the import path as needed
import { useAuth } from '../../contexts/AuthContext';

export default function StaffDashboard() {
  const { orders = [], loading, fetchOrders } = useOrder() || {};

  const { auth } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.member?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = order.status === statusFilter || statusFilter === 'All';
    return matchesSearch && matchesStatus;
  });

  // Handle order status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      // You might want to add API calls here to update the status in the backend
      // For example:
      // if (newStatus === 'Cancelled') {
      //   await cancelOrder(id, 'Changed by staff');
      // }
      // Then update the local state
      setOrders(orders.map(order => 
        order.id === id ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  // Handle view order details
  const handleViewOrder = (id) => {
    // You can use getOrderById from the context if needed
    const order = orders.find(o => o.id === id);
    console.log('Order details:', order);
    // Or show a modal with details
    alert(`View details for order ID: ${id}\nMember: ${order.member?.name}\nTotal: ${order.total}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Staff Dashboard - Order Management</h1>
        <div className="flex justify-center items-center h-64">
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Staff Dashboard - Order Management</h1>

      {auth && (
        <div className="mb-6 flex items-center space-x-4 bg-white p-4 rounded shadow">
          {auth.icon ? (
            <img
              src={auth.icon}
              alt="User Icon"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg">
              {auth.name ? auth.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-gray-900">{auth.name}</p>
            <p className="text-sm text-gray-600">{auth.email}</p>
          </div>
        </div>
      )}
      
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search orders..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="statusFilter" className="text-gray-700 font-medium">Status:</label>
          <select
            id="statusFilter"
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Items</th>
                <th className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total</th>
                <th className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                    order.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </th>
                <th className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => handleViewOrder(order.id)} 
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    
                    {order.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => handleStatusChange(order.id, 'Confirmed')} 
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(order.id, 'Cancelled')} 
                          className="text-red-600 hover:text-red-900"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.orderNumber || `ORD-${order.id}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.member?.name || 'Guest User'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.items?.length || order.products?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        order.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => handleViewOrder(order.id)} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        
                        {order.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(order.id, 'Confirmed')} 
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleStatusChange(order.id, 'Cancelled')} 
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredOrders.length}</span> orders
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
