import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, AlertTriangle, CheckCircle, Shield, Bug, Calendar, Volume2, VolumeX } from 'lucide-react';
import weatherService from '../services/weatherService.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useSpeech } from '../hooks/useSpeech.ts';

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  rainfall: number;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    rainfall: number;
  }>;
}

interface FarmingAdvice {
  category: string;
  priority: 'high' | 'medium' | 'low';
  advice: string;
  icon: string;
}

const WeatherCard: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [advice, setAdvice] = useState<FarmingAdvice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  const { t } = useLanguage();
  const { speak, isSpeaking, currentTextId } = useSpeech();

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      const weatherData = await weatherService.getCurrentWeather();
      setWeather(weatherData);
      const farmingAdvice = weatherService.getFarmingAdvice(weatherData);
      setAdvice(farmingAdvice);
      setError('');
    } catch (err) {
      setError('Failed to load weather data');
      console.error('Weather error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    if (condition.toLowerCase().includes('rain')) return <CloudRain className="w-6 h-6" />;
    if (condition.toLowerCase().includes('cloud')) return <Cloud className="w-6 h-6" />;
    if (condition.toLowerCase().includes('sun')) return <Sun className="w-6 h-6" />;
    return <Cloud className="w-6 h-6" />;
  };

  const getAdviceIcon = (iconName: string) => {
    switch (iconName) {
      case 'droplet': return <Droplets className="w-5 h-5" />;
      case 'alert-triangle': return <AlertTriangle className="w-5 h-5" />;
      case 'shield': return <Shield className="w-5 h-5" />;
      case 'bug': return <Bug className="w-5 h-5" />;
      case 'calendar': return <Calendar className="w-5 h-5" />;
      case 'check-circle': return <CheckCircle className="w-5 h-5" />;
      case 'sun': return <Sun className="w-5 h-5" />;
      case 'cloud-rain': return <CloudRain className="w-5 h-5" />;
      case 'wind': return <Wind className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300';
      default: return 'border-gray-200 bg-gray-50 text-gray-800 dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="mx-2 my-2 p-5 glass-card rounded-2xl">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-3"></div>
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full mb-1"></div>
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="mx-2 my-2 p-5 glass-card rounded-2xl">
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <span>{error || t('weather.unavailable')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-2 my-2 p-5 glass-card rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-base text-agri-green dark:text-emerald-400">{'\ud83c\udf24\ufe0f'} {t('section.weather')}</h3>
        <button
          onClick={loadWeatherData}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          {t('weather.refresh')}
        </button>
      </div>

      {/* Current Weather */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-blue-500 dark:text-sky-400 drop-shadow-sm">
            {getWeatherIcon(weather.condition)}
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{weather.temperature}°C</p>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{weather.condition}</p>
          </div>
        </div>
        <div className="text-right text-sm font-medium text-slate-600 dark:text-slate-400 space-y-1">
          <div className="flex items-center justify-end space-x-1.5">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center justify-end space-x-1.5">
            <Wind className="w-4 h-4 text-slate-400" />
            <span>{weather.windSpeed} km/h</span>
          </div>
          {weather.rainfall > 0 && (
            <div className="flex items-center justify-end space-x-1.5">
              <CloudRain className="w-4 h-4 text-blue-500" />
              <span>{weather.rainfall}mm</span>
            </div>
          )}
        </div>
      </div>

      {/* Farming Advice */}
      <div className="border-t border-slate-200 dark:border-slate-700/50 pt-4 mt-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">{t('weather.recommendations')}</h4>
          <button 
            onClick={() => {
              const fullAdviceText = advice.slice(0, 3).map(a => `${a.category}. ${a.advice}`).join('. ');
              speak(fullAdviceText, 'weather-advice');
            }}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-agri-green dark:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {isSpeaking && currentTextId === 'weather-advice' ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
        <div className="space-y-2.5">
          {advice.slice(0, 3).map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded-xl border text-xs sm:text-sm font-medium transition-colors duration-300 ${getPriorityColor(item.priority)}`}
            >
              <div className="flex items-start space-x-2">
                <span className="mt-0.5 opacity-80">{getAdviceIcon(item.icon)}</span>
                <div className="flex-1 leading-relaxed">
                  <span className="font-bold">{item.category}:</span>
                  <span className="ml-1 opacity-90">{item.advice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Day Forecast */}
      <div className="border-t border-slate-200 dark:border-slate-700/50 pt-4 mt-4">
        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200 mb-3">{t('weather.forecast')}</h4>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          {weather.forecast.slice(0, 3).map((day, index) => (
            <div key={index} className="text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/30">
              <p className="font-bold text-slate-700 dark:text-slate-300">{day.day}</p>
              <div className="flex justify-center my-1.5 text-blue-500 dark:text-sky-400">
                {getWeatherIcon(day.condition)}
              </div>
              <p className="font-medium text-slate-600 dark:text-slate-400">{day.high}° / {day.low}°</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
