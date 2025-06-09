import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import BookService from "../services/bookservice";
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
    { label: "All Books", value: "all" },
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

const Landing = () => {
    const navigate = useNavigate();
    const { auth, logout } = useAuth();
    const { cartItems, addToCart } = useCart();

    // Books state
    const [books, setBooks] = useState([]);
    const [totalCount, setTotalCount] = useState(0);

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
                } else {
                    const filters = {
                        page: 1,
                        pageSize: 12,
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
                }
            } catch (err) {
                setError("Could not load books. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, [genre, availability, search, sortBy, sortOrder, category]);

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

    const handleFilters = (type, value) => {
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
        <div className="min-h-screen bg-gradient-to-br from-[#f7efe5] via-[#f5e9d4] to-[#f8f5e4] font-serif">
            {/* Navbar */}
            <nav className="bg-[#f5f0dc] border-b border-stone-400 shadow-inner fixed top-0 w-full z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="text-3xl font-serif font-bold text-[#a9895a] hover:text-[#c97b63] transition">
                        BookLib
                    </Link>
                    <div className="flex items-center space-x-6">
                        {auth?.token ? (
                            <>
                                <Link to="/dashboard" title="User Dashboard" className="text-[#a9895a] hover:text-[#c97b63] transition">
                                    <FaUser className="w-6 h-6" />
                                </Link>
                                <Link to="/cart" title="Cart" className="relative text-[#a9895a] hover:text-[#c97b63] transition">
                                    <FaShoppingCart className="w-6 h-6" />
                                    {cartItems.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-[#c97b63] text-white rounded-full text-xs w-5 h-5 flex items-center justify-center border-2 border-white">
                                            {cartItems.length}
                                        </span>
                                    )}
                                </Link>
                                <button onClick={logout} title="Logout" className="text-[#a9895a] hover:text-[#c97b63] transition">
                                    <FaSignOutAlt className="w-6 h-6" />
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="text-[#a9895a] hover:text-[#c97b63] font-semibold">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
            {/* Spacer for fixed navbar */}
            <div className="h-20" />

            {/* DateTime Header */}
            <div className="bg-[#e3d5c3] text-stone-800 py-2 px-4 border-b border-[#e5ccb5] shadow">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="text-sm font-mono">📚 {currentDateTime}</div>
                    <div className="text-sm font-mono">👤 {auth?.user?.email || 'Guest'}</div>
                </div>
            </div>

            {/* Dialog Box */}
            {showDialog && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-[#fff8f0] border border-[#e5ccb5] shadow-xl px-8 py-4 rounded-2xl z-50 text-[#a9895a] font-semibold text-lg transition-all">
                    Book added to cart!
                </div>
            )}

            {/* Hero Section */}
            <div className="bg-[#ffe5ec] text-center py-10 px-4 border-b border-[#f3e8d8]">
                <h2 className="text-4xl font-bold text-[#c97b63] mb-2 font-serif tracking-tight drop-shadow-sm">
                    BookLib: Where Great Books Await You
                </h2>
                <p className="text-[#a9895a] max-w-2xl mx-auto text-lg">
                    Discover your next favorite read from trending BookTok picks, cozy classics, and more!
                </p>
            </div>

            {/* Announcements Section */}
            {!announcementsLoading && filteredAnnouncements.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="bg-[#f5e9d4] border border-[#e5ccb5] rounded-2xl p-4 shadow-sm">
                        <h3 className="text-lg font-semibold text-[#c97b63] mb-2 font-serif">Announcements</h3>
                        <div className="space-y-2">
                            {filteredAnnouncements.map(announcement => (
                                <div key={announcement.announcementId} className="flex items-start">
                                    <span className="flex-shrink-0 bg-[#ffe5ec] text-[#c97b63] text-xs font-semibold px-2 py-0.5 rounded mr-2">
                                        {announcement.category}
                                    </span>
                                    <p className="text-sm text-[#a9895a]">
                                        <strong>{announcement.title}:</strong> {announcement.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Categories */}
                <div className="mb-8 flex flex-wrap gap-2 justify-center">
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => handleFilters('category', cat.value)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border shadow-sm font-serif
                                ${category === cat.value
                                    ? "bg-[#ffe5ec] text-[#c97b63] border-[#f3e8d8] scale-105"
                                    : "bg-[#fff8f0] text-[#7c5e3c] border-[#e5ccb5] hover:bg-[#f3e8d8]"
                                }`}
                        >
                            {cat.label} {categoryCounts[cat.value] ? `(${categoryCounts[cat.value]})` : ""}
                        </button>
                    ))}
                </div>

                {/* Book Counter */}
                <div className="flex items-center justify-end mb-6">
                    <p className="text-sm text-[#a9895a] font-serif">
                        Showing {Math.min(books.length, totalCount)} of {totalCount} books
                    </p>
                </div>

                {/* Book Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#c97b63]"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-12">{error}</div>
                ) : (
                    <div
                        className="font-serif text-stone-900"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "2rem",
                        }}
                    >
                        {books.map(book => (
                            <article
                                key={book.id}
                                className="bg-[#fff8f0] border border-[#e5ccb5] rounded-2xl shadow-lg p-4 flex flex-col transition-transform hover:scale-105"
                            >
                                <img
                                    src={book.image}
                                    alt={book.title}
                                    className="w-full h-56 object-cover rounded-xl border border-[#f3e8d8] shadow mb-4 bg-[#f5e9d4]"
                                    onError={e => { e.target.onerror = null; e.target.src = "/placeholder-book.png"; }}
                                />
                                <h2 className="text-lg font-bold text-[#c97b63] mb-1 font-serif">{book.title}</h2>
                                <p className="text-sm text-[#a9895a] italic mb-2">by {book.author}</p>
                                <div className="flex flex-wrap gap-2 mb-3 text-xs">
                                    {book.isBestseller && (
                                        <span className="bg-[#ffe5ec] text-[#c97b63] rounded-full px-3 py-1 font-semibold">Bestseller</span>
                                    )}
                                    {book.isAwardWinner && (
                                        <span className="bg-[#f5e9d4] text-[#a9895a] rounded-full px-3 py-1 font-semibold">Award</span>
                                    )}
                                    {book.isComingSoon && (
                                        <span className="bg-[#f3e8d8] text-[#c97b63] rounded-full px-3 py-1 font-semibold">Coming Soon</span>
                                    )}
                                    {book.onSale && (
                                        <span className="bg-[#f8d7da] text-[#c97b63] rounded-full px-3 py-1 font-semibold">Sale</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-lg font-bold ${book.onSale ? "text-[#c97b63]" : "text-[#7c5e3c]"}`}>
                                        ₹{book.onSale ? book.discountPrice : book.price}
                                    </span>
                                    {book.onSale && (
                                        <span className="text-xs text-[#a9895a] line-through">₹{book.price}</span>
                                    )}
                                </div>
                                <div className="text-xs text-[#a9895a] mb-2">Rating: {book.rating}</div>
                                <div className="mt-auto flex gap-2">
                                    <button
                                        onClick={() => handleViewDetails(book.id)}
                                        className="px-4 py-1.5 rounded-full bg-[#ffe5ec] text-[#c97b63] font-semibold hover:bg-[#f3e8d8] transition"
                                    >
                                        Details
                                    </button>
                                    <button
                                        onClick={() => handleAddToCart(book)}
                                        className="px-4 py-1.5 rounded-full bg-[#c97b63] text-white font-bold hover:bg-[#a9895a] transition"
                                        disabled={book.stockQuantity === 0}
                                    >
                                        {book.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Landing;