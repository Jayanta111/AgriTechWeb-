import React, { useState, useEffect, useCallback } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, AlertTriangle, CheckCircle, Shield, Bug, Calendar, Thermometer, MapPin } from 'lucide-react';
import weatherService from './services/weatherService.tsx';

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

const WeatherScreen: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [detectedLocation, setDetectedLocation] = useState<string>('');
  const [locationLoading, setLocationLoading] = useState(false);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const weatherData = await weatherService.getCurrentWeather(); // No location parameter = auto-detect
      setWeather(weatherData);
      if (weatherData.location !== location) {
        setLocation(weatherData.location);
        setDetectedLocation(weatherData.location);
      }
      setError('');
    } catch (err) {
      setError('Failed to get location or weather data');
      console.error('Location/Weather error:', err);
    } finally {
      setLocationLoading(false);
    }
  };

  const loadWeatherData = useCallback(async (useLocation?: string) => {
    try {
      setLoading(true);
      const weatherData = await weatherService.getCurrentWeather(useLocation || location);
      setWeather(weatherData);
      if (useLocation && weatherData.location !== location) {
        setLocation(weatherData.location);
      }
      setError('');
    } catch (err) {
      setError('Failed to load weather data');
      console.error('Weather error:', err);
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  const getWeatherIcon = (condition: string, size: string = 'w-8 h-8') => {
    const iconClass = size;
    if (condition.toLowerCase().includes('rain')) return <CloudRain className={iconClass} />;
    if (condition.toLowerCase().includes('cloud')) return <Cloud className={iconClass} />;
    if (condition.toLowerCase().includes('sun')) return <Sun className={iconClass} />;
    return <Cloud className={iconClass} />;
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
      <div className="flex-1 bg-gray-50 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="flex-1 bg-gray-50 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error || 'Weather data unavailable'}</p>
            <button
              onClick={loadWeatherData}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const advice = weatherService.getFarmingAdvice(weather);
  const optimalActivities = weatherService.getOptimalActivities(weather);

  return (
    <div className="flex-1 bg-gray-50 p-3 sm:p-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Weather & Farming</h1>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter city (e.g., Delhi,IN)"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => loadWeatherData(location)}
            className="px-3 sm:px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Get Weather
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
          <button
            onClick={() => getCurrentLocation()}
            disabled={locationLoading}
            className="px-3 sm:px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
          >
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">{locationLoading ? 'Detecting...' : 'Use My Location'}</span>
          </button>
          {detectedLocation && (
            <span className="text-xs sm:text-sm text-gray-600">
              📍 {detectedLocation}
            </span>
          )}
        </div>
        <button
          onClick={() => loadWeatherData(location)}
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh Weather Data
        </button>
      </div>

      {/* Current Weather Card */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <div className="mb-2 sm:mb-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Current Weather</h2>
            <p className="text-sm sm:text-base text-gray-600">{weather.location}</p>
          </div>
          <div className="text-blue-500">
            {getWeatherIcon(weather.condition, 'w-6 h-6 sm:w-8 sm:h-8')}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2" />
              <span className="text-2xl sm:text-3xl font-bold text-gray-800">{weather.temperature}°C</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Temperature</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-2" />
              <span className="text-2xl sm:text-3xl font-bold text-gray-800">{weather.humidity}%</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Humidity</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2" />
              <span className="text-2xl sm:text-3xl font-bold text-gray-800">{weather.windSpeed}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Wind (km/h)</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CloudRain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
              <span className="text-2xl sm:text-3xl font-bold text-gray-800">{weather.rainfall}mm</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Rainfall</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-center text-blue-800 font-medium text-sm sm:text-base">{weather.condition}</p>
        </div>
      </div>

      {/* Farming Recommendations */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Farming Recommendations</h2>
        <div className="space-y-2 sm:space-y-3">
          {advice.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border text-xs sm:text-sm ${getPriorityColor(item.priority)}`}
            >
              <div className="flex items-start space-x-2 sm:space-x-3">
                <span className="mt-0.5">{getAdviceIcon(item.icon)}</span>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1 sm:mb-2">
                    <span className="font-semibold text-xs sm:text-sm">{item.category}:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.priority === 'high' ? 'bg-red-200 text-red-800' :
                      item.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm">{item.advice}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimal Activities */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Today's Optimal Activities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {optimalActivities.map((activity, index) => (
            <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium text-xs sm:text-sm">{activity}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">5-Day Forecast</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
          {weather.forecast.map((day, index) => (
            <div key={index} className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-700 text-xs sm:text-sm mb-1 sm:mb-2">{day.day}</p>
              <div className="flex justify-center mb-1 sm:mb-2 text-blue-500">
                {getWeatherIcon(day.condition, 'w-5 h-5 sm:w-6 sm:h-6')}
              </div>
              <p className="text-base sm:text-lg font-bold text-gray-800">{day.high}°</p>
              <p className="text-sm sm:text-base text-gray-600">{day.low}°</p>
              <p className="text-xs text-gray-500 mt-1">{day.condition}</p>
              {day.rainfall > 0 && (
                <p className="text-xs text-blue-600">{day.rainfall}mm</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherScreen;
