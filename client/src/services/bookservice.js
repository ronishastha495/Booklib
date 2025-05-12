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
    getStockInfo: async (bookId) => {
    try {
      const response = await api.get(`/Book/StockInfo/${bookId}`);
      return {
        available: response.data.stockQuantity,
        onSale: response.data.onSale,
        discountPrice: response.data.discountPrice
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get filtered books with pagination and sorting
   // Enhanced getFiltered with caching
  getFilteredBooks: async (filters) => {
    try {
      // Create a cache key based on filters
      const cacheKey = `books_${JSON.stringify(filters)}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const response = await api.get('/Book/GetFiltered', { 
        params: filters,
        headers: {
          'Cache-Control': 'max-age=300' // 5 minutes
        }
      });
      
      // Cache the response
      sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // Get book by ID
  getBookById: async (bookId) => {
    try {
   const response = await api.get(`/Book/${bookId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new book
  createBook: async (bookData) => {
    try {
      const response = await api.post('/Book/Create', bookData);
      // Clear relevant caches
      sessionStorage.removeItem('books_categories');
      sessionStorage.removeItem('books_all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a book
  updateBook: async (bookId, bookData) => {
    try {
    const response = await api.put(`/Book/Update/${bookId}`, bookData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a book
  deleteBook: async (bookId) => {
    try {
      const response = await api.delete(`/Book/Delete/${bookId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update book stock
  updateStock: async (bookId, quantity) => {
    try {
    const response = await api.patch(`/Book/UpdateStock/${bookId}`, { quantity });
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