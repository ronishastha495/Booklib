import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const welcomeText = "Welcome to Booklib";
  const taglineText = "Your personal library management solution";
  const [displayedWelcome, setDisplayedWelcome] = useState("");
  const [displayedTagline, setDisplayedTagline] = useState("");
  const [showButtons, setShowButtons] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const animateText = async () => {
      // Animate welcome text
      for (let i = 0; i <= welcomeText.length; i++) {
        setDisplayedWelcome(welcomeText.substring(0, i));
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Wait a bit before starting tagline
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Animate tagline text
      for (let i = 0; i <= taglineText.length; i++) {
        setDisplayedTagline(taglineText.substring(0, i));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Show buttons after text animation is complete
      await new Promise((resolve) => setTimeout(resolve, 300));
      setShowButtons(true);

      // Mark animation as complete for additional effects
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAnimationComplete(true);
    };

    animateText();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col justify-center items-center p-6 overflow-hidden relative">
      {/* Abstract decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-20 blur-xl -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200 to-indigo-200 rounded-full opacity-20 blur-xl -ml-48 -mb-48"></div>

      {/* Book-inspired floating elements */}
      <div
        className={`absolute transform ${
          animationComplete ? "translate-y-0 opacity-40" : "translate-y-12 opacity-0"
        } transition-all duration-1000 ease-out`}
      >
        <div className="w-8 h-32 bg-indigo-300 opacity-30 rotate-12 absolute -left-64 top-20"></div>
        <div className="w-8 h-24 bg-purple-300 opacity-30 -rotate-6 absolute -right-48 top-32"></div>
        <div className="w-8 h-40 bg-teal-300 opacity-30 rotate-3 absolute left-64 -top-12"></div>
      </div>

      <div className="relative z-10 max-w-md w-full bg-white bg-opacity-70 backdrop-blur-sm p-8 border-l-4 border-indigo-500 shadow-lg rounded-md">
        <h1 className="text-5xl font-light text-gray-900 mb-6">
          <span className="relative">
            {displayedWelcome}
            <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-100 origin-left transition-transform duration-700"></span>
            <span className="inline-block animate-pulse ml-1">|</span>
          </span>
        </h1>

        <p className="text-xl text-gray-600 mb-12 h-16 italic">{displayedTagline}</p>

        <div
          className={`flex flex-col space-y-4 transition-all duration-700 ${
            showButtons ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Link
            to="/login"
            className="group relative px-6 py-3 text-center text-indigo-700 bg-white border-2 border-indigo-500 hover:bg-indigo-50 transition-colors duration-300 overflow-hidden rounded-md"
          >
            <span className="relative z-10">Login</span>
            <span className="absolute inset-0 w-0 bg-indigo-100 transition-all duration-300 ease-out group-hover:w-full"></span>
          </Link>

          <Link
            to="/register"
            className="group relative px-6 py-3 text-center text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 rounded-md overflow-hidden"
          >
            Register
            <span className="absolute top-0 right-0 w-12 h-full bg-white opacity-20 transform -skew-x-30 translate-x-20 group-hover:translate-x-32 transition-transform duration-700"></span>
          </Link>

          <Link
            to="/books"
            className="px-6 py-3 text-center text-white bg-green-600 hover:bg-green-700 transition-colors duration-300 rounded-md shadow-md hover:shadow-lg"
          >
            View Books
          </Link>

          <Link
            to="/dashboard"
            className="px-6 py-3 text-center text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 rounded-md shadow-md hover:shadow-lg"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>

      {/* Floating book icon */}
      <div
        className={`absolute bottom-12 right-12 transform transition-all duration-1000 ${
          animationComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="w-16 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-r-sm rounded-b-sm relative shadow-lg">
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-white opacity-30 rounded-l-sm"></div>
          <div className="absolute inset-2 bg-white opacity-20 rounded-r-sm rounded-b-sm"></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
