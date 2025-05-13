import React, { useContext, useState, useEffect } from "react";
import { Search, Loader2, CheckCircle2, AlertCircle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { OrderContext } from '../../contexts/OrderContext';

const StaffDashboard = () => {
  const { orders, setOrders, loading, error, fetchPendingOrders, getOrderById, handleProcessClaimCode, searchOrderByClaimCode } = useContext(OrderContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [processing, setProcessing] = useState(false);
  const [processSuccess, setProcessSuccess] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const interval = setInterval(fetchPendingOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchPendingOrders]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setProcessSuccess(null);
      setOrders([]); // Clear orders to show all when search is cleared
      await fetchPendingOrders();
      return;
    }

    try {
      setProcessing(true);
      const response = await searchOrderByClaimCode(searchTerm);
      setProcessSuccess({
        message: "Order found successfully",
        orderId: response.orderId,
        customerName: response.userName || "Unknown"
      });
    } catch (err) {
      setProcessSuccess(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleFulfillOrder = async (orderId) => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order?.claimCode) {
      setProcessSuccess(null);
      return;
    }

    try {
      setProcessing(true);
      const response = await handleProcessClaimCode(order.claimCode);
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.orderId === orderId ? { ...o, status: "Completed" } : o
        )
      );
      setProcessSuccess({
        message: "Order fulfilled successfully",
        orderId: response.OrderId || orderId,
        customerName: response.CustomerName || order.userName || "Unknown"
      });
    } catch (err) {
      setProcessSuccess(null);
    } finally {
      setProcessing(false);
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Filter orders based on searchTerm (optional, for visual filtering)
  const filteredOrders = Array.isArray(orders)
    ? searchTerm
      ? orders.filter((order) =>
          order?.claimCode?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : orders
    : [];

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Staff Dashboard</h1>

      {/* Search Section */}
      <div className="relative mb-6">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by Claim Code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-start">
          <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={18} />
          <div>{error}</div>
        </div>
      )}
      
      {processSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          <div className="flex items-center">
            <CheckCircle2 className="mr-2 text-green-600" />
            <h3 className="font-semibold">Success!</h3>
          </div>
          <p className="mt-1">{processSuccess.message}</p>
          <div className="mt-2 text-sm">
            <p>Order ID: {processSuccess.orderId}</p>
            <p>Customer: {processSuccess.customerName}</p>
          </div>
        </div>
      )}
      
      {filteredOrders.length === 0 ? (
        <div className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md flex items-start">
          <Info className="mr-2 mt-0.5 flex-shrink-0" size={18} />
          <div>No orders found</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order?.orderId || Math.random()} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Order #{order?.orderId || "N/A"}</h3>
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded"
  style={{
    backgroundColor: order?.status === "Pending" ? "#fefcbf" : 
                   order?.status === "Completed" ? "#d1fae5" : "#e5e7eb",
    color: order?.status === "Pending" ? "#854d0e" : 
           order?.status === "Completed" ? "#065f46" : "#4b5563"
  }}>
  {order?.status || "Unknown"}
</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      Claim Code: <span className="font-mono font-semibold">{order?.claimCode || "N/A"}</span>
                    </span>
                    <button
  onClick={() => handleFulfillOrder(order?.orderId)}
  disabled={processing || order?.status === "Completed"}
  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 flex items-center"
>
  {processing ? (
    <>
      <Loader2 className="animate-spin mr-1" size={14} />
      Processing...
    </>
  ) : order?.status === "Completed" ? "Order Fulfilled" : "Fulfill Order"}
</button>
                    <button 
                      onClick={() => toggleOrderExpand(order?.orderId)}
                      className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {expandedOrder === order?.orderId ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {expandedOrder === order?.orderId && (
                <div className="p-4 space-y-4">
                  {/* User Details Section */}
                  <div>
                    <h4 className="font-medium mb-2">User Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">User ID</p>
                        <p>{order?.userId || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">User Name</p>
                        <p>{order?.userName || "Unknown"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details Section */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Order Date</p>
                      <p>{order?.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Subtotal</p>
                      <p>${order?.subTotal?.toFixed(2) || "0.00"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Discount</p>
                      <p>{order?.discountPercentage || 0}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Final Total</p>
                      <p className="font-semibold">${order?.finalTotal?.toFixed(2) || "0.00"}</p>
                    </div>
                  </div>

                  {/* Order Items Section */}
                  <div>
                    <h4 className="font-medium mb-2">Order Items</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Book Title</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Array.isArray(order?.items) ? order.items.map((item) => (
                            <tr key={`${order.orderId}-${item?.bookId || Math.random()}`}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{item?.bookTitle || "Unknown Book"}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{item?.quantity || 0}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">${item?.unitPrice?.toFixed(2) || "0.00"}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">${item?.subtotal?.toFixed(2) || "0.00"}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="4" className="px-4 py-2 text-center text-sm text-gray-500">
                                No items found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleFulfillOrder(order?.orderId)}
                      disabled={processing || order?.status === "Completed"}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 flex items-center"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={18} />
                          Processing...
                        </>
                      ) : "Fulfill Order"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;