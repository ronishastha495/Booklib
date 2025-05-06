import { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, X } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState([]);
  const [books, setBooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formData, setFormData] = useState({
    BookId: '',
    Percentage: 0,
    StartDate: new Date().toISOString().split('T')[0],
    EndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    IsOnSale: false,
  });

  // Fetch discounts and books
  useEffect(() => {
    fetchDiscounts();
    fetchBooks();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Discount/GetAll`);
      setDiscounts(response.data);
    } catch (error) {
      toast.error('Failed to fetch discounts');
      console.error(error);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Book/GetAll`);
      setBooks(response.data);
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDiscount) {
        await axios.put(`${API_BASE_URL}/Discount/Update/${editingDiscount.DiscountId}`, formData);
        toast.success('Discount updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/Discount/Create`, formData);
        toast.success('Discount created successfully');
      }
      fetchDiscounts();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.Message || 'Operation failed');
    }
  };

  // Handle discount deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      try {
        await axios.delete(`${API_BASE_URL}/Discount/Delete/${id}`);
        toast.success('Discount deleted successfully');
        fetchDiscounts();
      } catch (error) {
        toast.error('Failed to delete discount');
      }
    }
  };

  // Open modal for adding/editing
  const openModal = (discount = null) => {
    setEditingDiscount(discount);
    if (discount) {
      setFormData({
        BookId: discount.BookId,
        Percentage: discount.Percentage,
        StartDate: new Date(discount.StartDate).toISOString().split('T')[0],
        EndDate: new Date(discount.EndDate).toISOString().split('T')[0],
        IsOnSale: discount.IsOnSale,
      });
    } else {
      setFormData({
        BookId: '',
        Percentage: 0,
        StartDate: new Date().toISOString().split('T')[0],
        EndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        IsOnSale: false,
      });
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDiscount(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <Toaster position="top-right" richColors />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-700">Manage Discounts</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add New Discount
        </button>
      </div>

      {/* Discounts Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Book Title</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Percentage</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Start Date</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">End Date</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((discount) => (
              <tr key={discount.DiscountId} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800 font-medium">{discount.BookTitle}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{discount.Percentage}%</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(discount.StartDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(discount.EndDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`py-1 px-3 rounded-full text-xs font-medium ${
                      discount.IsOnSale ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {discount.IsOnSale ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(discount)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(discount.DiscountId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Adding/Editing Discount */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-gray-700">
                {editingDiscount ? 'Edit Discount' : 'Add New Discount'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Book</label>
                  <select
                    name="BookId"
                    value={formData.BookId}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a book</option>
                    {books.map((book) => (
                      <option key={book.BookId} value={book.BookId}>
                        {book.Title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Percentage (%)</label>
                  <input
                    type="number"
                    name="Percentage"
                    value={formData.Percentage}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    name="StartDate"
                    value={formData.StartDate}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    name="EndDate"
                    value={formData.EndDate}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="IsOnSale"
                    checked={formData.IsOnSale}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-700">Is On Sale</label>
                </div>
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
                  {editingDiscount ? 'Update Discount' : 'Add Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}