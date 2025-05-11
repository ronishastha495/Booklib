import React, { useState, useEffect } from 'react';
import { Package, Search, CheckCircle, PlusCircle, X } from 'react-feather';
import { toast } from 'sonner';
import { useBookContext } from '../../contexts/BookContext';
// import StockService from '../../services/StockService';

const InventoryManagement = () => {
  const { books, fetchAllBooks, loading, error } = useBookContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [stockUpdates, setStockUpdates] = useState({});
  const [orderFulfillment, setOrderFulfillment] = useState({
    orderId: '',
    books: []
  });
  const [replenishData, setReplenishData] = useState({
    bookId: '',
    quantity: 0
  });

  // Filter books based on search term
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle stock update input
  const handleStockUpdate = (bookId, value) => {
    setStockUpdates((prev) => ({
      ...prev,
      [bookId]: value
    }));
  };

  // Submit stock update
  const submitStockUpdate = async (bookId) => {
    const quantity = parseInt(stockUpdates[bookId], 10);
    if (isNaN(quantity) || quantity < 0) {
      toast.error('Invalid stock quantity');
      return;
    }
    try {
      await StockService.updateStock(bookId, quantity);
      await fetchAllBooks();
      toast.success('Stock updated successfully!');
      setStockUpdates((prev) => ({ ...prev, [bookId]: '' }));
    } catch (err) {
      toast.error('Failed to update stock');
    }
  };

  // Handle order fulfillment
  const handleOrderFulfillment = async (e) => {
    e.preventDefault();
    if (!orderFulfillment.orderId || orderFulfillment.books.length === 0) {
      toast.error('Please provide order ID and books');
      return;
    }
    try {
      await StockService.fulfillOrder(orderFulfillment.orderId, orderFulfillment.books);
      await fetchAllBooks();
      toast.success('Order fulfilled successfully!');
      setOrderFulfillment({ orderId: '', books: [] });
    } catch (err) {
      toast.error('Failed to fulfill order');
    }
  };

  // Handle stock replenishment
  const handleReplenishStock = async (e) => {
    e.preventDefault();
    if (!replenishData.bookId || replenishData.quantity <= 0) {
      toast.error('Please select a book and provide a valid quantity');
      return;
    }
    try {
      await StockService.replenishStock(replenishData.bookId, replenishData.quantity);
      await fetchAllBooks();
      toast.success('Stock replenished successfully!');
      setReplenishData({ bookId: '', quantity: 0 });
    } catch (err) {
      toast.error('Failed to replenish stock');
    }
  };

  if (loading) return <div className="text-center py-10">Loading inventory...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error loading inventory: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-stone-800">Inventory Management</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search books..."
              className="w-full md:w-64 px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-stone-400" />
          </div>
        </div>

        {/* Stock Updates Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-stone-50 border-y border-stone-200">
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Title</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">ISBN</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Current Stock</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Update Stock</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.bookId} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="py-3 px-4 font-medium text-stone-800">{book.title}</td>
                  <td className="py-3 px-4 text-stone-600">{book.isbn}</td>
                  <td className="py-3 px-4 text-stone-600">{book.stockQuantity}</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      className="w-24 px-2 py-1 rounded-md border border-stone-300"
                      value={stockUpdates[book.bookId] || ''}
                      onChange={(e) => handleStockUpdate(book.bookId, e.target.value)}
                      placeholder="New stock"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <button
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                      onClick={() => submitStockUpdate(book.bookId)}
                      disabled={!stockUpdates[book.bookId]}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Fulfillment Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
        <h3 className="text-lg font-semibold text-stone-800 mb-6">Fulfill Order</h3>
        <form onSubmit={handleOrderFulfillment} className="space-y-4">
          <div>
            <label className="block text-stone-700 font-medium mb-2">Order ID*</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={orderFulfillment.orderId}
              onChange={(e) => setOrderFulfillment({ ...orderFulfillment, orderId: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-stone-700 font-medium mb-2">Books in Order*</label>
            {orderFulfillment.books.map((book, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  className="w-full px-4 py-2 rounded-md border border-stone-300"
                  value={book.bookId}
                  onChange={(e) => {
                    const newBooks = [...orderFulfillment.books];
                    newBooks[index].bookId = e.target.value;
                    setOrderFulfillment({ ...orderFulfillment, books: newBooks });
                  }}
                >
                  <option value="">Select Book</option>
                  {books.map((b) => (
                    <option key={b.bookId} value={b.bookId}>{b.title}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="w-24 px-2 py-1 rounded-md border border-stone-300"
                  value={book.quantity}
                  onChange={(e) => {
                    const newBooks = [...orderFulfillment.books];
                    newBooks[index].quantity = parseInt(e.target.value, 10);
                    setOrderFulfillment({ ...orderFulfillment, books: newBooks });
                  }}
                  placeholder="Quantity"
                />
                <button
                  type="button"
                  className="p-1 text-red-500 hover:text-red-600"
                  onClick={() => {
                    const newBooks = orderFulfillment.books.filter((_, i) => i !== index);
                    setOrderFulfillment({ ...orderFulfillment, books: newBooks });
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="flex items-center gap-2 text-amber-600 hover:text-amber-700"
              onClick={() =>
                setOrderFulfillment({
                  ...orderFulfillment,
                  books: [...orderFulfillment.books, { bookId: '', quantity: 1 }]
                })
              }
            >
              <PlusCircle className="h-5 w-5" />
              Add Book
            </button>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
            disabled={loading}
          >
            Fulfill Order
          </button>
        </form>
      </div>

      {/* Stock Replenishment Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
        <h3 className="text-lg font-semibold text-stone-800 mb-6">Replenish Stock</h3>
        <form onSubmit={handleReplenishStock} className="space-y-4">
          <div>
            <label className="block text-stone-700 font-medium mb-2">Book*</label>
            <select
              className="w-full px-4 py-2 rounded-md border border-stone-300"
              value={replenishData.bookId}
              onChange={(e) => setReplenishData({ ...replenishData, bookId: e.target.value })}
              required
            >
              <option value="">Select Book</option>
              {books.map((book) => (
                <option key={book.bookId} value={book.bookId}>{book.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-stone-700 font-medium mb-2">Quantity to Add*</label>
            <input
              type="number"
              min="1"
              className="w-full px-4 py-2 rounded-md border border-stone-300"
              value={replenishData.quantity}
              onChange={(e) => setReplenishData({ ...replenishData, quantity: parseInt(e.target.value, 10) })}
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
            disabled={loading}
          >
            Replenish Stock
          </button>
        </form>
      </div>
    </div>
  );
};

export default InventoryManagement;