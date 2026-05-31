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
  distance_km?: number; // Added to simulate physical distance
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

// Mock data to initialize if local storage is empty
const defaultListings: Listing[] = [
  {
    listing_id: '1',
    seller_id: 'user1',
    seller_name: 'Ramesh Singh',
    commodity: 'Wheat',
    quantity: 500,
    price_per_unit: 22,
    unit: 'kg',
    location: 'Delhi',
    distance_km: 12, // Nearby
    description: 'High quality Sharbati wheat, freshly harvested.',
    images: [],
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
    views: 145,
    likes: 12
  },
  {
    listing_id: '2',
    seller_id: 'user2',
    seller_name: 'Suresh Patil',
    commodity: 'Tomato',
    quantity: 100,
    price_per_unit: 35,
    unit: 'kg',
    location: 'Maharashtra',
    distance_km: 45, // Not nearby
    description: 'Fresh organic tomatoes from farm.',
    images: [],
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 7).toISOString(),
    views: 89,
    likes: 5
  }
];

class MarketplaceService {
  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (!localStorage.getItem('marketplace_listings')) {
      localStorage.setItem('marketplace_listings', JSON.stringify(defaultListings));
    }
    if (!localStorage.getItem('marketplace_transactions')) {
      localStorage.setItem('marketplace_transactions', JSON.stringify([]));
    }
  }

  private getStoredListings(): Listing[] {
    const data = localStorage.getItem('marketplace_listings');
    return data ? JSON.parse(data) : [];
  }

  private saveListings(listings: Listing[]) {
    localStorage.setItem('marketplace_listings', JSON.stringify(listings));
  }

  private getStoredTransactions(): Transaction[] {
    const data = localStorage.getItem('marketplace_transactions');
    return data ? JSON.parse(data) : [];
  }

  private saveTransactions(transactions: Transaction[]) {
    localStorage.setItem('marketplace_transactions', JSON.stringify(transactions));
  }

  // Method to set auth token from component
  setAuthToken(token: string) {
    // Mock implementation
  }

  // Method to clear auth token
  clearAuthToken() {
    // Mock implementation
  }

  // User Management
  async createUser(userData: any): Promise<{ message: string; user_id: string }> {
    return { message: 'User created', user_id: 'user_' + Date.now() };
  }

  async getUsers(): Promise<User[]> {
    return [];
  }

  // Listing Management
  async createListing(listingData: {
    seller_id: string;
    seller_name?: string;
    commodity: string;
    quantity: number;
    price_per_unit: number;
    unit?: string;
    location: string;
    description?: string;
    images?: string[];
  }): Promise<{ message: string; listing_id: string }> {
    const listings = this.getStoredListings();
    
    // Auto-fetch seller name if not provided (mocking)
    const storedAuth = localStorage.getItem('auth_state');
    let sellerName = listingData.seller_name || 'Anonymous Farmer';
    if (storedAuth) {
      try {
        const auth = JSON.parse(storedAuth);
        if (auth.user && auth.user.name) {
          sellerName = auth.user.name;
        }
      } catch (e) {}
    }

    const newListing: Listing = {
      listing_id: 'listing_' + Date.now(),
      seller_id: listingData.seller_id,
      seller_name: sellerName,
      commodity: listingData.commodity,
      quantity: listingData.quantity,
      price_per_unit: listingData.price_per_unit,
      unit: listingData.unit || 'kg',
      location: listingData.location,
      distance_km: Math.floor(Math.random() * 50) + 1, // Random distance between 1 and 50 km
      description: listingData.description || '',
      images: listingData.images || [],
      status: 'active',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
      views: 0,
      likes: 0
    };

    listings.push(newListing);
    this.saveListings(listings);
    return { message: 'Listing created successfully', listing_id: newListing.listing_id };
  }

  async getListings(filters?: {
    commodity?: string;
    location?: string;
    min_price?: number;
    max_price?: number;
    status?: string;
  }): Promise<Listing[]> {
    let listings = this.getStoredListings();

    if (filters) {
      if (filters.commodity) {
        listings = listings.filter(l => l.commodity.toLowerCase() === filters.commodity!.toLowerCase());
      }
      if (filters.location) {
        listings = listings.filter(l => l.location.toLowerCase() === filters.location!.toLowerCase());
      }
      if (filters.min_price !== undefined) {
        listings = listings.filter(l => l.price_per_unit >= filters.min_price!);
      }
      if (filters.max_price !== undefined) {
        listings = listings.filter(l => l.price_per_unit <= filters.max_price!);
      }
      if (filters.status) {
        listings = listings.filter(l => l.status === filters.status);
      }
    }

    return listings;
  }

  async getListing(listingId: string): Promise<Listing> {
    const listings = this.getStoredListings();
    const listing = listings.find(l => l.listing_id === listingId);
    if (!listing) throw new Error('Listing not found');
    return listing;
  }

  async updateListing(listingId: string, updateData: Partial<Listing>): Promise<{ message: string }> {
    const listings = this.getStoredListings();
    const index = listings.findIndex(l => l.listing_id === listingId);
    if (index === -1) throw new Error('Listing not found');
    
    listings[index] = { ...listings[index], ...updateData };
    this.saveListings(listings);
    return { message: 'Listing updated successfully' };
  }

  async likeListing(listingId: string): Promise<{ message: string; likes: number }> {
    const listings = this.getStoredListings();
    const index = listings.findIndex(l => l.listing_id === listingId);
    if (index === -1) throw new Error('Listing not found');
    
    listings[index].likes += 1;
    this.saveListings(listings);
    return { message: 'Listing liked', likes: listings[index].likes };
  }

  // Transaction Management
  async createTransaction(transactionData: {
    listing_id: string;
    buyer_id: string;
    quantity: number;
  }): Promise<{ message: string; transaction_id: string }> {
    const listings = this.getStoredListings();
    const listing = listings.find(l => l.listing_id === transactionData.listing_id);
    if (!listing) throw new Error('Listing not found');

    const transactions = this.getStoredTransactions();
    const newTransaction: Transaction = {
      transaction_id: 'txn_' + Date.now(),
      listing_id: transactionData.listing_id,
      buyer_id: transactionData.buyer_id,
      seller_id: listing.seller_id,
      quantity: transactionData.quantity,
      total_price: transactionData.quantity * listing.price_per_unit,
      status: 'pending',
      created_at: new Date().toISOString(),
      listing: listing
    };

    transactions.push(newTransaction);
    this.saveTransactions(transactions);
    return { message: 'Transaction created', transaction_id: newTransaction.transaction_id };
  }

  async getTransactions(userId?: string): Promise<Transaction[]> {
    let transactions = this.getStoredTransactions();
    if (userId) {
      transactions = transactions.filter(t => t.buyer_id === userId || t.seller_id === userId);
    }
    return transactions;
  }

  async confirmTransaction(transactionId: string): Promise<{ message: string }> {
    const txns = this.getStoredTransactions();
    const index = txns.findIndex(t => t.transaction_id === transactionId);
    if (index > -1) {
      txns[index].status = 'confirmed';
      txns[index].confirmed_at = new Date().toISOString();
      this.saveTransactions(txns);
    }
    return { message: 'Transaction confirmed' };
  }

  async completeTransaction(transactionId: string): Promise<{ message: string }> {
    const txns = this.getStoredTransactions();
    const index = txns.findIndex(t => t.transaction_id === transactionId);
    if (index > -1) {
      txns[index].status = 'completed';
      txns[index].completed_at = new Date().toISOString();
      this.saveTransactions(txns);
    }
    return { message: 'Transaction completed' };
  }

  async cancelTransaction(transactionId: string): Promise<{ message: string }> {
    const txns = this.getStoredTransactions();
    const index = txns.findIndex(t => t.transaction_id === transactionId);
    if (index > -1) {
      txns[index].status = 'cancelled';
      this.saveTransactions(txns);
    }
    return { message: 'Transaction cancelled' };
  }

  // Marketplace Statistics
  async getMarketplaceStats(): Promise<MarketplaceStats> {
    const listings = this.getStoredListings();
    const txns = this.getStoredTransactions();

    return {
      active_listings: listings.filter(l => l.status === 'active').length,
      sold_listings: listings.filter(l => l.status === 'sold').length,
      pending_transactions: txns.filter(t => t.status === 'pending').length,
      completed_transactions: txns.filter(t => t.status === 'completed').length,
      popular_commodities: [['Wheat', 2], ['Tomato', 1]]
    };
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
        return 'text-green-600 bg-green-50 border border-green-200';
      case 'sold':
        return 'text-red-600 bg-red-50 border border-red-200';
      case 'expired':
        return 'text-gray-600 bg-gray-50 border border-gray-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border border-yellow-200';
      case 'confirmed':
        return 'text-blue-600 bg-blue-50 border border-blue-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border border-green-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border border-gray-200';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Active';
      case 'sold': return 'Sold';
      case 'expired': return 'Expired';
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  }

  getTransactionStatusMessage(status: string): string {
    switch (status) {
      case 'pending': return 'Waiting for seller confirmation';
      case 'confirmed': return 'Seller confirmed. Waiting for delivery';
      case 'completed': return 'Transaction completed successfully';
      case 'cancelled': return 'Transaction was cancelled';
      default: return 'Unknown status';
    }
  }

  // Search and Filter Functions
  searchListings(listings: Listing[], searchTerm: string): Listing[] {
    if (!searchTerm) return listings;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return listings.filter(listing =>
      listing.commodity.toLowerCase().includes(lowerSearchTerm) ||
      listing.location.toLowerCase().includes(lowerSearchTerm) ||
      (listing.description && listing.description.toLowerCase().includes(lowerSearchTerm))
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
