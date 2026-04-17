import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const API_BASE_URL = 'http://localhost:5001/api';

export interface User {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  user_type: 'farmer' | 'buyer';
  created_at: string;
  rating: number;
  total_transactions: number;
}

export interface Listing {
  listing_id: string;
  seller_id: string;
  commodity: string;
  quantity: number;
  price_per_unit: number;
  unit: string;
  location: string;
  description: string;
  images: string[];
  status: 'active' | 'sold' | 'expired';
  created_at: string;
  expires_at: string;
  views: number;
  likes: number;
  seller_name?: string;
  seller_location?: string;
}

export interface Transaction {
  transaction_id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  confirmed_at?: string;
  completed_at?: string;
  listing?: Listing;
}

export interface MarketplaceStats {
  active_listings: number;
  sold_listings: number;
  pending_transactions: number;
  completed_transactions: number;
  popular_commodities: [string, number][];
}

class MarketplaceService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  constructor() {
    // Add request interceptor to include auth token
    this.api.interceptors.request.use(async (config) => {
      try {
        // Get the auth token from Clerk
        const auth = await this.getAuthToken();
        if (auth) {
          config.headers.Authorization = `Bearer ${auth}`;
        }
      } catch (error) {
        console.warn('Failed to get auth token:', error);
      }
      return config;
    });
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      // This will be called from a React component context
      // For now, return null and we'll handle auth in the components
      return null;
    } catch (error) {
      return null;
    }
  }

  // Method to set auth token from component
  setAuthToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Method to clear auth token
  clearAuthToken() {
    delete this.api.defaults.headers.common['Authorization'];
  }

  // User Management
  async createUser(userData: {
    name: string;
    email: string;
    phone: string;
    location: string;
    user_type?: 'farmer' | 'buyer';
  }): Promise<{ message: string; user_id: string }> {
    try {
      const response = await this.api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const response = await this.api.get('/users');
      return response.data.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  // Listing Management
  async createListing(listingData: {
    seller_id: string;
    commodity: string;
    quantity: number;
    price_per_unit: number;
    unit?: string;
    location: string;
    description?: string;
    images?: string[];
  }): Promise<{ message: string; listing_id: string }> {
    try {
      const response = await this.api.post('/listings', listingData);
      return response.data;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw new Error('Failed to create listing');
    }
  }

  async getListings(filters?: {
    commodity?: string;
    location?: string;
    min_price?: number;
    max_price?: number;
    status?: string;
  }): Promise<Listing[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.commodity) params.append('commodity', filters.commodity);
      if (filters?.location) params.append('location', filters.location);
      if (filters?.min_price) params.append('min_price', filters.min_price.toString());
      if (filters?.max_price) params.append('max_price', filters.max_price.toString());
      if (filters?.status) params.append('status', filters.status);

      const response = await this.api.get(`/listings?${params.toString()}`);
      return response.data.listings;
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw new Error('Failed to fetch listings');
    }
  }

  async getListing(listingId: string): Promise<Listing> {
    try {
      const response = await this.api.get(`/listings/${listingId}`);
      return response.data.listing;
    } catch (error) {
      console.error('Error fetching listing:', error);
      throw new Error('Failed to fetch listing');
    }
  }

  async updateListing(listingId: string, updateData: Partial<Listing>): Promise<{ message: string }> {
    try {
      const response = await this.api.put(`/listings/${listingId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating listing:', error);
      throw new Error('Failed to update listing');
    }
  }

  async likeListing(listingId: string): Promise<{ message: string; likes: number }> {
    try {
      const response = await this.api.post(`/listings/${listingId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking listing:', error);
      throw new Error('Failed to like listing');
    }
  }

  // Transaction Management
  async createTransaction(transactionData: {
    listing_id: string;
    buyer_id: string;
    quantity: number;
  }): Promise<{ message: string; transaction_id: string }> {
    try {
      const response = await this.api.post('/transactions', transactionData);
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to create transaction');
    }
  }

  async getTransactions(userId?: string): Promise<Transaction[]> {
    try {
      const params = userId ? `?user_id=${userId}` : '';
      const response = await this.api.get(`/transactions${params}`);
      return response.data.transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Failed to fetch transactions');
    }
  }

  async confirmTransaction(transactionId: string): Promise<{ message: string }> {
    try {
      const response = await this.api.post(`/transactions/${transactionId}/confirm`);
      return response.data;
    } catch (error) {
      console.error('Error confirming transaction:', error);
      throw new Error('Failed to confirm transaction');
    }
  }

  async completeTransaction(transactionId: string): Promise<{ message: string }> {
    try {
      const response = await this.api.post(`/transactions/${transactionId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing transaction:', error);
      throw new Error('Failed to complete transaction');
    }
  }

  async cancelTransaction(transactionId: string): Promise<{ message: string }> {
    try {
      const response = await this.api.post(`/transactions/${transactionId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      throw new Error('Failed to cancel transaction');
    }
  }

  // Marketplace Statistics
  async getMarketplaceStats(): Promise<MarketplaceStats> {
    try {
      const response = await this.api.get('/marketplace/stats');
      return response.data.stats;
    } catch (error) {
      console.error('Error fetching marketplace stats:', error);
      throw new Error('Failed to fetch marketplace stats');
    }
  }

  // Utility Functions
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'sold':
        return 'text-red-600';
      case 'expired':
        return 'text-gray-600';
      case 'pending':
        return 'text-yellow-600';
      case 'confirmed':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Active';
      case 'sold':
        return 'Sold';
      case 'expired':
        return 'Expired';
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  getTransactionStatusMessage(status: string): string {
    switch (status) {
      case 'pending':
        return 'Waiting for seller confirmation';
      case 'confirmed':
        return 'Seller confirmed. Waiting for delivery';
      case 'completed':
        return 'Transaction completed successfully';
      case 'cancelled':
        return 'Transaction was cancelled';
      default:
        return 'Unknown status';
    }
  }

  // Search and Filter Functions
  searchListings(listings: Listing[], searchTerm: string): Listing[] {
    if (!searchTerm) return listings;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return listings.filter(listing =>
      listing.commodity.toLowerCase().includes(lowerSearchTerm) ||
      listing.location.toLowerCase().includes(lowerSearchTerm) ||
      listing.description.toLowerCase().includes(lowerSearchTerm)
    );
  }

  filterByPriceRange(listings: Listing[], minPrice?: number, maxPrice?: number): Listing[] {
    return listings.filter(listing => {
      if (minPrice !== undefined && listing.price_per_unit < minPrice) return false;
      if (maxPrice !== undefined && listing.price_per_unit > maxPrice) return false;
      return true;
    });
  }

  sortByPrice(listings: Listing[], order: 'asc' | 'desc' = 'asc'): Listing[] {
    return [...listings].sort((a, b) => 
      order === 'asc' ? a.price_per_unit - b.price_per_unit : b.price_per_unit - a.price_per_unit
    );
  }

  sortByDate(listings: Listing[], order: 'asc' | 'desc' = 'desc'): Listing[] {
    return [...listings].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }
}

const marketplaceService = new MarketplaceService();
export default marketplaceService;
