import axios from 'axios';

const API_URL = 'http://localhost:5259/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const orderService = {
  createOrder: async (orderData) => {
    try {
      const response = await axios.post(`${API_URL}/Order`, orderData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    }
  },

  getOrder: async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/Order/${orderId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get order:', error);
      throw error;
    }
  },

  getUserOrders: async () => {
    try {
      const response = await axios.get(`${API_URL}/Order`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get user orders:', error);
      throw error;
    }
  },

  cancelOrder: async (orderId, reason) => {
    try {
      const response = await axios.post(
        `${API_URL}/Order/${orderId}/cancel`,
        { reason },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to cancel order:', error);
      throw error;
    }
  },

  getPendingOrders: async () => {
    try {
      const response = await axios.get(`${API_URL}/staff/orders/pending`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get pending orders:', error);
      throw error;
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/staff/orders/${orderId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get order by ID:', error);
      throw error;
    }
  },

  processClaimCode: async (claimCode) => {
    try {
      const response = await axios.post(
        `${API_URL}/staff/process-claim`,
        { claimCode },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to process claim code:', error);
      throw error;
    }
  },

  // New method for real-time updates
  setupOrderUpdates: (callback) => {
    const ws = new WebSocket('ws://localhost:5259/ws/orders');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_ORDER') {
        callback(data.order);
      }
    };
    return ws;
  }
};

export default orderService;