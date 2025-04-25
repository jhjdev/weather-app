// Required imports for functionality
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {Platform} from 'react-native';
import {
  getCurrentWeather,
  getForecast,
  ApiError,
} from '../../services/weatherApi';

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
  isLoading: {
    location: boolean;
    currentWeather: boolean;
    forecast: boolean;
  };
  error: {
    location: string | null;
    currentWeather: string | null;
    forecast: string | null;
  };
}

// Initial State
const initialState: WeatherState = {
  currentLocation: null,
  currentWeather: null,
  forecast: [],
  isLoading: {
    location: false,
    currentWeather: false,
    forecast: false,
  },
  error: {
    location: null,
    currentWeather: null,
    forecast: null,
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

    // To toggle simulator location:
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

    const {latitude, longitude} = currentLocation;
    const weatherData = await getCurrentWeather(latitude, longitude);

    return {
      temperature: weatherData.current.temperature,
      feelsLike: weatherData.current.feelsLike,
      humidity: weatherData.current.humidity,
      windSpeed: weatherData.current.windSpeed,
      condition: weatherData.current.condition,
      timestamp: weatherData.current.timestamp,
      sunrise: weatherData.current.sunrise,
      sunset: weatherData.current.sunset,
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

    const {latitude, longitude} = currentLocation;
    const forecastData = await getForecast(latitude, longitude);

    return forecastData.forecast;
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to fetch forecast');
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
  },
});

export const {resetWeatherData} = weatherSlice.actions;

export default weatherSlice.reducer;
