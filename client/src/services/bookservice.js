import axios from 'axios';
import api from './api';

const BookService = {
  // Get all books
  getAllBooks: async () => {
    try {
      const response = await api.get('/Book/GetAll');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get filtered books with pagination and sorting
  getFilteredBooks: async (filters) => {
    try {
      const response = await api.get('/Book/GetFiltered', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get book by ID
  getBookById: async (id) => {
    try {
      const response = await api.get(`/Book/GetById/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new book
  createBook: async (bookData) => {
    try {
      const response = await api.post('/Book/Create', bookData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a book
  updateBook: async (id, bookData) => {
    try {
      const response = await api.put(`/Book/Update/${id}`, bookData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a book
  deleteBook: async (id) => {
    try {
      const response = await api.delete(`/Book/Delete/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update book stock
  updateStock: async (id, quantity) => {
    try {
      const response = await api.patch(`/Book/UpdateStock/${id}`, { quantity });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get books by author
  getBooksByAuthor: async (authorName) => {
    try {
      const response = await api.get(`/Book/GetByAuthor/${authorName}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all authors
  getAllAuthors: async () => {
    try {
      const response = await api.get('/Book/GetAuthors');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get books by category
  getBooksByCategory: async (category) => {
    try {
      const response = await api.get(`/Book/Categories/${category}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get category counts
  getCategoryCounts: async () => {
    try {
      const response = await api.get('/Book/Categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default BookService;