import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5259/api/Order';

const getAuthHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUserOrders = async () => {
  const response = await axios.get(API_URL, { headers: getAuthHeaders() });
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

export const createOrder = async (notes = '') => {
  const response = await axios.post(API_URL, { notes }, { headers: getAuthHeaders() });
  return response.data;
};

export const cancelOrder = async (id, reason) => {
  const response = await axios.post(`${API_URL}/${id}/cancel`, reason, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return response.data;
};
