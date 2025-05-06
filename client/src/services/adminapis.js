import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5259/api',
});

export const getBooks = (params) => api.get('/Book/GetFiltered', { params });
export const createBook = (data) => api.post('/Book/Create', data);
export const updateBook = (id, data) => api.put(`/Book/Update/${id}`, data);
export const deleteBook = (id) => api.delete(`/Book/Delete/${id}`);

export const getAllDiscounts = () => api.get('/Discount/GetAll');
export const getActiveDiscounts = () => api.get('/Discount/GetActive');
export const getDiscountById = (id) => api.get(`/Discount/GetById/${id}`);
export const createDiscount = (data) => api.post('/Discount/Create', data);
export const updateDiscount = (id, data) => api.put(`/Discount/Update/${id}`, data);
export const deleteDiscount = (id) => api.delete(`/Discount/Delete/${id}`);

export const getAnnouncements = () => api.get('/Announcement');
export const getActiveAnnouncements = () => api.get('/Announcement/active');
export const getAnnouncementsByCategory = (category) => api.get(`/Announcement/category/${category}`);
export const getAnnouncementById = (id) => api.get(`/Announcement/${id}`);
export const getAnnouncementsByBook = (bookId) => api.get(`/Announcement/book/${bookId}`);
export const getAnnouncementCategories = () => api.get('/Announcement/categories');
export const createAnnouncement = (data) => api.post('/Announcement', data);
export const updateAnnouncement = (id, data) => api.put(`/Announcement/${id}`, data);
export const deleteAnnouncement = (id) => api.delete(`/Announcement/${id}`);
export const toggleAnnouncementActive = (id) => api.patch(`/Announcement/${id}/toggle-active`);

export default api;