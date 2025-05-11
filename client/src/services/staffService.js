import api from './api';

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/staff/dashboard-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getPendingOrders = async () => {
  try {
    const response = await api.get('/staff/orders/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    throw error;
  }
};

export const processClaimCode = async (claimCode) => {
  try {
    const response = await api.post('/staff/process-claim', { claimCode });
    return response.data;
  } catch (error) {
    console.error('Error processing claim code:', error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const response = await api.get('/staff/orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};
