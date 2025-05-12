import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/common/navbar';

const categories = [
  'All Books',
  'Bestsellers',
  'Award Winners',
  'New Releases',
  'New Arrivals',
  'Coming Soon',
  'Deals',
];

const books = [

];

const Landing = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Books');
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />
      <header className="bg-indigo-100 text-center py-10 px-4">
        <h2 className="text-3xl font-bold text-indigo-800 mb-2">Discover Your Next Favorite Book</h2>
        <p className="text-gray-700 max-w-2xl mx-auto">Browse through bestsellers, new releases, exclusive editions and more!</p>
      </header>
      <div className="flex flex-wrap justify-center mt-6 gap-4 px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full font-medium text-sm transition ${selectedCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="mt-8 px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Search by title, author, ISBN..."
          className="w-full md:w-1/2 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <select className="px-4 py-2 border rounded shadow-sm">
          <option>Sort By</option>
          <option>Title</option>
          <option>Price</option>
          <option>Popularity</option>
        </select>
      </div>
      <section className="mt-10 px-4 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
            onClick={() => navigate(`/bookdetails/${book.id}`)}
          >
            <img src={book.image} alt={book.title} className="w-full h-64 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-800">{book.title}</h3>
              <p className="text-sm text-gray-600">by {book.author}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-indigo-600 font-bold">
                  ${book.onSale ? (book.price * (1 - book.discount / 100)).toFixed(2) : book.price.toFixed(2)}
                </p>
                {book.onSale && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">-{book.discount}%</span>
                )}
              </div>
              <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </section>
      <div className="bg-yellow-100 mt-16 p-4 text-center text-sm text-yellow-800">
        ⚡ New Arrivals just landed! Get exclusive editions now in-store.
      </div>
      <footer className="mt-10 p-6 bg-white border-t text-center text-gray-600 text-sm">
        © 2025 Library Store. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;