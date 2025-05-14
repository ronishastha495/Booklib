import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { FaArrowLeft, FaTrash, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'sonner';
import orderService from '../services/orderService';

const Cart = () => {
    const [currentDateTime, setCurrentDateTime] = useState('');
    const { auth } = useAuth();
    const navigate = useNavigate();
    const currentUser = auth?.user?.email || 'Guest';
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        volumeDiscount,
        loyaltyDiscount,
        total,
        itemCount
    } = useCart();

    // Update date/time every second
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
        if (!auth?.user) {
            toast.error("Please login to place an order");
            navigate('/login', { state: { from: '/cart' } });
            return;
        }

        if (cartItems.length === 0) {
            toast.error("Your cart is empty");
            return;
        }
        setIsProcessing(true);
        try {
            const orderData = {
                items: cartItems.map(item => ({
                    bookId: item.id,
                    quantity: item.quantity
                }))
            };

            const response = await orderService.createOrder(orderData);

            clearCart();
            toast.success(
                <div className="space-y-2">
                    <p className="font-semibold">Order placed successfully!</p>
                    <div className="bg-green-50 p-2 rounded">
                        <p className="text-sm">Claim Code:</p>
                        <p className="font-mono font-bold">{response.claimCode}</p>
                    </div>
                    <p className="text-sm text-green-600">
                        ✉️ Confirmation email sent to {auth.user.email}
                    </p>
                </div>,
                { duration: 5000 }
            );

            setOrderPlaced(true);

            setTimeout(() => {
                navigate(`/order-confirmation/${response.orderId}`);
            }, 3000);

        } catch (error) {
            console.error('Order error:', error);
            toast.error(
                <div>
                    <p className="font-semibold">Order Failed</p>
                    <p className="text-sm">{error.response?.data || 'Failed to place order'}</p>
                </div>
            );
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f7efe5] via-[#f5e9d4] to-[#f8f5e4] font-serif">
            {/* DateTime Header */}
            <div className="bg-[#e3d5c3] text-stone-800 py-2 px-4 border-b border-[#e5ccb5] shadow">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="text-sm font-mono">📚 {currentDateTime}</div>
                    <div className="text-sm font-mono">👤 {currentUser}</div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Back to Books Link */}
                <Link
                    to="/books"
                    className="inline-flex items-center text-[#a9895a] hover:text-[#c97b63] mb-6 font-semibold"
                >
                    <FaArrowLeft className="mr-2" />
                    Continue Shopping
                </Link>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="bg-[#fff8f0] rounded-2xl shadow-xl p-6 flex-1 border border-[#e5ccb5]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-[#7c5e3c]">Shopping Cart</h2>
                            {cartItems.length > 0 && (
                                <button
                                    onClick={clearCart}
                                    className="text-red-600 hover:text-red-800 text-sm flex items-center font-semibold"
                                >
                                    <FaTrash className="mr-1" />
                                    Clear Cart
                                </button>
                            )}
                        </div>

                        {cartItems.length === 0 ? (
                            <div className="text-center py-8">
                                <FaShoppingCart className="mx-auto text-4xl text-[#e5ccb5] mb-4" />
                                <p className="text-[#a9895a] mb-4">Your cart is empty.</p>
                                <Link
                                    to="/books"
                                    className="inline-block bg-[#e3d5c3] text-[#7c5e3c] px-6 py-2 rounded-full hover:bg-[#f3e8d8] border border-[#e5ccb5] font-semibold transition"
                                >
                                    Browse Books
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between border-b border-[#f3e8d8] py-4 gap-4">
                                        <div className="flex items-center space-x-4 w-full sm:w-auto">
                                            <img
                                                src={item.image || "/placeholder-book.png"}
                                                alt={item.title}
                                                className="w-16 h-24 object-cover rounded-lg border border-[#e5ccb5] bg-[#f5e9d4]"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/placeholder-book.png";
                                                }}
                                            />
                                            <div>
                                                <h3 className="font-semibold text-[#7c5e3c]">{item.title}</h3>
                                                <p className="text-[#a9895a]">by {item.author}</p>
                                                <p className="text-[#a9895a]">₹{item.price.toFixed(2)} each</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="flex items-center border border-[#e5ccb5] rounded-lg bg-[#f5e9d4]">
                                                <button
                                                    className="px-3 py-1 hover:bg-[#f3e8d8] rounded-l-lg transition text-[#7c5e3c] font-bold text-lg"
                                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                >
                                                    -
                                                </button>
                                                <span className="px-4 py-1 border-x border-[#e5ccb5] bg-[#fff8f0] text-[#7c5e3c] font-semibold">{item.quantity}</span>
                                                <button
                                                    className="px-3 py-1 hover:bg-[#f3e8d8] rounded-r-lg transition text-[#7c5e3c] font-bold text-lg"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p className="font-semibold text-[#7c5e3c] w-24 text-right">
                                                ₹{(item.price * item.quantity).toFixed(2)}
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
                        <div className="bg-[#fff8f0] rounded-2xl shadow-xl p-6 w-full lg:w-1/3 border border-[#e5ccb5] h-fit">
                            <h2 className="text-xl font-bold mb-4 text-[#7c5e3c]">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-[#a9895a]">
                                    <p>Subtotal ({itemCount} items)</p>
                                    <p>₹{subtotal.toFixed(2)}</p>
                                </div>
                                {volumeDiscount > 0 && (
                                    <div className="flex justify-between text-green-700">
                                        <p>Volume Discount (5%)</p>
                                        <p>-₹{volumeDiscount.toFixed(2)}</p>
                                    </div>
                                )}
                                {loyaltyDiscount > 0 && (
                                    <div className="flex justify-between text-green-700">
                                        <p>Loyalty Discount (10%)</p>
                                        <p>-₹{loyaltyDiscount.toFixed(2)}</p>
                                    </div>
                                )}
                                <div className="border-t border-[#e5ccb5] pt-3 mt-3">
                                    <div className="flex justify-between font-bold text-lg text-[#7c5e3c]">
                                        <p>Total</p>
                                        <p>₹{total.toFixed(2)}</p>
                                    </div>
                                    {(volumeDiscount > 0 || loyaltyDiscount > 0) && (
                                        <p className="text-green-700 text-sm mt-2">
                                            You saved ₹{(volumeDiscount + loyaltyDiscount).toFixed(2)}!
                                        </p>
                                    )}
                                </div>
                                <div className="mt-6 space-y-2">
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={isProcessing}
                                        className={`w-full py-3 rounded-full font-semibold transition shadow-lg ${isProcessing
                                                ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
                                                : 'bg-[#c97b63] text-white hover:bg-[#a9895a]'
                                            }`}
                                    >
                                        {isProcessing ? 'Processing...' : 'Place Order'}
                                    </button>
                                    <p className="text-sm text-[#a9895a] text-center">
                                        Order confirmation will be sent to:
                                        <br />
                                        <span className="font-medium">{auth?.user?.email}</span>
                                    </p>
                                    <Link
                                        to="/books"
                                        className="block text-center text-[#c97b63] hover:text-[#a9895a] text-sm font-semibold"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                                {orderPlaced && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <p className="font-medium">Order Confirmed!</p>
                                        </div>
                                        <p className="text-sm">Check your email for order details and claim code.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cart;