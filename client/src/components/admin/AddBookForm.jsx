import React from 'react';
import { X } from 'react-feather';
import { useBookContext } from '../../contexts/BookContext';
import { toast } from 'sonner';

const AddBookForm = ({ isOpen, onClose }) => {
  const { createBook } = useBookContext();
  const [loading, setLoading] = React.useState(false);
  const [newBook, setNewBook] = React.useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    publisher: '',
    publishedDate: '',
    language: '',
    format: '',
    price: '',
    stockQuantity: '',
    isBestseller: false,
    onSale: false,
    discountPrice: '',
    discountEndDate: '',
    description: '',
    imageUrl: '',
    imageFile: null
  });

  if (!isOpen) return null;

  const validateBookData = (bookData) => {
    const requiredFields = ['title', 'author', 'isbn', 'genre', 'price', 'stockQuantity'];
    const missingFields = requiredFields.filter((field) => !bookData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    if (bookData.price && isNaN(parseFloat(bookData.price))) {
      throw new Error('Price must be a valid number');
    }

    if (!bookData.imageFile && !bookData.imageUrl) {
      throw new Error('Book cover image is required');
    }

    return true;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBook((prev) => ({
      ...prev,
      [name]: type === 'checkbox' || type === 'radio' ? value === 'true' : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be less than 5MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setNewBook((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: previewUrl
    }));
  };

  const uploadImage = async (file) => {
    // Simulate file upload (replace with actual upload logic, e.g., Firebase, AWS S3)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(URL.createObjectURL(file)); // Temporary for demo
      }, 1000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      validateBookData(newBook);
      setLoading(true);

      let imageUrl = newBook.imageUrl;

      if (newBook.imageFile) {
        imageUrl = await uploadImage(newBook.imageFile);
      }

      const formattedBook = {
        ...newBook,
        publishedDate: newBook.publishedDate ? new Date(newBook.publishedDate).toISOString() : null,
        discountEndDate: newBook.discountEndDate ? new Date(newBook.discountEndDate).toISOString() : null,
        price: parseFloat(newBook.price),
        stockQuantity: parseInt(newBook.stockQuantity),
        discountPrice: newBook.discountPrice ? parseFloat(newBook.discountPrice) : null,
        imageUrl
      };

      await createBook(formattedBook);

      if (newBook.imageUrl && newBook.imageFile) {
        URL.revokeObjectURL(newBook.imageUrl);
      }

      setNewBook({
        title: '',
        author: '',
        isbn: '',
        genre: '',
        publisher: '',
        publishedDate: '',
        language: '',
        format: '',
        price: '',
        stockQuantity: '',
        isBestseller: false,
        onSale: false,
        discountPrice: '',
        discountEndDate: '',
        description: '',
        imageUrl: '',
        imageFile: null
      });

      onClose();
      toast.success('Book created successfully!');
      window.location.reload(); // Trigger full page reload
    } catch (error) {
      toast.error(error.message || 'Failed to create book');
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-stone-800">Add New Book</h3>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-full">
            <X className="h-5 w-5 text-stone-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-stone-700 font-medium mb-2">Title*</label>
              <input
                type="text"
                name="title"
                className="w-full px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Book title"
                value={newBook.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-2">Author*</label>
              <input
                type="text"
                name="author"
                className="w-full px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Author name"
                value={newBook.author}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-2">ISBN*</label>
              <input
                type="text"
                name="isbn"
                className="w-full px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="ISBN"
                value={newBook.isbn}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-2">Genre*</label>
              <select
                name="genre"
                className="w-full px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={newBook.genre}
                onChange={handleInputChange}
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
              <label className="block text-stone-700 font-medium mb-2">Publisher</label>
              <input
                type="text"
                name="publisher"
                className="w-full px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Publisher"
                value={newBook.publisher}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-2">Published Date</label>
              <input
                type="date"
                name="publishedDate"
                className="w-full px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={newBook.publishedDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-2">Language</label>
              <select
                name="language"
                className="w-full px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={newBook.language}
                onChange={handleInputChange}
              >
                <option value="">Select Language</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Italian">Italian</option>
                <option value="Japanese">Japanese</option>
                <option value="Chinese">Chinese</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-2">Format</label>
              <select
                name="format"
                className="w-full px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={newBook.format}
                onChange={handleInputChange}
              >
                <option value="">Select Format</option>
                <option value="Hardcover">Hardcover</option>
                <option value="Paperback">Paperback</option>
                <option value="Signed Edition">Signed Edition</option>
                <option value="Limited Edition">Limited Edition</option>
                <option value="First Edition">First Edition</option>
                <option value="Deluxe Edition">Deluxe Edition</option>
                <option value="Collector's Edition">Collector's Edition</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-2">Price ($)*</label>
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="0.00"
                value={newBook.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-2">Stock Quantity*</label>
              <input
                type="number"
                name="stockQuantity"
                min="0"
                className="w-full px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="0"
                value={newBook.stockQuantity}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-2">Bestseller</label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isBestseller"
                    value="true"
                    className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                    checked={newBook.isBestseller === true}
                    onChange={handleInputChange}
                  />
                  <span className="ml-2 text-stone-600">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isBestseller"
                    value="false"
                    className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                    checked={newBook.isBestseller === false}
                    onChange={handleInputChange}
                  />
                  <span className="ml-2 text-stone-600">No</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-2">On Sale</label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="onSale"
                    value="true"
                    className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                    checked={newBook.onSale === true}
                    onChange={handleInputChange}
                  />
                  <span className="ml-2 text-stone-600">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="onSale"
                    value="false"
                    className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                    checked={newBook.onSale === false}
                    onChange={handleInputChange}
                  />
                  <span className="ml-2 text-stone-600">No</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-2">Discount Price ($)</label>
              <input
                type="number"
                name="discountPrice"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="0.00"
                value={newBook.discountPrice || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-2">Discount End Date</label>
              <input
                type="date"
                name="discountEndDate"
                className="w-full px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={newBook.discountEndDate || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-stone-700 font-medium mb-2">Book Cover Image*</label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="imageFile"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-stone-300 border-dashed rounded-lg cursor-pointer bg-stone-50 hover:bg-amber-50 hover:border-amber-500 transition-colors duration-200"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-3 text-amber-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16V8m0 0l-4 4m4-4l4 4m6-4v12m-4-2l4-4m-4 4l-4-4"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-stone-600">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-stone-500">JPEG, PNG, GIF (Max. 5MB)</p>
                  </div>
                  <input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    required
                  />
                </label>
              </div>
              {newBook.imageUrl && (
                <div className="mt-4">
                  <p className="text-stone-600 font-medium mb-2">Preview:</p>
                  <div className="flex justify-center">
                    <img
                      src={newBook.imageUrl}
                      alt="Book cover preview"
                      className="h-48 w-auto object-cover rounded-lg border border-stone-200 shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-stone-700 font-medium mb-2">Description</label>
              <textarea
                rows="4"
                name="description"
                className="w-full px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Book description"
                value={newBook.description}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-2 border border-stone-300 rounded-md text-stone-600 hover:bg-stone-50"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Book'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookForm;