import { useState, useEffect } from 'react';
import { Book, Tag, Bell, Package, Search, Plus, Edit, Trash2, ChevronDown, X } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import axios from 'axios';
import DiscountManagement from './DiscountManagement';
import AnnouncementManagement from './AnnouncementManagement';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function BookAdmin() {
  const [activeTab, setActiveTab] = useState('Books');
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('All Genres');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    Title: '',
    Author: '',
    ImageURL: '',
    ISBN: '',
    Description: '',
    Genre: '',
    Price: 0,
    YearPublished: 0,
    Publisher: '',
    Language: '',
    Format: '',
    StockQuantity: 0,
    IsAvailable: true,
    OnSale: false,
    DiscountPrice: null,
    DiscountEndDate: null,
  });

  // Fetch books from API
  useEffect(() => {
    fetchBooks();
  }, [currentPage, searchTerm, genreFilter, statusFilter]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Book/GetFiltered`, {
        params: {
          search: searchTerm,
          genre: genreFilter !== 'All Genres' ? genreFilter : null,
          page: currentPage,
          pageSize: 10,
        },
      });
      setBooks(response.data.Books);
      setTotalPages(response.data.TotalPages);
    } catch (error) {
      toast.error('Failed to fetch books');
      console.error(error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle form submission for creating/updating books
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBook) {
        // Update book
        await axios.put(`${API_BASE_URL}/Book/Update/${editingBook.BookId}`, formData);
        toast.success('Book updated successfully');
      } else {
        // Create book
        await axios.post(`${API_BASE_URL}/Book/Create`, formData);
        toast.success('Book added successfully');
      }
      fetchBooks();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.Message || 'Operation failed');
    }
  };

  // Handle book deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`${API_BASE_URL}/Book/Delete/${id}`);
        toast.success('Book deleted successfully');
        fetchBooks();
      } catch (error) {
        toast.error('Failed to delete book');
      }
    }
  };

  // Open modal for adding/editing
  const openModal = (book = null) => {
    setEditingBook(book);
    if (book) {
      setFormData({
        Title: book.Title,
        Author: book.Author,
        ImageURL: book.ImageURL,
        ISBN: book.ISBN,
        Description: book.Description,
        Genre: book.Genre,
        Price: book.Price,
        YearPublished: book.YearPublished,
        Publisher: book.Publisher,
        Language: book.Language,
        Format: book.Format,
        StockQuantity: book.StockQuantity,
        IsAvailable: book.IsAvailable,
        OnSale: book.OnSale,
        DiscountPrice: book.DiscountPrice,
        DiscountEndDate: book.DiscountEndDate ? new Date(book.DiscountEndDate).toISOString().split('T')[0] : null,
      });
    } else {
      setFormData({
        Title: '',
        Author: '',
        ImageURL: '',
        ISBN: '',
        Description: '',
        Genre: '',
        Price: 0,
        YearPublished: 0,
        Publisher: '',
        Language: '',
        Format: '',
        StockQuantity: 0,
        IsAvailable: true,
        OnSale: false,
        DiscountPrice: null,
        DiscountEndDate: null,
      });
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBook(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">BookLib Admin</h1>
        </div>
        <nav className="mt-2">
          {['Books', 'Discounts', 'Announcements', 'Inventory'].map((tab) => (
            <button
              key={tab}
              className={`flex items-center w-full px-6 py-3 text-left ${
                activeTab === tab ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Books' && <Book size={20} className={`mr-3 ${activeTab === tab ? 'text-blue-600' : 'text-gray-400'}`} />}
              {tab === 'Discounts' && <Tag size={20} className={`mr-3 ${activeTab === tab ? 'text-blue-600' : 'text-gray-400'}`} />}
              {tab === 'Announcements' && <Bell size={20} className={`mr-3 ${activeTab === tab ? 'text-blue-600' : 'text-gray-400'}`} />}
              {tab === 'Inventory' && <Package size={20} className={`mr-3 ${activeTab === tab ? 'text-blue-600' : 'text-gray-400'}`} />}
              <span className="font-medium">{tab}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'Books' && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-medium text-gray-700">Book Inventory Management</h2>
                <button
                  onClick={() => openModal()}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} className="mr-2" />
                  Add New Book
                </button>
              </div>

              {/* Search and Filter */}
              <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search books..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="relative w-48">
                    <select
                      className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={genreFilter}
                      onChange={(e) => setGenreFilter(e.target.value)}
                    >
                      <option>All Genres</option>
                      <option>Fiction</option>
                      <option>Non-Fiction</option>
                      <option>Science</option>
                      <option>History</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative w-48">
                    <select
                      className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option>All Status</option>
                      <option>In Stock</option>
                      <option>Low Stock</option>
                      <option>Out of Stock</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Books Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Author</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Genre</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Stock</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book.BookId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">{book.Title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{book.Author}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{book.Genre}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">Rs.{book.Price}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{book.StockQuantity}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`py-1 px-3 rounded-full text-xs font-medium ${
                              book.StockQuantity > 5
                                ? 'bg-green-100 text-green-800'
                                : book.StockQuantity > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {book.StockQuantity > 5 ? 'In Stock' : book.StockQuantity > 0 ? 'Low Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <button onClick={() => openModal(book)} className="text-blue-500 hover:text-blue-700">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(book.BookId)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, books.length)} of {books.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        className={`px-3 py-1 rounded-md text-sm ${
                          currentPage === i + 1 ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Discounts' && <DiscountManagement />}

          {activeTab === 'Announcements' && <AnnouncementManagement />}

          {activeTab === 'Inventory' && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-medium text-gray-700 mb-4">Inventory Overview</h2>
              <p className="text-gray-500">Feature to manage inventory coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Adding/Editing Book */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-gray-700">{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="Title"
                    value={formData.Title}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Author</label>
                  <input
                    type="text"
                    name="Author"
                    value={formData.Author}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ISBN</label>
                  <input
                    type="text"
                    name="ISBN"
                    value={formData.ISBN}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    type="text"
                    name="ImageURL"
                    value={formData.ImageURL}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="Description"
                    value={formData.Description}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Genre</label>
                  <input
                    type="text"
                    name="Genre"
                    value={formData.Genre}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    name="Price"
                    value={formData.Price}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year Published</label>
                  <input
                    type="number"
                    name="YearPublished"
                    value={formData.YearPublished}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Publisher</label>
                  <input
                    type="text"
                    name="Publisher"
                    value={formData.Publisher}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <input
                    type="text"
                    name="Language"
                    value={formData.Language}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Format</label>
                  <input
                    type="text"
                    name="Format"
                    value={formData.Format}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md downtown:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                  <input
                    type="number"
                    name="StockQuantity"
                    value={formData.StockQuantity}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="IsAvailable"
                    checked={formData.IsAvailable}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-700">Is Available</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="OnSale"
                    checked={formData.OnSale}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-700">On Sale</label>
                </div>
                {formData.OnSale && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Discount Price</label>
                      <input
                        type="number"
                        name="DiscountPrice"
                        value={formData.DiscountPrice || ''}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Discount End Date</label>
                      <input
                        type="date"
                        name="DiscountEndDate"
                        value={formData.DiscountEndDate || ''}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingBook ? 'Update Book' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}