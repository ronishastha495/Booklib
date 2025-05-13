import React, { createContext, useContext, useEffect, useState } from 'react';
import orderService from '../services/orderService';

const OrderContext = createContext();

export { OrderContext };

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wsConnections, setWsConnections] = useState({ orders: null, notifications: null });

  
  const fetchPendingOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getPendingOrders();
      setOrders(response);
    } catch (err) {
      console.error('Failed to load pending orders:', err);
      setError(err.message || 'Failed to load pending orders');
    } finally {
      setLoading(false);
    }
  };

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

  const placeOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.createOrder(orderData);
      setOrders((prev) => [response, ...prev]);
      return response;
    } catch (err) {
      console.error('Order creation failed:', err);
      setError(err.message || 'Order creation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelUserOrder = async (id, reason) => {
    setLoading(true);
    setError(null);
    try {
      await orderService.cancelOrder(id, reason);
      setOrders((prev) =>
        prev.map((order) =>
          order.orderId === id ? { ...order, status: 'Cancelled' } : order
        )
      );
    } catch (err) {
      console.error('Order cancellation failed:', err);
      setError(err.message || 'Order cancellation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

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

  const getOrderById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrderById(id);
      return response;
    } catch (err) {
      console.error('Failed to fetch order:', err);
      setError(err.message || 'Failed to fetch order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchOrderByClaimCode = async (claimCode) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrderByClaimCode(claimCode);
      setOrders((prev) => {
        const existingIndex = prev.findIndex((o) => o.claimCode === claimCode);
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
      setError(err.message || 'Order not found for the given claim code');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    fetchNotifications();

    const wsOrders = orderService.setupOrderUpdates((newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    const wsNotifications = orderService.setupNotificationUpdates((newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    });

    return () => {
      wsOrders.close();
      wsNotifications.close();
    };
  }, []);

  useEffect(() => {
  const fetchInitialData = async () => {
    try {
      await fetchPendingOrders();
      await fetchNotifications();
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  fetchInitialData();

  // Setup WebSocket connections with proper authentication
  const token = localStorage.getItem('token');
  
  const wsOrders = new WebSocket(`ws://localhost:5259/ws/orders`);
  const wsNotifications = new WebSocket(`ws://localhost:5259/ws/notifications`);

  // Add connection handlers
  wsOrders.onopen = () => {
    console.log('Orders WebSocket Connected');
    // Send authentication token
    wsOrders.send(JSON.stringify({ type: 'auth', token }));
  };

  wsNotifications.onopen = () => {
    console.log('Notifications WebSocket Connected');
    // Send authentication token
    wsNotifications.send(JSON.stringify({ type: 'auth', token }));
  };

  wsOrders.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'NEW_ORDER') {
      setOrders((prev) => [data.order, ...prev]);
    }
  };

  wsNotifications.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'NEW_NOTIFICATION') {
      setNotifications((prev) => [data.notification, ...prev]);
    }
  };

  wsOrders.onerror = (error) => {
    console.error('Orders WebSocket Error:', error);
  };

  wsNotifications.onerror = (error) => {
    console.error('Notifications WebSocket Error:', error);
  };

  // Cleanup function
  return () => {
    if (wsOrders.readyState === WebSocket.OPEN) {
      wsOrders.close();
    }
    if (wsNotifications.readyState === WebSocket.OPEN) {
      wsNotifications.close();
    }
  };
}, []); // Empty dependency array since this should only run once on mount
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
        }
      };

      notificationsWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_NOTIFICATION') {
          setNotifications(prev => [data.notification, ...prev]);
          // Play a sound or show a toast for new notifications
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

    setupWebSockets();

    // Fetch initial data
    fetchPendingOrders();
    fetchNotifications();

    // Cleanup function
    return () => {
      if (wsConnections.orders?.readyState === WebSocket.OPEN) {
        wsConnections.orders.close();
      }
      if (wsConnections.notifications?.readyState === WebSocket.OPEN) {
        wsConnections.notifications.close();
      }
    };
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        setOrders,
        notifications,
        loading,
        error,
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