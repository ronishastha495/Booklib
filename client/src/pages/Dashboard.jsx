import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import authService from '../services/authService';
import api from '../services/api';

const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    author: '',
    priceRange: '',
    rating: '',
    language: '',
    format: '',
    publisher: '',
    category: 'All Books'
  });
  const [sort, setSort] = useState('title-asc');
  const [cart, setCart] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch user data from token
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          const response = await api.get('/auth/user'); // Assumed endpoint
          setUser(response.data);
        }
      } catch (error) {
        toast.error('Failed to fetch user data');
        authService.logout();
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  // Fetch books with pagination, search, sort, and filters
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const params = {
          page,
          search,
          genre: filters.genre,
          author: filters.author,
          priceRange: filters.priceRange,
          rating: filters.rating,
          language: filters.language,
          format: filters.format,
          publisher: filters.publisher,
          category: filters.category,
          sort
        };
        const response = await api.get('/books', { params }); // Assumed endpoint
        setBooks(response.data.books);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        toast.error('Failed to fetch books');
      }
    };
    fetchBooks();
  }, [page, search, filters, sort]);

  // Fetch cart and bookmarks
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [cartResponse, bookmarkResponse, orderResponse] = await Promise.all([
          api.get('/cart'), // Assumed endpoint
          api.get('/bookmarks'), // Assumed endpoint
          api.get('/orders') // Assumed endpoint
        ]);
        setCart(cartResponse.data);
        setBookmarks(bookmarkResponse.data);
        setOrders(orderResponse.data);
      } catch (error) {
        toast.error('Failed to fetch user data');
      }
    };
    if (user) fetchUserData();
  }, [user]);

  const handleSearch = (e) => setSearch(e.target.value);
  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleSortChange = (e) => setSort(e.target.value);
  const handlePageChange = (newPage) => setPage(newPage);

  const addToCart = async (bookId) => {
    try {
      await api.post('/cart', { bookId }); // Assumed endpoint
      setCart([...cart, { id: bookId }]);
      toast.success('Book added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const addToBookmarks = async (bookId) => {
    try {
      await api.post('/bookmarks', { bookId }); // Assumed endpoint
      setBookmarks([...bookmarks, { id: bookId }]);
      toast.success('Book bookmarked');
    } catch (error) {
      toast.error('Failed to bookmark book');
    }
  };

  const placeOrder = async () => {
    try {
      const response = await api.post('/orders', { cart }); // Assumed endpoint
      setOrders([...orders, response.data]);
      setCart([]);
      toast.success('Order placed successfully! Check your email for claim code.');
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await api.delete(`/orders/${orderId}`); // Assumed endpoint
      setOrders(orders.filter((order) => order.id !== orderId));
      toast.success('Order cancelled');
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  const submitReview = async (bookId) => {
    try {
      await api.post(`/reviews/${bookId}`, review); // Assumed endpoint
      setReview({ rating: 0, comment: '' });
      toast.success('Review submitted');
    } catch (error) {
      toast.error('You can only review purchased books');
    }
  };

  const logout = () => {
    authService.logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed" 
      style={{ 
        backgroundImage: `url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
      }}
    >
      <nav className="bg-amber-900/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="font-serif text-2xl text-amber-100">Booklib Dashboard</div>
            <div className="flex items-center space-x-4">
              <span className="text-amber-200">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1 bg-amber-700 text-amber-100 rounded-md hover:bg-amber-600 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-amber-900/80 backdrop-blur-md rounded-2xl p-6 mb-6">
          {/* Search, Filters, and Sort */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by title, ISBN, or description..."
              className="w-full md:w-1/3 px-4 py-2 bg-amber-800/50 text-amber-100 border border-amber-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-amber-400/50"
            />
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="px-4 py-2 bg-amber-800/50 text-amber-100 border border-amber-600 rounded-md focus:outline-none"
            >
              <option value="All Books">All Books</option>
              <option value="Bestsellers">Bestsellers</option>
              <option value="Award Winners">Award Winners</option>
              <option value="New Releases">New Releases</option>
              <option value="New Arrivals">New Arrivals</option>
              <option value="Coming Soon">Coming Soon</option>
              <option value="Deals">Deals</option>
            </select>
            <select
              name="sort"
              value={sort}
              onChange={handleSortChange}
              className="px-4 py-2 bg-amber-800/50 text-amber-100 border border-amber-600 rounded-md focus:outline-none"
            >
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="popularity-desc">Most Popular</option>
            </select>
          </div>
          {/* Additional Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <input
              name="genre"
              value={filters.genre}
              onChange={handleFilterChange}
              placeholder="Genre"
              className="px-4 py-2 bg-amber-800/50 text-amber-100 border border-amber-600 rounded-md focus:outline-none placeholder-amber-400/50"
            />
            <input
              name="author"
              value={filters.author}
              onChange={handleFilterChange}
              placeholder="Author"
              className="px-4 py-2 bg-amber-800/50 text-amber-100 border border-amber-600 rounded-md focus:outline-none placeholder-amber-400/50"
            />
            <input
              name="priceRange"
              value={filters.priceRange}
              onChange={handleFilterChange}
              placeholder="Price Range"
              className="px-4 py-2 bg-amber-800/50 text-amber-100 border border-amber-600 rounded-md focus:outline-none placeholder-amber-400/50"
            />
            <input
              name="rating"
              value={filters.rating}
              onChange={handleFilterChange}
              placeholder="Rating"
              className="px-4 py-2 bg-amber-800/50 text-amber-100 border border-amber-600 rounded-md focus:outline-none placeholder-amber-400/50"
            />
          </div>
        </div>
        {/* Book Catalogue */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {books.map((book) => (
            <div key={book.id} className="bg-amber-800/50 rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-serif text-amber-100">{book.title}</h3>
              <p className="text-amber-200">by {book.author}</p>
              <p className="text-amber-200">${book.price}</p>
              {book.onSale && <span className="text-amber-400">On Sale!</span>}
              <button
                onClick={() => setSelectedBook(book)}
                className="mt-2 px-4 py-1 bg-amber-700 text-amber-100 rounded-md hover:bg-amber-600"
              >
                View Details
              </button>
              <button
                onClick={() => addToBookmarks(book.id)}
                className="mt-2 ml-2 px-4 py-1 bg-transparent border border-amber-100 text-amber-100 rounded-md hover:bg-amber-100 hover:text-amber-900"
              >
                Bookmark
              </button>
              <button
                onClick={() => addToCart(book.id)}
                className="mt-2 ml-2 px-4 py-1 bg-amber-700 text-amber-100 rounded-md hover:bg-amber-600"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
        {/* Pagination */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-amber-700 text-amber-100 rounded-md disabled:bg-amber-600"
          >
            Previous
          </button>
          <span className="text-amber-100">Page {page} of {totalPages}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 bg-amber-700 text-amber-100 rounded-md disabled:bg-amber-600"
          >
            Next
          </button>
        </div>
        {/* Book Details Modal */}
        {selectedBook && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-amber-900/80 backdrop-blur-md rounded-2xl p-6 max-w-lg w-full mx-4">
              <h3 className="text-2xl font-serif text-amber-100">{selectedBook.title}</h3>
              <p className="text-amber-200">Author: {selectedBook.author}</p>
              <p className="text-amber-200">Genre: {selectedBook.genre}</p>
              <p className="text-amber-200">Price: ${selectedBook.price}</p>
              <p className="text-amber-200">Format: {selectedBook.format}</p>
              <p className="text-amber-200">Description: {selectedBook.description}</p>
              <div className="mt-4">
                <label className="block text-sm text-amber-200">Rating</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={review.rating}
                  onChange={(e) => setReview({ ...review, rating: e.target.value })}
                  className="w-full px-4 py-2 bg-amber-800/50 text-amber-100 border border-amber-600 rounded-md"
                />
                <label className="block text-sm text-amber-200 mt-2">Comment</label>
                <textarea
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  className="w-full px-4 py-2 bg-amber-800/50 text-amber-100 border border-amber-600 rounded-md"
                />
                <button
                  onClick={() => submitReview(selectedBook.id)}
                  className="mt-2 px-4 py-1 bg-amber-700 text-amber-100 rounded-md hover:bg-amber-600"
                >
                  Submit Review
                </button>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="mt-4 px-4 py-1 bg-amber-700 text-amber-100 rounded-md hover:bg-amber-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
        {/* Cart and Orders */}
        <div className="bg-amber-900/80 backdrop-blur-md rounded-2xl p-6">
          <h3 className="text-2xl font-serif text-amber-100 mb-4">Your Cart</h3>
          {cart.length > 0 ? (
            <>
              {cart.map((item) => (
                <div key={item.id} className="text-amber-200">{item.title} - ${item.price}</div>
              ))}
              <p className="text-amber-200 mt-2">
                Total: ${cart.reduce((sum, item) => sum + item.price, 0)}
                {cart.length >= 5 && ' (5% discount applied)'}
                {orders.length >= 10 && ' (10% stackable discount applied)'}
              </p>
              <button
                onClick={placeOrder}
                className="mt-4 px-4 py-1 bg-amber-700 text-amber-100 rounded-md hover:bg-amber-600"
              >
                Place Order
              </button>
            </>
          ) : (
            <p className="text-amber-200">Your cart is empty</p>
          )}
          <h3 className="text-2xl font-serif text-amber-100 mt-6 mb-4">Your Orders</h3>
          {orders.map((order) => (
            <div key={order.id} className="text-amber-200 mb-2">
              Order #{order.id} - Claim Code: {order.claimCode}
              <button
                onClick={() => cancelOrder(order.id)}
                className="ml-4 px-2 py-1 bg-amber-700 text-amber-100 rounded-md hover:bg-amber-600"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;