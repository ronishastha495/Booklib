import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaShoppingCart, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import Reviews from './Reviews';
import { useWishlist } from '../contexts/WishlistContext';
import reviewService from '../services/reviewService';

// Utility functions for bookmarks
const getBookmarks = () => {
  try {
    return JSON.parse(localStorage.getItem('bookmarks')) || [];
  } catch {
    return [];
  }
};

const formatDateTime = (date) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const BACKEND_URL = 'http://localhost:5259';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { auth } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(formatDateTime(new Date()));
  const [isAdded, setIsAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const currentUser = auth?.user?.email || 'Guest';

  // Check if review form should be shown
  const showReviewForm = new URLSearchParams(location.search).get('review') === 'true';

  // Update date/time every second
  useEffect(() => {
    const updateDateTime = () => {
      setCurrentDateTime(formatDateTime(new Date()));
    };
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (showReviewForm && auth?.user?.email && canReview && !hasReviewed) {
      document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showReviewForm, auth, canReview, hasReviewed]);

  // Fetch book data and reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch book
        const bookResponse = await fetch(`${BACKEND_URL}/api/Book/GetById/${id}`);
        if (!bookResponse.ok) {
          throw new Error(bookResponse.status === 404 ? 'Book not found' : 'Failed to load book details');
        }
        const bookData = await bookResponse.json();
        setBook(bookData);

        // Fetch reviews
        const reviewResponse = await reviewService.getBookReviews(id);
        setReviews(reviewResponse);

        // Check if user can review
        if (auth?.user?.email) {
          const canReviewResult = await reviewService.canReviewBook(id);
          setCanReview(canReviewResult);

          // Check if user has already reviewed
          const userReviews = await reviewService.getUserReviews();
          setHasReviewed(userReviews.some((review) => review.bookId === id));
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, auth]);

  useEffect(() => {
    if (auth?.user?.email) {
      setIsBookmarked(isInWishlist(id));
    }
  }, [id, auth, isInWishlist]);
  const toggleBookmark = () => {
    if (!auth?.user?.email) {
      toast.error('Please login to bookmark items');
      navigate('/login', { state: { from: `/books/${id}` } });
      return;
    }

    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };
  const handleAddToCart = () => {
    if (!auth?.user?.email) {
      toast.error('Please login to add items to cart');
      navigate('/login', { state: { from: `/books/${id}` } });
      return;
    }

    if (!book) {
      toast.error('Book data not available');
      return;
    }

    const bookForCart = {
      id: book.bookId,
      title: book.title,
      author: book.author,
      price: book.onSale ? Number(book.discountPrice) : Number(book.price),
      image: book.imageURL,
      stockQuantity: Number(book.stockQuantity),
      quantity: Number(quantity),
    };

    try {
      addToCart(bookForCart);
      setIsAdded(true);
      toast.success('Added to cart successfully!');
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (book && value > 0 && value <= book.stockQuantity) {
      setQuantity(value);
    }
  };

  const handleReviewSubmitted = async (reviewData) => {
    await reviewService.createReview(reviewData);
    const updatedReviews = await reviewService.getBookReviews(id);
    setReviews(updatedReviews);
    setHasReviewed(true);
    toast.success('Review submitted successfully!');
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewService.deleteReview(reviewId);
      setReviews(reviews.filter((review) => review.reviewId !== reviewId));
      setHasReviewed(false);
      setCanReview(true);
      toast.success('Review deleted successfully');
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleEditReview = (review) => {
    toast.info('Edit review functionality not implemented yet');
  };

  // --- CUTESY VINTAGE THEME CSS BELOW! ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7efe5] via-[#f5e9d4] to-[#f8f5e4] font-serif">
        <div className="bg-[#e3d5c3] text-stone-800 py-2 px-4 border-b border-[#e5ccb5] shadow">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-sm font-mono">📚 {currentDateTime}</div>
            <div className="text-sm font-mono">👤 {currentUser}</div>
          </div>
        </div>
        <div className="flex items-center justify-center flex-1 h-[calc(100vh-40px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c3a984] mx-auto"></div>
            <p className="mt-4 text-[#a9895a] font-serif">Loading book details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7efe5] via-[#f5e9d4] to-[#f8f5e4] font-serif">
        <div className="bg-[#e3d5c3] text-stone-800 py-2 px-4 border-b border-[#e5ccb5] shadow">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-sm font-mono">📚 {currentDateTime}</div>
            <div className="text-sm font-mono">👤 {currentUser}</div>
          </div>
        </div>
        <div className="flex items-center justify-center flex-1 h-[calc(100vh-40px)]">
          <div className="bg-[#fff8f0] p-8 rounded-2xl shadow-lg text-center max-w-md border border-[#e5ccb5]">
            <h2 className="text-2xl font-bold text-[#c97b63] mb-4">Oops!</h2>
            <p className="text-[#a9895a] mb-6">{error}</p>
            <Link
              to="/books"
              className="inline-block bg-[#e3d5c3] text-[#7c5e3c] px-6 py-2 rounded-full hover:bg-[#f3e8d8] border border-[#e5ccb5] transition font-semibold"
            >
              ← Back to Books
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7efe5] via-[#f5e9d4] to-[#f8f5e4] font-serif">
      {/* Top Bar */}
      <div className="bg-[#e3d5c3] text-stone-800 py-2 px-4 border-b border-[#e5ccb5] shadow">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-sm font-mono">📚 {currentDateTime}</div>
          <div className="text-sm font-mono">👤 {currentUser}</div>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link
            to="/books"
            className="flex items-center text-[#a9895a] mb-6 hover:text-[#c97b63] transition font-semibold"
          >
            <FaArrowLeft className="mr-2" /> Back to Books
          </Link>
          <div className="bg-[#fff8f0] rounded-2xl shadow-xl overflow-hidden border border-[#e5ccb5]">
            <div className="md:flex">
              {/* Book Cover */}
              <div className="md:w-1/3 bg-[#f7efe5] flex items-center justify-center p-8">
                <img
                  src={book.imageURL}
                  alt={book.title}
                  className="object-contain max-h-80 w-auto rounded-xl shadow border-2 border-[#e5ccb5] bg-[#f5e9d4]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-book.png';
                  }}
                />
              </div>

              {/* Book Info */}
              <div className="md:w-2/3 p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-[#7c5e3c] mb-2 font-serif">{book.title}</h1>
                    <p className="text-xl text-[#a9895a] mb-4 font-serif italic">by {book.author}</p>
                  </div>
                  <button
                    onClick={toggleBookmark}
                    className="text-2xl p-2 hover:text-pink-400 transition"
                    title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                  >
                    {isBookmarked ? <FaHeart className="text-pink-400" /> : <FaRegHeart />}
                  </button>
                </div>

                {/* Price & Sale */}
                <div className="mb-6">
                  {book.onSale ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#c97b63]">₹{book.discountPrice.toFixed(2)}</span>
                      <span className="text-lg text-[#a9895a] line-through">₹{book.price.toFixed(2)}</span>
                      <span className="bg-[#f5e9d4] text-[#c97b63] px-2 py-1 rounded-full text-sm font-medium border border-[#e5ccb5]">
                        {Math.round(((book.price - book.discountPrice) / book.price) * 100)}% OFF
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-[#c97b63]">₹{book.price.toFixed(2)}</span>
                  )}
                  {book.onSale && book.discountEndDate && (
                    <p className="text-sm text-[#c97b63] mt-1 font-mono">
                      Sale ends on {new Date(book.discountEndDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-[#7c5e3c]">
                  <div>
                    <p className="mb-2"><span className="font-semibold">Genre:</span> {book.genre}</p>
                    <p className="mb-2"><span className="font-semibold">Format:</span> {book.format}</p>
                    <p className="mb-2"><span className="font-semibold">ISBN:</span> {book.isbn}</p>
                  </div>
                  <div>
                    <p className="mb-2"><span className="font-semibold">Publisher:</span> {book.publisher}</p>
                    <p className="mb-2"><span className="font-semibold">Published:</span> {book.yearPublished}</p>
                    <p className="mb-2"><span className="font-semibold">Language:</span> {book.language}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-2 text-[#a9895a]">Description</h2>
                  <p className="text-[#7c5e3c]">{book.description}</p>
                </div>

                {/* Add to Cart */}
                <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-4">
                  <div className="flex items-center">
                    <p className="mr-4 text-[#a9895a] font-semibold">
                      {book.stockQuantity > 0 ? (
                        <span className="text-green-700">In Stock ({book.stockQuantity} available)</span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </p>
                    <input
                      type="number"
                      min="1"
                      max={book.stockQuantity}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-16 px-2 py-1 border border-[#e5ccb5] rounded-lg text-center bg-[#f5e9d4] text-[#7c5e3c] font-semibold shadow-sm"
                      disabled={!book.isAvailable || book.stockQuantity === 0}
                    />
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={!book.isAvailable || book.stockQuantity === 0}
                    className={`flex items-center px-6 py-3 rounded-full text-white font-semibold transition shadow-lg ${isAdded
                        ? 'bg-green-500'
                        : book.isAvailable && book.stockQuantity > 0
                          ? 'bg-[#c97b63] hover:bg-[#a9895a]'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                  >
                    <FaShoppingCart className="mr-2" />
                    {isAdded ? 'Added to Cart' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-8 bg-[#fff8f0] rounded-2xl shadow-lg p-6 border border-[#e5ccb5]">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
              <h2 className="text-2xl font-semibold text-[#a9895a]">Customer Reviews</h2>
              {auth?.user?.email && canReview && !hasReviewed && (
                <Link
                  to="/order/history"
                  className="px-4 py-2 bg-[#c97b63] text-white rounded-full hover:bg-[#a9895a] transition font-semibold shadow"
                >
                  Write a Review (Go to Order History)
                </Link>
              )}
            </div>

            {auth?.user?.email && !canReview && !hasReviewed && (
              <p className="text-[#a9895a] italic mb-4">You can only review books you have purchased.</p>
            )}
            {!auth?.user?.email && (
              <p className="text-[#a9895a] italic mb-4">
                Please <Link to="/login" className="text-[#c97b63] hover:underline">log in</Link> to write a review.
              </p>
            )}
            <Reviews
              reviews={reviews}
              currentUserId={auth?.user?.id}
              onDelete={handleDeleteReview}
              onEdit={handleEditReview}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;