import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { auth } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    if (!auth?.user?.id) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/Bookmark/getAll/${auth.user.id}`);
      setWishlist(response.data);
    } catch (err) {
      console.error('Wishlist fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (bookId) => {
    try {
      setLoading(true);
      await api.post('/Bookmark/create', {
        memberId: auth.user.id,
        bookId
      });
      await fetchWishlist();
    } catch (err) {
      console.error('Add to wishlist error:', err);
      setError(err.response?.data?.message || 'Failed to add to wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (bookId) => {
    try {
      setLoading(true);
      await api.delete('/Bookmark/delete', {
        data: {
          memberId: auth.user.id,
          bookId
        }
      });
      await fetchWishlist();
    } catch (err) {
      console.error('Remove from wishlist error:', err);
      setError(err.response?.data?.message || 'Failed to remove from wishlist');
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (bookId) => {
    return wishlist.some(item => item.bookId === bookId);
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (auth?.user?.id) {
      fetchWishlist();
    }
  }, [auth?.user?.id]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        error,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);