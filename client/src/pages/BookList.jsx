import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from './CartContext';

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

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(2);
    const [totalPages, setTotalPages] = useState(1);

    const [genre, setGenre] = useState("");
    const [availability, setAvailability] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("dateadded");
    const [sortOrder, setSortOrder] = useState("desc");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { cartItems, addToCart } = useCart();
    const [showDialog, setShowDialog] = useState(false);

    // Fetch books from backend with filters/sort/pagination
    useEffect(() => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
            page,
            pageSize,
            ...(genre && genre !== "All" ? { genre } : {}),
            ...(availability !== "" ? { isAvailable: availability } : {}),
            ...(search ? { search } : {}),
            ...(sortBy ? { sortBy } : {}),
            ...(sortOrder ? { sortOrder } : {})
        });

        fetch(`/api/Book/GetFiltered?${params}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch books");
                return res.json();
            })
            .then(data => {
                setBooks(data.Books.map(book => ({
                    id: book.bookId,
                    title: book.title,
                    author: book.author,
                    price: book.price,
                    rating: book.rating || "N/A",
                    image: book.imageURL || "https://via.placeholder.com/128x192?text=No+Image"
                })));
                setTotalCount(data.TotalCount);
                setTotalPages(data.TotalPages);
            })
            .catch(() => {
                setBooks([]);
                setTotalCount(0);
                setTotalPages(1);
                setError("Could not load books.");
            })
            .finally(() => setLoading(false));
    }, [page, pageSize, genre, availability, search, sortBy, sortOrder]);

    const handleAddToCart = (book) => {
        addToCart(book);
        setShowDialog(true);
        setTimeout(() => setShowDialog(false), 1200);
    };

    const handleGenreChange = (e) => {
        setGenre(e.target.value);
        setPage(1);
    };

    const handleAvailabilityChange = (e) => {
        setAvailability(e.target.value);
        setPage(1);
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleSortChange = (e) => {
        const idx = e.target.selectedIndex;
        setSortBy(sortOptions[idx].value.sortBy);
        setSortOrder(sortOptions[idx].value.sortOrder);
        setPage(1);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Dialog Box */}
            {showDialog && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-lg px-6 py-3 rounded z-50">
                    Book added to cart!
                </div>
            )}

            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">BookLib</h1>
                    <div className="flex items-center space-x-4">
                        {/* Genre Filter */}
                        <select
                            className="border border-gray-300 rounded-md px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={genre}
                            onChange={handleGenreChange}
                        >
                            {genres.map(g => (
                                <option key={g} value={g === "All" ? "" : g}>{g}</option>
                            ))}
                        </select>
                        {/* Availability Filter */}
                        <select
                            className="border border-gray-300 rounded-md px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                            className="border border-gray-300 rounded-md px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {/* Sort */}
                        <select
                            className="border border-gray-300 rounded-md px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onChange={handleSortChange}
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.label}>{opt.label}</option>
                            ))}
                        </select>
                        <Link to="/cart" className="relative">
                            <button className="text-gray-700 hover:text-indigo-600">
                                <FaShoppingCart className="w-6 h-6" />
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                                        {cartItems.length}
                                    </span>
                                )}
                            </button>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="booksPerPage" className="text-sm text-gray-700">
                            Books per page:
                        </label>
                        <select
                            id="booksPerPage"
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="border border-gray-300 rounded-md px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <div className="flex overflow-x-auto space-x-6 pb-4">
                    {loading ? (
                        <p className="text-gray-600">Loading books...</p>
                    ) : error ? (
                        <p className="text-red-600">{error}</p>
                    ) : books.length > 0 ? (
                        books.map((book) => (
                            <div
                                key={book.id}
                                className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center min-w-[200px] max-w-[200px]"
                            >
                                <img
                                    src={book.image}
                                    alt={book.title}
                                    className="w-32 h-48 object-cover rounded-md mb-4"
                                />
                                <h3 className="text-lg font-medium text-gray-900 text-center">{book.title}</h3>
                                <p className="text-sm text-gray-600">{book.author}</p>
                                <p className="text-lg font-semibold text-gray-900 mt-2">₹{book.price}</p>
                                <p className="text-sm text-gray-600">★ {book.rating}</p>
                                <button
                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    onClick={() => handleAddToCart(book)}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600">No books available</p>
                    )}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <nav className="inline-flex rounded-md shadow">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPage(i + 1)}
                                    className={`px-3 py-2 border border-gray-300 text-sm font-medium ${page === i + 1
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white text-gray-500 hover:bg-gray-50"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                                className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
