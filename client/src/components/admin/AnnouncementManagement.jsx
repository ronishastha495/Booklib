import React, { useState, useEffect } from 'react';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementActive,
  getAnnouncementCategories,
} from '../../services/adminapis';

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    content: '',
    startDate: '',
    endDate: '',
    isActive: false,
    category: '',
    bookId: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAnnouncements();
      setAnnouncements(response.data);
    } catch {
      setError('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAnnouncementCategories();
      setCategories(response.data);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchCategories();
  }, []);

  const resetForm = () => {
    setForm({
      title: '',
      content: '',
      startDate: '',
      endDate: '',
      isActive: false,
      category: '',
      bookId: '',
    });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await updateAnnouncement(editingId, form);
      } else {
        await createAnnouncement(form);
      }
      await fetchAnnouncements();
      resetForm();
    } catch {
      setError('Failed to save announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setForm({
      title: announcement.title,
      content: announcement.content,
      startDate: announcement.startDate ? announcement.startDate.substring(0, 10) : '',
      endDate: announcement.endDate ? announcement.endDate.substring(0, 10) : '',
      isActive: announcement.isActive,
      category: announcement.category || '',
      bookId: announcement.bookId || '',
    });
    setEditingId(announcement.announcementId);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    setLoading(true);
    setError(null);
    try {
      await deleteAnnouncement(id);
      await fetchAnnouncements();
    } catch {
      setError('Failed to delete announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await toggleAnnouncementActive(id);
      await fetchAnnouncements();
    } catch {
      setError('Failed to toggle active status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Announcement Management</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label className="block font-medium mb-1" htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1" htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={form.content}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={4}
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block font-medium mb-1" htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1" htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleInputChange}
              className="mr-2"
            />
            Active
          </label>
        </div>

        <div>
          <label className="block font-medium mb-1" htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1" htmlFor="bookId">Book ID (optional)</label>
          <input
            id="bookId"
            name="bookId"
            type="text"
            value={form.bookId}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter book ID if applicable"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {editingId ? 'Update Announcement' : 'Create Announcement'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="text-xl font-semibold mb-2">Announcements List</h3>
      {loading ? (
        <p>Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <p>No announcements found.</p>
      ) : (
        <table className="w-full border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-1">Title</th>
              <th className="border border-gray-300 px-2 py-1">Category</th>
              <th className="border border-gray-300 px-2 py-1">Active</th>
              <th className="border border-gray-300 px-2 py-1">Start Date</th>
              <th className="border border-gray-300 px-2 py-1">End Date</th>
              <th className="border border-gray-300 px-2 py-1">Book ID</th>
              <th className="border border-gray-300 px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((a) => (
              <tr key={a.announcementId}>
                <td className="border border-gray-300 px-2 py-1">{a.title}</td>
                <td className="border border-gray-300 px-2 py-1">{a.category}</td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={a.isActive}
                    onChange={() => handleToggleActive(a.announcementId)}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">{a.startDate?.substring(0, 10)}</td>
                <td className="border border-gray-300 px-2 py-1">{a.endDate?.substring(0, 10)}</td>
                <td className="border border-gray-300 px-2 py-1">{a.bookId}</td>
                <td className="border border-gray-300 px-2 py-1 space-x-2">
                  <button
                    onClick={() => handleEdit(a)}
                    className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.announcementId)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AnnouncementManagement;
