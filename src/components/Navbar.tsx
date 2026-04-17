import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Camera, Home } from 'lucide-react';

export const Navbar = () => {
  return (
    <nav className="bg-agri-green text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8" />
            <span className="text-xl font-bold">AgriTech</span>
          </div>
          
          <div className="flex space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-1 hover:text-agri-dark transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link
              to="/detect"
              className="flex items-center space-x-1 hover:text-agri-dark transition-colors"
            >
              <Camera className="h-5 w-5" />
              <span>Detect Disease</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
