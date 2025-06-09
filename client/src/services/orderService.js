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
  getOrders: async () => {
    try {
      const response = await axios.get(`${API_URL}/Order`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get orders:', error);
      throw error;
    }
  },
  

  getOrderById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/Order/${id}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get order by ID:', error);
      throw error;
    }
  },

  createOrder: async (orderData) => {
    try {
      const response = await axios.get(`${API_URL}/Order`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get orders:', error);
      throw error;
    }
  },
  
  // Get a specific order by ID
  getOrderById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/Order/${id}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get order:', error);
      throw error;
    }
  },
  
  // Create a new order with email confirmation
  createOrder: async (orderData) => {
    try {
      const response = await axios.post(`${API_URL}/Order`, orderData, {
        headers: getAuthHeaders()
      });

      // Log successful order creation and email sending
      console.log('Order created successfully:', response.data);
      console.log('Confirmation email will be sent automatically');

      return response.data;
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Order creation failed:', error.response.data);
        throw new Error(error.response.data || 'Failed to create order');
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw new Error('No response received from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        throw new Error('Error setting up request');
      }
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

  getOrderByClaimCode: async (claimCode) => {
    try {
      const response = await axios.get(`${API_URL}/staff/orders/${claimCode}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get order by claim code:', error);
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

  getNotifications: async () => {
    try {
      const response = await axios.get(`${API_URL}/Notification`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get notifications:', error);
      throw error;
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await axios.post(
        `${API_URL}/Notification/${notificationId}/mark-read`,
        {},
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  },

setupOrderUpdates: (callback) => {
    const ws = new WebSocket('ws://localhost:5259/ws/orders');
    
    ws.onopen = () => {
        // console.log('Connected to orders WebSocket');
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
        console.log('Disconnected from orders WebSocket');
    };
    
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_ORDER') {
                callback(data.order);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };
    
    return ws;
},

setupNotificationUpdates: (callback) => {
  const token = localStorage.getItem('token');
  const ws = new WebSocket('ws://localhost:5259/ws/notifications');
  
  ws.onopen = () => {
    // console.log('Notifications WebSocket Connected');
    ws.send(JSON.stringify({ type: 'auth', token }));
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_NOTIFICATION') {
        callback(data.notification);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
  };

  return ws;
}
};

export default orderService;