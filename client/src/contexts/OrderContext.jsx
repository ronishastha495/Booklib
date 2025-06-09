import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import orderService from '../services/orderService';
import { toast } from 'sonner';

const OrderContext = createContext();

export { OrderContext };

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userOrders, setUserOrders] = useState([]);

  const ordersSocketRef = useRef(null);
  const notificationsSocketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const fetchUserOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getUserOrders();
      setUserOrders(response);
    } catch (err) {
      console.error('Failed to load user orders:', err);
      setError(err.message || 'Failed to load user orders');
    } finally {
      setLoading(false);
    }
  };

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
      setNotifications(prev =>
        prev.map(n =>
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
      setOrders(prev => [response, ...prev]);
      setUserOrders(prev => [response, ...prev]);
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

  const cancelUserOrder = async (id, reason) => {
    setLoading(true);
    setError(null);
    try {
      await orderService.cancelOrder(id, reason);
      const updateStatus = (orders) =>
        orders.map(order =>
          order.orderId === id
            ? { ...order, status: 'Cancelled', cancellationReason: reason }
            : order
        );
      setOrders(updateStatus);
      setUserOrders(updateStatus);
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

  const searchOrderByClaimCode = async (claimCode) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrderByClaimCode(claimCode);
      setOrders(prev => {
        const existingIndex = prev.findIndex(o => o.claimCode === claimCode);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = response;
          return updated;
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

  const setupWebSockets = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token) return;

    if (ordersSocketRef.current) ordersSocketRef.current.close();
    if (notificationsSocketRef.current) notificationsSocketRef.current.close();

    const ordersWs = new WebSocket('ws://localhost:5259/ws/orders');
    const notificationsWs = new WebSocket('ws://localhost:5259/ws/notifications');

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
        if (data.order.userId === userId) {
          setUserOrders(prev => [data.order, ...prev]);
          toast.info(`Your order #${data.order.orderId} has been created`);
        } else {
          toast.info(`New order received: #${data.order.orderId}`);
        }
      }
    };

    notificationsWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_NOTIFICATION') {
        setNotifications(prev => [data.notification, ...prev]);
        toast.info('New notification received');
      }
    };

    const reconnect = () => {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        setupWebSockets();
      }, 5000);
    };

    ordersWs.onerror = (error) => {
      console.error('Orders WebSocket error:', error);
    };
    ordersWs.onclose = () => {
      console.warn('Orders WebSocket closed. Reconnecting...');
      reconnect();
    };

    notificationsWs.onerror = (error) => {
      console.error('Notifications WebSocket error:', error);
    };
    notificationsWs.onclose = () => {
      console.warn('Notifications WebSocket closed. Reconnecting...');
      reconnect();
    };

    ordersSocketRef.current = ordersWs;
    notificationsSocketRef.current = notificationsWs;
  };

  useEffect(() => {
    fetchUserOrders();
    fetchPendingOrders();
    fetchNotifications();
    setupWebSockets();

    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      ordersSocketRef.current?.close();
      notificationsSocketRef.current?.close();
    };
  }, []);

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
