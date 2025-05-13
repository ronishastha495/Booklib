import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Percent, Search, Save, X } from 'react-feather';
import { Toaster } from 'sonner';
import { useBookContext } from '../../contexts/BookContext';
import { useNavigate } from 'react-router-dom';
import AddBookForm from '../../components/admin/AddBookForm';

const Catalog = () => {
  const {
    books,
    filteredBooks,
    loading,
    error,
    pagination,
    fetchAllBooks,
    fetchFilteredBooks,
    createBook,
    updateBook,
    deleteBook,
    setPagination,
  } = useBookContext();

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [editingBookId, setEditingBookId] = useState(null);
  const [editBookData, setEditBookData] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Initialize pagination with pageSize of 5
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize: 5 }));
    fetchFilteredBooks({
      page: 1,
      pageSize: 5,
      search: searchTerm,
      genre: selectedGenre !== 'All Genres' ? selectedGenre : undefined,
    });
  }, []);

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      fetchFilteredBooks({
        page: newPage,
        pageSize: 5,
        search: searchTerm,
        genre: selectedGenre !== 'All Genres' ? selectedGenre : undefined,
      });
    }
  };

  // Handle search and filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchFilteredBooks({
        page: 1,
        pageSize: 5,
        search: searchTerm,
        genre: selectedGenre !== 'All Genres' ? selectedGenre : undefined,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedGenre, fetchFilteredBooks]);

  // Handle edit input changes
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditBookData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' || type === 'radio' ? checked : value,
    }));
  };

  // Handle edit submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!editingBookId) {
        alert('Invalid book ID for update.');
        return;
      }
      await updateBook(editingBookId, editBookData);
      setEditingBookId(null);
      setEditBookData(null);
    } catch (err) {
      console.error('Error updating book:', err);
    }
  };

  // Start editing a book
  const startEditing = (book) => {
    setEditingBookId(book.bookId);
    setEditBookData({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      genre: book.genre || '',
      publisher: book.publisher || '',
      publishedDate: book.publishedDate ? new Date(book.publishedDate).toISOString().split('T')[0] : '',
      language: book.language || '',
      format: book.format || '',
      price: book.price !== undefined && book.price !== null ? book.price : '',
      stockQuantity: book.stockQuantity !== undefined && book.stockQuantity !== null ? book.stockQuantity : 0,
      isBestseller: book.isBestseller || false,
      isAwardWinner: book.isAwardWinner || false,
      isComingSoon: book.isComingSoon || false,
      onSale: book.onSale || false,
      description: book.description || '',
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingBookId(null);
    setEditBookData(null);
  };

  // Handle delete with confirmation
  const handleDelete = async (bookId) => {
    if (!bookId) {
      alert('Invalid book ID for delete.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook(bookId);
      } catch (err) {
        console.error('Error deleting book:', err);
      }
    }
  };

  // Navigate to /discount
  const handleCreateDiscount = () => {
    navigate('/discount');
  };

  if (loading && !books.length) return <div className="text-center py-10">Loading books...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error loading books: {error.message}</div>;

  const displayedBooks = filteredBooks.length ? filteredBooks : books;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />
      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-stone-800">Book Catalog</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search books..."
                className="w-full md:w-64 px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-stone-400" />
            </div>
            <select
              className="px-4 py-2 rounded-md border border-stone-300 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option>All Genres</option>
              <option>Fiction</option>
              <option>Science Fiction</option>
              <option>Fantasy</option>
              <option>Historical Fiction</option>
              <option>Mystery</option>
              <option>Thriller</option>
              <option>Romance</option>
            </select>
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-5 w-5" />
              <span>Add Book</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-stone-50 border-y border-stone-200">
                <th className="text-left py-3 px-4 text-stone-500 font-medium">ID</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Title</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Author</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">ISBN</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Genre</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Format</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Stock</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Price</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedBooks.map((book) => (
                <tr key={book.bookId || `book-${Math.random()}`} className={`border-b border-stone-100 ${editingBookId === book.bookId ? 'bg-amber-50' : 'hover:bg-stone-50'}`}>
                  {editingBookId === book.bookId ? (
                    <td colSpan="10" className="py-4 px-4">
                      <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-stone-700 text-sm font-medium mb-1">Title*</label>
                          <input
                            type="text"
                            name="title"
                            className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm"
                            value={editBookData.title}
                            onChange={handleEditInputChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-stone-700 text-sm font-medium mb-1">Author*</label>
                          <input
                            type="text"
                            name="author"
                            className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm"
                            value={editBookData.author}
                            onChange={handleEditInputChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-stone-700 text-sm font-medium mb-1">ISBN*</label>
                          <input
                            type="text"
                            name="isbn"
                            className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm"
                            value={editBookData.isbn}
                            onChange={handleEditInputChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-stone-700 text-sm font-medium mb-1">Genre*</label>
                          <select
                            name="genre"
                            className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm"
                            value={editBookData.genre}
                            onChange={handleEditInputChange}
                            required
                          >
                            <option value="">Select Genre</option>
                            <option value="Fiction">Fiction</option>
                            <option value="Science Fiction">Science Fiction</option>
                            <option value="Fantasy">Fantasy</option>
                            <option value="Historical Fiction">Historical Fiction</option>
                            <option value="Mystery">Mystery</option>
                            <option value="Thriller">Thriller</option>
                            <option value="Romance">Romance</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-stone-700 text-sm font-medium mb-1">Price*</label>
                          <input
                            type="number"
                            name="price"
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm"
                            value={editBookData.price}
                            onChange={handleEditInputChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-stone-700 text-sm font-medium mb-1">Stock*</label>
                          <input
                            type="number"
                            name="stockQuantity"
                            min="0"
                            className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm"
                            value={editBookData.stockQuantity}
                            onChange={handleEditInputChange}
                            required
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <button
                            type="submit"
                            className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                            disabled={loading}
                          >
                            <Save className="h-4 w-4" />
                            Save
                          </button>
                          <button
                            type="button"
                            className="flex items-center gap-1 px-3 py-2 bg-stone-200 text-stone-700 rounded-md hover:bg-stone-300 text-sm"
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </button>
                        </div>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td className="py-3 px-4 font-medium text-stone-800">{book.bookId || 'N/A'}</td>
                      <td className="py-3 px-4 font-medium text-stone-800">{book.title}</td>
                      <td className="py-3 px-4 text-stone-600">{book.author}</td>
                      <td className="py-3 px-4 text-stone-600">{book.isbn}</td>
                      <td className="py-3 px-4 text-stone-600">{book.genre}</td>
                      <td className="py-3 px-4 text-stone-600">{book.format}</td>
                      <td className="py-3 px-4 text-stone-600">{book.stockQuantity}</td>
                      <td className="py-3 px-4 text-stone-600">${book.price}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            book.stockQuantity > 10
                              ? 'bg-green-100 text-green-800'
                              : book.stockQuantity > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {book.stockQuantity > 10 ? 'In Stock' : book.stockQuantity > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="p-1 rounded-md hover:bg-stone-100">
                            <Eye className="h-5 w-5 text-blue-500" />
                          </button>
                          <button
                            className="p-1 rounded-md hover:bg-stone-100"
                            onClick={() => startEditing(book)}
                          >
                            <Edit className="h-5 w-5 text-amber-500" />
                          </button>
                          <button
                            className="p-1 rounded-md hover:bg-stone-100"
                            onClick={() => handleDelete(book.bookId)}
                          >
                            <Trash2 className="h-5 w-5 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-stone-500 text-sm">
            Showing {displayedBooks.length} of {pagination.totalCount} books
          </p>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border border-stone-300 rounded-md text-stone-600 hover:bg-stone-50 disabled:opacity-50"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  className={`px-3 py-1 rounded-md ${
                    pageNum === pagination.page
                      ? 'bg-amber-500 text-white'
                      : 'border border-stone-300 text-stone-600 hover:bg-stone-50'
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}

            {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
              <span className="px-2">...</span>
            )}

            {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
              <button
                className="px-3 py-1 border border-stone-300 rounded-md text-stone-600 hover:bg-stone-50"
                onClick={() => handlePageChange(pagination.totalPages)}
              >
                {pagination.totalPages}
              </button>
            )}

            <button
              className="px-3 py-1 border border-stone-300 rounded-md text-stone-600 hover:bg-stone-50 disabled:opacity-50"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <AddBookForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-stone-800">Active Discounts</h3>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
            onClick={() => navigate('/discount')}
          >
            <Percent className="h-5 w-5" />
            <span>Create Discount</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-stone-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full mb-2">
                  Seasonal Sale
                </span>
                <h4 className="font-semibold text-stone-800">Spring Reading</h4>
                <p className="text-stone-500 text-sm">15% off selected titles</p>
              </div>
              <span className="text-xl font-bold text-purple-600">15%</span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-stone-500">Expires: May 30, 2025</p>
              <div className="flex gap-2">
                <button className="p-1 rounded-md hover:bg-stone-100">
                  <Edit className="h-4 w-4 text-amber-500" />
                </button>
                <button className="p-1 rounded-md hover:bg-stone-100">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 border border-stone-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mb-2">
                  Category Discount
                </span>
                <h4 className="font-semibold text-stone-800">Mystery Books</h4>
                <p className="text-stone-500 text-sm">10% off all mystery titles</p>
              </div>
              <span className="text-xl font-bold text-blue-600">10%</span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-stone-500">Expires: June 15, 2025</p>
              <div className="flex gap-2">
                <button className="p-1 rounded-md hover:bg-stone-100">
                  <Edit className="h-4 w-4 text-amber-500" />
                </button>
                <button className="p-1 rounded-md hover:bg-stone-100">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 border border-stone-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full mb-2">
                  Special Promotion
                </span>
                <h4 className="font-semibold text-stone-800">New Members</h4>
                <p className="text-stone-500 text-sm">20% off first purchase</p>
              </div>
              <span className="text-xl font-bold text-green-600">20%</span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-stone-500">Ongoing</p>
              <div className="flex gap-2">
                <button className="p-1 rounded-md hover:bg-stone-100">
                  <Edit className="h-4 w-4 text-amber-500" />
                </button>
                <button className="p-1 rounded-md hover:bg-stone-100">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;