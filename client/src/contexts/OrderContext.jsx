import React, { createContext, useContext, useEffect, useState } from 'react';
import orderService from '../services/orderService';

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    await fetchPendingOrders(); // Refresh the order list
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
      // Add or update the order in the orders state
      setOrders((prev) => {
        const existingIndex = prev.findIndex((o) => o.claimCode === claimCode);
        if (existingIndex !== -1) {
          // Update existing order
          const updatedOrders = [...prev];
          updatedOrders[existingIndex] = response;
          return updatedOrders;
        }
        // Add new order to the top
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
    
    // Setup WebSocket for real-time updates
    const ws = orderService.setupOrderUpdates((newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    return () => ws.close();
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        setOrders,
        loading,
        error,
        fetchPendingOrders,
        placeOrder,
        cancelUserOrder,
        getOrderById: orderService.getOrderById,
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