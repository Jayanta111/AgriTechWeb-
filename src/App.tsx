import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomeScreen from './HomeScreen.tsx';
import ScanScreen from './ScanScreen.tsx';
import MarketplaceScreen from './MarketplaceScreen.tsx';
import WeatherScreen from './WeatherScreen.tsx';
import SignInPage from './pages/SignInPage.tsx';
import SignUpPage from './pages/SignUpPage.tsx';
import BottomNavBar from './components/BottomNavBar.tsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { LanguageProvider } from './contexts/LanguageContext.tsx';

const AppRoutes = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user navigates directly to /market, ensure tab reflects it
    if (location.pathname === '/market') {
      setActiveTab('Market');
    } else if (location.pathname === '/') {
      // Keep whatever tab is active unless they force a route
      if (activeTab === 'Market') setActiveTab('Home'); // Fallback if they go to / but tab was market
    }
  }, [location.pathname]);

  const handleNavPress = (tabName: string) => {
    setActiveTab(tabName);
    if (tabName === 'Market') {
      navigate('/market');
    } else if (location.pathname !== '/') {
      navigate('/');
    }
  };

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
    <Routes>
      {/* Auth Pages */}
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      
      {/* Marketplace Route */}
      <Route path="/market" element={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex flex-col">
          <div className="flex-1 pb-20">
            <MarketplaceScreen />
          </div>
          <BottomNavBar active="Market" onPress={handleNavPress} />
          <PWAInstallPrompt />
        </div>
      } />
      
      {/* Main App */}
      <Route path="/*" element={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex flex-col">
          <div className="flex-1 pb-20">
            {renderMainScreen()}
          </div>
          <BottomNavBar active={activeTab} onPress={handleNavPress} />
          <PWAInstallPrompt />
        </div>
      } />
    </Routes>
  );
};

function App() {
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

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router future={{ 
            v7_startTransition: true,
            v7_relativeSplatPath: true 
          }}>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
