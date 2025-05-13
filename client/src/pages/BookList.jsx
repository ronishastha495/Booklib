import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import BookService from '../services/bookservice';
import { toast } from 'sonner';
import { useAnnouncementContext } from '../contexts/AnnouncementContext';

// Constants
const genres = ["All", "Fiction", "Non-Fiction", "Science", "Technology"];
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
    return now.toISOString().slice(0, 19).replace('T', ' ');
};

const BookList = () => {
    const navigate = useNavigate();
    const { auth, logout } = useAuth();
    const { cartItems, addToCart } = useCart();

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
    const currentUser = auth?.user?.email || 'Guest';

    // Update date/time every second
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

    // Fetch books with filters
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
                        image: book.imageURL || "/placeholder-book.png",
                        isBestseller: book.isBestseller,
                        isAwardWinner: book.isAwardWinner,
                        isComingSoon: book.isComingSoon,
                        onSale: book.onSale,
                        stockQuantity: book.stockQuantity,
                        discountPrice: book.discountPrice
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
                        image: book.imageURL || "/placeholder-book.png",
                        isBestseller: book.isBestseller,
                        isAwardWinner: book.isAwardWinner,
                        isComingSoon: book.isComingSoon,
                        onSale: book.onSale,
                        stockQuantity: book.stockQuantity,
                        discountPrice: book.discountPrice
                    })));
                    setTotalCount(response.totalCount);
                    setTotalPages(response.totalPages);
                }
            } catch (err) {
                console.error("Error fetching books:", err);
                setError("Could not load books. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, [page, pageSize, genre, availability, search, sortBy, sortOrder, category]);

    const handleViewDetails = (bookId) => {
        if (!auth?.token) {
            toast.error("Please login to view book details");
            navigate('/login', { state: { from: `/books/${bookId}` } });
            return;
        }
        navigate(`/books/${bookId}`);
    };

    const handleAddToCart = (book) => {
        if (!auth?.token) {
            toast.error("Please login to add items to cart");
            navigate('/login', { state: { from: '/books' } });
            return;
        }

        const bookForCart = {
            id: book.id,
            title: book.title,
            author: book.author,
            price: book.onSale ? book.discountPrice : book.price,
            image: book.image,
            quantity: 1,
            stockQuantity: book.stockQuantity
        };

        addToCart(bookForCart);
        setShowDialog(true);
        setTimeout(() => setShowDialog(false), 1200);
    };

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        navigate('/login');
    };

    const handleFilters = (type, value) => {
        setPage(1); // Reset to first page when filters change
        switch (type) {
            case 'genre':
                setGenre(value);
                setCategory("all");
                break;
            case 'availability':
                setAvailability(value);
                setCategory("all");
                break;
            case 'search':
                setSearch(value);
                setCategory("all");
                break;
            case 'sort':
                const option = sortOptions.find(opt => opt.label === value);
                if (option) {
                    setSortBy(option.value.sortBy);
                    setSortOrder(option.value.sortOrder);
                }
                setCategory("all");
                break;
            case 'category':
                setCategory(value);
                setGenre("");
                setAvailability("");
                setSearch("");
                break;
            case 'pageSize':
                setPageSize(Number(value));
                setPage(1);
                break;
            default:
                break;
        }
    };

    const { announcements: activeAnnouncements, loading: announcementsLoading } = useAnnouncementContext();
    const now = new Date();
    const filteredAnnouncements = activeAnnouncements?.filter(announcement => 
        announcement.isActive && 
        new Date(announcement.startDate) <= now && 
        new Date(announcement.endDate) >= now
    ) || [];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* DateTime Header */}
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
                            className="border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            value={genre}
                            onChange={(e) => handleFilters('genre', e.target.value)}
                        >
                            {genres.map(g => (
                                <option key={g} value={g === "All" ? "" : g}>{g}</option>
                            ))}
                        </select>
                        <select
                            className="border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            value={availability}
                            onChange={(e) => handleFilters('availability', e.target.value)}
                        >
                            {availabilities.map(a => (
                                <option key={a.label} value={a.value}>{a.label}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => handleFilters('search', e.target.value)}
                            className="border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                        <select
                            className="border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            onChange={(e) => handleFilters('sort', e.target.value)}
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.label}>{opt.label}</option>
                            ))}
                        </select>
                        {auth?.token && (
                            <>
                                <Link to="/dashboard" className="relative" title="User Dashboard">
                                    <button className="text-gray-700 hover:text-indigo-600">
                                        <FaUser className="w-6 h-6" />
                                    </button>
                                </Link>
                                <Link to="/cart" className="relative" title="Cart">
                                    <button className="text-gray-700 hover:text-indigo-600">
                                        <FaShoppingCart className="w-6 h-6" />
                                        {cartItems.length > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                                                {cartItems.length}
                                            </span>
                                        )}
                                    </button>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-700 hover:text-indigo-600"
                                    title="Logout"
                                >
                                    <FaSignOutAlt className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Announcements Section */}
            {!announcementsLoading && filteredAnnouncements.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-blue-800 mb-2">Announcements</h3>
                        <div className="space-y-2">
                            {filteredAnnouncements.map(announcement => (
                                <div key={announcement.announcementId} className="flex items-start">
                                    <span className="flex-shrink-0 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded mr-2">
                                        {announcement.category}
                                    </span>
                                    <p className="text-sm text-blue-700">
                                        <strong>{announcement.title}:</strong> {announcement.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Categories */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => handleFilters('category', cat.value)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                category === cat.value
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                            {cat.label} {categoryCounts[cat.value] ? `(${categoryCounts[cat.value]})` : ""}
                        </button>
                    ))}
                </div>

                {/* Page Size and Count */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700">Books per page:</label>
                        <select
                            value={pageSize}
                            onChange={(e) => handleFilters('pageSize', e.target.value)}
                            className="border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                            {[10, 20, 50].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <p className="text-sm text-gray-600">
                        Showing {Math.min((page - 1) * pageSize + 1, totalCount)} - {Math.min(page * pageSize, totalCount)} of {totalCount} books
                    </p>
                </div>

                {/* Book Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {books.map((book) => (
                            <div
                                key={book.id}
                                className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center transition-transform hover:scale-105 relative"
                            >
                                {/* Badges */}
                                {book.isBestseller && (
                                    <span className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                        Bestseller
                                    </span>
                                )}
                                {book.isAwardWinner && (
                                    <span className="absolute top-2 right-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                        Award Winner
                                    </span>
                                )}

                                {/* Book Image */}
                                <img
                                    src={book.image}
                                    alt={book.title}
                                    className="w-40 h-56 object-cover rounded-md mb-4"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/placeholder-book.png";
                                    }}
                                />

                                {/* Book Info */}
                                <h3 className="text-lg font-medium text-gray-900 text-center mb-1">{book.title}</h3>
                                <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                                <div className="flex items-center space-x-2 mb-4">
                                    {book.onSale ? (
                                        <>
                                            <span className="text-lg font-bold text-indigo-600">₹{book.discountPrice}</span>
                                            <span className="text-sm text-gray-500 line-through">₹{book.price}</span>
                                        </>
                                    ) : (
                                        <span className="text-lg font-bold text-gray-900">₹{book.price}</span>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col space-y-2 w-full">
                                    {auth?.token ? (
                                        <>
                                            <button
                                                onClick={() => handleViewDetails(book.id)}
                                                className="w-full py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => handleAddToCart(book)}
                                                disabled={!book.stockQuantity}
                                                className={`w-full py-2 rounded-md transition-colors ${
                                                    book.stockQuantity
                                                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                }`}
                                            >
                                                {book.stockQuantity ? "Add to Cart" : "Out of Stock"}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => navigate('/login', { state: { from: '/books' } })}
                                            className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                        >
                                            Login to Purchase
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && category === "all" && (
                    <div className="flex justify-center mt-8">
                        <nav className="inline-flex rounded-md shadow-sm">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPage(i + 1)}
                                    className={`px-3 py-1 border-t border-b border-gray-300 text-sm font-medium ${
                                        page === i + 1
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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