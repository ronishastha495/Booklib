import React, { useEffect, useState } from 'react';
import { useDiscounts } from '../../contexts/DiscountContext';
import { useBookContext } from '../../contexts/BookContext';
import { toast, Toaster } from 'sonner';
import { Calendar, Percent, Tag, Check, X, Edit, Trash2 } from 'lucide-react';

const DiscountManager = () => {
  const {
    discounts,
    loading: discountsLoading,
    error: discountsError,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    fetchAllDiscounts,
  } = useDiscounts();

  const {
    books,
    loading: booksLoading,
    error: booksError,
    fetchAllBooks,
  } = useBookContext();

  const [form, setForm] = useState({
    bookId: '',
    bookTitle: '',
    percentage: '',
    startDate: '',
    endDate: '',
    isOnSale: false,
  });

  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllDiscounts();
    fetchAllBooks();
  }, []);

  useEffect(() => {
    if (books && books.length > 0) {
      setFilteredBooks(
        searchTerm
          ? books.filter(book => 
              book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
              book.bookId.toString().includes(searchTerm)
            )
          : books
      );
    }
  }, [books, searchTerm]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // If book selection changes, update form with book title
    if (name === 'bookId' && value) {
      const selectedBook = books.find(book => book.bookId.toString() === value);
      if (selectedBook) {
        setForm(prev => ({
          ...prev,
          bookId: value,
          bookTitle: selectedBook.title
        }));
      }
    }
  };

  const validateForm = () => {
    if (!form.bookId) return 'Book selection is required';
    if (!form.percentage || form.percentage < 0 || form.percentage > 100) 
      return 'Percentage must be between 0 and 100';
    if (!form.startDate) return 'Start date is required';
    if (!form.endDate) return 'End date is required';
    if (new Date(form.startDate) > new Date(form.endDate))
      return 'Start date must be before end date';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    const discountData = {
      ...form,
      percentage: parseFloat(form.percentage),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateDiscount(editingId, discountData);
        toast.success('Discount updated successfully!');
        setEditingId(null);
      } else {
        await createDiscount(discountData);

      }
      setForm({
        bookId: '',
        bookTitle: '',
        percentage: '',
        startDate: '',
        endDate: '',
        isOnSale: false,
      });
      setSearchTerm('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save discount');
      console.error('Submit failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (discount) => {
    // Format dates for datetime-local input
    const startDate = new Date(discount.startDate)
      .toISOString()
      .substring(0, 16);
    const endDate = new Date(discount.endDate)
      .toISOString()
      .substring(0, 16);
    
    setForm({
      bookId: discount.bookId.toString(),
      bookTitle: discount.bookTitle || '',
      percentage: discount.percentage,
      startDate,
      endDate,
      isOnSale: discount.isOnSale,
    });
    setEditingId(discount.discountId);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) {
      return;
    }

    try {
      await deleteDiscount(id);
      toast.success('Discount deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete discount');
      console.error('Delete failed:', error);
    }
  };

  const resetForm = () => {
    setForm({
      bookId: '',
      bookTitle: '',
      percentage: '',
      startDate: '',
      endDate: '',
      isOnSale: false,
    });
    setEditingId(null);
    setSearchTerm('');
  };

  if (discountsError || booksError) {
    return (
      <div className="text-red-600 p-4">
        {discountsError || booksError}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Toaster position="top-right" richColors />
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 mb-8">
        <h2 className="text-xl font-semibold text-stone-800 mb-6">
          {editingId ? 'Edit Discount' : 'Create New Discount'}
        </h2>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-stone-700 text-sm font-medium mb-1">
                Book Selection*
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, author or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                
                <select
                  name="bookId"
                  value={form.bookId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  disabled={submitting}
                >
                  <option value="">Select a book</option>
                  {filteredBooks.map((book) => (
                    <option key={book.bookId} value={book.bookId}>
                      {book.title} - {book.author} (ID: {book.bookId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-700 text-sm font-medium mb-1">
                  Discount Percentage (%)*
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
                  <input
                    type="number"
                    name="percentage"
                    placeholder="Enter discount percentage"
                    value={form.percentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    disabled={submitting}
                  />
                </div>
              </div>
              
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isOnSale"
                    checked={form.isOnSale}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                  />
                  <span className="text-stone-700 text-sm font-medium">Mark as "On Sale"</span>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-700 text-sm font-medium mb-1">
                  Start Date & Time*
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    disabled={submitting}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-stone-700 text-sm font-medium mb-1">
                  End Date & Time*
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              type="submit" 
              className={`flex items-center justify-center gap-2 px-6 py-2 rounded-md flex-1 ${
                submitting 
                  ? 'bg-stone-400 cursor-not-allowed' 
                  : 'bg-amber-500 hover:bg-amber-600'
              } text-white transition-colors`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : editingId ? (
                <>
                  <Check className="h-5 w-5" />
                  Update Discount
                </>
              ) : (
                <>
                  <Tag className="h-5 w-5" />
                  Create Discount
                </>
              )}
            </button>
            
            {editingId && (
              <button 
                type="button" 
                onClick={resetForm}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-stone-200 text-stone-700 rounded-md hover:bg-stone-300 transition-colors"
              >
                <X className="h-5 w-5" />
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
        <h3 className="text-lg font-semibold text-stone-800 mb-6">Active Discounts</h3>
        
        {discountsLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        ) : discounts.length === 0 ? (
          <div className="text-center py-8 text-stone-500">
            <Tag className="h-10 w-10 mx-auto text-stone-400 mb-2 opacity-50" />
            <p>No discounts have been created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discounts.map((discount) => (
              <div 
                key={discount.discountId} 
                className="border border-stone-200 rounded-lg hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="bg-stone-50 px-4 py-3 border-b border-stone-200 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="inline-block w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mr-3">
                      <Percent className="h-4 w-4" />
                    </span>
                    <span className="font-medium text-stone-800">
                      {discount.percentage}% Off
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    discount.isOnSale
                      ? 'bg-green-100 text-green-800'
                      : 'bg-stone-100 text-stone-800'
                  }`}>
                    {discount.isOnSale ? 'On Sale' : 'Regular Discount'}
                  </span>
                </div>
                
                <div className="p-4">
                  <h4 className="font-semibold text-stone-800 mb-1">
                    {discount.bookTitle || `Book ID: ${discount.bookId}`}
                  </h4>
                  
                  <div className="space-y-2 text-sm text-stone-600 mb-4">
                    <p>
                      <span className="text-stone-500">Valid from:</span>{' '}
                      {new Date(discount.startDate).toLocaleDateString()} {new Date(discount.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <p>
                      <span className="text-stone-500">Valid until:</span>{' '}
                      {new Date(discount.endDate).toLocaleDateString()} {new Date(discount.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      onClick={() => handleEdit(discount)} 
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors text-sm"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(discount.discountId)} 
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountManager;