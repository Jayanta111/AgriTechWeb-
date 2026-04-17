import React from 'react';
import { MapPin, Phone, Star, Clock } from 'lucide-react';

const ShopScreen = () => {
  const shops = [
    {
      name: 'Green Valley Agro Store',
      address: '123 Main Street, Downtown',
      phone: '+91 98765 43210',
      rating: 4.5,
      distance: '2.5 km',
      hours: '8:00 AM - 8:00 PM',
      specialties: ['Organic Seeds', 'Fertilizers', 'Pesticides']
    },
    {
      name: 'Farmers Supply Co.',
      address: '456 Market Road',
      phone: '+91 98765 43211',
      rating: 4.2,
      distance: '3.1 km',
      hours: '7:00 AM - 9:00 PM',
      specialties: ['Tools', 'Irrigation', 'Seeds']
    },
    {
      name: 'AgriTech Solutions',
      address: '789 Industrial Area',
      phone: '+91 98765 43212',
      rating: 4.8,
      distance: '5.2 km',
      hours: '9:00 AM - 6:00 PM',
      specialties: ['Modern Equipment', 'Sensors', 'Drones']
    }
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-200 text-yellow-400" />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="flex-1 bg-gray-50 p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nearby Shops</h1>

      <div className="space-y-4">
        {shops.map((shop, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{shop.name}</h3>
                <div className="flex items-center space-x-1 mb-1">
                  {renderStars(shop.rating)}
                  <span className="text-sm text-gray-600 ml-1">({shop.rating})</span>
                </div>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                {shop.distance}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{shop.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{shop.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{shop.hours}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Specialties:</p>
              <div className="flex flex-wrap gap-1">
                {shop.specialties.map((specialty, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
                Get Directions
              </button>
              <button className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                Call Shop
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-yellow-50 rounded-xl p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Shop Tips</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>Call ahead to check product availability</li>
          <li>Ask about bulk discounts for large orders</li>
          <li>Compare prices between multiple shops</li>
          <li>Check for organic certification if needed</li>
        </ul>
      </div>
    </div>
  );
};

export default ShopScreen;
