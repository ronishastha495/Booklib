import axios from 'axios';

const API_URL = 'http://localhost:5000/api/Order';

export const getUserOrders = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createOrder = async (notes = '') => {
  const response = await axios.post(API_URL, { notes });
  return response.data;
};

export const cancelOrder = async (id, reason) => {
  const response = await axios.post(`${API_URL}/${id}/cancel`, reason, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};
