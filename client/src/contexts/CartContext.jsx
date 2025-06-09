import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { auth } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    
    // Get user-specific cart key
  const getCartKey = () => {
    const userId = auth?.user?.email; // Use email consistently
    return `bookshopCart_${userId || 'guest'}`;
};

    // Load cart from localStorage on mount or when user changes
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(getCartKey());
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            } else {
                setCartItems([]); // Clear cart if no saved data for current user
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            setCartItems([]);
        }
    }, [auth?.user]); // Reload cart when user changes

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (cartItems.length > 0) {
            try {
                localStorage.setItem(getCartKey(), JSON.stringify(cartItems));
            } catch (error) {
                console.error('Error saving cart:', error);
            }
        } else {
            localStorage.removeItem(getCartKey());
        }
    }, [cartItems, auth?.user]);

    const addToCart = (book) => {
        // Validate book data
        if (!book) {
            console.error('Invalid book data:', book);
            toast.error('Invalid book data');
            return;
        }

        // Ensure required fields are present
        const requiredFields = ['id', 'title', 'price', 'quantity'];
        const missingFields = requiredFields.filter(field => !book[field]);
        
        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            toast.error(`Missing required fields: ${missingFields.join(', ')}`);
            return;
        }

        // Ensure numerical values are valid
        const price = Number(book.price);
        const quantity = Number(book.quantity);
        const stockQuantity = Number(book.stockQuantity);

        if (isNaN(price) || price <= 0) {
            toast.error('Invalid price');
            return;
        }

        if (isNaN(quantity) || quantity <= 0) {
            toast.error('Invalid quantity');
            return;
        }

        setCartItems(prevItems => {
            // Check for existing item
            const existingItem = prevItems.find(item => item.id === book.id);

            if (existingItem) {
                // Calculate new quantity
                const newQuantity = existingItem.quantity + quantity;

                // Check stock limit
                if (newQuantity > stockQuantity) {
                    toast.error(`Cannot add more than ${stockQuantity} copies`);
                    return prevItems;
                }

                // Update existing item
                return prevItems.map(item =>
                    item.id === book.id
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            }

            // Add new item
            const newItem = {
                id: book.id,
                title: book.title,
                author: book.author || 'Unknown Author',
                price: price,
                image: book.image || book.imageURL,
                quantity: quantity,
                stockQuantity: stockQuantity
            };

            return [...prevItems, newItem];
        });
    };

    const updateQuantity = (bookId, newQuantity) => {
        if (typeof newQuantity !== 'number' || newQuantity < 0) {
            toast.error('Invalid quantity');
            return;
        }

        setCartItems(prevItems => {
            const item = prevItems.find(item => item.id === bookId);
            
            if (!item) return prevItems;

            if (newQuantity === 0) {
                return prevItems.filter(item => item.id !== bookId);
            }

            if (newQuantity > item.stockQuantity) {
                toast.error(`Cannot add more than ${item.stockQuantity} copies`);
                return prevItems;
            }

            return prevItems.map(item =>
                item.id === bookId ? { ...item, quantity: newQuantity } : item
            );
        });
    };

    const removeFromCart = (bookId) => {
        setCartItems(prev => prev.filter(item => item.id !== bookId));
        toast.success('Item removed from cart');
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem(getCartKey());
        toast.success('Cart cleared');
    };

    // Calculate cart totals
    const calculateTotals = () => {
        const subtotal = cartItems.reduce((sum, item) => 
            sum + (Number(item.price) * Number(item.quantity)), 0);
        const itemCount = cartItems.reduce((sum, item) => 
            sum + Number(item.quantity), 0);
        
        // Volume discount (5% for 5+ books)
        const volumeDiscount = itemCount >= 5 ? subtotal * 0.05 : 0;
        
        // For now, loyalty discount is 0 until we implement order history
        const loyaltyDiscount = 0;
        
        return {
            subtotal,
            volumeDiscount,
            loyaltyDiscount,
            total: subtotal - volumeDiscount - loyaltyDiscount,
            itemCount
        };
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        ...calculateTotals()
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

export default CartContext;