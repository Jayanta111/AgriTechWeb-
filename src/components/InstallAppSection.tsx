import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check, Info, Wifi } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallAppSection: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installStatus, setInstallStatus] = useState<'available' | 'installed' | 'unsupported'>('available');
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isStandaloneChrome = window.matchMedia('(display-mode: standalone)').matches;
      
      if (isStandalone || isInWebAppiOS || isStandaloneChrome) {
        setIsInstalled(true);
        setInstallStatus('installed');
        console.log('App is already installed');
      } else {
        console.log('App is not installed, checking for install prompt...');
        // Check if we can show install prompt
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(() => {
            console.log('Service worker is ready');
          }).catch(error => {
            console.error('Service worker not ready:', error);
          });
        }
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
      setInstallStatus('available');
      console.log('Install prompt stored, showing install options');
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('appinstalled event fired');
      setIsInstalled(true);
      setInstallStatus('installed');
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    // Check if PWA is supported
    const checkPWASupport = () => {
      const isSupported = 'serviceWorker' in navigator && 
                         'beforeinstallprompt' in window &&
                         'PushManager' in window;
      
      if (!isSupported) {
        console.log('PWA not fully supported, falling back to manual install');
        setInstallStatus('available'); // Still show manual install option
      } else {
        console.log('PWA is supported');
      }
    };

    checkIfInstalled();
    checkPWASupport();
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Also check for install prompt after a delay (some browsers are slow)
    const checkDelay = setTimeout(() => {
      if (!deferredPrompt && !isInstalled) {
        console.log('No install prompt received, enabling manual install');
        setInstallStatus('available');
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(checkDelay);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    console.log('Install button clicked');
    console.log('Deferred prompt available:', !!deferredPrompt);
    
    if (!deferredPrompt) {
      console.log('No deferred prompt, showing manual instructions');
      setShowInstructions(true);
      return;
    }

    try {
      console.log('Prompting for installation...');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('User choice:', outcome);
      
      if (outcome === 'accepted') {
        console.log('Installation accepted');
        setIsInstalled(true);
        setInstallStatus('installed');
        setShowInstallBanner(false);
      } else {
        console.log('Installation dismissed');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Installation failed:', error);
      setShowInstructions(true);
    }
  };

  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return {
        title: 'Chrome Installation',
        steps: [
          'Tap the three dots (menu) in the top-right corner',
          'Select "Add to Home screen" or "Install app"',
          'Tap "Install" to confirm',
          'Look for AgriTech icon on your home screen'
        ]
      };
    } else if (userAgent.includes('firefox')) {
      return {
        title: 'Firefox Installation',
        steps: [
          'Tap the three dots (menu) in the top-right corner',
          'Select "Install Page" or "Add to Home screen"',
          'Tap "Install" to confirm',
          'Look for AgriTech icon on your home screen'
        ]
      };
    } else if (userAgent.includes('safari')) {
      return {
        title: 'Safari Installation',
        steps: [
          'Tap the Share button (square with arrow)',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to confirm',
          'Look for AgriTech icon on your home screen'
        ]
      };
    } else {
      return {
        title: 'Installation Instructions',
        steps: [
          'Look for "Install" or "Add to Home screen" in browser menu',
          'Follow the prompts to install the app',
          'Look for AgriTech icon on your home screen'
        ]
      };
    }
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
  };

  const instructions = getBrowserInstructions();

  if (isInstalled) {
    return (
      <div className="mx-4 mb-4 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <Check className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm sm:text-base">App Installed Successfully!</p>
            <p className="text-xs sm:text-sm">You can access AgriTech from your home screen</p>
          </div>
        </div>
      </div>
    );
  }

  if (showInstallBanner) {
    return (
      <div className="mx-4 mb-4 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm sm:text-base">Install AgriTech App</p>
              <p className="text-xs sm:text-sm opacity-90">Get the full app experience on your device</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={dismissInstallBanner}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleInstallClick}
              className="bg-white text-green-600 px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-100 transition-colors flex items-center space-x-1"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Install</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4">
      {/* Main Install Button */}
      <button
        onClick={handleInstallClick}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-3 group"
      >
        <Smartphone className="w-6 h-6 flex-shrink-0" />
        <div className="text-left flex-1">
          <p className="font-bold text-base sm:text-lg">Install AgriTech App</p>
          <p className="text-xs sm:text-sm opacity-90">Get native app experience offline</p>
        </div>
        <Download className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
      </button>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{instructions.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">Follow these steps to install AgriTech</p>
                </div>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {instructions.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-700">{step}</p>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-blue-800 font-semibold mb-1">Benefits of Installing:</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>Works offline - use disease detection without internet</li>
                      <li>Native app experience - full screen, no browser UI</li>
                      <li>Home screen access - launch like any other app</li>
                      <li>Fast loading - instant startup with cached content</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Try Install
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Highlights */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
            <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Works Offline</span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
            <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Native Feel</span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Free Install</span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
            <Check className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>No Play Store</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallAppSection;
