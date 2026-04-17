import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './HomeScreen.tsx';
import ScanScreen from './ScanScreen.tsx';
import MarketplaceScreen from './MarketplaceScreen.tsx';
import WeatherScreen from './WeatherScreen.tsx';
import SignInPage from './pages/SignInPage.tsx';
import SignUpPage from './pages/SignUpPage.tsx';
import BottomNavBar from './components/BottomNavBar.tsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Home');

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  const renderMainScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen />;
      case 'Scan':
        return <ScanScreen />;
      case 'Market':
        return <MarketplaceScreen />;
      case 'Weather':
        return <WeatherScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <AuthProvider>
      <Router future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true 
      }}>
        <Routes>
          {/* Auth Pages */}
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          
          {/* Marketplace Route */}
          <Route path="/market" element={
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <div className="flex-1 pb-20">
                <MarketplaceScreen />
              </div>
              <BottomNavBar active="Market" onPress={setActiveTab} />
              <PWAInstallPrompt />
            </div>
          } />
          
          {/* Main App */}
          <Route path="/*" element={
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <div className="flex-1 pb-20">
                {renderMainScreen()}
              </div>
              <BottomNavBar active={activeTab} onPress={setActiveTab} />
              <PWAInstallPrompt />
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
