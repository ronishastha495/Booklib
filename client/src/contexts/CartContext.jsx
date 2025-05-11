import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on initial load
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('bookshopCart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      localStorage.removeItem('bookshopCart');
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('bookshopCart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cartItems]);

  const addToCart = (book) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === book.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + (book.quantity || 1) }
            : item
        );
      }
      return [...prevItems, {
        ...book,
        quantity: book.quantity || 1,
        addedAt: new Date().toISOString()
      }];
    });
  };

  const removeFromCart = (bookId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== bookId));
  };

  const updateQuantity = (bookId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === bookId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate cart totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    const volumeDiscount = subtotal >= 2000 ? subtotal * 0.05 : 0;
    const loyaltyDiscount = subtotal >= 3000 ? subtotal * 0.10 : 0;
    const total = subtotal - volumeDiscount - loyaltyDiscount;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      volumeDiscount: Number(volumeDiscount.toFixed(2)),
      loyaltyDiscount: Number(loyaltyDiscount.toFixed(2)),
      total: Number(total.toFixed(2)),
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  };

  const cartTotals = calculateTotals();

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    ...cartTotals
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook for accessing cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};