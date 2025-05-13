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

  createDiscount: async (discountData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/Create`, discountData);
      return response.data;
    } catch (error) {
      console.error('Error creating discount:', error);
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