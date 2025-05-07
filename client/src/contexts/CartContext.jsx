import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (book) => {
    setCartItems((prevItems) => {
      // Check if the book is already in the cart
      const existingItem = prevItems.find(item => item.id === book.id);
      if (existingItem) {
        // If already in cart, increase quantity
        return prevItems.map(item =>
          item.id === book.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      } else {
        // If not in cart, add with quantity 1
        return [...prevItems, { ...book, quantity: 1 }];
      }
    });
  };

  const value = {
    cartItems,
    addToCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
