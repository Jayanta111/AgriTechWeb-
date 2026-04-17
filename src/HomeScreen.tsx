import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogIn, UserPlus } from 'lucide-react';
import ScrollView from './components/ScrollView.tsx';
import FlatCards from './components/FlatCards.tsx';
import Slider from './components/Slider.tsx';
import WeatherCard from './components/WeatherCard.tsx';
import InstallAppSection from './components/InstallAppSection.tsx';
import { useAuthContext } from './contexts/AuthContext.tsx';

const HomeScreen = () => {
  const { isAuthenticated, user } = useAuthContext();

  return (
    <div className="flex-1 bg-gray-50">
      <ScrollView>
        <div className="pt-4 sm:pt-6 md:pt-10 pb-16 sm:pb-20">
          {/* Header with Auth */}
          <div className="px-4 mb-4 sm:mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-green-800">AgriTech</h1>
                <p className="text-sm sm:text-base text-gray-600">AI Plant Disease Detection</p>
              </div>
              
              {/* Auth Section */}
              <div className="flex items-center space-x-3">
                {isAuthenticated && user ? (
                  <div className="flex items-center space-x-2">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.user_type}</p>
                    </div>
                    <div className="bg-green-500 p-2 rounded-full">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Link
                      to="/sign-in"
                      className="bg-green-500 text-white px-3 py-2 rounded-lg flex items-center space-x-1 hover:bg-green-600 transition-colors text-sm"
                    >
                      <LogIn className="w-4 h-4" />
                      <span className="hidden sm:inline">Sign In</span>
                    </Link>
                    <Link
                      to="/sign-up"
                      className="bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center space-x-1 hover:bg-blue-600 transition-colors text-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="hidden sm:inline">Sign Up</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Install App Section */}
          <InstallAppSection />

          <h2 className="text-lg sm:text-xl font-bold px-4 mb-2 sm:mb-3">Supported Crops</h2>
          <div className="mt-1 px-4">
            <Slider />
          </div>
          <div className="px-4">
            <FlatCards />
          </div>

          {/* Weather Update Section */}
          <div className="px-4">
            <WeatherCard />
          </div>

          {/* Farming Tips Cards - Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 mt-6">
            <div className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-sm sm:text-base mb-3 text-green-800 text-center">{'\ud83c\udf3e'} Farming Tip</h3>
              <img
                src="/images/Agriculture.jpg"
                alt="Agriculture"
                className="w-full h-32 sm:h-36 md:h-40 rounded-xl mb-3 object-cover"
              />
              <p className="text-xs sm:text-sm text-gray-700 text-center leading-4 sm:leading-5">
                Water crops early morning to reduce evaporation and improve soil moisture.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-sm sm:text-base mb-3 text-green-800 text-center">{'\ud83c\udf31'} Soil Health</h3>
              <img
                src="/images/Soil.jpg"
                alt="Soil Health"
                className="w-full h-32 sm:h-36 md:h-40 rounded-xl mb-3 object-cover"
              />
              <p className="text-xs sm:text-sm text-gray-700 text-center leading-4 sm:leading-5">
                Check soil pH and nutrients regularly for better crop yield.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-sm sm:text-base mb-3 text-green-800 text-center">{'\u2600\ufe0f'} Sunlight Guide</h3>
              <img
                src="/images/sunlight.jpg"
                alt="Sunlight"
                className="w-full h-32 sm:h-36 md:h-40 rounded-xl mb-3 object-cover"
              />
              <p className="text-xs sm:text-sm text-gray-700 text-center leading-4 sm:leading-5">
                Most crops need 6-8 hours of direct sunlight daily.
              </p>
            </div>
          </div>
        </div>
      </ScrollView>
    </div>
  );
};

export default HomeScreen;
