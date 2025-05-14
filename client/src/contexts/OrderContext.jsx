import React, { createContext, useContext, useEffect, useState } from 'react';
import orderService from '../services/orderService';
import { toast } from 'sonner'; // Assuming you're using sonner for notifications

const OrderContext = createContext();

export { OrderContext };

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [wsConnections, setWsConnections] = useState({ orders: null, notifications: null });

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

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getNotifications();
      setNotifications(response);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    setLoading(true);
    setError(null);
    try {
      await orderService.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setError(err.message || 'Failed to mark notification as read');
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

  // Process claim code
  const handleProcessClaimCode = async (claimCode) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.processClaimCode(claimCode);
      await fetchPendingOrders();
      return response;
    } catch (err) {
      console.error('Failed to process claim code:', err);
      setError(err.response?.data?.message || 'Failed to process claim code');
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

  // Setup WebSocket connections for real-time updates
  useEffect(() => {
    // Initialize WebSocket connections
    const token = localStorage.getItem('token');
    if (!token) return;

    const setupWebSockets = () => {
      // Close existing connections if they exist
      if (wsConnections.orders) wsConnections.orders.close();
      if (wsConnections.notifications) wsConnections.notifications.close();

      const ordersWs = new WebSocket(`ws://localhost:5259/ws/orders`);
      const notificationsWs = new WebSocket(`ws://localhost:5259/ws/notifications`);

      ordersWs.onopen = () => {
        console.log('Orders WebSocket Connected');
        ordersWs.send(JSON.stringify({ type: 'auth', token }));
      };

      notificationsWs.onopen = () => {
        console.log('Notifications WebSocket Connected');
        notificationsWs.send(JSON.stringify({ type: 'auth', token }));
      };

      ordersWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_ORDER') {
          setOrders(prev => [data.order, ...prev]);
          
          // Add to user orders if belongs to current user
          if (data.order.userId === localStorage.getItem('userId')) {
            setUserOrders(prev => [data.order, ...prev]);
            toast.info(`Your order #${data.order.orderId} has been created`);
          } else {
            // Show notification for new orders to staff
            toast.info(`New order received: #${data.order.orderId}`);
          }
        }
      };

      notificationsWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_NOTIFICATION') {
          setNotifications(prev => [data.notification, ...prev]);
          // Play a sound or show a toast for new notifications
          toast.info('New notification received');
        }
      };

      ordersWs.onerror = (error) => {
        console.error('Orders WebSocket Error:', error);
      };

      notificationsWs.onerror = (error) => {
        console.error('Notifications WebSocket Error:', error);
      };

      ordersWs.onclose = () => {
        console.log('Orders WebSocket disconnected');
        // Attempt to reconnect after a delay
        setTimeout(setupWebSockets, 5000);
      };

      notificationsWs.onclose = () => {
        console.log('Notifications WebSocket disconnected');
        // Attempt to reconnect after a delay
        setTimeout(setupWebSockets, 5000);
      };

      setWsConnections({ orders: ordersWs, notifications: notificationsWs });
    };

    // Fetch initial data
    fetchUserOrders();
    fetchPendingOrders();
    fetchNotifications();
    
    // Setup websocket connections
    setupWebSockets();

    // Cleanup function
    return () => {
      if (wsConnections.orders?.readyState === WebSocket.OPEN) {
        wsConnections.orders.close();
      }
      if (wsConnections.notifications?.readyState === WebSocket.OPEN) {
        wsConnections.notifications.close();
      }
    };
  }, []); // Empty dependency array since this should only run once on mount

  return (
    <OrderContext.Provider
      value={{
        orders,
        userOrders,
        notifications,
        loading,
        error,
        fetchUserOrders,
        fetchPendingOrders,
        fetchNotifications,
        markNotificationAsRead,
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