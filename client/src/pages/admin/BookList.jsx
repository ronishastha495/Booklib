import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from '../../contexts/CartContext';

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

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(2);
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

    const { cartItems, addToCart } = useCart();
    const [showDialog, setShowDialog] = useState(false);

    // Fetch category counts
    useEffect(() => {
        fetch('/api/Book/Categories')
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch categories");
                return res.json();
            })
            .then(data => setCategoryCounts(data))
            .catch(() => setCategoryCounts({}));
    }, []);

    // Fetch books based on filters or category
    useEffect(() => {
        setLoading(true);
        setError(null);

        let url;
        if (category !== "all") {
            url = `/api/Book/Categories/${category}`;
        } else {
            const params = new URLSearchParams({
                page,
                pageSize,
                ...(genre && genre !== "All" ? { genre } : {}),
                ...(availability !== "" ? { isAvailable: availability } : {}),
                ...(search ? { search } : {}),
                ...(sortBy ? { sortBy } : {}),
                ...(sortOrder ? { sortOrder } : {})
            });
            url = `/api/Book/GetFiltered?${params}`;
        }

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch books");
                return res.json();
            })
            .then(data => {
                const bookData = category !== "all" ? data : data.Books;
                setBooks(bookData.map(book => ({
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
                setTotalCount(category !== "all" ? bookData.length : data.TotalCount);
                setTotalPages(category !== "all" ? 1 : data.TotalPages);
            })
            .catch(() => {
                setBooks([]);
                setTotalCount(0);
                setTotalPages(1);
                setError("Could not load books.");
            })
            .finally(() => setLoading(false));
    }, [page, pageSize, genre, availability, search, sortBy, sortOrder, category]);

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
        const idx = e.target.selectedIndex;
        setSortBy(sortOptions[idx].value.sortBy);
        setSortOrder(sortOptions[idx].value.sortOrder);
        setCategory("all");
        setPage(1);
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
            {/* Dialog Box */}
            {showDialog && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 shadow-lg px-6 py-3 rounded-lg z-50 text-gray-700">
                    Book added to cart!
                </div>
            )}

            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">BookLib</h1>
                    <div className="flex items-center space-x-4">
                        {/* Genre Filter */}
                        <select
                            className="border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                            value={genre}
                            onChange={handleGenreChange}
                        >
                            {genres.map(g => (
                                <option key={g} value={g === "All" ? "" : g}>{g}</option>
                            ))}
                        </select>
                        {/* Availability Filter */}
                        <select
                            className="border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                            value={availability}
                            onChange={handleAvailabilityChange}
                        >
                            {availabilities.map(a => (
                                <option key={a.label} value={a.value}>{a.label}</option>
                            ))}
                        </select>
                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={handleSearch}
                            className="border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                        />
                        {/* Sort */}
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Category Selector */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => handleCategoryChange(cat.value)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                category === cat.value
                                    ? "bg-amber-600 text-white"
                                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                            {cat.label} {categoryCounts[cat.value] ? `(${categoryCounts[cat.value]})` : ""}
                        </button>
                    ))}
                </div>
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
                            {[2, 3, 5, 10, 20].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <p className="text-sm text-gray-600">
                        Showing {(page - 1) * pageSize + 1}- {Math.min(page * pageSize, totalCount)} of {totalCount} books
                    </p>
                </div>
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
                                <img
                                    src={book.image}
                                    alt={book.title}
                                    className="w-40 h-56 object-cover rounded-md mb-4"
                                />
                                <h3 className="text-lg font-medium text-gray-900 text-center line-clamp-2">{book.title}</h3>
                                <p className="text-sm text-gray-500 text-center">{book.author}</p>
                                <p className="text-lg font-semibold text-gray-900 mt-2">₹{book.price}</p>
                                <p className="text-sm text-gray-500 flex items-center">
                                    <span className="text-amber-500 mr-1">★</span> {book.rating}
                                </p>
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
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-l-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPage(i + 1)}
                                    className={`px-4 py-2 border border-gray-200 text-sm font-medium ${
                                        page === i + 1
                                            ? "bg-amber-600 text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(page + 1)}
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