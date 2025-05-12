import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AnnouncementCarousel = () => {
  const announcements = [
    'New Book Releases This Week!',
    'Join Our Reading Club Today!',
    'Special Discount on Bestsellers!',
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % announcements.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  return (
    <div className="bg-indigo-600 text-white text-center py-4">
      <p className="text-lg font-semibold">{announcements[current]}</p>
    </div>
  );
};

const BooksGrid = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts?_limit=6')
      .then((response) => response.json())
      .then((data) => {
        setBooks(
          data.map((item, index) => ({
            id: item.id,
            title: item.title,
            author: `Author ${index + 1}`,
            cover: `https://via.placeholder.com/150?text=Book+${index + 1}`,
          }))
        );
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching books:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading books...</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {books.map((book) => (
        <div key={book.id} className="border rounded-lg shadow-md p-4 hover:shadow-lg transition">
          <img src={book.cover} alt={book.title} className="w-full h-48 object-cover rounded" />
          <h3 className="text-lg font-semibold mt-2">{book.title}</h3>
          <p className="text-gray-600">{book.author}</p>
        </div>
      ))}
    </div>
  );
};

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementCarousel />
      <main className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center my-6">Featured Books</h2>
        <BooksGrid />
      </main>
    </div>
  );
};

export default HomePage;