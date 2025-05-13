import React from 'react';
import { FaTimes, FaCheckCircle, FaClock, FaBoxOpen, FaTimesCircle } from 'react-icons/fa';

const OrderDetailsModal = ({ order, onClose }) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          {/* Claim Code Highlight Box */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3 flex flex-col">
            <span className="text-sm text-indigo-600 font-medium">Claim Code:</span>
            <span className="text-lg font-bold text-indigo-700">{order.claimCode}</span>
            <span className="text-xs text-indigo-500 mt-1">Show this code when picking up your order</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusIcon(order.status)}
            <span className="text-lg font-medium capitalize">{order.status}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            {order.updatedAt && (
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{formatDate(order.updatedAt)}</p>
              </div>
            )}
            {order.cancelledAt && (
              <div>
                <p className="text-sm text-gray-500">Cancelled At</p>
                <p className="font-medium">{formatDate(order.cancelledAt)}</p>
              </div>
            )}
            {order.cancellationReason && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Cancellation Reason</p>
                <p className="font-medium">{order.cancellationReason}</p>
              </div>
            )}
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Order Items</h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.bookId} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{item.bookTitle}</p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Quantity: {item.quantity}</span>
                      {" • "}₹{item.unitPrice.toFixed(2)} each
                    </p>
                  </div>
                  <p className="font-medium">₹{(item.unitPrice * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <p>Subtotal</p>
              <p className="font-medium">₹{order.subTotal.toFixed(2)}</p>
            </div>
            {order.discountPercentage > 0 && (
              <div className="flex justify-between text-green-600">
                <p>Discount ({order.discountPercentage}%)</p>
                <p className="font-medium">-₹{(order.subTotal * order.discountPercentage / 100).toFixed(2)}</p>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-bold text-lg">
              <p>Total</p>
              <p>₹{order.finalTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-3 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;