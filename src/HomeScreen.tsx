import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogIn, UserPlus, Sun, Moon, Volume2, VolumeX, LogOut } from 'lucide-react';
import ScrollView from './components/ScrollView.tsx';
import FlatCards from './components/FlatCards.tsx';
import Slider from './components/Slider.tsx';
import WeatherCard from './components/WeatherCard.tsx';
import InstallAppSection from './components/InstallAppSection.tsx';
import { useAuthContext } from './contexts/AuthContext.tsx';
import { useTheme } from './contexts/ThemeContext.tsx';
import { useLanguage } from './contexts/LanguageContext.tsx';
import { useSpeech } from './hooks/useSpeech.ts';

const HomeScreen = () => {
  const { isAuthenticated, user, signOut } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { speak, isSpeaking, currentTextId } = useSpeech();

  const handleSpeak = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    speak(text, id);
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 animate-fade-in">
      <ScrollView>
        <div className="pt-4 sm:pt-6 md:pt-10 pb-16 sm:pb-20">
          {/* Header with Auth & Toggles */}
          <div className="px-4 mb-8 sm:mb-10 animate-slide-up">
            <div className="flex justify-between items-center glass-panel rounded-2xl p-4 sm:p-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gradient">{t('app.title')}</h1>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors duration-300">{t('app.subtitle')}</p>
              </div>

              {/* Right Action Section */}
              <div className="flex items-center space-x-3">
                {/* Language Toggle */}
                <button 
                  onClick={toggleLanguage}
                  className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 border border-slate-200/50 dark:border-slate-600/50 shadow-sm transition-all text-slate-600 dark:text-slate-300 font-bold"
                  aria-label="Toggle Language"
                >
                  {language === 'en' ? 'अ' : 'A'}
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 border border-slate-200/50 dark:border-slate-600/50 shadow-sm transition-all text-slate-600 dark:text-slate-300"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {isAuthenticated && user ? (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="flex items-center space-x-3 bg-white/50 dark:bg-slate-800/50 p-2 rounded-2xl border border-white/60 dark:border-slate-700/50 shadow-sm transition-colors duration-300">
                      <div className="text-right hidden sm:block px-2">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                        <p className="text-xs text-agri-green dark:text-emerald-400 font-medium uppercase tracking-wider">{user.user_type}</p>
                      </div>
                      <div className="bg-gradient-to-tr from-agri-green to-emerald-400 dark:from-emerald-500 dark:to-emerald-300 p-2.5 rounded-xl shadow-md shadow-emerald-500/20">
                        <User className="w-5 h-5 text-white dark:text-slate-900" />
                      </div>
                    </div>
                    <button
                      onClick={signOut}
                      className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-800/50 shadow-sm transition-colors duration-300"
                      aria-label="Sign Out"
                      title="Sign Out"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-3">
                    <Link
                      to="/sign-in?redirect=/market"
                      className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl flex items-center space-x-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-sm transition-all duration-300 text-sm font-semibold"
                    >
                      <LogIn className="w-4 h-4 text-agri-green dark:text-emerald-400" />
                      <span className="hidden sm:inline">{t('auth.signin')}</span>
                    </Link>
                    <Link
                      to="/sign-up?redirect=/market"
                      className="bg-gradient-to-r from-agri-green to-emerald-500 dark:from-emerald-600 dark:to-emerald-400 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-md shadow-emerald-500/30 dark:shadow-emerald-900/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm font-semibold"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('auth.signup')}</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Install App Section */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <InstallAppSection />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl sm:text-2xl font-bold px-4 mb-3 text-slate-800 dark:text-slate-100 transition-colors duration-300">{t('section.supported_crops')}</h2>
            <div className="mt-2 px-4">
              <Slider />
            </div>
          </div>

          <div className="px-4 mt-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <FlatCards />
          </div>

          {/* Weather Update Section */}
          <div className="px-4 mt-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <WeatherCard />
          </div>

          {/* Farming Tips Cards - Responsive Grid */}
          <div className="px-4 mt-10 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100 transition-colors duration-300">{t('section.farming_insights')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-5 glass-card rounded-2xl group cursor-pointer relative">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">{'\ud83c\udf3e'}</span>
                  <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-200">{t('insights.irrigation')}</h3>
                  <button 
                    onClick={(e) => handleSpeak(e, t('insights.irrigation.desc'), 'irrigation')}
                    className="ml-auto p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-agri-green dark:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {isSpeaking && currentTextId === 'irrigation' ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>
                <div className="overflow-hidden rounded-xl mb-4 relative">
                  <div className="absolute inset-0 bg-agri-dark/10 group-hover:bg-transparent transition-colors z-10" />
                  <img
                    src="/images/Agriculture.jpg"
                    alt="Agriculture"
                    className="w-full h-40 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors duration-300">
                  {t('insights.irrigation.desc')}
                </p>
              </div>

              <div className="p-5 glass-card rounded-2xl group cursor-pointer relative">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">{'\ud83c\udf31'}</span>
                  <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-200">{t('insights.soil')}</h3>
                  <button 
                    onClick={(e) => handleSpeak(e, t('insights.soil.desc'), 'soil')}
                    className="ml-auto p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-agri-green dark:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {isSpeaking && currentTextId === 'soil' ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>
                <div className="overflow-hidden rounded-xl mb-4 relative">
                  <div className="absolute inset-0 bg-agri-dark/10 group-hover:bg-transparent transition-colors z-10" />
                  <img
                    src="/images/Soil.jpg"
                    alt="Soil Health"
                    className="w-full h-40 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors duration-300">
                  {t('insights.soil.desc')}
                </p>
              </div>

              <div className="p-5 glass-card rounded-2xl group cursor-pointer relative">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">{'\u2600\ufe0f'}</span>
                  <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-200">{t('insights.sunlight')}</h3>
                  <button 
                    onClick={(e) => handleSpeak(e, t('insights.sunlight.desc'), 'sunlight')}
                    className="ml-auto p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-agri-green dark:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {isSpeaking && currentTextId === 'sunlight' ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>
                <div className="overflow-hidden rounded-xl mb-4 relative">
                  <div className="absolute inset-0 bg-agri-dark/10 group-hover:bg-transparent transition-colors z-10" />
                  <img
                    src="/images/sunlight.jpg"
                    alt="Sunlight"
                    className="w-full h-40 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors duration-300">
                  {t('insights.sunlight.desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollView>
    </div>
  );
};

export default HomeScreen;
