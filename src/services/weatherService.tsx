
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

class WeatherService {
  private apiKey = '671e95d9201b0567138de5658ea1992f';
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  
  async getCurrentWeather(location?: string): Promise<WeatherData> {
    // If no location provided, try to get user's current location
    if (!location) {
      location = await this.getCurrentLocation();
    }
    
    return this.getWeatherForLocation(location);
  }
  
  private async getCurrentLocation(): Promise<string> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('Geolocation not supported, using default location');
        resolve('Delhi,IN');
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding to get city name
          this.reverseGeocode(latitude, longitude)
            .then(cityName => {
              console.log('Detected location:', cityName);
              resolve(cityName);
            })
            .catch(() => {
              console.log('Reverse geocoding failed, using coordinates');
              resolve(`${latitude.toFixed(2)},${longitude.toFixed(2)}`);
            });
        },
        (error) => {
          console.log('Geolocation error:', error);
          resolve('Delhi,IN'); // Fallback to default
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }
  
  private async reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }
      
      const data = await response.json();
      if (data && data.length > 0) {
        const city = data[0];
        const state = city.state ? `,${city.state}` : '';
        const country = city.country ? `,${city.country}` : '';
        return `${city.name}${state}${country}`;
      }
      
      return `${lat.toFixed(2)},${lon.toFixed(2)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(2)},${lon.toFixed(2)}`;
    }
  }
  
  private async getWeatherForLocation(location: string): Promise<WeatherData> {
    try {
      // Get current weather
      const currentResponse = await fetch(
        `${this.baseUrl}/weather?q=${location}&appid=${this.apiKey}&units=metric`
      );
      
      if (!currentResponse.ok) {
        throw new Error(`Weather API error: ${currentResponse.status}`);
      }
      
      const currentData = await currentResponse.json();
      
      // Get 5-day forecast
      const forecastResponse = await fetch(
        `${this.baseUrl}/forecast?q=${location}&appid=${this.apiKey}&units=metric`
      );
      
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }
      
      const forecastData = await forecastResponse.json();
      
      // Process forecast data (group by day)
      const dailyForecast = this.processForecastData(forecastData.list);
      
      const weatherData: WeatherData = {
        location: currentData.name || location,
        temperature: Math.round(currentData.main.temp),
        humidity: currentData.main.humidity,
        condition: this.getWeatherCondition(currentData.weather[0].main, currentData.weather[0].description),
        windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
        rainfall: currentData.rain ? Math.round(currentData.rain['1h'] || 0) : 0,
        forecast: dailyForecast
      };
      
      return weatherData;
    } catch (error) {
      console.error('Weather API error:', error);
      // Fallback to mock data if API fails
      return this.getFallbackWeatherData(location);
    }
  }
  
  private processForecastData(forecastList: any[]): Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    rainfall: number;
  }> {
    const dailyData: { [key: string]: any[] } = {};
    const today = new Date().getDate();
    
    // Group forecast data by day
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.getDate() === today ? 'Today' : 
                    date.getDate() === today + 1 ? 'Tomorrow' :
                    date.getDate() === today + 2 ? 'Day After' :
                    date.getDate() === today + 3 ? 'Day 4' : 'Day 5';
      
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = [];
      }
      dailyData[dayKey].push(item);
    });
    
    // Process each day's data
    return Object.keys(dailyData).slice(0, 5).map(dayKey => {
      const dayData = dailyData[dayKey];
      const temps = dayData.map(item => item.main.temp);
      const maxTemp = Math.round(Math.max(...temps));
      const minTemp = Math.round(Math.min(...temps));
      const avgCondition = this.getMostCommonCondition(dayData.map(item => item.weather[0].main));
      const totalRain = dayData.reduce((sum, item) => sum + (item.rain ? item.rain['3h'] || 0 : 0), 0);
      
      return {
        day: dayKey,
        high: maxTemp,
        low: minTemp,
        condition: avgCondition,
        rainfall: Math.round(totalRain)
      };
    });
  }
  
  private getWeatherCondition(main: string, description: string): string {
    const conditionMap: { [key: string]: string } = {
      'Clear': 'Sunny',
      'Clouds': 'Cloudy',
      'Rain': 'Rainy',
      'Drizzle': 'Rainy',
      'Thunderstorm': 'Stormy',
      'Snow': 'Snowy',
      'Mist': 'Foggy',
      'Haze': 'Hazy'
    };
    
    return conditionMap[main] || description || 'Unknown';
  }
  
  private getMostCommonCondition(conditions: string[]): string {
    const counts: { [key: string]: number } = {};
    conditions.forEach(condition => {
      counts[condition] = (counts[condition] || 0) + 1;
    });
    
    let maxCount = 0;
    let mostCommon = conditions[0];
    
    Object.keys(counts).forEach(condition => {
      if (counts[condition] > maxCount) {
        maxCount = counts[condition];
        mostCommon = condition;
      }
    });
    
    return this.getWeatherCondition(mostCommon, '');
  }
  
  private getFallbackWeatherData(location: string): WeatherData {
    return {
      location: location,
      temperature: 28,
      humidity: 65,
      condition: 'Partly Cloudy',
      windSpeed: 12,
      rainfall: 2,
      forecast: [
        { day: 'Today', high: 32, low: 24, condition: 'Partly Cloudy', rainfall: 2 },
        { day: 'Tomorrow', high: 30, low: 23, condition: 'Rainy', rainfall: 8 },
        { day: 'Day After', high: 29, low: 22, condition: 'Sunny', rainfall: 0 },
        { day: 'Day 4', high: 31, low: 24, condition: 'Cloudy', rainfall: 1 },
        { day: 'Day 5', high: 33, low: 25, condition: 'Sunny', rainfall: 0 }
      ]
    };
  }

  getFarmingAdvice(weather: WeatherData): FarmingAdvice[] {
    const advice: FarmingAdvice[] = [];

    // Temperature-based advice
    if (weather.temperature > 35) {
      advice.push({
        category: 'Irrigation',
        priority: 'high',
        advice: 'High temperature detected. Increase irrigation frequency and water early morning or late evening to reduce evaporation.',
        icon: 'droplet'
      });
    } else if (weather.temperature < 15) {
      advice.push({
        category: 'Protection',
        priority: 'medium',
        advice: 'Low temperature. Consider covering sensitive plants to prevent frost damage.',
        icon: 'shield'
      });
    }

    // Humidity-based advice
    if (weather.humidity > 80) {
      advice.push({
        category: 'Disease Prevention',
        priority: 'high',
        advice: 'High humidity increases fungal disease risk. Ensure proper air circulation and avoid overhead watering.',
        icon: 'alert-triangle'
      });
    } else if (weather.humidity < 30) {
      advice.push({
        category: 'Irrigation',
        priority: 'medium',
        advice: 'Low humidity detected. Increase watering frequency and consider mulching to retain soil moisture.',
        icon: 'droplet'
      });
    }

    // Rainfall-based advice
    if (weather.rainfall > 10) {
      advice.push({
        category: 'Irrigation',
        priority: 'high',
        advice: 'Heavy rainfall expected. Reduce irrigation and check drainage to prevent waterlogging.',
        icon: 'cloud-rain'
      });
    } else if (weather.rainfall === 0 && weather.temperature > 30) {
      advice.push({
        category: 'Irrigation',
        priority: 'high',
        advice: 'No rainfall with high temperature. Increase irrigation and consider drought-resistant crop varieties.',
        icon: 'sun'
      });
    }

    // Wind-based advice
    if (weather.windSpeed > 20) {
      advice.push({
        category: 'Protection',
        priority: 'medium',
        advice: 'Strong winds detected. Consider windbreaks and stake tall plants to prevent damage.',
        icon: 'wind'
      });
    }

    // Condition-based advice
    if (weather.condition.toLowerCase().includes('rain')) {
      advice.push({
        category: 'Planting',
        priority: 'low',
        advice: 'Rainy weather good for planting leafy vegetables. Avoid planting during heavy downpours.',
        icon: 'cloud-rain'
      });
    } else if (weather.condition.toLowerCase().includes('sunny')) {
      advice.push({
        category: 'Pest Control',
        priority: 'medium',
        advice: 'Sunny weather increases pest activity. Monitor plants regularly and apply organic pest control if needed.',
        icon: 'bug'
      });
    }

    // General advice based on forecast
    const nextDaysRain = weather.forecast.slice(1, 3).reduce((sum, day) => sum + day.rainfall, 0);
    if (nextDaysRain > 15) {
      advice.push({
        category: 'Planning',
        priority: 'medium',
        advice: 'Heavy rainfall expected in next few days. Postpone fertilizer application and prepare drainage.',
        icon: 'calendar'
      });
    }

    return advice.length > 0 ? advice : [{
      category: 'General',
      priority: 'low',
      advice: 'Weather conditions are favorable for most farming activities. Continue regular crop monitoring.',
      icon: 'check-circle'
    }];
  }

  getOptimalActivities(weather: WeatherData): string[] {
    const activities: string[] = [];

    if (weather.condition.toLowerCase().includes('sunny') && weather.temperature < 32) {
      activities.push('Planting seeds', 'Applying fertilizer', 'Pest monitoring');
    }

    if (weather.condition.toLowerCase().includes('cloudy')) {
      activities.push('Transplanting seedlings', 'Weeding', 'Soil preparation');
    }

    if (weather.rainfall === 0 && weather.temperature > 25) {
      activities.push('Irrigation', 'Mulching', 'Drought preparation');
    }

    if (weather.humidity > 70) {
      activities.push('Disease monitoring', 'Pruning for air circulation');
    }

    if (weather.windSpeed < 15 && weather.temperature > 20) {
      activities.push('Spraying pesticides', 'Harvesting');
    }

    return activities.length > 0 ? activities : ['General crop monitoring', 'Soil moisture check'];
  }
}

const weatherService = new WeatherService();
export default weatherService;
