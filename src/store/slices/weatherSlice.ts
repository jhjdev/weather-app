// Required imports for functionality
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
  apiService,
  WeatherSearchResult,
  WeatherHistoryItem,
  ApiError,
} from '../../services/apiService';

// Weather Condition Interface
export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

// Current Weather Interface
export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: WeatherCondition;
  timestamp: number;
  sunrise?: number;
  sunset?: number;
}

// Daily Forecast Interface
export interface DailyForecast {
  date: number;
  minTemp: number;
  maxTemp: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
}

// Location Interface
export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

// Weather State Interface
export interface WeatherState {
  currentLocation: Location | null;
  currentWeather: CurrentWeather | null;
  forecast: DailyForecast[];
  searchResults: WeatherSearchResult[];
  history: WeatherHistoryItem[];
  isLoading: {
    location: boolean;
    currentWeather: boolean;
    forecast: boolean;
    search: boolean;
    history: boolean;
  };
  error: {
    location: string | null;
    currentWeather: string | null;
    forecast: string | null;
    search: string | null;
    history: string | null;
  };
}

// Initial State
const initialState: WeatherState = {
  currentLocation: null,
  currentWeather: null,
  forecast: [],
  searchResults: [],
  history: [],
  isLoading: {
    location: false,
    currentWeather: false,
    forecast: false,
    search: false,
    history: false,
  },
  error: {
    location: null,
    currentWeather: null,
    forecast: null,
    search: null,
    history: null,
  },
};

// Async Thunks
interface LocationParams {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

// Set Current Location
export const setLocationAsync = createAsyncThunk<
  Location,
  LocationParams,
  {rejectValue: string}
>('weather/setLocation', async (locationData, {rejectWithValue}) => {
  try {
    const {latitude, longitude, city, country} = locationData;

    // To replace the simulator locations with a hard coded location:
    // 1. Command + / to uncomment/comment (Mac)
    // 2. Shift + Command + / to block comment/uncomment (Mac)
    // if (__DEV__ && Platform.OS === 'ios') {
    //   return {
    //     latitude,
    //     longitude,
    //     city: 'New York',
    //     country: 'US',
    //   };
    // }

    return {
      latitude,
      longitude,
      city: city || 'Current Location',
      country: country || '',
    };
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to set location');
  }
});

// Fetch Current Weather
export const fetchCurrentWeather = createAsyncThunk<
  CurrentWeather,
  void,
  {
    rejectValue: string;
    state: {weather: WeatherState};
  }
>('weather/fetchCurrentWeather', async (_, {getState, rejectWithValue}) => {
  try {
    const {currentLocation} = getState().weather;

    if (!currentLocation) {
      return rejectWithValue('Location not set');
    }

    const {city} = currentLocation;
    const weatherData = await apiService.getCurrentWeather(city);

    return {
      temperature: weatherData.temperature,
      feelsLike: weatherData.temperature, // API response doesn't have feelsLike, use temperature
      humidity: weatherData.humidity,
      windSpeed: weatherData.windSpeed,
      condition: {
        id: 1,
        main: weatherData.description,
        description: weatherData.description,
        icon: 'default',
      },
      timestamp: Date.now(),
    };
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(
      apiError.message || 'Failed to fetch current weather',
    );
  }
});

// Fetch Forecast
export const fetchForecast = createAsyncThunk<
  DailyForecast[],
  void,
  {
    rejectValue: string;
    state: {weather: WeatherState};
  }
>('weather/fetchForecast', async (_, {getState, rejectWithValue}) => {
  try {
    const {currentLocation} = getState().weather;

    if (!currentLocation) {
      return rejectWithValue('Location not set');
    }

    const {city} = currentLocation;
    const currentWeatherData = await apiService.getCurrentWeather(city);

    // Since the API doesn't have forecast endpoint, simulate 7-day forecast
    // based on current weather with some variation
    const forecast: DailyForecast[] = [];
    const baseTemp = currentWeatherData.temperature;

    for (let i = 0; i < 7; i++) {
      const tempVariation = (Math.random() - 0.5) * 10; // ±5 degrees variation
      const minTemp = baseTemp + tempVariation - 5;
      const maxTemp = baseTemp + tempVariation + 5;

      forecast.push({
        date: Date.now() + i * 24 * 60 * 60 * 1000, // Add i days
        minTemp: Math.round(minTemp),
        maxTemp: Math.round(maxTemp),
        condition: {
          id: 1,
          main: currentWeatherData.description,
          description: currentWeatherData.description,
          icon: 'default',
        },
        humidity: currentWeatherData.humidity,
        windSpeed: currentWeatherData.windSpeed,
      });
    }

    return forecast;
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to fetch forecast');
  }
});

// Search Weather by Location
export const searchWeatherByLocation = createAsyncThunk<
  WeatherSearchResult,
  string,
  {rejectValue: string}
>('weather/searchWeatherByLocation', async (location, {rejectWithValue}) => {
  try {
    const searchResult = await apiService.searchWeather(location);
    return searchResult;
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(
      apiError.message || 'Failed to search weather by location',
    );
  }
});

// Get Weather History
export const getWeatherHistory = createAsyncThunk<
  WeatherHistoryItem[],
  void,
  {rejectValue: string}
>('weather/getWeatherHistory', async (_, {rejectWithValue}) => {
  try {
    const history = await apiService.getWeatherHistory();
    return history;
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to get weather history');
  }
});

// Weather Slice
const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    // Reset all weather data
    resetWeatherData: state => {
      state.currentWeather = null;
      state.forecast = [];
      state.error.currentWeather = null;
      state.error.forecast = null;
    },
  },
  extraReducers: builder => {
    // Set Location
    builder
      .addCase(setLocationAsync.pending, state => {
        state.isLoading.location = true;
        state.error.location = null;
      })
      .addCase(setLocationAsync.fulfilled, (state, action) => {
        state.currentLocation = action.payload;
        state.isLoading.location = false;
        state.error.location = null;
      })
      .addCase(setLocationAsync.rejected, (state, action) => {
        state.isLoading.location = false;
        state.error.location = action.payload || 'Failed to set location';
      });

    // Fetch Current Weather
    builder
      .addCase(fetchCurrentWeather.pending, state => {
        state.isLoading.currentWeather = true;
        state.error.currentWeather = null;
      })
      .addCase(fetchCurrentWeather.fulfilled, (state, action) => {
        state.currentWeather = action.payload;
        state.isLoading.currentWeather = false;
        state.error.currentWeather = null;
      })
      .addCase(fetchCurrentWeather.rejected, (state, action) => {
        state.isLoading.currentWeather = false;
        state.error.currentWeather =
          action.payload || 'Failed to fetch current weather';
      });

    // Fetch Forecast
    builder
      .addCase(fetchForecast.pending, state => {
        state.isLoading.forecast = true;
        state.error.forecast = null;
      })
      .addCase(fetchForecast.fulfilled, (state, action) => {
        state.forecast = action.payload;
        state.isLoading.forecast = false;
        state.error.forecast = null;
      })
      .addCase(fetchForecast.rejected, (state, action) => {
        state.isLoading.forecast = false;
        state.error.forecast = action.payload || 'Failed to fetch forecast';
      });

    // Search Weather by Location
    builder
      .addCase(searchWeatherByLocation.pending, state => {
        state.isLoading.search = true;
        state.error.search = null;
      })
      .addCase(searchWeatherByLocation.fulfilled, (state, action) => {
        state.searchResults = [action.payload];
        state.isLoading.search = false;
        state.error.search = null;
      })
      .addCase(searchWeatherByLocation.rejected, (state, action) => {
        state.isLoading.search = false;
        state.error.search = action.payload || 'Failed to search weather';
      });

    // Get Weather History
    builder
      .addCase(getWeatherHistory.pending, state => {
        state.isLoading.history = true;
        state.error.history = null;
      })
      .addCase(getWeatherHistory.fulfilled, (state, action) => {
        state.history = action.payload;
        state.isLoading.history = false;
        state.error.history = null;
      })
      .addCase(getWeatherHistory.rejected, (state, action) => {
        state.isLoading.history = false;
        state.error.history = action.payload || 'Failed to get weather history';
      });
  },
});

export const {resetWeatherData} = weatherSlice.actions;

export default weatherSlice.reducer;
