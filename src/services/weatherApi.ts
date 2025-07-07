/**
 * Weather API Service
 *
 * This service provides weather data using the Hostaway Assessment API
 * and maintains backward compatibility with the existing app structure.
 */
import {
  apiService,
  WeatherData as ApiWeatherData,
  WeatherHistoryItem,
} from './apiService';

// Error Types
export interface ApiError {
  message: string;
  code?: number;
  status?: number;
}

// Weather Types for backward compatibility
export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface MainWeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

export interface WindData {
  speed: number;
  deg: number;
  gust?: number;
}

export interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    condition: WeatherCondition;
    timestamp: number;
    sunrise?: number;
    sunset?: number;
  };
}

// Forecast Types
export interface DailyForecast {
  date: number;
  minTemp: number;
  maxTemp: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
}

export interface ForecastData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  forecast: DailyForecast[];
}

// Location Search Types
export interface LocationSearchResult {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

// Transform API weather data to app format
const transformWeatherData = (
  data: ApiWeatherData,
  lat: number,
  lon: number,
): WeatherData => {
  // Parse location from string if needed
  const locationParts = data.location.split(',');
  const cityName = locationParts[0]?.trim() || 'Unknown';
  const country = locationParts[1]?.trim() || '';

  // Create weather condition from description
  const condition: WeatherCondition = {
    id: 800, // Default to clear sky
    main: data.description.includes('cloud')
      ? 'Clouds'
      : data.description.includes('rain')
      ? 'Rain'
      : 'Clear',
    description: data.description,
    icon: '01d', // Default icon
  };

  return {
    location: {
      name: cityName,
      country: country,
      lat: lat,
      lon: lon,
    },
    current: {
      temperature: data.temperature,
      feelsLike: data.temperature, // API doesn't provide feels like, use temperature
      humidity: data.humidity,
      windSpeed: data.windSpeed,
      condition: condition,
      timestamp: new Date(data.timestamp).getTime() / 1000, // Convert to Unix timestamp
      sunrise: undefined, // API doesn't provide sunrise/sunset
      sunset: undefined,
    },
  };
};

// Transform weather history item to weather data
const transformHistoryItem = (item: WeatherHistoryItem): WeatherData => {
  const condition: WeatherCondition = {
    id: 800,
    main: item.weatherData.description.includes('cloud')
      ? 'Clouds'
      : item.weatherData.description.includes('rain')
      ? 'Rain'
      : 'Clear',
    description: item.weatherData.description,
    icon: item.weatherData.icon || '01d',
  };

  return {
    location: {
      name: item.location.name,
      country: item.location.country,
      lat: item.location.lat,
      lon: item.location.lon,
    },
    current: {
      temperature: item.weatherData.temperature,
      feelsLike: item.weatherData.temperature, // Use same value as temperature
      humidity: item.weatherData.humidity,
      windSpeed: item.weatherData.windSpeed,
      condition: condition,
      timestamp: new Date(item.createdAt).getTime() / 1000, // Convert to Unix timestamp
      sunrise: undefined, // API doesn't provide sunrise/sunset
      sunset: undefined,
    },
  };
};

// Helper function to create ApiError
function createApiError(message: string, code: number = 500): ApiError {
  return {message, code};
}

// API function to get current weather
export const getCurrentWeather = async (city: string): Promise<WeatherData> => {
  try {
    // Initialize API service
    await apiService.initialize();

    // Check if user is authenticated
    const isAuthenticated = await apiService.isAuthenticated();
    if (!isAuthenticated) {
      throw createApiError(
        'Authentication required. Please log in to access weather data.',
        401,
      );
    }

    // Fetch weather data from API
    const weatherData = await apiService.getCurrentWeather(city);

    // Transform and return data
    return transformWeatherData(weatherData, 0, 0); // Use 0,0 for coordinates since we don't have them
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw {
      message:
        error instanceof Error
          ? error.message
          : 'Failed to fetch current weather',
      code: (error as any)?.statusCode || 500,
    };
  }
};

// API function to get forecast (using current weather for now)
export const getForecast = async (city: string): Promise<ForecastData> => {
  try {
    // Get current weather and create a simple forecast
    const currentWeather = await getCurrentWeather(city);

    // Create a simple 5-day forecast based on current weather
    const forecast: DailyForecast[] = [];
    const today = new Date();

    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Add some variation to temperature
      const tempVariation = (Math.random() - 0.5) * 10; // ±5°C variation
      const temp = currentWeather.current.temperature + tempVariation;

      forecast.push({
        date: date.getTime() / 1000,
        minTemp: temp - 5,
        maxTemp: temp + 5,
        condition: currentWeather.current.condition,
        humidity: currentWeather.current.humidity,
        windSpeed: currentWeather.current.windSpeed,
      });
    }

    return {
      location: currentWeather.location,
      forecast: forecast,
    };
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw {
      message:
        error instanceof Error ? error.message : 'Failed to fetch forecast',
      code: (error as any)?.statusCode || 500,
    };
  }
};

// API function to search locations
export const searchLocations = async (
  query: string,
): Promise<LocationSearchResult[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    // Initialize API service
    await apiService.initialize();

    // Check if user is authenticated
    const isAuthenticated = await apiService.isAuthenticated();
    if (!isAuthenticated) {
      throw createApiError(
        'Authentication required. Please log in to search locations.',
        401,
      );
    }

    // Search weather for the location
    const searchResult = await apiService.searchWeather(query);

    // Transform to location search result
    const locationResult: LocationSearchResult = {
      id: `${searchResult.location.lat}_${searchResult.location.lon}`,
      name: searchResult.location.name,
      country: searchResult.location.country,
      state: undefined, // API doesn't provide state
      lat: searchResult.location.lat,
      lon: searchResult.location.lon,
    };

    return [locationResult];
  } catch (error) {
    console.error('Error searching locations:', error);
    throw {
      message:
        error instanceof Error ? error.message : 'Failed to search locations',
      code: (error as any)?.statusCode || 500,
    };
  }
};

// Helper function to get weather history
export const getWeatherHistory = async (): Promise<WeatherData[]> => {
  try {
    // Initialize API service
    await apiService.initialize();

    // Check if user is authenticated
    const isAuthenticated = await apiService.isAuthenticated();
    if (!isAuthenticated) {
      throw createApiError(
        'Authentication required. Please log in to access weather history.',
        401,
      );
    }

    // Get weather history from API
    const history = await apiService.getWeatherHistory();

    // Transform results to WeatherData format
    return history.map((result: WeatherHistoryItem) =>
      transformHistoryItem(result),
    );
  } catch (error) {
    console.error('Error fetching weather history:', error);
    throw {
      message:
        error instanceof Error
          ? error.message
          : 'Failed to fetch weather history',
      code: (error as any)?.statusCode || 500,
    };
  }
};

// Export the API service for direct access if needed
export {apiService};
