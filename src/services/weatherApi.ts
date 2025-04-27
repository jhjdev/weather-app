// Import centralized environment configuration
import { env } from '../config/env';

// API Configuration is loaded from environment configuration
const WEATHER_ENDPOINT = '/data/2.5/weather';
const FORECAST_ENDPOINT = '/data/2.5/forecast';
const GEO_ENDPOINT = '/geo/1.0/direct';

// Default parameters for API requests
const DEFAULT_PARAMS = {
  appid: env.weather.apiKey,
  units: 'metric', // Celsius
};
// API key is validated at module initialization

const TIMEOUT = 10000; // 10 seconds

// Error Types
export interface ApiError {
  message: string;
  code?: number;
  status?: number;
}

// Weather Types
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

export interface CloudsData {
  all: number;
}

export interface SysData {
  type?: number;
  id?: number;
  country: string;
  sunrise: number;
  sunset: number;
}

export interface WeatherResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: WeatherCondition[];
  base: string;
  main: MainWeatherData;
  visibility: number;
  wind: WindData;
  clouds: CloudsData;
  dt: number;
  sys: SysData;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

// Forecast Types
export interface ForecastItem {
  dt: number;
  main: MainWeatherData;
  weather: WeatherCondition[];
  clouds: CloudsData;
  wind: WindData;
  visibility: number;
  pop: number;
  dt_txt: string;
}

export interface ForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

// Geocoding Types
export interface GeocodingResponse {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

// Transformed Types for our app
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
    sunrise: number;
    sunset: number;
  };
}

export interface DailyForecastData {
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
  forecast: DailyForecastData[];
}

export interface LocationSearchResult {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

// Utility function to build API URLs
const buildUrl = (endpoint: string, params: Record<string, any>): string => {
  // Debug log for the API key that's being loaded
  console.log('Weather API Configuration:', {
    apiKey: env.weather.apiKey,
    apiUrl: env.weather.apiUrl,
  });
  
  // Ensure endpoint starts with /
  if (!endpoint.startsWith('/')) {
    endpoint = `/${endpoint}`;
  }

  // Add debug log for the params
  console.log('Building URL with params:', {
    endpoint,
    params,
    allParams: { ...DEFAULT_PARAMS, ...params }
  });

  // Create URL with base and endpoint
  const url = new URL(endpoint, env.weather.apiUrl);

  // Add all parameters
  const allParams = { ...DEFAULT_PARAMS, ...params };
  Object.entries(allParams).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  return url.toString();
};

// Generic fetch function with timeout
const fetchWithTimeout = async <T>(url: string): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch data';

      if (response.status === 401) {
        errorMessage = 'Invalid API key';
      } else if (response.status === 404) {
        errorMessage = 'Resource not found';
      } else if (response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (response.status === 400) {
        errorMessage = 'Bad request. Check parameters.';
      }

      throw {
        message: errorMessage,
        status: response.status,
        code: response.status,
      };
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw {
        message: 'Request timed out',
        code: 408,
      };
    }
    throw error;
  }
};

// Transform response data to our app format
const transformWeatherData = (data: WeatherResponse): WeatherData => {
  return {
    location: {
      name: data.name,
      country: data.sys.country,
      lat: data.coord.lat,
      lon: data.coord.lon,
    },
    current: {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      condition: data.weather[0],
      timestamp: data.dt,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
    },
  };
};

// Group forecast items by day and get min/max temps
const transformForecastData = (data: ForecastResponse): ForecastData => {
  // Group forecast items by day
  const groupedByDay = data.list.reduce<Record<string, ForecastItem[]>>(
    (acc, item) => {
      // Get the date part of dt_txt (YYYY-MM-DD)
      const date = item.dt_txt.split(' ')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    },
    {},
  );

  // Transform each day's data
  const dailyForecast = Object.values(groupedByDay).map(items => {
    // Find min and max temperatures for the day
    const minTemp = Math.min(...items.map(item => item.main.temp_min));
    const maxTemp = Math.max(...items.map(item => item.main.temp_max));

    // Use the middle of the day (noon) forecast for conditions
    const middayForecast =
      items.find(item => item.dt_txt.includes('12:00:00')) || items[0];

    return {
      date: middayForecast.dt,
      minTemp,
      maxTemp,
      condition: middayForecast.weather[0],
      humidity: middayForecast.main.humidity,
      windSpeed: middayForecast.wind.speed,
    };
  });

  return {
    location: {
      name: data.city.name,
      country: data.city.country,
      lat: data.city.coord.lat,
      lon: data.city.coord.lon,
    },
    forecast: dailyForecast,
  };
};

// Transform geocoding response to location search results
const transformLocationResults = (
  data: GeocodingResponse[],
): LocationSearchResult[] => {
  if (!data || data.length === 0) {
    return [];
  }

  return data.map(item => {
    // Ensure we have all required properties
    if (!item.name || !item.country || typeof item.lat !== 'number' || typeof item.lon !== 'number') {
      console.warn('Geocoding result missing required properties:', item);
    }

    return {
      id: `${item.lat}_${item.lon}`,
      name: item.name,
      country: item.country,
      state: item.state,
      lat: item.lat,
      lon: item.lon,
    };
  });
};

// API function to get current weather
export const getCurrentWeather = async (
  lat: number,
  lon: number,
): Promise<WeatherData> => {
  try {
    // Build URL and fetch data
    const url = buildUrl(WEATHER_ENDPOINT, {lat, lon});
    const response = await fetchWithTimeout<WeatherResponse>(url);

    // Transform and return data
    return transformWeatherData(response);
  } catch (error) {
    // Error handled by caller
    throw {
      message:
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : 'Failed to fetch current weather',
      code:
        typeof error === 'object' && error !== null && 'code' in error
          ? (error as any).code
          : 500,
    };
  }
};

// API function to get forecast
export const getForecast = async (
  lat: number,
  lon: number,
): Promise<ForecastData> => {
  try {
    // Build URL and fetch data
    const url = buildUrl(FORECAST_ENDPOINT, {lat, lon});
    const response = await fetchWithTimeout<ForecastResponse>(url);

    // Transform and return data
    return transformForecastData(response);
  } catch (error) {
    // Error handled by caller
    throw {
      message:
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : 'Failed to fetch forecast',
      code:
        typeof error === 'object' && error !== null && 'code' in error
          ? (error as any).code
          : 500,
    };
  }
};

// Helper function specifically for Geocoding API
const fetchGeocodingData = async (query: string): Promise<GeocodingResponse[]> => {
  // Validate input query
  if (!query || typeof query !== 'string') {
    throw new Error('Search query is required and must be a non-empty string');
  }

  const cleanQuery = query.trim();

  if (cleanQuery.length < 2) {
    throw new Error('Search query must be at least 2 characters long');
  }

  try {
    const encodedQuery = encodeURIComponent(cleanQuery);
    const geocodingUrl = buildUrl(GEO_ENDPOINT, { q: encodedQuery, limit: 5 });

    const data = await fetchWithTimeout<GeocodingResponse[]>(geocodingUrl);

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from geocoding API');
    }

    return data;
  } catch (error) {
    // Error handled by caller
    throw {
      message: typeof error === 'object' && error !== null && 'message' in error
        ? (error as any).message
        : 'Failed to fetch geocoding data',
      code: typeof error === 'object' && error !== null && 'code' in error
        ? (error as any).code
        : 500,
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
    // Use the dedicated geocoding fetch function
    const data = await fetchGeocodingData(query);
    // Transform the data to our app format
    return transformLocationResults(data);
  } catch (error) {
    // Error handled by caller

    // Provide more detailed error messages based on the error type
    let errorMessage = 'Failed to search locations';
    let errorCode = 500;

    if (typeof error === 'object' && error !== null) {
      if ('message' in error) {
        errorMessage = (error as any).message;
      }
      if ('code' in error) {
        errorCode = (error as any).code;
      } else if ('status' in error) {
        errorCode = (error as any).status;
      }

      // Special case for common errors
      if (errorCode === 404) {
        errorMessage = 'Location search service not available (404). Please check API configuration.';
      } else if (errorCode === 401) {
        errorMessage = 'Invalid API key for location search.';
      }
    }

    throw {
      message: errorMessage,
      code: errorCode,
    };
  }
};
