import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, MapPin, RefreshCw, Search, Filter } from 'lucide-react';
import marketPriceService from './services/marketPriceService.tsx';

const MarketScreen = () => {
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMarketPrices();
  }, [selectedState, selectedCommodity]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadMarketPrices();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [selectedState, selectedCommodity]);

  const loadMarketPrices = async () => {
    try {
      setLoading(true);
      const data = await marketPriceService.getMarketPrices(selectedState, selectedCommodity);
      setMarketData(data);
      setError('');
    } catch (err) {
      setError('Failed to load market prices');
      console.error('Market price error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    return marketPriceService.getPriceTrendColor(trend);
  };

  const filteredPrices = marketData?.prices?.filter(price => 
    price.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    price.market.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading market prices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={loadMarketPrices} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const insights = marketData ? marketPriceService.getMarketInsights(marketData.prices) : null;

  return (
    <div className="flex-1 bg-gray-50 p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Market Prices</h1>
        <button
          onClick={loadMarketPrices}
          className="mt-2 sm:mt-0 bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-3 sm:p-4 mb-4 shadow-md">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search commodities or markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All States</option>
            <option value="Delhi">Delhi</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
          </select>
          <select
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Commodities</option>
            <option value="Wheat">Wheat</option>
            <option value="Rice">Rice</option>
            <option value="Tomato">Tomato</option>
            <option value="Potato">Potato</option>
            <option value="Onion">Onion</option>
            <option value="Mustard">Mustard</option>
            <option value="Gram">Gram</option>
          </select>
        </div>
      </div>

      {/* Market Overview */}
      {insights && (
        <div className="bg-white rounded-xl p-3 sm:p-4 mb-4 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Market Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Avg Price</p>
              <p className="text-lg sm:text-xl font-bold text-green-600">
                {marketPriceService.formatPrice(insights.averagePrice)}
              </p>
            </div>
            <div className="bg-red-50 p-2 sm:p-3 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Highest</p>
              <p className="text-lg sm:text-xl font-bold text-red-600">
                {marketPriceService.formatPrice(insights.highestPrice.price)}
              </p>
              <p className="text-xs text-gray-500">{insights.highestPrice.commodity}</p>
            </div>
            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Lowest</p>
              <p className="text-lg sm:text-xl font-bold text-blue-600">
                {marketPriceService.formatPrice(insights.lowestPrice.price)}
              </p>
              <p className="text-xs text-gray-500">{insights.lowestPrice.commodity}</p>
            </div>
            <div className="bg-purple-50 p-2 sm:p-3 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Trending</p>
              <p className="text-lg sm:text-xl font-bold text-purple-600">
                {insights.trendingUp > insights.trendingDown ? 'Up' : 'Down'}
              </p>
              <p className="text-xs text-gray-500">{insights.trendingUp} up / {insights.trendingDown} down</p>
            </div>
          </div>
        </div>
      )}

      {/* Market Prices List */}
      <div className="space-y-2 sm:space-y-3">
        {filteredPrices.map((price: any, index: number) => (
          <div key={index} className="bg-white p-3 sm:p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-2 sm:mb-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{price.commodity}</h3>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {marketPriceService.formatPrice(price.price)}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">{price.unit}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="flex items-center space-x-2">
                  {getTrendIcon(price.trend)}
                  <span className={`font-semibold text-sm sm:text-base ${getTrendColor(price.trend)}`}>
                    {price.changePercent > 0 ? '+' : ''}{price.changePercent}%
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{price.market}</span>
                </div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Previous: {marketPriceService.formatPrice(price.previousPrice)} | 
                Updated: {marketPriceService.formatDate(price.date)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredPrices.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-gray-500">No market data found for your filters</p>
        </div>
      )}

      {/* Market Insights */}
      <div className="mt-4 sm:mt-6 bg-blue-50 rounded-xl p-3 sm:p-4">
        <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Market Insights</h3>
        <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
          <li>Real-time prices from major mandis across India</li>
          <li>Prices updated every hour for accurate market information</li>
          <li>Track trends to make informed selling decisions</li>
          <li>Filter by state and commodity for targeted information</li>
        </ul>
      </div>

      {/* Last Updated */}
      {marketData && (
        <div className="mt-4 text-center text-xs text-gray-500">
          Last updated: {marketPriceService.formatDate(marketData.lastUpdated)}
        </div>
      )}
    </div>
  );
};

export default MarketScreen;
