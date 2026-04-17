# AgriTech Web Application

A React web application that matches the React Native mobile app design and provides plant disease detection through both camera and image upload methods.

## Features

- **Live Camera Detection**: Real-time plant disease detection using device camera
- **Image Upload Detection**: Upload plant images for analysis
- **Weather Integration**: Real-time weather updates with farming recommendations
- **Market Prices**: Real-time mandi prices from major agricultural markets across India
- **Marketplace**: Buy and sell agricultural products directly with other farmers
- **Smart Farming Advice**: AI-powered suggestions based on weather conditions
- **Backend Integration**: Connects to Flask API with YOLO model
- **Responsive Design**: Works on desktop and mobile browsers
- **Four Main Screens**: Home, Scan, Marketplace, and Weather

## Setup Instructions

### 1. Start Backend Servers

#### Option 1: Start Both Servers Together (Recommended)
```bash
cd d:\Hackthon\Backend
python start_all.py
```
This will start both servers simultaneously:
- Disease Detection: http://localhost:5000
- Marketplace: http://localhost:5001

#### Option 2: Windows Batch File
```bash
cd d:\Hackthon\Backend
start_all.bat
```

#### Option 3: PowerShell Script
```powershell
cd d:\Hackthon\Backend
.\start_all.ps1
```

#### Option 4: Linux/Mac Shell Script
```bash
cd d:\Hackthon\Backend
chmod +x start_all.sh
./start_all.sh
```

#### Option 5: Start Servers Individually
**Disease Detection Server:**
```bash
cd d:\Hackthon\Backend
python enhanced_flask_app.py
```
**Marketplace Server:**
```bash
cd d:\Hackthon\Backend
python marketplace.py
```

### 2. Start Frontend Development Server
```bash
cd d:\Hackthon\AgriTech-Web
npm start
```
Frontend will run on: http://localhost:3000

## How to Use Scan Feature

### Camera Mode:
1. Navigate to "Scan" tab
2. Allow camera permissions when prompted
3. Point camera at plant leaf
4. Click "Scan Now" button or wait for automatic scan (every 20 seconds)
5. View detection results

### Upload Mode:
1. Navigate to "Scan" tab
2. Click "Upload" button
3. Choose an image of plant leaf
4. View automatic analysis results

## Weather Features

### Weather Updates:
- **Real-time Weather**: Current temperature, humidity, wind speed, and rainfall
- **5-Day Forecast**: Plan farming activities with advance weather information
- **Smart Recommendations**: Get farming advice based on current conditions
- **Location Support**: Enter any city name (e.g., Delhi,IN, Mumbai,IN)
- **OpenWeatherMap API**: Real weather data with fallback to mock data

### Farming Advice Categories:
- **Irrigation**: Watering recommendations based on temperature and rainfall
- **Disease Prevention**: Alerts for high humidity periods that increase disease risk
- **Protection**: Advice for extreme weather conditions
- **Optimal Activities**: Best farming tasks for current weather

### Weather-Based Suggestions:
- **High Temperature (>35°C)**: Increase irrigation, water early morning/evening
- **High Humidity (>80%)**: Ensure air circulation, avoid overhead watering
- **Heavy Rainfall**: Reduce irrigation, check drainage systems
- **Strong Winds**: Use windbreaks, stake tall plants
- **Sunny Weather**: Monitor for increased pest activity

## Market Price Features

### Real-Time Mandi Prices
- **Live Data**: Real-time prices from major agricultural markets across India
- **Multiple Commodities**: Wheat, Rice, Tomato, Potato, Onion, Mustard, Gram, and more
- **Price Trends**: Track price movements with up/down/stable indicators
- **Market Locations**: Prices from Delhi, Mumbai, Kolkata, Chennai, Bangalore, and other major mandis

### Market Analysis Tools
- **Price Comparison**: Compare prices across different markets
- **Trend Analysis**: See price changes with percentage indicators
- **Market Overview**: Average, highest, and lowest prices at a glance
- **Search & Filter**: Filter by state, commodity, or search specific markets

