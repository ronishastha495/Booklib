import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft, FaShoppingCart, FaHeart, FaRegHeart } from "react-icons/fa";
import { useCart } from '../contexts/CartContext';

// Utility functions for bookmarks
const getBookmarks = () => {
    try {
        return JSON.parse(localStorage.getItem('bookmarks')) || [];
    } catch {
        return [];
    }
};

const setBookmarks = (bookmarks) => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
};

const formatDateTime = (date) => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

const BACKEND_URL = "http://localhost:5259";

const BookDetail = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDateTime, setCurrentDateTime] = useState(formatDateTime(new Date()));
    const currentUser = "BipanaPokharel"; // You can replace this with actual user data

    const { addToCart } = useCart();

    // Update date/time every second
    useEffect(() => {
        const updateDateTime = () => {
            setCurrentDateTime(formatDateTime(new Date()));
        };

        const timer = setInterval(updateDateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch book data
    useEffect(() => {
        const fetchBook = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${BACKEND_URL}/api/Book/GetById/${id}`);
                if (!response.ok) {
                    throw new Error('Book not found');
                }
                const data = await response.json();
                setBook({
                    bookId: data.bookId,
                    title: data.title,
                    author: data.author,
                    imageURL: data.imageURL || "https://via.placeholder.com/300x450?text=No+Image",
                    isbn: data.isbn,
                    description: data.description,
                    genre: data.genre,
                    price: data.price,
                    yearPublished: data.yearPublished,
                    publisher: data.publisher,
                    language: data.language,
                    format: data.format,
                    stockQuantity: data.stockQuantity,
                    isAvailable: data.isAvailable,
                    onSale: data.onSale,
                    discountPrice: data.discountPrice,
                    discountEndDate: data.discountEndDate,
                    addedDate: data.addedDate
                });
                setError(null);
            } catch (error) {
                setError('Failed to load book details. Please try again later.');
                setBook(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBook();
        }
    }, [id]);

    // Bookmark logic
    useEffect(() => {
        setIsBookmarked(getBookmarks().includes(id));
    }, [id]);

    const toggleBookmark = () => {
        const bookmarks = getBookmarks();
        let updated;
        if (isBookmarked) {
            updated = bookmarks.filter(bookId => bookId !== id);
        } else {
            updated = [...bookmarks, id];
        }
        setBookmarks(updated);
        setIsBookmarked(!isBookmarked);
    };

    const handleAddToCart = () => {
        if (book) {
            const bookForCart = {
                id: book.bookId,
                title: book.title,
                author: book.author,
                price: book.onSale ? book.discountPrice : book.price,
                image: book.imageURL,
                quantity: quantity
            };
            addToCart(bookForCart);
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 2000);
        }
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (book && value > 0 && value <= book.stockQuantity) {
            setQuantity(value);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-gray-800 text-white py-2 px-4">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="text-sm">
                            Current Date and Time (UTC): {currentDateTime}
                        </div>
                        <div className="text-sm">
                            Current User's Login: {currentUser}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center flex-1 h-[calc(100vh-40px)]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-700">Loading book details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !book) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-gray-800 text-white py-2 px-4">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="text-sm">
                            Current Date and Time (UTC): {currentDateTime}
                        </div>
                        <div className="text-sm">
                            Current User's Login: {currentUser}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center flex-1 h-[calc(100vh-40px)]">
                    <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                        <p className="text-gray-700 mb-6">{error}</p>
                        <Link
                            to="/books"
                            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                        >
                            Back to Books
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!book) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gray-800 text-white py-2 px-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="text-sm">
                        Current Date and Time (UTC): {currentDateTime}
                    </div>
                    <div className="text-sm">
                        Current User's Login: {currentUser}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <Link
                        to="/books"
                        className="flex items-center text-gray-700 mb-6 hover:text-indigo-600 transition"
                    >
                        <FaArrowLeft className="mr-2" /> Back to Books
                    </Link>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="md:flex">
                            {/* Book Image */}
                            <div className="md:w-1/3 bg-gray-100 flex items-center justify-center p-8">
                                <img
                                    src={book.imageURL}
                                    alt={book.title}
                                    className="object-contain max-h-96 w-auto rounded shadow-md"
                                />
                            </div>

                            {/* Book Details */}
                            <div className="md:w-2/3 p-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                                        <p className="text-xl text-gray-700 mb-4">by {book.author}</p>
                                    </div>
                                    <button
                                        onClick={toggleBookmark}
                                        className="text-2xl p-2 hover:text-yellow-500 transition"
                                        title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                                    >
                                        {isBookmarked ? <FaHeart className="text-yellow-500" /> : <FaRegHeart />}
                                    </button>
                                </div>

                                {/* Price Section */}
                                <div className="mb-6">
                                    {book.onSale ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-indigo-600">
                                                ₹{book.discountPrice.toFixed(2)}
                                            </span>
                                            <span className="text-lg text-gray-500 line-through">
                                                ₹{book.price.toFixed(2)}
                                            </span>
                                            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm font-medium">
                                                {Math.round(((book.price - book.discountPrice) / book.price) * 100)}% OFF
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-2xl font-bold text-indigo-600">
                                            ₹{book.price.toFixed(2)}
                                        </span>
                                    )}
                                    {book.onSale && book.discountEndDate && (
                                        <p className="text-sm text-red-600 mt-1">
                                            Sale ends on {new Date(book.discountEndDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>

                                {/* Book Details Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="mb-2"><span className="font-semibold">Genre:</span> {book.genre}</p>
                                        <p className="mb-2"><span className="font-semibold">Format:</span> {book.format}</p>
                                        <p className="mb-2"><span className="font-semibold">ISBN:</span> {book.isbn}</p>
                                    </div>
                                    <div>
                                        <p className="mb-2"><span className="font-semibold">Publisher:</span> {book.publisher}</p>
                                        <p className="mb-2"><span className="font-semibold">Published:</span> {book.yearPublished}</p>
                                        <p className="mb-2"><span className="font-semibold">Language:</span> {book.language}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold mb-2">Description</h2>
                                    <p className="text-gray-700">{book.description}</p>
                                </div>

                                {/* Add to Cart Section */}
                                <div className="flex items-center justify-between mt-8">
                                    <div className="flex items-center">
                                        <p className="mr-4 text-gray-700">
                                            {book.stockQuantity > 0 ? (
                                                <span className="text-green-600">In Stock ({book.stockQuantity} available)</span>
                                            ) : (
                                                <span className="text-red-600">Out of Stock</span>
                                            )}
                                        </p>
                                        <input
                                            type="number"
                                            min="1"
                                            max={book.stockQuantity}
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            className="w-16 px-2 py-1 border rounded text-center"
                                            disabled={!book.isAvailable || book.stockQuantity === 0}
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={!book.isAvailable || book.stockQuantity === 0}
                                        className={`flex items-center px-6 py-3 rounded-lg text-white font-medium transition ${isAdded
                                            ? "bg-green-600"
                                            : book.isAvailable && book.stockQuantity > 0
                                                ? "bg-indigo-600 hover:bg-indigo-700"
                                                : "bg-gray-400 cursor-not-allowed"
                                            }`}
                                    >
                                        <FaShoppingCart className="mr-2" />
                                        {isAdded ? "Added to Cart" : "Add to Cart"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetail;