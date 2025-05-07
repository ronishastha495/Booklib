import React, { useState, useEffect } from 'react';
import {
  getAllDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from '../../services/adminapis';

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [form, setForm] = useState({
    bookId: '',
    percentage: '',
    startDate: '',
    endDate: '',
    isOnSale: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDiscounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllDiscounts();
      setDiscounts(response.data);
    } catch {
      setError('Failed to fetch discounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const resetForm = () => {
    setForm({
      bookId: '',
      percentage: '',
      startDate: '',
      endDate: '',
      isOnSale: false,
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
        await updateDiscount(editingId, form);
      } else {
        await createDiscount(form);
      }
      await fetchDiscounts();
      resetForm();
    } catch {
      setError('Failed to save discount');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (discount) => {
    setForm({
      bookId: discount.bookId || '',
      percentage: discount.percentage || '',
      startDate: discount.startDate ? discount.startDate.substring(0, 10) : '',
      endDate: discount.endDate ? discount.endDate.substring(0, 10) : '',
      isOnSale: discount.isOnSale || false,
    });
    setEditingId(discount.discountId);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) return;
    setLoading(true);
    setError(null);
    try {
      await deleteDiscount(id);
      await fetchDiscounts();
    } catch {
      setError('Failed to delete discount');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Discount Management</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label className="block font-medium mb-1" htmlFor="bookId">Book ID</label>
          <input
            id="bookId"
            name="bookId"
            type="text"
            value={form.bookId}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1" htmlFor="percentage">Discount Percentage</label>
          <input
            id="percentage"
            name="percentage"
            type="number"
            min="0"
            max="100"
            value={form.percentage}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
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
              name="isOnSale"
              checked={form.isOnSale}
              onChange={handleInputChange}
              className="mr-2"
            />
            Active
          </label>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {editingId ? 'Update Discount' : 'Create Discount'}
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

      <h3 className="text-xl font-semibold mb-2">Discounts List</h3>
      {loading ? (
        <p>Loading discounts...</p>
      ) : discounts.length === 0 ? (
        <p>No discounts found.</p>
      ) : (
        <table className="w-full border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-1">Book ID</th>
              <th className="border border-gray-300 px-2 py-1">Percentage</th>
              <th className="border border-gray-300 px-2 py-1">Active</th>
              <th className="border border-gray-300 px-2 py-1">Start Date</th>
              <th className="border border-gray-300 px-2 py-1">End Date</th>
              <th className="border border-gray-300 px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((d) => (
              <tr key={d.discountId}>
                <td className="border border-gray-300 px-2 py-1">{d.bookId}</td>
                <td className="border border-gray-300 px-2 py-1">{d.percentage}%</td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  <input type="checkbox" checked={d.isOnSale} readOnly />
                </td>
                <td className="border border-gray-300 px-2 py-1">{d.startDate?.substring(0, 10)}</td>
                <td className="border border-gray-300 px-2 py-1">{d.endDate?.substring(0, 10)}</td>
                <td className="border border-gray-300 px-2 py-1 space-x-2">
                  <button
                    onClick={() => handleEdit(d)}
                    className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(d.discountId)}
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

export default DiscountManagement;
