import { useState } from 'react';
import { Eye, CheckCircle, XCircle, Search } from 'lucide-react';

export default function StaffDashboard() {
  // Sample order data
  const initialOrders = [
    {
      id: 1,
      orderNumber: "ORD-2025-001",
      member: "John Smith",
      date: "2025-05-10",
      items: 3,
      total: "$45.99",
      status: "Pending",
    },
    {
      id: 2,
      orderNumber: "ORD-2025-002",
      member: "Sarah Johnson",
      date: "2025-05-09",
      items: 1,
      total: "$18.99",
      status: "Pending",
    },
    {
      id: 3,
      orderNumber: "ORD-2025-003",
      member: "Michael Davis",
      date: "2025-05-09",
      items: 5,
      total: "$87.50",
      status: "Pending",
    },
    {
      id: 4,
      orderNumber: "ORD-2025-004",
      member: "Emily Wilson",
      date: "2025-05-08",
      items: 2,
      total: "$32.98",
      status: "Pending",
    },
    {
      id: 5,
      orderNumber: "ORD-2025-005",
      member: "David Brown",
      date: "2025-05-08",
      items: 4,
      total: "$65.96",
      status: "Pending",
    },
    {
      id: 6,
      orderNumber: "ORD-2025-006",
      member: "Lisa Taylor",
      date: "2025-05-07",
      items: 1,
      total: "$20.99",
      status: "Pending",
    },
    {
      id: 7,
      orderNumber: "ORD-2025-007",
      member: "Robert Martinez",
      date: "2025-05-07",
      items: 3,
      total: "$42.97",
      status: "Pending",
    },
  ];

  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.member.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = order.status === statusFilter || statusFilter === 'All';
    return matchesSearch && matchesStatus;
  });

  // Handle order status change
  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  // Handle view order details (placeholder function)
  const handleViewOrder = (id) => {
    alert(`View details for order ID: ${id}`);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Staff Dashboard - Order Management</h1>
      
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.orderNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.member}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.total}</td>
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