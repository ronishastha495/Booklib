import React from 'react';
import { Coffee, X } from 'react-feather';

const AddBookForm = ({ isOpen, onClose, onSubmit, newBook, setNewBook, loading }) => {
  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBook((prev) => ({
      ...prev,
      [name]: type === 'checkbox' || type === 'radio' ? checked : value,
    }));
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
        <form onSubmit={onSubmit}>
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
                    className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                    checked={newBook.isBestseller}
                    onChange={() => setNewBook((prev) => ({ ...prev, isBestseller: true }))}
                  />
                  <span className="ml-2 text-stone-600">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isBestseller"
                    className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                    checked={!newBook.isBestseller}
                    onChange={() => setNewBook((prev) => ({ ...prev, isBestseller: false }))}
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
                    className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                    checked={newBook.onSale}
                    onChange={() => setNewBook((prev) => ({ ...prev, onSale: true }))}
                  />
                  <span className="ml-2 text-stone-600">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="onSale"
                    className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                    checked={!newBook.onSale}
                    onChange={() => setNewBook((prev) => ({ ...prev, onSale: false }))}
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
              <label className="block text-stone-700 font-medium mb-2">Book Cover Image</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-stone-300 border-dashed rounded-lg cursor-pointer bg-stone-50 hover:bg-stone-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Coffee className="w-8 h-8 mb-3 text-stone-400" />
                    <p className="mb-2 text-sm text-stone-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-stone-500">SVG, PNG, JPG or WEBP (MAX. 800x400px)</p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      // Handle file upload logic here
                    }}
                  />
                </label>
              </div>
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