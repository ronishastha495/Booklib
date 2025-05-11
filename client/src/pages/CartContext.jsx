import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch cart on initial load
    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/Cart');
            setCartItems(response.data.items);
        } catch (error) {
            toast.error('Failed to fetch cart');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (book, quantity = 1) => {
        try {
            setLoading(true);
            const response = await axios.post('/api/Cart/items', {
                bookId: book.id,
                quantity: quantity
            });
            setCartItems(response.data.items);
            toast.success('Item added to cart');
        } catch (error) {
            toast.error(error.response?.data || 'Failed to add item to cart');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (bookId, quantity) => {
        try {
            setLoading(true);
            const response = await axios.put(`/api/Cart/items/${bookId}/quantity`, {
                quantity: quantity
            });
            setCartItems(response.data.items);
        } catch (error) {
            toast.error(error.response?.data || 'Failed to update quantity');
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (bookId) => {
        try {
            setLoading(true);
            await axios.delete(`/api/Cart/items/${bookId}`);
            setCartItems(prev => prev.filter(item => item.id !== bookId));
            toast.success('Item removed from cart');
        } catch (error) {
            toast.error('Failed to remove item from cart');
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        setCartItems([]);
        // Note: Add API endpoint for clearing cart if needed
    };

    // Calculate totals based on cart items
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const volumeDiscount = cartItems.reduce((sum, item) => sum + item.quantity, 0) >= 5 ? subtotal * 0.05 : 0;
    const loyaltyDiscount = subtotal >= 3000 ? subtotal * 0.10 : 0;
    const total = subtotal - volumeDiscount - loyaltyDiscount;

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            subtotal,
            volumeDiscount,
            loyaltyDiscount,
            total,
            loading
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;