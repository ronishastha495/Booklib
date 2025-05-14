import axios from 'axios';

const API_BASE_URL = 'http://localhost:5259/api/Discount';

const discountService = {
  getAllDiscounts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/GetAll`);
      return response.data;
    } catch (error) {
      console.error('Error getting all discounts:', error);
      throw error;
    }
  },

  getActiveDiscounts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/GetActive`);
      return response.data;
    } catch (error) {
      console.error('Error getting active discounts:', error);
      throw error;
    }
  },

  getDiscountById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/GetById/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting discount with id ${id}:`, error);
      throw error;
    }
  },

 // Add this to your discountService.js file

// Modified createDiscount function with detailed error logging
createDiscount: async (discountData) => {
  try {
    // Log the exact data being sent
    console.log('Sending discount data to API:', JSON.stringify(discountData, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/Create`, discountData);
    return response.data;
  } catch (error) {
    // Enhanced error logging
    console.error('Error creating discount:', error);
    
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error('Server response data:', error.response.data);
      console.error('Server response status:', error.response.status);
      console.error('Server response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something else caused the error
      console.error('Error message:', error.message);
    }
    
    throw error;
  }
},

  updateDiscount: async (id, discountData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/Update/${id}`, discountData);
      return response.data;
    } catch (error) {
      console.error(`Error updating discount with id ${id}:`, error);
      throw error;
    }
  },

  deleteDiscount: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/Delete/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting discount with id ${id}:`, error);
      throw error;
    }
  }
};

export default discountService;