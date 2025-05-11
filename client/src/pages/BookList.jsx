import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from '../contexts/CartContext';
import BookService from "../services/bookService";

// Constants
const genres = ["All", "Fiction", "Non-Fiction"];
const availabilities = [
    { label: "All", value: "" },
    { label: "In Stock", value: true },
    { label: "Out of Stock", value: false }
];
const sortOptions = [
    { label: "Latest", value: { sortBy: "dateAdded", sortOrder: "desc" } },
    { label: "Price Low to High", value: { sortBy: "price", sortOrder: "asc" } },
    { label: "Price High to Low", value: { sortBy: "price", sortOrder: "desc" } }
];
const categories = [
    { label: "All", value: "all" },
    { label: "Bestsellers", value: "bestsellers" },
    { label: "Award Winners", value: "award-winners" },
    { label: "New Releases", value: "new-releases" },
    { label: "New Arrivals", value: "new-arrivals" },
    { label: "Coming Soon", value: "coming-soon" },
    { label: "Deals", value: "deals" }
];

const formatDateTime = () => {
    const now = new Date();
    return now.getUTCFullYear() + '-' +
        String(now.getUTCMonth() + 1).padStart(2, '0') + '-' +
        String(now.getUTCDate()).padStart(2, '0') + ' ' +
        String(now.getUTCHours()).padStart(2, '0') + ':' +
        String(now.getUTCMinutes()).padStart(2, '0') + ':' +
        String(now.getUTCSeconds()).padStart(2, '0');
};

