import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import BookService from '../services/bookService';

const BookContext = createContext();

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });

  // Fetch all books
  const fetchAllBooks = async () => {
    setLoading(true);
    try {
      const data = await BookService.getAllBooks();
      setBooks(data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  // Fetch filtered books
  const fetchFilteredBooks = async (filters = {}) => {
    setLoading(true);
    try {
      const { page, pageSize, ...otherFilters } = filters;
      const params = {
        page: page || pagination.page,
        pageSize: pageSize || pagination.pageSize,
        ...otherFilters
      };
      
      const data = await BookService.getFilteredBooks(params);
      setFilteredBooks(data.books || data);
      
      if (data.totalCount) {
        setPagination({
          page: data.page,
          pageSize: data.pageSize,
          totalCount: data.totalCount,
          totalPages: data.totalPages
        });
      }
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  // Fetch books by category
  const fetchBooksByCategory = async (category) => {
    setLoading(true);
    try {
      const data = await BookService.getBooksByCategory(category);
      setFilteredBooks(data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  // Fetch category counts
  const fetchCategoryCounts = async () => {
    try {
      const data = await BookService.getCategoryCounts();
      setCategories(data);
    } catch (err) {
      setError(err);
    }
  };

  // Create book
  const createBook = async (bookData) => {
    setLoading(true);
    try {
      const data = await BookService.createBook(bookData);
      await fetchAllBooks();
      toast.success('Book added successfully!');
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update book
  const updateBook = async (bookId, bookData) => {
    setLoading(true);
    try {
      const data = await BookService.updateBook(bookId, bookData);
      await fetchAllBooks();
      toast.success('Book updated successfully!');
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete book
  const deleteBook = async (bookId) => {
    setLoading(true);
    try {
      const data = await BookService.deleteBook(bookId);
      await fetchAllBooks();
      toast.success('Book deleted successfully!');
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAllBooks();
    fetchCategoryCounts();
  }, []);

  return (
    <BookContext.Provider
      value={{
        books,
        filteredBooks,
        categories,
        loading,
        error,
        pagination,
        fetchAllBooks,
        fetchFilteredBooks,
        fetchBooksByCategory,
        createBook,
        updateBook,
        deleteBook,
        setPagination
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export const useBookContext = () => useContext(BookContext);