### Price Information
- **Current Price**: Real-time market prices in INR per quintal
- **Previous Price**: Compare with previous day's prices
- **Change Percentage**: See exact price movement percentages
- **Last Updated**: Timestamp for price data freshness

### Market Insights
- **Trending Analysis**: Track which commodities are trending up or down
- **Market Summary**: Quick overview of market conditions
- **Location-Based**: Filter prices by state for local market information
- **Real-Time Updates**: Automatic refresh every 5 minutes
- **API Integration**: Multiple data sources with fallback system
- **Manual Refresh**: Force refresh for latest price updates

### Real-Time API Features
- **Multiple Data Sources**: Government API + Commercial APIs
- **Automatic Fallback**: Mock data if APIs are unavailable
- **Error Handling**: Graceful degradation with user notifications
- **Data Transformation**: Consistent format across different APIs
- **Performance**: Optimized API calls with caching

## Marketplace Features

### Direct Trading Platform
- **Create Listings**: Farmers can list their agricultural products for sale
- **Browse Products**: Buyers can browse available products with detailed information
- **Real-Time Transactions**: Live buy/sell transactions with status tracking
- **Secure Payments**: Transaction system with confirmation and completion tracking

### Listing Management
- **Product Details**: Add commodity, quantity, price, location, and description
- **Image Upload**: Add product images for better visibility
- **Status Tracking**: Active, sold, or expired listing status
- **View Analytics**: Track views and likes on your listings

### Transaction System
- **Buy Requests**: Buyers can request to purchase specific quantities
- **Seller Confirmation**: Sellers can confirm or reject buy requests
- **Delivery Tracking**: Track transaction status from pending to completion
- **Transaction History**: View all past and current transactions

### Search and Discovery
- **Advanced Filters**: Filter by commodity, location, price range
- **Search Functionality**: Search for specific products or locations
- **Sorting Options**: Sort by price, date, or relevance
- **Marketplace Stats**: View marketplace statistics and trends

### User Features
- **User Profiles**: Create farmer or buyer profiles
- **Location-Based**: Find products and buyers in your area
- **Rating System**: Build trust through transaction ratings
- **Communication**: Connect with buyers and sellers directly

## Real-Time Location Usage

### Automatic Location Detection
1. **Open Weather Screen**: Navigate to Weather tab
2. **Click "Use My Location"**: Green button with location icon
3. **Allow Permission**: Grant browser location access when prompted
4. **Auto-Detection**: App detects your GPS coordinates and city name
5. **Get Weather**: Real-time weather for your exact location

### Manual Location Entry
1. **Type Location**: Enter city name in format "City,CountryCode"
2. **Examples**: "Delhi,IN", "Mumbai,IN", "New York,US"
3. **Get Weather**: Click "Get Weather" button
4. **Refresh Data**: Update weather anytime with refresh button

### Location Features
- **GPS Accuracy**: High-accuracy location detection
- **Reverse Geocoding**: Converts coordinates to readable city names
- **Fallback System**: Uses default location if GPS is unavailable
- **Privacy Safe**: Location only used for weather, not stored

## Troubleshooting

### Camera Not Working:
- Ensure camera permissions are granted
- Try using a different browser (Chrome recommended)
- Check if camera is not being used by another application

### Scan Not Working:
- Verify backend server is running on localhost:5000
- Check browser console for error messages (F12)
- Ensure good internet connection
- Try with a clear, well-lit plant image

### Backend Connection Issues:
- Make sure Python Flask server is running
- Check that port 5000 is not blocked by firewall
- Verify YOLO model files are in Backend directory

## Supported Plants

- **Tomato**: 9 disease conditions + healthy
- **Potato**: 3 disease conditions + healthy  
- **Pepper**: 2 disease conditions + healthy

## Progressive Web App (PWA) Features
- **Installable**: Can be installed on Android and iOS devices
- **Offline Support**: Works without internet connection (cached content)
- **App-like Experience**: Fullscreen mode with no browser UI
- **Push Notifications**: Weather alerts and farming reminders
- **Background Sync**: Syncs data when connection is restored
- **Responsive Design**: Optimized for mobile and desktop
- **In-App Install**: Install button directly in the app interface

