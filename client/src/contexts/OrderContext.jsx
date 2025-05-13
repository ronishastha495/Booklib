import React, { createContext, useContext, useEffect, useState } from 'react';
import orderService from '../services/orderService';
import { toast } from 'sonner'; // Assuming you're using react-toastify for notifications

const OrderContext = createContext();

export { OrderContext };

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userOrders, setUserOrders] = useState([]); // Added for user-specific orders

  // Fetch user's orders
  const fetchUserOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getUserOrders();
      setUserOrders(response);
    } catch (err) {
      console.error('Failed to load user orders:', err);
      setError(err.message || 'Failed to load user orders');
      toast.error('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending orders (for staff)
  const fetchPendingOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getPendingOrders();
      setOrders(response);
    } catch (err) {
      console.error('Failed to load pending orders:', err);
      setError(err.message || 'Failed to load pending orders');
      toast.error('Failed to load pending orders');
    } finally {
      setLoading(false);
    }
  };

  // Place new order with automatic email confirmation
  const placeOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.createOrder(orderData);
      
      // Update both orders lists
      setOrders(prev => [response, ...prev]);
      setUserOrders(prev => [response, ...prev]);
      
      // Show success message
      toast.success('Order placed successfully! Check your email for confirmation.');
      
      return response;
    } catch (err) {
      console.error('Order creation failed:', err);
      const errorMessage = err.message || 'Order creation failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancel user order
  const cancelUserOrder = async (id, reason) => {
    setLoading(true);
    setError(null);
    try {
      await orderService.cancelOrder(id, reason);
      
      // Update both order lists
      const updateOrderStatus = (orders) =>
        orders.map(order =>
          order.orderId === id 
            ? { ...order, status: 'Cancelled', cancellationReason: reason }
            : order
        );
      
      setOrders(updateOrderStatus);
      setUserOrders(updateOrderStatus);
      
      toast.success('Order cancelled successfully');
    } catch (err) {
      console.error('Order cancellation failed:', err);
      const errorMessage = err.message || 'Order cancellation failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Process claim code (for staff)
  const handleProcessClaimCode = async (claimCode) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.processClaimCode(claimCode);
      await fetchPendingOrders(); // Refresh the order list
      toast.success('Claim code processed successfully');
      return response;
    } catch (err) {
      console.error('Failed to process claim code:', err);
      const errorMessage = err.response?.data?.message || 'Failed to process claim code';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get order by ID
  const getOrderById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrderById(id);
      return response;
    } catch (err) {
      console.error('Failed to fetch order:', err);
      const errorMessage = err.message || 'Failed to fetch order';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Search order by claim code
  const searchOrderByClaimCode = async (claimCode) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrderByClaimCode(claimCode);
      
      // Update orders state
      setOrders(prev => {
        const existingIndex = prev.findIndex(o => o.claimCode === claimCode);
        if (existingIndex !== -1) {
          const updatedOrders = [...prev];
          updatedOrders[existingIndex] = response;
          return updatedOrders;
        }
        return [response, ...prev];
      });
      
      return response;
    } catch (err) {
      console.error('Failed to search order by claim code:', err);
      const errorMessage = err.message || 'Order not found for the given claim code';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Setup real-time updates and initial data fetch
  useEffect(() => {
    fetchUserOrders(); // Load user's orders
    fetchPendingOrders(); // Load pending orders if user is staff
    
    // Setup WebSocket for real-time updates
    const ws = orderService.setupOrderUpdates((newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
      setUserOrders(prev => {
        if (newOrder.userId === localStorage.getItem('userId')) {
          return [newOrder, ...prev];
        }
        return prev;
      });
      
      // Show notification for new orders
      toast.info(`New order received: #${newOrder.orderId}`);
    });

    // Cleanup WebSocket connection
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        userOrders,
        loading,
        error,
        fetchUserOrders,
        fetchPendingOrders,
        placeOrder,
        cancelUserOrder,
        handleProcessClaimCode,
        getOrderById,
        searchOrderByClaimCode,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export default OrderProvider;