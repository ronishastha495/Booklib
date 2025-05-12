// import React, { createContext, useContext, useState, useEffect } from 'react';

// const CartContext = createContext();

// export const useCart = () => useContext(CartContext);

// export const CartProvider = ({ children }) => {
//     const [cartItems, setCartItems] = useState([]);

//     useEffect(() => {
//         const savedCart = localStorage.getItem('bookshopCart');
//         if (savedCart) {
//             try {
//                 setCartItems(JSON.parse(savedCart));
//             } catch (error) {
//                 console.error('Error loading cart from localStorage:', error);
//                 setCartItems([]);
//             }
//         }
//     }, []);

//     useEffect(() => {
//         localStorage.setItem('bookshopCart', JSON.stringify(cartItems));
//     }, [cartItems]);

//     const addToCart = (book) => {
//         setCartItems(prevItems => {
//             const existingItemIndex = prevItems.findIndex(item => item.id === book.id);
//             if (existingItemIndex >= 0) {
//                 const updatedItems = [...prevItems];
//                 const newQuantity = prevItems[existingItemIndex].quantity + (book.quantity || 1);
//                 updatedItems[existingItemIndex] = {
//                     ...prevItems[existingItemIndex],
//                     quantity: newQuantity
//                 };
//                 return updatedItems;
//             } else {
//                 return [...prevItems, { ...book, quantity: book.quantity || 1 }];
//             }
//         });
//     };

//     const removeFromCart = (bookId) => {
//         setCartItems(prevItems => prevItems.filter(item => item.id !== bookId));
//     };

//     // Fix: This function should SET the quantity, not add/subtract
//     const updateQuantity = (bookId, quantity) => {
//         if (quantity <= 0) {
//             removeFromCart(bookId);
//             return;
//         }
//         setCartItems(prevItems =>
//             prevItems.map(item =>
//                 item.id === bookId ? { ...item, quantity } : item
//             )
//         );
//     };

//     const clearCart = () => {
//         setCartItems([]);
//     };

//     const getTotalPrice = () => {
//         return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
//     };

//     const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
//     const volumeDiscount = subtotal >= 2000 ? subtotal * 0.05 : 0;
//     const loyaltyDiscount = subtotal >= 3000 ? subtotal * 0.10 : 0;
//     const total = subtotal - volumeDiscount - loyaltyDiscount;

//     const value = {
//         cartItems,
//         addToCart,
//         removeFromCart,
//         updateQuantity,
//         clearCart,
//         getTotalPrice,
//         subtotal,
//         volumeDiscount,
//         loyaltyDiscount,
//         total
//     };

//     return (
//         <CartContext.Provider value={value}>
//             {children}
//         </CartContext.Provider>
//     );
// };

// export default CartContext;