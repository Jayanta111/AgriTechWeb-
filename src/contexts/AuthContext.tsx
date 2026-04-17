import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClerkProvider, useUser, useAuth } from '@clerk/clerk-react';
import { User } from '../services/marketplaceService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => void;
  signUp: () => void;
  signOut: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authMode: 'signin' | 'signup';
  setAuthMode: (mode: 'signin' | 'signup') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProviderContent: React.FC<AuthProviderProps> = ({ children }) => {
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (isSignedIn && clerkUser) {
      // Transform Clerk user to our app's User format
      const appUser: User = {
        user_id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.username || 'Unknown User',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        phone: clerkUser.primaryPhoneNumber?.phoneNumber || '',
        location: '', // Will be updated separately
        user_type: 'buyer', // Default, can be updated in profile
        created_at: clerkUser.createdAt?.toISOString() || new Date().toISOString(),
        rating: 0,
        total_transactions: 0
      };
      setUser(appUser);
    } else {
      setUser(null);
    }
  }, [isSignedIn, clerkUser]);

  const signIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const signUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const signOut = async () => {
    await clerkSignOut();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading: !isLoaded,
    isAuthenticated: isSignedIn || false,
    signIn,
    signUp,
    signOut,
    showAuthModal,
    setShowAuthModal,
    authMode,
    setAuthMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const clerkPublishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

  console.log('Environment check:', {
    key: clerkPublishableKey,
    env: process.env.NODE_ENV,
    allEnv: process.env
  });

  if (!clerkPublishableKey) {
    console.error('Missing Clerk Publishable Key. Please check your .env file.');
    return <div>Error: Missing Clerk configuration</div>;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <AuthProviderContent>
        {children}
      </AuthProviderContent>
    </ClerkProvider>
  );
};
