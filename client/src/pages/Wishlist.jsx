// pages/Wishlist.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const Wishlist = () => {
  const { wishlist, loading, error, removeFromWishlist } = useWishlist();
  const { auth } = useAuth();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (!auth?.user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="mb-6">Please login to view your wishlist.</p>
          <Link
            to="/login"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Wishlist</h1>
        
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">Your wishlist is empty</p>
            <Link
              to="/books"
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div key={item.bookmarkId} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Link to={`/books/${item.bookId}`}>
                  <img
                    src={item.imageURL}
                    alt={item.bookTitle}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-book.png';
                    }}
                  />
                </Link>
                <div className="p-4">
                  <Link to={`/books/${item.bookId}`} className="block">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-indigo-600">
                      {item.bookTitle}
                    </h3>
                    <p className="text-gray-600 mb-3">{item.author}</p>
                  </Link>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Added on {new Date(item.addedDate).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => removeFromWishlist(item.bookId)}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Remove from wishlist"
                    >
                      Remove
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

export default Wishlist;