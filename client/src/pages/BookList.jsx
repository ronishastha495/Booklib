import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import BookService from '../services/bookService';
import { toast } from 'sonner';
import { useAnnouncementContext } from '../contexts/AnnouncementContext';

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

    const [books, setBooks] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [genre, setGenre] = useState("");
    const [availability, setAvailability] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("dateAdded");
    const [sortOrder, setSortOrder] = useState("desc");
    const [category, setCategory] = useState("all");
    const [categoryCounts, setCategoryCounts] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState(formatDateTime());
    const currentUser = auth?.user?.email || 'Guest';

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(formatDateTime());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const data = await BookService.getCategoryCounts();
                setCategoryCounts(data);
            } catch {
                setCategoryCounts({});
            }
        };
        fetchCounts();
    }, []);

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
            } catch {
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
        setPage(1);
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
        <div className="min-h-screen bg-gradient-to-b from-[#fdf6e3] via-[#f5f0dc] to-[#e8e1c6] font-serif text-stone-900">
            {/* Navbar */}
            <nav className="bg-[#f5f0dc] border-b border-stone-400 shadow-inner fixed top-0 w-full z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Brand name on the far left */}
                    <Link to="/" className="text-3xl font-serif font-bold text-stone-800">
                        Booklib
                    </Link>

                    {/* Navigation & user controls */}
                    <div className="flex items-center space-x-6">
                        {/* Filters or links could go here */}

                        {/* User icons */}
                        {auth?.token ? (
                            <>
                                <Link to="/dashboard" title="User Dashboard" className="text-stone-700 hover:text-stone-900 transition">
                                    <FaUser className="w-6 h-6" />
                                </Link>
                                <Link to="/cart" title="Cart" className="relative text-stone-700 hover:text-stone-900 transition">
                                    <FaShoppingCart className="w-6 h-6" />
                                    {cartItems.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-stone-700 text-[#fdf6e3] rounded-full text-xs w-5 h-5 flex items-center justify-center border-2 border-[#fdf6e3]">
                                            {cartItems.length}
                                        </span>
                                    )}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    title="Logout"
                                    className="text-stone-700 hover:text-stone-900 transition"
                                >
                                    <FaSignOutAlt className="w-6 h-6" />
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="text-stone-700 hover:text-stone-900 font-semibold">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Spacer for fixed navbar */}
            <div className="h-20" />

            {/* Date & User */}
            <div className="bg-[#d9cbb6] border-b border-stone-400 py-2 px-6 flex justify-between text-sm tracking-wide">
                <div>{currentDateTime}</div>
                <div>Welcome, {currentUser}</div>
            </div>

            {/* Dialog */}
            {showDialog && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-[#f8f1d8] border border-stone-400 shadow-md px-8 py-3 rounded-lg text-stone-800 font-semibold z-50">
                    Book added to cart!
                </div>
            )}

            {/* Filters */}
            <section className="max-w-7xl mx-auto px-6 mt-6 flex flex-wrap gap-3 items-center">
                <select
                    className="rounded-full border border-stone-400 bg-[#fdf6e3] px-4 py-1 text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-600"
                    value={genre}
                    onChange={e => handleFilters('genre', e.target.value)}
                >
                    {genres.map(g => (
                        <option key={g} value={g === "All" ? "" : g}>{g}</option>
                    ))}
                </select>
                <select
                    className="rounded-full border border-stone-400 bg-[#fdf6e3] px-4 py-1 text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-600"
                    value={availability}
                    onChange={e => handleFilters('availability', e.target.value)}
                >
                    {availabilities.map(a => (
                        <option key={a.label} value={a.value}>{a.label}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Search books…"
                    value={search}
                    onChange={e => handleFilters('search', e.target.value)}
                    className="rounded-full border border-stone-400 bg-[#fdf6e3] px-4 py-1 text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-600 flex-grow min-w-[200px]"
                />
                <select
                    className="rounded-full border border-stone-400 bg-[#fdf6e3] px-4 py-1 text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-600"
                    onChange={e => handleFilters('sort', e.target.value)}
                >
                    {sortOptions.map(opt => (
                        <option key={opt.label}>{opt.label}</option>
                    ))}
                </select>
            </section>

            {/* Announcements */}
            {!announcementsLoading && filteredAnnouncements.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 py-4 bg-[#f5f0dc] border border-stone-400 rounded-lg mt-6 shadow-inner">
                    <h3 className="text-lg font-semibold mb-3 text-stone-800">Announcements</h3>
                    <ul className="space-y-2">
                        {filteredAnnouncements.map(a => (
                            <li key={a.announcementId} className="flex gap-3">
                                <span className="bg-stone-700 text-[#fdf6e3] px-2 rounded font-semibold text-xs">{a.category}</span>
                                <p className="text-stone-800"><strong>{a.title}:</strong> {a.content}</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Categories */}
            <nav className="max-w-7xl mx-auto px-6 mt-8 flex flex-wrap gap-3">
                {categories.map(cat => (
                    <button
                        key={cat.value}
                        onClick={() => handleFilters('category', cat.value)}
                        className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors border shadow-sm font-serif
                            ${category === cat.value
                                ? "bg-stone-700 text-[#fdf6e3] border-stone-700 scale-105"
                                : "bg-[#fdf6e3] text-stone-700 border-stone-400 hover:bg-stone-200"
                            }`}
                    >
                        {cat.label} {categoryCounts[cat.value] ? `(${categoryCounts[cat.value]})` : ""}
                    </button>
                ))}
            </nav>

            {/* Page Size and Count */}
            <div className="max-w-7xl mx-auto px-6 mt-6 flex justify-between items-center text-stone-700 text-sm font-serif">
                <div className="flex items-center gap-2">
                    <label>Books per page:</label>
                    <select
                        value={pageSize}
                        onChange={e => handleFilters('pageSize', e.target.value)}
                        className="rounded-full border border-stone-400 bg-[#fdf6e3] px-3 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-600"
                    >
                        {[10, 20, 50].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>
                <div>
                    Showing {Math.min((page - 1) * pageSize + 1, totalCount)} - {Math.min(page * pageSize, totalCount)} of {totalCount} books
                </div>
            </div>

            {/* Book Grid */}
            <main className="max-w-7xl mx-auto px-6 mt-6">
                {loading ? (
                    <div className="flex justify-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-stone-700"></div>
                    </div>
                ) : error ? (
                    <p className="text-center text-red-700 font-serif py-24">{error}</p>
                ) : books.length === 0 ? (
                    <p className="text-center text-stone-500 font-serif py-24">No books found.</p>
                ) : (
                    <div
                        className="font-serif text-stone-900"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "1.5rem",
                        }}
                    >
                        {books.map(book => (
                            <article
                                key={book.id}
                                className="bg-[#fdf6e3] border border-stone-400 rounded-lg shadow-inner p-4 flex flex-col"
                            >
                                <img
                                    src={book.image}
                                    alt={book.title}
                                    className="w-full h-56 object-cover rounded-md border border-stone-300 shadow-sm mb-4"
                                    onError={e => { e.target.onerror = null; e.target.src = "/placeholder-book.png"; }}
                                />
                                <h2 className="text-xl font-semibold mb-1">{book.title}</h2>
                                <p className="italic mb-2 text-stone-700">by {book.author}</p>
                                <div className="flex flex-wrap gap-2 mb-3 text-xs">
                                    {book.isBestseller && <span className="bg-stone-700 text-[#fdf6e3] rounded-full px-3 py-1 font-semibold">Bestseller</span>}
                                    {book.isAwardWinner && <span className="bg-stone-600 text-[#fdf6e3] rounded-full px-3 py-1 font-semibold">Award Winner</span>}
                                    {book.isComingSoon && <span className="bg-stone-500 text-[#fdf6e3] rounded-full px-3 py-1 font-semibold">Coming Soon</span>}
                                    {book.onSale && <span className="bg-amber-700 text-[#fdf6e3] rounded-full px-3 py-1 font-semibold">Sale</span>}
                                </div>
                                <div className="flex items-center gap-4 mb-3">
                                    <span className={`text-lg font-bold ${book.onSale ? "text-amber-700" : "text-stone-900"}`}>
                                        ₹{book.onSale ? book.discountPrice : book.price}
                                    </span>
                                    {book.onSale && (
                                        <span className="line-through text-stone-500">₹{book.price}</span>
                                    )}
                                </div>
                                <p className="text-sm mb-4 text-stone-700">Rating: {book.rating}</p>
                                <div className="mt-auto flex gap-4 flex-wrap">
                                    <button
                                        onClick={() => handleViewDetails(book.id)}
                                        className="px-5 py-2 rounded-full border border-stone-700 text-stone-700 hover:bg-stone-700 hover:text-[#fdf6e3] transition-colors font-semibold"
                                    >
                                        Details
                                    </button>
                                    <button
                                        onClick={() => handleAddToCart(book)}
                                        disabled={book.stockQuantity === 0}
                                        className={`px-5 py-2 rounded-full font-semibold transition-colors ${book.stockQuantity === 0
                                                ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                                                : "bg-amber-700 text-[#fdf6e3] hover:bg-amber-800"
                                            }`}
                                    >
                                        {book.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="max-w-7xl mx-auto px-6 mt-10 flex justify-center gap-3">
                    {[...Array(totalPages)].map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setPage(idx + 1)}
                            className={`px-4 py-2 rounded-full font-semibold border transition-all ${page === idx + 1
                                    ? "bg-stone-700 text-[#fdf6e3] border-stone-700 scale-105"
                                    : "bg-[#fdf6e3] text-stone-700 border-stone-400 hover:bg-stone-200"
                                }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookList;