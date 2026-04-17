# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for the AgriTech Web application.

## Prerequisites

1. A Clerk account (sign up at [https://dashboard.clerk.com](https://dashboard.clerk.com))
2. Node.js and npm installed

## Setup Steps

### 1. Create a Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click "Add application" 
3. Choose a name for your application (e.g., "AgriTech Web")
4. Select your authentication providers:
   - Email (recommended)
   - Phone number (optional)
   - Google/GitHub social login (optional)
5. Configure your application settings:
   - Development URL: `http://localhost:3000`
   - Production URL: `https://your-domain.com` (when ready)
6. Click "Create application"

### 2. Get Your API Keys

After creating your application, you'll see your API keys:

1. **Publishable Key**: Starts with `pk_test_` (for development) or `pk_live_` (for production)
2. **Secret Key**: Starts with `sk_test_` (for development) or `sk_live_` (for production)

### 3. Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual Clerk keys:
   ```env
   # Clerk Configuration
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE
   CLERK_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
   ```

   Replace `YOUR_ACTUAL_PUBLISHABLE_KEY_HERE` and `YOUR_ACTUAL_SECRET_KEY_HERE` with the keys from your Clerk dashboard.

### 4. Configure Clerk Routes

In your Clerk application dashboard, configure the following routes:

1. **Sign In URL**: `/sign-in`
2. **Sign Up URL**: `/sign-up`
3. **After Sign In**: `/` (redirect to home)
4. **After Sign Up**: `/` (redirect to home)

### 5. Test the Authentication

1. Start your development server:
   ```bash
   npm start
   ```

2. Navigate to the Marketplace tab
3. Try to create a listing or buy a product
4. You should see the authentication modal
5. Sign up or sign in with your credentials

## Features Implemented

### Authentication Requirements

- **Create Listing**: Users must be signed in to create product listings
- **Buy Products**: Users must be signed in to purchase products
- **View Listings**: Anyone can browse listings without authentication

### User Flow

1. Unauthenticated users see lock icons on "Create Listing" and "Buy" buttons
2. Clicking these buttons triggers the sign-in modal
3. After successful authentication, users can perform marketplace actions
4. User information is stored in Clerk and synchronized with the app's user database

### Security Features

- JWT token management handled by Clerk
- Automatic token refresh
- Secure session management
- User data protection

## Backend Integration

Your backend API should:

1. Verify Clerk JWT tokens on protected routes
2. Extract user information from the token
3. Use the `user_id` from Clerk for database operations

Example backend verification (Node.js):
```javascript
const { clerkClient } = require('@clerk/backend');

// Middleware to verify Clerk token
const verifyClerkToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const payload = await clerkClient.verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

## Troubleshooting

### Common Issues

1. **"Missing Clerk configuration" error**
   - Ensure your `.env` file has the correct keys
   - Restart your development server after updating `.env`

2. **Authentication modal not appearing**
   - Check that Clerk components are properly wrapped in `AuthProvider`
   - Verify the environment variables are loaded correctly

3. **Token verification failures**
   - Ensure you're using the correct keys (test vs production)
   - Check that your backend is using the correct Clerk SDK

### Environment Variables Not Loading

If your environment variables aren't loading:

1. Ensure the `.env` file is in the project root
2. Restart your development server
3. Check that the variable names match exactly (including `VITE_` prefix)

## Production Deployment

For production deployment:

1. Update your Clerk application settings to use production URLs
2. Use production keys (`pk_live_` and `sk_live_`)
3. Set environment variables in your hosting environment
4. Ensure your HTTPS certificate is properly configured

## Support

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Support](https://clerk.com/support)
- [React Quickstart Guide](https://clerk.com/docs/quickstarts/react)
