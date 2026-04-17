import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Camera, AlertCircle, TrendingUp, Shield, Zap } from 'lucide-react';

export const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-agri-green to-agri-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Leaf className="h-16 w-16" />
          </div>
          <h1 className="text-5xl font-bold mb-4">AgriTech</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Advanced AI-powered plant disease detection to protect your crops and maximize yield
          </p>
          <Link
            to="/detect"
            className="bg-white text-agri-green px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <Camera className="h-5 w-5" />
            <span>Start Detection</span>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Why Choose AgriTech?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="bg-agri-green bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-agri-green" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Detection</h3>
              <p className="text-gray-600">
                Get instant results with our advanced AI technology
              </p>
            </div>

            <div className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="bg-agri-green bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-agri-green" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Accurate Results</h3>
              <p className="text-gray-600">
                95%+ accuracy in identifying plant diseases
              </p>
            </div>

            <div className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="bg-agri-green bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-agri-green" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Increase Yield</h3>
              <p className="text-gray-600">
                Early detection helps protect your harvest
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Plants Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Supported Plants
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-agri-green">Tomato</h3>
              <ul className="space-y-1 text-gray-600">
                <li>Target Spot</li>
                <li>Yellow Leaf Curl Virus</li>
                <li>Mosaic Virus</li>
                <li>Bacterial Spot</li>
                <li>Early & Late Blight</li>
                <li>Leaf Mold</li>
                <li>Septoria Leaf Spot</li>
                <li>Spider Mites</li>
                <li>Healthy</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-agri-green">Potato</h3>
              <ul className="space-y-1 text-gray-600">
                <li>Early Blight</li>
                <li>Late Blight</li>
                <li>Healthy</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-agri-green">Pepper</h3>
              <ul className="space-y-1 text-gray-600">
                <li>Bacterial Spot</li>
                <li>Healthy</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-agri-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            Protect Your Crops Today
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Don't let diseases destroy your harvest. Early detection is key to healthy crops.
          </p>
          <Link
            to="/detect"
            className="bg-white text-agri-green px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <Camera className="h-5 w-5" />
            <span>Start Detection Now</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
