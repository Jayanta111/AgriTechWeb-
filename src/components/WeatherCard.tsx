import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, AlertTriangle, CheckCircle, Shield, Bug, Calendar } from 'lucide-react';
import weatherService from '../services/weatherService.tsx';

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

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      // Call without location parameter to trigger auto-location detection
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
      case 'high': return 'border-red-200 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-green-200 bg-green-50 text-green-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="mx-4 my-2 p-4 bg-white rounded-xl shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="mx-4 my-2 p-4 bg-white rounded-xl shadow-md">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <span>{error || 'Weather data unavailable'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 my-2 p-4 bg-white rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-base text-green-800">{'\ud83c\udf24\ufe0f'} Weather Update</h3>
        <button
          onClick={loadWeatherData}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Refresh
        </button>
      </div>

      {/* Current Weather */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-blue-500">
            {getWeatherIcon(weather.condition)}
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{weather.temperature}°C</p>
            <p className="text-sm text-gray-600">{weather.condition}</p>
          </div>
        </div>
        <div className="text-right text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Droplets className="w-4 h-4" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <Wind className="w-4 h-4" />
            <span>{weather.windSpeed} km/h</span>
          </div>
          {weather.rainfall > 0 && (
            <div className="flex items-center space-x-1">
              <CloudRain className="w-4 h-4" />
              <span>{weather.rainfall}mm</span>
            </div>
          )}
        </div>
      </div>

      {/* Farming Advice */}
      <div className="border-t pt-3">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Farming Recommendations</h4>
        <div className="space-y-2">
          {advice.slice(0, 3).map((item, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg border text-xs ${getPriorityColor(item.priority)}`}
            >
              <div className="flex items-start space-x-2">
                <span className="mt-0.5">{getAdviceIcon(item.icon)}</span>
                <div className="flex-1">
                  <span className="font-semibold">{item.category}:</span>
                  <span className="ml-1">{item.advice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Day Forecast */}
      <div className="border-t pt-3 mt-3">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">3-Day Forecast</h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          {weather.forecast.slice(0, 3).map((day, index) => (
            <div key={index} className="text-xs">
              <p className="font-medium text-gray-700">{day.day}</p>
              <div className="flex justify-center my-1 text-blue-500">
                {getWeatherIcon(day.condition)}
              </div>
              <p className="text-gray-600">{day.high}°/{day.low}°</p>
              {day.rainfall > 0 && (
                <p className="text-blue-600">{day.rainfall}mm</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
