import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  LogOut,
} from "lucide-react";
import { OrderContext } from "../../contexts/OrderContext";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

const StaffDashboard = () => {
  const {
    orders,
    setOrders,
    loading,
    error,
    fetchPendingOrders,
    handleProcessClaimCode,
    searchOrderByClaimCode,
  } = useContext(OrderContext);
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [processingOrders, setProcessingOrders] = useState({});
  const [processSuccess, setProcessSuccess] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchPendingOrders]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setProcessSuccess(null);
      setOrders([]);
      await fetchPendingOrders();
      return;
    }

    const tempOrderId = `search-${Date.now()}`;
    setProcessingOrders((prev) => ({ ...prev, [tempOrderId]: true }));

    try {
      const response = await searchOrderByClaimCode(searchTerm);
      setProcessSuccess({
        message: "Order found successfully",
        orderId: response.orderId,
        customerName: response.userName || "Unknown",
      });
      setOrders([response]);
    } catch (err) {
      setProcessSuccess(null);
      toast.error("Order not found");
    } finally {
      setProcessingOrders((prev) => {
        const updated = { ...prev };
        delete updated[tempOrderId];
        return updated;
      });
    }
  };

  const handleFulfillOrder = async (orderId) => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order?.claimCode) {
      setProcessSuccess(null);
      return;
    }

    setProcessingOrders((prev) => ({ ...prev, [orderId]: true }));

    try {
      const response = await handleProcessClaimCode(order.claimCode);
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.orderId === orderId ? { ...o, status: "Completed" } : o
        )
      );
      setProcessSuccess({
        message: "Order fulfilled successfully",
        orderId: response.OrderId || orderId,
        customerName: response.CustomerName || order.userName || "Unknown",
      });
    } catch (err) {
      setProcessSuccess(null);
      toast.success("Order fulfilled successfully!");
    } finally {
      setProcessingOrders((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const filteredOrders = Array.isArray(orders)
    ? searchTerm
      ? orders.filter((order) =>
          order?.claimCode?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : orders
    : [];

  const isProcessing = (orderId) => processingOrders[orderId];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl font-serif bg-gradient-to-br from-[#f7efe5] via-[#f5e9d4] to-[#f8f5e4] min-h-screen rounded-2xl shadow-lg border border-[#e5ccb5]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#7c5e3c]">Staff Dashboard</h1>
        {auth?.token && (
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 bg-[#c97b63] text-white rounded-md hover:bg-[#a9895a] focus:outline-none focus:ring-2 focus:ring-[#a9895a]"
            title="Logout"
          >
            <LogOut className="mr-2" size={18} />
            Logout
          </button>
        )}
      </div>

      {/* Search Section */}
      <div className="relative mb-6">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-[#a9895a]" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by Claim Code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-[#e5ccb5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a9895a] text-[#7c5e3c] bg-[#fff8f0]"
          />
        </form>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#f8e0e0] border border-[#c97b63] text-[#c97b63] rounded-md flex items-start">
          <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={18} />
          <div>{error}</div>
        </div>
      )}

      {processSuccess && (
        <div className="mb-6 p-4 bg-[#d1fae5] border border-[#065f46] text-[#065f46] rounded-md">
          <div className="flex items-center">
            <CheckCircle2 className="mr-2 text-[#065f46]" />
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
        <div className="p-4 bg-[#bfdbfe] border border-[#3b82f6] text-[#1e40af] rounded-md flex items-start">
          <Info className="mr-2 mt-0.5 flex-shrink-0" size={18} />
          <div>No orders found</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order?.orderId || Math.random()}
              className="bg-[#fff8f0] rounded-lg shadow-md overflow-hidden border border-[#e5ccb5]"
            >
              <div className="p-4 border-b border-[#e5ccb5] cursor-pointer flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-[#7c5e3c]">
                    Order #{order?.orderId || "N/A"}
                  </h3>
                  <span
                    className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${
                      order?.status === "Pending"
                        ? "bg-[#fefcbf] text-[#854d0e]"
                        : order?.status === "Completed"
                        ? "bg-[#d1fae5] text-[#065f46]"
                        : "bg-[#e5e7eb] text-[#4b5563]"
                    }`}
                  >
                    {order?.status || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#7c5e3c]">
                    Claim Code:{" "}
                    <span className="font-mono font-semibold">
                      {order?.claimCode || "N/A"}
                    </span>
                  </span>
                 <button
                    onClick={() => handleFulfillOrder(order?.orderId)}
                    disabled={processingOrders[order?.orderId]  || order?.status === "Completed"}
                    className={`px-3 py-1.5 text-sm rounded-md focus:outline-none focus:ring-2 flex items-center
                      ${order?.status === "Completed" 
                        ? "bg-[#fefcbf] text-[#854d0e] cursor-default" 
                        : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-gray-400"}`}
                  >
                    {processingOrders[order?.orderId]  ? (
                      <>
                        <Loader2 className="animate-spin mr-1" size={14} />
                        Processing...
                      </>
                    ) : order?.status === "Completed" ? (
                      "Order Fulfilled"
                    ) : (
                      "Fulfill Order"
                    )}
                  </button>

                  <button
                    onClick={() => toggleOrderExpand(order?.orderId)}
                    className="p-1 text-[#7c5e3c] hover:text-[#a9895a] focus:outline-none"
                  >
                    {expandedOrder === order?.orderId ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>
              </div>

              {expandedOrder === order?.orderId && (
                <div className="p-4 space-y-4 text-[#7c5e3c]">
                  {/* User Details Section */}
                  <div>
                    <h4 className="font-medium mb-2">User Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[#a9895a]">User ID</p>
                        <p>{order?.userId || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[#a9895a]">User Name</p>
                        <p>{order?.userName || "Unknown"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details Section */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[#a9895a]">Order Date</p>
                      <p>
                        {order?.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#a9895a]">Subtotal</p>
                      <p>${order?.subTotal?.toFixed(2) || "0.00"}</p>
                    </div>
                    <div>
                      <p className="text-[#a9895a]">Discount</p>
                      <p>{order?.discountPercentage || 0}%</p>
                    </div>
                    <div>
                      <p className="text-[#a9895a]">Final Total</p>
                      <p className="font-semibold">
                        ${order?.finalTotal?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Section */}
                  <div>
                    <h4 className="font-medium mb-2">Order Items</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[#e5ccb5]">
                        <thead className="bg-[#f5e9d4] text-[#a9895a]">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                              Book Title
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                              Quantity
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                              Unit Price
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                              Subtotal
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-[#fff8f0] divide-y divide-[#e5ccb5]">
                          {Array.isArray(order?.items) ? (
                            order.items.map((item) => (
                              <tr
                                key={`${order.orderId}-${item?.bookId || Math.random()}`}
                              >
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  {item?.bookTitle || "Unknown Book"}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  {item?.quantity || 0}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  ${item?.unitPrice?.toFixed(2) || "0.00"}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  ${item?.subtotal?.toFixed(2) || "0.00"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="4"
                                className="px-4 py-2 text-center text-sm text-[#a9895a]"
                              >
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
                      disabled={processingOrders[order?.orderId] || order?.status === "Completed"}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 flex items-center"
                    >
                      {processingOrders[order?.orderId] ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={18} />
                          Processing...
                        </>
                      ) : (
                        "Fulfill Order"
                      )}
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