import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div 
    className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed" 
    style={{ 
      backgroundImage: `url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
    }}
  >
    <div className="bg-amber-900/80 backdrop-blur-md rounded-2xl p-10 max-w-2xl w-full mx-4 shadow-2xl">
      <h1 className="text-5xl font-serif text-amber-100 text-center mb-6">Welcome to Booklib</h1>
      <p className="text-amber-200 text-lg text-center mb-8 font-light">
        Discover a world of stories, knowledge, and adventure. Your next favorite book awaits!
      </p>
      <div className="flex justify-center space-x-6">
        <Link 
          to="/login" 
          className="px-6 py-3 bg-amber-700 text-amber-100 rounded-lg hover:bg-amber-600 transition-colors duration-300 font-medium"
        >
          Login
        </Link>
        <Link 
          to="/register" 
          className="px-6 py-3 bg-transparent border-2 border-amber-100 text-amber-100 rounded-lg hover:bg-amber-100 hover:text-amber-900 transition-colors duration-300 font-medium"
        >
          Register
        </Link>
      </div>
    </div>
  </div>
);

export default Home;