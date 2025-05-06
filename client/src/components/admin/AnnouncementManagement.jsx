import { useState, useEffect } from 'react';
import { Bell, Plus, Edit, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState([]);
  const [books, setBooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    Title: '',
    Content: '',
    StartDate: new Date().toISOString().split('T')[0],
    EndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    IsActive: true,
    Category: '',
    BookId: '',
  });

  // Fetch announcements and books
  useEffect(() => {
    fetchAnnouncements();
    fetchBooks();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Announcement`);
      setAnnouncements(response.data);
    } catch (error) {
      toast.error('Failed to fetch announcements');
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
      const payload = {
        ...formData,
        BookId: formData.BookId ? formData.BookId : null,
      };
      if (editingAnnouncement) {
        await axios.put(`${API_BASE_URL}/Announcement/${editingAnnouncement.AnnouncementId}`, payload);
        toast.success('Announcement updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/Announcement`, payload);
        toast.success('Announcement created successfully');
      }
      fetchAnnouncements();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.Message || 'Operation failed');
    }
  };

  // Handle announcement deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await axios.delete(`${API_BASE_URL}/Announcement/${id}`);
        toast.success('Announcement deleted successfully');
        fetchAnnouncements();
      } catch (error) {
        toast.error('Failed to delete announcement');
        console.error(error);
      }
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/Announcement/${id}/toggle-active`);
      toast.success(`Announcement is now ${currentStatus ? 'inactive' : 'active'}`);
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to toggle announcement status');
      console.error(error);
    }
  };

  // Open modal for adding/editing
  const openModal = (announcement = null) => {
    setEditingAnnouncement(announcement);
    if (announcement) {
      setFormData({
        Title: announcement.Title,
        Content: announcement.Content,
        StartDate: new Date(announcement.StartDate).toISOString().split('T')[0],
        EndDate: new Date(announcement.EndDate).toISOString().split('T')[0],
        IsActive: announcement.IsActive,
        Category: announcement.Category || '',
        BookId: announcement.BookId || '',
      });
    } else {
      setFormData({
        Title: '',
        Content: '',
        StartDate: new Date().toISOString().split('T')[0],
        EndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        IsActive: true,
        Category: '',
        BookId: '',
      });
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAnnouncement(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <Toaster position="top-right" richColors />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-700">Manage Announcements</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add New Announcement
        </button>
      </div>

      {/* Announcements Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Title</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Category</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Book</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Start Date</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">End Date</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((announcement) => (
              <tr key={announcement.AnnouncementId} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800 font-medium">{announcement.Title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{announcement.Category || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{announcement.BookTitle || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(announcement.StartDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(announcement.EndDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleToggleActive(announcement.AnnouncementId, announcement.IsActive)}
                    className={`py-1 px-3 rounded-full text-xs font-medium ${
                      announcement.IsActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {announcement.IsActive ? (
                      <ToggleRight size={18} className="inline mr-1" />
                    ) : (
                      <ToggleLeft size={18} className="inline mr-1" />
                    )}
                    {announcement.IsActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(announcement)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.AnnouncementId)}
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

      {/* Modal for Adding/Editing Announcement */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-gray-700">
                {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="Title"
                    value={formData.Title}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    maxLength="200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    name="Content"
                    value={formData.Content}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    rows="4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    name="Category"
                    value={formData.Category}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Book (Optional)</label>
                  <select
                    name="BookId"
                    value={formData.BookId}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {books.map((book) => (
                      <option key={book.BookId} value={book.BookId}>
                        {book.Title}
                      </option>
                    ))}
                  </select>
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
                    name="IsActive"
                    checked={formData.IsActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-700">Is Active</label>
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
                  {editingAnnouncement ? 'Update Announcement' : 'Add Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}