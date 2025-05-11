import React, { useState, useEffect } from 'react';
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementActive,
} from '../../services/announcementService';
import { useAnnouncementContext } from '../../contexts/AnnouncementContext';

const defaultCategories = ['General', 'Events', 'Updates', 'Promotions'];

const AnnouncementManagement = () => {
  const { announcements = [], categories: contextCategories = [], loading, error, fetchAnnouncements } = useAnnouncementContext();
  const [form, setForm] = useState({
    title: '',
    content: '',
    startDate: '',
    endDate: '',
    isActive: false,
    category: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [category, setCategory] = useState('');

  const allCategories = Array.from(new Set([...defaultCategories, ...contextCategories]));

  useEffect(() => {
    if (editingId && announcements.length > 0) {
      const announcementToEdit = announcements.find(a => a.announcementId === editingId);
      if (announcementToEdit && announcementToEdit.category) {
        setCategory(announcementToEdit.category);
        setForm(prev => ({ ...prev, category: announcementToEdit.category }));
      }
    } else if (!editingId) {
      setCategory('');
      setForm(prev => ({ ...prev, category: '' }));
    }
  }, [editingId, announcements]);

  const resetForm = () => {
    setForm({
      title: '',
      content: '',
      startDate: '',
      endDate: '',
      isActive: false,
      category: '',
    });
    setEditingId(null);
    setFormError(null);
    setCategory('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setForm((prev) => ({
      ...prev,
      category: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      const categoryToUse = category || defaultCategories[0];
      if (!form.title || !form.content || !form.startDate || !form.endDate || !categoryToUse) {
        setFormError('Please fill in all required fields.');
        return;
      }

      const startDateISO = new Date(form.startDate).toISOString();
      const endDateISO = new Date(form.endDate).toISOString();

      const formData = {
        title: form.title,
        content: form.content,
        startDate: startDateISO,
        endDate: endDateISO,
        isActive: form.isActive,
        category: categoryToUse,
      };

      if (editingId) {
        await updateAnnouncement(editingId, formData);
      } else {
        await createAnnouncement(formData);
      }
      await fetchAnnouncements();
      resetForm();
    } catch (err) {
      console.error('Error saving announcement:', err);
      if (err && err.errors) {
        const errorMessages = Object.entries(err.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
        setFormError(`Validation errors: ${errorMessages}`);
      } else {
        setFormError(err.message || 'Failed to save announcement');
      }
    }
  };

  const handleEdit = (announcement) => {
    setForm({
      title: announcement.title || '',
      content: announcement.content || '',
      startDate: announcement.startDate ? new Date(announcement.startDate).toISOString().substring(0, 10) : '',
      endDate: announcement.endDate ? new Date(announcement.endDate).toISOString().substring(0, 10) : '',
      isActive: announcement.isActive || false,
      category: announcement.category || '',
    });
    setCategory(announcement.category || '');
    setEditingId(announcement.announcementId);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      await fetchAnnouncements();
    } catch (err) {
      setFormError(err.message || 'Failed to delete announcement');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleAnnouncementActive(id);
      await fetchAnnouncements();
    } catch (err) {
      setFormError(err.message || 'Failed to toggle active status');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Announcement Management</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {formError && <p className="text-red-500 mb-4">{formError}</p>}

        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={form.content}
              onChange={handleInputChange}
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={handleCategoryChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select category</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {editingId ? 'Update Announcement' : 'Create Announcement'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <h3 className="text-xl font-semibold text-gray-800 mb-4">Announcements List</h3>
        {loading ? (
          <p className="text-gray-600">Loading announcements...</p>
        ) : !Array.isArray(announcements) || announcements.length === 0 ? (
          <p className="text-gray-600">No announcements found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {announcements.map((a) => (
                  <tr key={a.announcementId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="checkbox"
                        checked={a.isActive}
                        onChange={() => handleToggleActive(a.announcementId)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {a.startDate ? new Date(a.startDate).toISOString().substring(0, 10) : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {a.endDate ? new Date(a.endDate).toISOString().substring(0, 10) : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(a)}
                        className="inline-flex items-center px-3 py-1 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a.announcementId)}
                        className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementManagement;