import React, { useState, useMemo } from 'react';

const Cart = () => {
    // Assuming these are the items already in the cart (from state or context)
    const [cartItems, setCartItems] = useState([
        { id: 1, title: 'Bora', author: 'Akhanda Bhandari', price: 800, quantity: 1 },
        { id: 2, title: 'Metamorphosis', author: 'Franz Kafka', price: 200, quantity: 7 }
    ]);
    const [orderPlaced, setOrderPlaced] = useState(false);

    const handleQuantityChange = (id, delta) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    };

    const handleRemoveItem = (id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const subtotal = useMemo(() =>
        cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems]
    );

    // Volume Discount: 5% if subtotal is Rs. 1000 or more
    const volumeDiscount = subtotal >= 1000 ? subtotal * 0.05 : 0;

    // Loyalty Discount: 10% if subtotal is Rs. 1000 or more
    const loyaltyDiscount = subtotal >= 1000 ? subtotal * 0.10 : 0;

    const total = subtotal - volumeDiscount - loyaltyDiscount;

    const handlePlaceOrder = () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        // Simulate sending to backend
        console.log("Order placed:", cartItems);
        console.log("Total: Rs.", total);

        // Clear cart and show message
        setCartItems([]);
        setOrderPlaced(true);

        // Optionally reset the message after some time
        setTimeout(() => setOrderPlaced(false), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Shopping Cart */}
                    <div className="bg-white rounded-lg shadow-lg p-6 flex-1">
                        <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>

                        {cartItems.length === 0 && (
                            <p className="text-gray-500">Your cart is empty.</p>
                        )}

                        {cartItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between border-b py-4">
                                <div className="flex items-center space-x-4">
                                    <img src="https://via.placeholder.com/50" alt="Book Cover" className="w-16 h-24 object-cover rounded" />
                                    <div>
                                        <h3 className="font-semibold">{item.title}</h3>
                                        <p className="text-gray-600">by {item.author}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center border rounded">
                                        <button className="px-2 py-1" onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                                        <span className="px-4">{item.quantity}</span>
                                        <button className="px-2 py-1" onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                                    </div>
                                    <p className="font-semibold">Rs.{item.price * item.quantity}</p>
                                    <button className="text-red-500" onClick={() => handleRemoveItem(item.id)}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full lg:w-1/3">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <p>Subtotal</p>
                                <p>Rs.{subtotal}</p>
                            </div>
                            {volumeDiscount > 0 && (
                                <div className="flex justify-between text-red-500">
                                    <p>Volume Discount (5%)</p>
                                    <p>-Rs.{volumeDiscount.toFixed(0)}</p>
                                </div>
                            )}
                            {loyaltyDiscount > 0 && (
                                <div className="flex justify-between text-red-500">
                                    <p>Loyalty Discount (10%)</p>
                                    <p>-Rs.{loyaltyDiscount.toFixed(0)}</p>
                                </div>
                            )}
                            <div className="flex justify-between font-bold border-t pt-2">
                                <p>Total</p>
                                <p>Rs.{total.toFixed(0)}</p>
                            </div>
                        </div>
                        <button
                            className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700"
                            onClick={handlePlaceOrder}
                        >
                            Place Order
                        </button>
                        {orderPlaced && (
                            <p className="text-green-600 mt-4 font-medium">Order placed successfully!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
