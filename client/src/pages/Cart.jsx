import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext'; // Add this import
import { FaArrowLeft, FaTrash, FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';
import axios from 'axios';
import api from '../services/api';

const Cart = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState('');
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        volumeDiscount,
        loyaltyDiscount,
        total,
        loading
    } = useCart();

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const formatted = now.getUTCFullYear() + '-' +
                String(now.getUTCMonth() + 1).padStart(2, '0') + '-' +
                String(now.getUTCDate()).padStart(2, '0') + ' ' +
                String(now.getUTCHours()).padStart(2, '0') + ':' +
                String(now.getUTCMinutes()).padStart(2, '0') + ':' +
                String(now.getUTCSeconds()).padStart(2, '0');
            setCurrentDateTime(formatted);
        };

        updateDateTime();
        const timer = setInterval(updateDateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const handlePlaceOrder = async () => {
        if (!isAuthenticated) {
            toast.error("Please login to place an order");
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        try {
            setIsProcessing(true);
            const response = await api.post('/Order', {
                notes: "Order placed from cart" // Add this to match OrderRequestDTO
            });
            if (response.data) {
                await clearCart();
                toast.success(`Order placed successfully! Your claim code is: ${response.data.claimCode}`);
                navigate('/orders', {
                    state: {
                        orderId: response.data.orderId,
                        claimCode: response.data.claimCode
                    }
                });
            }
        } catch (error) {
            console.error('Order error:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                toast.error('Your session has expired. Please login again.');
                navigate('/login');
            } else {
                toast.error(error.response?.data || 'Failed to place order');
            }
        } finally {
            setIsProcessing(false);
        }
    };
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* DateTime Header */}
            <div className="bg-gray-800 text-white py-2 px-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="text-sm">
                        Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): {currentDateTime}
                    </div>
                    <div className="text-sm">
                        Current User's Login: {user ? user.username : 'Guest'}
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-6">
                <Link
                    to="/books"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <FaArrowLeft className="mr-2" />
                    Continue Shopping
                </Link>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Cart Items */}
                    <div className="bg-white rounded-lg shadow-lg p-6 flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Shopping Cart</h2>
                            {cartItems.length > 0 && (
                                <button
                                    onClick={clearCart}
                                    className="text-red-600 hover:text-red-800 text-sm flex items-center"
                                >
                                    <FaTrash className="mr-1" />
                                    Clear Cart
                                </button>
                            )}
                        </div>

                        {cartItems.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">Your cart is empty.</p>
                                <Link
                                    to="/booklist"
                                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                                >
                                    Browse Books
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between border-b py-4">
                                        {/* Cart item content */}
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={item.image || "https://via.placeholder.com/50"}
                                                alt={item.title}
                                                className="w-16 h-24 object-cover rounded"
                                            />
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                                                <p className="text-gray-600">by {item.author}</p>
                                                <p className="text-gray-600">Rs.{item.price} each</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center border rounded">
                                                <button
                                                    className="px-3 py-1 hover:bg-gray-100 transition"
                                                    onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <span className="px-4 py-1 border-x">{item.quantity}</span>
                                                <button
                                                    className="px-3 py-1 hover:bg-gray-100 transition"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.stockQuantity}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p className="font-semibold text-gray-800 w-24 text-right">
                                                Rs.{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-500 hover:text-red-700 transition"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    {cartItems.length > 0 && (
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full lg:w-1/3 h-fit">
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <p>Subtotal</p>
                                    <p>Rs.{subtotal.toFixed(2)}</p>
                                </div>
                                {volumeDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <p>Volume Discount (5%)</p>
                                        <p>-Rs.{volumeDiscount.toFixed(2)}</p>
                                    </div>
                                )}
                                {loyaltyDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <p>Loyalty Discount (10%)</p>
                                        <p>-Rs.{loyaltyDiscount.toFixed(2)}</p>
                                    </div>
                                )}
                                <div className="border-t pt-3 mt-3">
                                    <div className="flex justify-between font-bold text-lg">
                                        <p>Total</p>
                                        <p>Rs.{total.toFixed(2)}</p>
                                    </div>
                                    {(volumeDiscount > 0 || loyaltyDiscount > 0) && (
                                        <p className="text-green-600 text-sm mt-2">
                                            You saved Rs.{(volumeDiscount + loyaltyDiscount).toFixed(2)}!
                                        </p>
                                    )}
                                </div>
                                <div className="mt-6 space-y-2">
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={isProcessing || !isAuthenticated}
                                        className={`w-full flex justify-center items-center py-3 rounded-lg
                                            ${isProcessing || !isAuthenticated
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'} 
                                            text-white transition`}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <FaSpinner className="animate-spin mr-2" />
                                                Processing...
                                            </>
                                        ) : !isAuthenticated ? (
                                            'Please Login to Place Order'
                                        ) : (
                                            'Place Order'
                                        )}
                                    </button>
                                    {!isAuthenticated && (
                                        <Link
                                            to="/login"
                                            className="block text-center text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Login to Place Order
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cart;