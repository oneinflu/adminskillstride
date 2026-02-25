import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-6">
      {/* 404 Text */}
      <h1 className="text-9xl font-extrabold tracking-widest">404</h1>
      <div className="bg-pink-500 px-2 text-sm rounded rotate-12 absolute">
        Page Not Found
      </div>

      {/* Message */}
      <p className="mt-6 text-lg text-gray-300 max-w-md text-center">
        Sorry, the page you’re looking for doesn’t exist. It might have been
        moved or deleted.
      </p>

      {/* Buttons */}
      <div className="mt-8 flex space-x-4">
        <Link
          to="/"
          className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg shadow-lg transition-all duration-300"
        >
          Go Home
        </Link>
      </div>

      {/* Decorative SVG (Optional) */}
      <div className="absolute bottom-6 text-gray-500 text-xs">
        © {new Date().getFullYear()} Skillstride Academy. All rights reserved.
      </div>
    </div>
  );
};

export default NotFound;
