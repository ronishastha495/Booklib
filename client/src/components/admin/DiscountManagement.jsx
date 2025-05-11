import React, { useEffect, useState } from 'react';
import { useDiscounts } from '../../contexts/DiscountContext';

const DiscountManager = () => {
  const {
    discounts,
    loading,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    fetchAllDiscounts,
  } = useDiscounts();

  const [form, setForm] = useState({
    bookId: '',
    percentage: '',
    startDate: '',
    endDate: '',
    isOnSale: false,
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAllDiscounts();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const discountData = {
      ...form,
      percentage: parseFloat(form.percentage),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
    };

    try {
      if (editingId) {
        await updateDiscount(editingId, discountData);
        setEditingId(null);
      } else {
        await createDiscount(discountData);
      }
      setForm({
        bookId: '',
        percentage: '',
        startDate: '',
        endDate: '',
        isOnSale: false,
      });
      fetchAllDiscounts();
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  const handleEdit = (discount) => {
    setForm({
      bookId: discount.bookId,
      percentage: discount.percentage,
      startDate: new Date(discount.startDate).toISOString().substring(0, 16),
      endDate: new Date(discount.endDate).toISOString().substring(0, 16),
      isOnSale: discount.isOnSale,
    });
    setEditingId(discount.discountId);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      await deleteDiscount(id);
      fetchAllDiscounts();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        {editingId ? 'Edit Discount' : 'Add Discount'}
      </h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" onSubmit={handleSubmit}>
        <input
          type="text"
          name="bookId"
          placeholder="Book ID"
          value={form.bookId}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="percentage"
          placeholder="Discount (%)"
          value={form.percentage}
          onChange={handleChange}
          min="0"
          max="100"
          required
          className="border p-2 rounded"
        />
        <input
          type="datetime-local"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="datetime-local"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <label className="flex items-center gap-2 col-span-2">
          <input
            type="checkbox"
            name="isOnSale"
            checked={form.isOnSale}
            onChange={handleChange}
          />
          Is On Sale?
        </label>
        <button type="submit" className="col-span-2 bg-blue-600 text-white py-2 rounded">
          {editingId ? 'Update Discount' : 'Create Discount'}
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-2">All Discounts</h3>
      {loading ? (
        <p>Loading...</p>
      ) : discounts.length === 0 ? (
        <p>No discounts available.</p>
      ) : (
        <div className="space-y-4">
          {discounts.map((d) => (
            <div key={d.discountId} className="border p-4 rounded shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <p><strong>Book Title:</strong> {d.bookTitle}</p>
                <p><strong>Discount:</strong> {d.percentage}%</p>
                <p><strong>From:</strong> {new Date(d.startDate).toLocaleString()}</p>
                <p><strong>To:</strong> {new Date(d.endDate).toLocaleString()}</p>
                <p><strong>On Sale:</strong> {d.isOnSale ? 'Yes' : 'No'}</p>
              </div>
              <div className="mt-2 md:mt-0 md:ml-4 flex gap-2">
                <button onClick={() => handleEdit(d)} className="bg-yellow-500 px-3 py-1 text-white rounded">
                  Edit
                </button>
                <button onClick={() => handleDelete(d.discountId)} className="bg-red-600 px-3 py-1 text-white rounded">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscountManager;