const BookList = () => {
    // Pagination states
    const [books, setBooks] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Filter states
    const [genre, setGenre] = useState("");
    const [availability, setAvailability] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("dateAdded");
    const [sortOrder, setSortOrder] = useState("desc");
    const [category, setCategory] = useState("all");
    const [categoryCounts, setCategoryCounts] = useState({});

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState(formatDateTime());
    const currentUser = "BipanaPokharel";

    const { cartItems, addToCart } = useCart();

    // Date/time update effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(formatDateTime());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch category counts
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const data = await BookService.getCategoryCounts();
                setCategoryCounts(data);
            } catch (err) {
                console.error("Error fetching category counts:", err);
                setCategoryCounts({});
            }
        };
        fetchCounts();
    }, []);

    // Fetch books
    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            setError(null);

            try {
                let data;
                if (category !== "all") {
                    data = await BookService.getBooksByCategory(category);
                    setBooks(data.map(book => ({
                        id: book.bookId,
                        title: book.title,
                        author: book.author,
                        price: book.price,
                        rating: book.rating || "N/A",
                        image: book.imageURL || "https://via.placeholder.com/128x192?text=No+Image",
                        isBestseller: book.isBestseller,
                        isAwardWinner: book.isAwardWinner,
                        isComingSoon: book.isComingSoon,
                        onSale: book.onSale
                    })));
                    setTotalCount(data.length);
                    setTotalPages(1);
                } else {
                    const filters = {
                        page,
                        pageSize,
                        ...(genre && genre !== "All" ? { genre } : {}),
                        ...(availability !== "" ? { isAvailable: availability } : {}),
                        ...(search ? { search } : {}),
                        sortBy,
                        sortOrder
                    };
                    const response = await BookService.getFilteredBooks(filters);
                    setBooks(response.books.map(book => ({
                        id: book.bookId,
                        title: book.title,
                        author: book.author,
                        price: book.price,
                        rating: book.rating || "N/A",
                        image: book.imageURL || "https://via.placeholder.com/128x192?text=No+Image",
                        isBestseller: book.isBestseller,
                        isAwardWinner: book.isAwardWinner,
                        isComingSoon: book.isComingSoon,
                        onSale: book.onSale
                    })));
                    setTotalCount(response.totalCount);
                    setTotalPages(response.totalPages);
                }
            } catch (err) {
                console.error("Error fetching books:", err);
                setBooks([]);
                setTotalCount(0);
                setTotalPages(1);
                setError("Could not load books.");
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, [page, pageSize, genre, availability, search, sortBy, sortOrder, category]);

    // Event handlers
    const handleAddToCart = (book) => {
        addToCart(book);
        setShowDialog(true);
        setTimeout(() => setShowDialog(false), 1200);
    };

    const handleGenreChange = (e) => {
        setGenre(e.target.value);
        setCategory("all");
        setPage(1);
    };

    const handleAvailabilityChange = (e) => {
        setAvailability(e.target.value);
        setCategory("all");
        setPage(1);
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCategory("all");
        setPage(1);
    };

    const handleSortChange = (e) => {
        const selectedOption = sortOptions.find(opt => opt.label === e.target.value);
        if (selectedOption && selectedOption.value) {
            setSortBy(selectedOption.value.sortBy);
            setSortOrder(selectedOption.value.sortOrder);
            setCategory("all");
            setPage(1);
        }
    };

    const handleCategoryChange = (catValue) => {
        setCategory(catValue);
        setGenre("");
        setAvailability("");
        setSearch("");
        setPage(1);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* DateTime Header */}
            <div className="bg-gray-800 text-white py-2 px-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="text-sm">
                        Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): {currentDateTime}
                    </div>
                    <div className="text-sm">
                        Current User's Login: {currentUser}
                    </div>
                </div>
            </div>

            {/* Dialog Box */}
            {showDialog && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 shadow-lg px-6 py-3 rounded-lg z-50 text-gray-700">
                    Book added to cart!
                </div>
            )}

            {/* Main Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">BookLib</h1>
                    <div className="flex items-center space-x-4">
                        {/* Filters */}
                        <select
                            className="border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                            value={genre}
                            onChange={handleGenreChange}
                        >
                            {genres.map(g => (
                                <option key={g} value={g === "All" ? "" : g}>{g}</option>
                            ))}
                        </select>
                        <select
                            className="border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                            value={availability}
                            onChange={handleAvailabilityChange}
                        >
                            {availabilities.map(a => (
                                <option key={a.label} value={a.value}>{a.label}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={handleSearch}
                            className="border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                        />
                        <select
                            className="border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                            onChange={handleSortChange}
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.label}>{opt.label}</option>
                            ))}
                        </select>
                        <Link to="/cart" className="relative">
                            <button className="text-gray-700 hover:text-amber-600">
                                <FaShoppingCart className="w-6 h-6" />
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-amber-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                                        {cartItems.length}
                                    </span>
                                )}
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Categories */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => handleCategoryChange(cat.value)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${category === cat.value
                                ? "bg-amber-600 text-white"
                                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            {cat.label} {categoryCounts[cat.value] ? `(${categoryCounts[cat.value]})` : ""}
                        </button>
                    ))}
                </div>

                {/* Page Size Selector and Count */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="booksPerPage" className="text-sm text-gray-700">
                            Books per page:
                        </label>
                        <select
                            id="booksPerPage"
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                        >
                            {[10, 20, 50].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <p className="text-sm text-gray-600">
                        Showing {(page - 1) * pageSize + 1}- {Math.min(page * pageSize, totalCount)} of {totalCount} books
                    </p>
                </div>

                {/* Book Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {loading ? (
                        <p className="text-gray-600 col-span-full text-center">Loading books...</p>
                    ) : error ? (
                        <p className="text-red-600 col-span-full text-center">{error}</p>
                    ) : books.length > 0 ? (
                        books.map((book) => (
                            <div
                                key={book.id}
                                className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center transition-transform transform hover:scale-105 relative"
                            >
                                {/* Badges */}
                                {book.isBestseller && (
                                    <span className="absolute top-2 left-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                                        Bestseller
                                    </span>
                                )}
                                {book.isAwardWinner && (
                                    <span className="absolute top-2 left-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded mt-8">
                                        Award Winner
                                    </span>
                                )}
                                {book.isComingSoon && (
                                    <span className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                                        Coming Soon
                                    </span>
                                )}
                                {book.onSale && (
                                    <span className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded mt-8">
                                        On Sale
                                    </span>
                                )}

                                {/* Book Image */}
                                <img
                                    src={book.image}
                                    alt={book.title}
                                    className="w-40 h-56 object-cover rounded-md mb-4"
                                />

                                {/* Book Info */}
                                <h3 className="text-lg font-medium text-gray-900 text-center line-clamp-2">{book.title}</h3>
                                <p className="text-sm text-gray-500 text-center">{book.author}</p>
                                <p className="text-lg font-semibold text-gray-900 mt-2">₹{book.price}</p>
                                <p className="text-sm text-gray-500 flex items-center">
                                    <span className="text-amber-500 mr-1">★</span> {book.rating}
                                </p>

                                {/* Action Buttons */}
                                <Link to={`/books/${book.id}`}>
                                    <button className="w-full py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-300 transition-colors">
                                        View Details
                                    </button>
                                </Link>
                                <button
                                    className="mt-4 w-full py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    onClick={() => handleAddToCart(book)}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600 col-span-full text-center">No books available</p>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && category === "all" && (
                    <div className="flex justify-center mt-8">
                        <nav className="inline-flex rounded-md shadow-sm">
                            <button
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-l-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPage(i + 1)}
                                    className={`px-4 py-2 border border-gray-200 text-sm font-medium ${page === i + 1
                                        ? "bg-amber-600 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-r-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BookList;