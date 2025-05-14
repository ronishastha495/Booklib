import React, { useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';




const WishlistItem = memo(({ item, onRemove }) => {
  // Show a short snippet (max 100 chars) of description if available
  const descriptionSnippet = item.description
    ? item.description.length > 100
      ? item.description.slice(0, 100) + '…'
      : item.description
    : null;

  return (
    <div className="bg-[#fff8f0] rounded-2xl shadow-lg border border-[#e5ccb5] flex flex-col">
      <Link to={`/books/${item.bookId}`}>
        <img
          src={item.imageURL}
          alt={item.bookTitle}
          className="w-full h-48 object-cover rounded-t-2xl border-b border-[#e5ccb5] bg-[#f5e9d4]"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-book.png';
          }}
        />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/books/${item.bookId}`} className="block mb-2">
          <h3 className="text-lg font-semibold text-[#a9895a] hover:text-[#7c5e3c] transition font-serif">
            {item.bookTitle}
          </h3>
          <p className="text-[#7c5e3c] mb-2">{item.author}</p>
        </Link>

        {/* Description snippet box */}
        {descriptionSnippet && (
          <div className="mb-4 p-3 bg-[#f5e9d4] rounded-lg border border-[#e5ccb5] text-sm text-[#7c5e3c] font-serif line-clamp-4">
            {descriptionSnippet}
          </div>
        )}

        <div className="mt-auto flex justify-between items-center text-sm text-[#a9895a]">
          <span>Added on {new Date(item.addedDate).toLocaleDateString()}</span>
          <button
            onClick={() => onRemove(item.bookId)}
            className="text-[#c97b63] hover:text-[#7c5e3c] transition font-semibold"
            title="Remove from wishlist"
            aria-label={`Remove ${item.bookTitle} from wishlist`}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
});

const Wishlist = () => {
  const { wishlist, loading, error, removeFromWishlist } = useWishlist();
  const { auth } = useAuth();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (!auth?.user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7efe5] via-[#f5e9d4] to-[#f8f5e4] font-serif">
        <div className="text-center p-8 bg-[#fff8f0] rounded-2xl shadow-lg max-w-md border border-[#e5ccb5]">
          <h2 className="text-2xl font-bold mb-4 text-[#a9895a]">Login Required</h2>
          <p className="mb-6 text-[#7c5e3c]">Please login to view your wishlist.</p>
          <Link
            to="/login"
            className="bg-[#a9895a] text-white px-6 py-2 rounded-full hover:bg-[#7c5e3c] transition font-semibold"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7efe5] via-[#f5e9d4] to-[#f8f5e4] font-serif">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#a9895a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#7c5e3c]">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7efe5] via-[#f5e9d4] to-[#f8f5e4] font-serif py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#7c5e3c] mb-8">Your Wishlist</h1>

        {wishlist.length === 0 ? (
          <div className="bg-[#fff8f0] rounded-2xl shadow-lg p-8 text-center border border-[#e5ccb5] text-[#a9895a]">
            <p className="mb-4">Your wishlist is empty</p>
            <Link
              to="/books"
              className="inline-block bg-[#a9895a] text-white px-6 py-2 rounded-full hover:bg-[#7c5e3c] transition font-semibold"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
            }}
          >
            {wishlist.map(item => (
              <WishlistItem key={item.bookmarkId} item={item} onRemove={removeFromWishlist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;