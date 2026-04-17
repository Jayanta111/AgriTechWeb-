import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Heart, Eye, Package, User, MapPin, Calendar, TrendingUp, RefreshCw, AlertCircle, TrendingDown, Minus, Lock, LogIn, UserPlus } from 'lucide-react';
import marketplaceService, { Listing, Transaction, MarketplaceStats } from './services/marketplaceService.tsx';
import marketPriceService from './services/marketPriceService.tsx';
import CreateListingModal from './components/CreateListingModal.tsx';
import { useAuthContext } from './contexts/AuthContext.tsx';

const MarketplaceScreen: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [marketPrices, setMarketPrices] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'browse' | 'my-listings' | 'transactions' | 'mandi-prices'>('browse');
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<'price' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Authentication context
  const { 
    user: currentUser, 
    isAuthenticated
  } = useAuthContext();

  useEffect(() => {
    loadMarketplaceData();
    loadMandiPrices();
  }, []);

  useEffect(() => {
    if (activeTab === 'browse') {
      loadListings();
    } else if (activeTab === 'transactions') {
      loadTransactions();
    } else if (activeTab === 'mandi-prices') {
      loadMandiPrices();
    }
  }, [activeTab]);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      const [listingsData, statsData] = await Promise.all([
        marketplaceService.getListings(),
        marketplaceService.getMarketplaceStats()
      ]);
      setListings(listingsData);
      setStats(statsData);
      setError('');
    } catch (err) {
      setError('Failed to load marketplace data');
      console.error('Marketplace error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMandiPrices = async () => {
    try {
      setLoading(true);
      const prices = await marketPriceService.getMarketPrices(selectedLocation, selectedCommodity);
      setMarketPrices(prices);
      setError('');
    } catch (err) {
      setError('Failed to load mandi prices');
      console.error('Mandi price error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadListings = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedCommodity) filters.commodity = selectedCommodity;
      if (selectedLocation) filters.location = selectedLocation;
      if (priceRange.min) filters.min_price = parseFloat(priceRange.min);
      if (priceRange.max) filters.max_price = parseFloat(priceRange.max);

      const listingsData = await marketplaceService.getListings(filters);
      setListings(listingsData);
      setError('');
    } catch (err) {
      setError('Failed to load listings');
      console.error('Listings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      if (!currentUser) {
        setTransactions([]);
        setError('');
        return;
      }
      const transactionsData = await marketplaceService.getTransactions(currentUser.user_id);
      setTransactions(transactionsData);
      setError('');
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Transactions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (listingData: any) => {
    if (!isAuthenticated || !currentUser) {
      // Redirect to sign-in page instead of showing modal
      window.location.href = '/sign-in';
      return;
    }

    try {
      await marketplaceService.createListing({
        ...listingData,
        seller_id: currentUser.user_id
      });
      setShowCreateListing(false);
      loadListings();
    } catch (err) {
      setError('Failed to create listing');
      console.error('Create listing error:', err);
    }
  };

  const handleBuy = async (listingId: string, quantity: number) => {
    if (!isAuthenticated || !currentUser) {
      // Redirect to sign-in page instead of showing modal
      window.location.href = '/sign-in';
      return;
    }

    try {
      await marketplaceService.createTransaction({
        listing_id: listingId,
        buyer_id: currentUser.user_id,
        quantity
      });
      loadTransactions();
    } catch (err) {
      setError('Failed to create purchase request');
      console.error('Buy error:', err);
    }
  };

  const handleLike = async (listingId: string) => {
    try {
      await marketplaceService.likeListing(listingId);
      loadListings();
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const getMandiPriceForCommodity = (commodity: string) => {
    if (!marketPrices?.prices) return null;
    const matchingPrices = marketPrices.prices.filter((p: any) => 
      p.commodity.toLowerCase() === commodity.toLowerCase()
    );
    return matchingPrices.length > 0 ? matchingPrices[0] : null;
  };

  const getPriceComparison = (listingPrice: number, mandiPrice: number) => {
    const difference = ((listingPrice - mandiPrice) / mandiPrice) * 100;
    return {
      difference,
      isHigher: listingPrice > mandiPrice,
      isLower: listingPrice < mandiPrice
    };
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

  const getFilteredAndSortedListings = () => {
    let filtered = listings;

    // Apply search
    if (searchTerm) {
      filtered = marketplaceService.searchListings(filtered, searchTerm);
    }

    // Apply sorting
    if (sortBy === 'price') {
      filtered = marketplaceService.sortByPrice(filtered, sortOrder);
    } else {
      filtered = marketplaceService.sortByDate(filtered, sortOrder);
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-3 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Marketplace</h1>
          {isAuthenticated && currentUser && (
            <p className="text-sm text-gray-600 mt-1">
              Welcome back, {currentUser.name}! ({currentUser.user_type})
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-3 mt-2 sm:mt-0">
          {!isAuthenticated ? (
            <div className="flex space-x-2">
              <Link
                to="/sign-in"
                className="bg-green-500 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm">Sign In</span>
              </Link>
              <Link
                to="/sign-up"
                className="bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-sm">Sign Up</span>
              </Link>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateListing(true)}
              className="bg-green-500 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Create Listing</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <Package className="w-5 h-5 text-blue-500" />
              <span className="text-lg sm:text-xl font-bold text-gray-800">{stats.active_listings}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Active Listings</p>
          </div>
          <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-lg sm:text-xl font-bold text-gray-800">{stats.completed_transactions}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Completed</p>
          </div>
          <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-lg sm:text-xl font-bold text-gray-800">{stats.pending_transactions}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Pending</p>
          </div>
          <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <User className="w-5 h-5 text-purple-500" />
              <span className="text-lg sm:text-xl font-bold text-gray-800">{stats.sold_listings}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Sold</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-4 border-b">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'browse'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Browse
        </button>
        <button
          onClick={() => setActiveTab('my-listings')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'my-listings'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          My Listings
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'transactions'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('mandi-prices')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'mandi-prices'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Mandi Prices
        </button>
      </div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div>
          {/* Search and Filters */}
          <div className="bg-white rounded-xl p-3 sm:p-4 mb-4 shadow-md">
            <div className="flex flex-col space-y-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search commodities, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
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
                </select>

                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Locations</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                </select>

                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort as 'price' | 'date');
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {getFilteredAndSortedListings().map((listing) => (
              <div key={listing.listing_id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="p-3 sm:p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{listing.commodity}</h3>
                      <p className="text-lg sm:text-xl font-bold text-green-600">
                        {marketplaceService.formatPrice(listing.price_per_unit)}/{listing.unit}
                      </p>
                      {(() => {
                        const mandiPrice = getMandiPriceForCommodity(listing.commodity);
                        if (mandiPrice) {
                          const comparison = getPriceComparison(listing.price_per_unit, mandiPrice.price);
                          return (
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">
                                Mandi: {marketPriceService.formatPrice(mandiPrice.price)}
                              </span>
                              <span className={`text-xs font-medium ${
                                comparison.isHigher ? 'text-red-600' : 
                                comparison.isLower ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                {comparison.isHigher ? '+' : ''}{comparison.difference.toFixed(1)}%
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${marketplaceService.getStatusColor(listing.status)}`}>
                      {marketplaceService.getStatusText(listing.status)}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs sm:text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{listing.quantity} {listing.unit} available</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{marketplaceService.formatDate(listing.created_at)}</span>
                    </div>
                  </div>

                  {listing.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{listing.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{listing.likes}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleLike(listing.listing_id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      {!isAuthenticated ? (
                        <Link
                          to="/sign-in"
                          className="px-2 py-1 bg-blue-500 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Sign In</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleBuy(listing.listing_id, 1)}
                          className="px-2 py-1 bg-blue-500 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
                          disabled={listing.status !== 'active'}
                        >
                          <span>Buy</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.transaction_id} className="bg-white rounded-xl p-3 sm:p-4 shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                    {transaction.listing?.commodity || 'Unknown'}
                  </h3>
                  <p className="text-lg sm:text-xl font-bold text-green-600">
                    {marketplaceService.formatPrice(transaction.total_price)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {transaction.quantity} {transaction.listing?.unit || 'units'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${marketplaceService.getStatusColor(transaction.status)}`}>
                    {marketplaceService.getStatusText(transaction.status)}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {marketplaceService.formatDateTime(transaction.created_at)}
                  </p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-600">
                  {marketplaceService.getTransactionStatusMessage(transaction.status)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mandi Prices Tab */}
      {activeTab === 'mandi-prices' && (
        <div>
          <div className="bg-white rounded-xl p-3 sm:p-4 mb-4 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Live Mandi Prices</h2>
              <button
                onClick={loadMandiPrices}
                className="mt-2 sm:mt-0 bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
            
            {/* Filters for Mandi Prices */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
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
          {marketPrices && (
            <div className="bg-white rounded-xl p-3 sm:p-4 mb-4 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Market Overview</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">Avg Price</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">
                    {marketPriceService.formatPrice(
                      marketPrices.prices.reduce((sum: number, p: any) => sum + p.price, 0) / marketPrices.prices.length
                    )}
                  </p>
                </div>
                <div className="bg-red-50 p-2 sm:p-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">Highest</p>
                  <p className="text-lg sm:text-xl font-bold text-red-600">
                    {marketPriceService.formatPrice(Math.max(...marketPrices.prices.map((p: any) => p.price)))}
                  </p>
                </div>
                <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">Lowest</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-600">
                    {marketPriceService.formatPrice(Math.min(...marketPrices.prices.map((p: any) => p.price)))}
                  </p>
                </div>
                <div className="bg-purple-50 p-2 sm:p-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">Total Items</p>
                  <p className="text-lg sm:text-xl font-bold text-purple-600">
                    {marketPrices.prices.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mandi Prices List */}
          <div className="space-y-2 sm:space-y-3">
            {marketPrices?.prices?.map((price: any, index: number) => (
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
                      <span className={`font-semibold text-sm sm:text-base ${marketPriceService.getPriceTrendColor(price.trend)}`}>
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

          {marketPrices?.prices?.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-gray-500">No mandi price data available</p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={showCreateListing}
        onClose={() => setShowCreateListing(false)}
        onSubmit={handleCreateListing}
        loading={loading}
      />
    </div>
  );
};

export default MarketplaceScreen;
