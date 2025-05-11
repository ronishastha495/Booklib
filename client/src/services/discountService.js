import axios from 'axios';

const API_BASE_URL = 'http://localhost:5259/api/Discount'; // Adjust if hosted differently

const discountService = {
  getAllDiscounts: async () => {
    const response = await axios.get(`${API_BASE_URL}/GetAll`);
    return response.data;
  },

  getActiveDiscounts: async () => {
    const response = await axios.get(`${API_BASE_URL}/GetActive`);
    return response.data;
  },

  getDiscountById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/GetById/${id}`);
    return response.data;
  },

  createDiscount: async (discountData) => {
    const response = await axios.post(`${API_BASE_URL}/Create`, discountData);
    return response.data;
  },

  updateDiscount: async (id, discountData) => {
    const response = await axios.put(`${API_BASE_URL}/Update/${id}`, discountData);
    return response.data;
  },

  deleteDiscount: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/Delete/${id}`);
    return response.data;
  }
};

export default discountService;
