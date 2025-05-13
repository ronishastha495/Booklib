import api from './api';

const orderService = {
  // Get all orders for the current user
  getOrders: async () => {
    return await api.get('/Order');
  },
  
  // Get a specific order by ID
  getOrderById: async (id) => {
    return await api.get(`/Order/${id}`);
  },
  
  // Create a new order
  createOrder: async (orderData) => {
    const response = await api.post('/Order', orderData);
    return response.data;
  },
  
  // Cancel an order
  cancelOrder: async (id, reason) => {
    return await api.post(`/Order/${id}/cancel`, { reason });
  }
};

export default orderService;