import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getUserOrders,
  getOrderById,
  createOrder,
  cancelOrder,
} from '../services/orderService';

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getUserOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async (notes = '') => {
    try {
      const newOrder = await createOrder(notes);
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    }
  };

  const cancelUserOrder = async (id, reason) => {
    try {
      await cancelOrder(id, reason);
      setOrders((prev) =>
        prev.map((order) =>
          order.orderId === id ? { ...order, status: 'Cancelled' } : order
        )
      );
    } catch (error) {
      console.error('Order cancellation failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        fetchOrders,
        placeOrder,
        cancelUserOrder,
        getOrderById,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
