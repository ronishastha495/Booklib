import axios from 'axios';

const API_URL = 'http://localhost:5259/api/Announcement';

export const getAnnouncements = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Failed to fetch announcements';
  }
};

export const getActiveAnnouncements = async () => {
  try {
    const response = await axios.get(`${API_URL}/active`);
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Failed to fetch active announcements';
  }
};

export const getAnnouncementsByCategory = async (category) => {
  try {
    const response = await axios.get(`${API_URL}/category/${category}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Failed to fetch announcements by category';
  }
};

export const getAnnouncement = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Failed to fetch announcement';
  }
};

export const getAnnouncementsByBook = async (bookId) => {
  try {
    const response = await axios.get(`${API_URL}/book/${bookId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Failed to fetch announcements by book';
  }
};

export const getAnnouncementCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Failed to fetch categories';
  }
};

export const createAnnouncement = async (announcement) => {
  try {
    const response = await axios.post(API_URL, announcement);
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Failed to create announcement';
  }
};

export const updateAnnouncement = async (id, announcement) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, announcement);
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Failed to update announcement';
  }
};

export const deleteAnnouncement = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Failed to delete announcement';
  }
};

export const toggleAnnouncementActive = async (id) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/toggle-active`);
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Failed to toggle announcement active status';
  }
};