### Install App Feature

#### **Home Screen Installation**
- **Install Button**: Prominent install button on the home screen
- **Smart Detection**: Automatically detects if app is already installed
- **Browser Compatibility**: Works with Chrome, Firefox, Safari, Edge
- **One-Click Install**: Simple installation process with clear instructions
- **Status Indicators**: Shows installation status and success messages

#### **Installation Experience**
- **Install Banner**: Elegant banner appears when installation is available
- **Manual Instructions**: Step-by-step instructions for each browser
- **Feature Benefits**: Shows benefits of installing the app
- **Confirmation**: Clear success message when installed

#### **Cross-Browser Support**
- **Chrome**: "Add to Home screen" or "Install app" option
- **Firefox**: "Install Page" or "Add to Home screen" option  
- **Safari**: "Add to Home Screen" from share menu
- **Edge**: "Add to Home screen" or "Install app" option

### Android Installation Guide

### Step 1: Start the App
1. **Start Backend Servers**:
```bash
cd d:\Hackthon\Backend
python start_all.py
```
   ```bash
   cd d:\Hackthon\Backend
   python start_all.py
   ```
2. **Start Frontend**:
   ```bash
   cd d:\Hackthon\AgriTech-Web
   npm start
   ```
3. **Open Browser**: Navigate to `http://localhost:3000`

### Step 2: Enable PWA Installation
1. **Open Chrome Browser** on your Android device
2. **Enter URL**: Type your computer's IP address followed by :3000
   - Example: `http://192.168.1.100:3000`
   - **Find your IP**: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. **Load the App**: Wait for the AgriTech app to load completely

### Step 3: Install the PWA
1. **Look for Install Prompt**: Chrome will show "Add to Home screen" banner
2. **Tap "Add to Home Screen"**: If no banner appears:
   - Tap the **three dots** (menu) in Chrome
   - Select **"Add to Home screen"** or **"Install app"**
3. **Confirm Installation**: 
   - Verify the app name: "AgriTech"
   - Check the URL: Your IP address
   - Tap **"Add"** or **"Install"**

### Step 4: Launch the App
1. **Home Screen Icon**: Look for the AgriTech icon on your home screen
2. **Tap to Launch**: The app will open in full-screen mode
3. **Offline Ready**: The app works without internet connection

### Troubleshooting Installation

#### If Install Banner Doesn't Appear:
1. **Check HTTPS**: PWA requires HTTPS (localhost works for development)
2. **Refresh Page**: Reload the app completely
3. **Clear Cache**: Clear Chrome browser data
4. **Update Chrome**: Ensure Chrome is updated to latest version
5. **Check PWA Criteria**: 
   - App must load successfully
   - Service worker must be registered
   - Manifest must be valid

#### Manual Installation:
1. **Chrome Menu**: Tap three dots > "Add to Home screen"
2. **Confirm**: Verify app details and tap "Add"
3. **Check Home Screen**: Look for AgriTech icon

#### If App Doesn't Work Offline:
1. **First Visit**: Ensure you've visited all main screens while online
2. **Service Worker**: Check browser console for service worker errors
3. **Cache Size**: Some browsers limit cache storage
4. **Refresh Online**: Visit app online again to update cache

### PWA Benefits on Android

#### **Native App Experience:**
- **Full Screen**: No browser UI elements
- **Home Screen Icon**: Easy access like native apps
- **Splash Screen**: Professional loading screen
- **App Switcher**: Appears in recent apps

#### **Offline Capabilities:**
- **Disease Detection**: Works offline (camera-based)
- **Marketplace**: Browse cached listings
- **Weather Data**: Shows last known weather
- **Navigation**: All screens accessible offline

#### **Performance:**
- **Fast Loading**: Cached resources load instantly
- **Smooth Scrolling**: Optimized for mobile performance
- **Touch Gestures**: Native-like touch interactions
- **Responsive Design**: Perfect for all screen sizes

### Network Requirements

