import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5259/api/Order';

const API_URL = 'http://localhost:5259/api';

const orderService = {
  createOrder: async (orderData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/Order`, orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    }
  },

  getOrder: async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/Order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get order:', error);
      throw error;
    }
  }
};

export default orderService;