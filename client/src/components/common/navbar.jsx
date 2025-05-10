import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <h1
          className="text-2xl font-bold text-indigo-600 cursor-pointer flex items-center"
          onClick={() => navigate('/')}
        >
          <span className="mr-2">📚</span> Library Store
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/booklist')}
            className="text-gray-700 hover:text-indigo-600 font-medium flex items-center"
          >
            <span className="mr-1">📖</span> Books
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="text-gray-700 hover:text-indigo-600 font-medium flex items-center"
          >
            <span className="mr-1">📦</span> Orders
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="text-gray-700 hover:text-indigo-600 font-medium flex items-center"
          >
            <span className="mr-1">🛒</span> Cart
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-700 hover:text-indigo-600 font-medium flex items-center"
        >
          <span className="mr-1">👤</span> Dashboard
        </button>
        <button
          onClick={() => navigate('/login')}
          className="text-gray-700 hover:text-indigo-600 font-medium"
        >
          Login
        </button>
        <button
          onClick={() => navigate('/register')}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Register
        </button>
      </div>
    </nav>
  );
};

export default NavBar;