#### **For Installation:**
- **Internet Connection**: Required for initial installation
- **Local Network**: Device must be on same WiFi as computer
- **Chrome Browser**: Required for PWA installation
- **Android Version**: Android 5.0+ recommended

#### **For Usage:**
- **Online Features**: Real-time data (weather, marketplace)
- **Offline Features**: Disease detection, cached content
- **Background Sync**: Updates when connection restored
- **Push Notifications**: Coming soon

### Installation Instructions

#### Android (Chrome):
1. Open AgriTech in Chrome browser
2. Look for "Install" banner at bottom
3. Click "Install" button
4. App appears on home screen

#### iOS (Safari):
1. Open AgriTech in Safari browser
2. Tap Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm
5. App appears on home screen

#### Desktop (Chrome/Edge):
1. Open AgriTech in Chrome/Edge
2. Click install icon in address bar
3. Click "Install" button
4. App appears in applications

### PWA Benefits
- **No App Store**: Install directly from website
- **Always Updated**: Latest version loads automatically
- **Small Size**: Minimal storage required
- **Fast Loading**: Cached resources load instantly
- **Cross-Platform**: Works on any device with modern browser

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Python Flask, YOLOv8, OpenCV
- **Weather API**: OpenWeatherMap API
- **PWA**: Service Worker, Web App Manifest
- **Icons**: Lucide React
- **HTTP Client**: Axios

## API Configuration

### Market Price API
- **Multiple APIs**: Government of India, CommodityOnline, Mandi Bharat
- **Real-Time Data**: Live market prices with automatic refresh
- **Fallback System**: Mock data if all APIs fail
- **Auto-Refresh**: Updates every 5 minutes
- **Data Sources**: Official government agricultural market data

### OpenWeatherMap API
- **API Key**: Integrated in weatherService.tsx
- **Base URL**: https://api.openweathermap.org/data/2.5
- **Endpoints**: 
  - `/weather` - Current weather data
  - `/forecast` - 5-day weather forecast
- **Units**: Metric (°C, km/h, mm)
- **Fallback**: Mock data if API fails

### Location Features
- **Auto-Detection**: Uses browser geolocation API to detect user's current location
- **Reverse Geocoding**: Converts GPS coordinates to readable city names
- **Manual Input**: Users can manually enter any location
- **Permission Handling**: Graceful fallback if location access is denied

### Location Format
Use format: `City,CountryCode`
- Examples: `Delhi,IN`, `Mumbai,IN`, `New York,US`
- Auto-Detected: Real GPS coordinates converted to city name
- Default: `Delhi,IN` (fallback if geolocation fails)

## Static Assets

### Images
- **Location**: `public/images/` directory
- **Agriculture.jpg**: Main farming image used in tips cards
- **lenom.png**: Lemon/soil health image for farming tips
- **Usage**: Referenced with `/images/filename.png` in components

### Adding New Images
1. Place images in `public/images/` directory
2. Reference in components using `/images/filename.ext`
3. Use descriptive alt text for accessibility
4. Optimize images for web (WebP format recommended)

## Responsive Design

### Breakpoints
- **Mobile**: < 640px (sm: breakpoint)
- **Tablet**: 640px - 1024px (md: breakpoint)  
- **Desktop**: > 1024px (lg: breakpoint)

### Responsive Features
- **HomeScreen**: Grid layout adapts from 1 to 3 columns
- **ScanScreen**: Camera and upload interfaces optimized for mobile
- **WeatherScreen**: Card layouts adjust for screen size
- **BottomNavBar**: Compact navigation with hidden text on mobile

### Mobile Optimizations
- **Touch Targets**: Larger tap targets for mobile interaction
- **Readable Text**: Scales appropriately for screen size
- **Flexible Layouts**: Content reflows for different orientations
- **Performance**: Optimized images and reduced animations on mobile

## Development

The app uses TypeScript with strict mode enabled. All imports use .tsx extensions for proper module resolution.

## Browser Compatibility

- Chrome (Recommended)
- Firefox
- Safari
- Edge

Note: Camera functionality works best in Chrome due to better WebRTC support.
#   A g r i T e c h W e b -  
 