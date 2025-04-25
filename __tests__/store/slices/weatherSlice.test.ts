// Declare global mockDelay to fix the implicit 'any' type
declare global {
  var mockDelay: number;
}

import { configureStore } from '@reduxjs/toolkit';
import weatherReducer, {
  WeatherState,
  resetWeatherData,
  setLocationAsync,
  fetchCurrentWeather,
  fetchForecast,
  Location,
  CurrentWeather,
  DailyForecast,
} from '../../../src/store/slices/weatherSlice';
import * as weatherApi from '../../../src/services/weatherApi';

// Extend the ApiError interface to include the 'name' property required by Error
type ExtendedApiError = weatherApi.ApiError & {
  name: string;
};

// Mock the weatherApi module
jest.mock('../../../src/services/weatherApi');

// Type the mocked module for better type safety
const mockedWeatherApi = weatherApi as jest.Mocked<typeof weatherApi>;

// Mock data for testing
const mockLocation: Location = {
  latitude: 40.7128,
  longitude: -74.006,
  city: 'New York',
  country: 'US',
};

const mockWeatherCondition = {
  id: 800,
  main: 'Clear',
  description: 'clear sky',
  icon: '01d',
};

const mockCurrentWeather: CurrentWeather = {
  temperature: 22.5,
  feelsLike: 23.2,
  humidity: 65,
  windSpeed: 3.5,
  condition: mockWeatherCondition,
  timestamp: 1622548800,
  sunrise: 1622527200,
  sunset: 1622581200,
};

const mockForecast: DailyForecast[] = [
  {
    date: 1622548800,
    minTemp: 18,
    maxTemp: 24,
    condition: mockWeatherCondition,
    humidity: 60,
    windSpeed: 2.5,
  },
  {
    date: 1622635200,
    minTemp: 19,
    maxTemp: 25,
    condition: mockWeatherCondition,
    humidity: 65,
    windSpeed: 3.0,
  },
];

// API response mocks
const mockApiWeatherResponse = {
  location: {
    name: 'New York',
    country: 'US',
    lat: 40.7128,
    lon: -74.006,
  },
  current: {
    temperature: 22.5,
    feelsLike: 23.2,
    humidity: 65,
    windSpeed: 3.5,
    condition: mockWeatherCondition,
    timestamp: 1622548800,
    sunrise: 1622527200,
    sunset: 1622581200,
  },
};

const mockApiForecastResponse = {
  location: {
    name: 'New York',
    country: 'US',
    lat: 40.7128,
    lon: -74.006,
  },
  forecast: mockForecast,
};

// Initial state definition for tests
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

// Create a test store with the weather reducer and proper state initialization
const createTestStore = (stateOverrides: Partial<WeatherState> = {}) => {
  return configureStore({
    reducer: {
      weather: weatherReducer,
    },
    preloadedState: {
      weather: {
        ...initialState,
        ...stateOverrides,
        // Ensure nested objects are properly merged
        isLoading: {
          ...initialState.isLoading,
          ...(stateOverrides.isLoading || {}),
        },
        error: {
          ...initialState.error,
          ...(stateOverrides.error || {}),
        },
      },
    },
  });
};

describe('weatherSlice', () => {
  // Add cleanup for this test suite
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('should return the initial state', () => {
      const store = createTestStore();
      const state = store.getState().weather;

      expect(state.currentLocation).toBeNull();
      expect(state.currentWeather).toBeNull();
      expect(state.forecast).toEqual([]);
      expect(state.isLoading.location).toBe(false);
      expect(state.isLoading.currentWeather).toBe(false);
      expect(state.isLoading.forecast).toBe(false);
      expect(state.error.location).toBeNull();
      expect(state.error.currentWeather).toBeNull();
      expect(state.error.forecast).toBeNull();
    });
  });

  describe('resetWeatherData reducer', () => {
    it('should reset weather data while keeping location', () => {
      // Create a store with some initial data
      const stateOverrides: Partial<WeatherState> = {
        currentLocation: mockLocation,
        currentWeather: mockCurrentWeather,
        forecast: mockForecast,
        error: {
          location: null,
          currentWeather: 'Some error',
          forecast: 'Some error',
        },
      };

      const store = createTestStore(stateOverrides);

      // Dispatch the resetWeatherData action
      store.dispatch(resetWeatherData());

      // Check the state after reset
      const state = store.getState().weather;

      // Location should be preserved
      expect(state.currentLocation).toEqual(mockLocation);

      // These should be reset
      expect(state.currentWeather).toBeNull();
      expect(state.forecast).toEqual([]);
      expect(state.error.currentWeather).toBeNull();
      expect(state.error.forecast).toBeNull();
    });
  });

  describe('setLocationAsync thunk', () => {
    it('should set location successfully', async () => {
      const store = createTestStore();

      const locationParams = {
        latitude: 40.7128,
        longitude: -74.006,
        city: 'New York',
        country: 'US',
      };

      // Dispatch the action
      await store.dispatch(setLocationAsync(locationParams));

      // Check the state after action
      const state = store.getState().weather;

      expect(state.currentLocation).toEqual({
        latitude: 40.7128,
        longitude: -74.006,
        city: 'New York',
        country: 'US',
      });
      expect(state.isLoading.location).toBe(false);
      expect(state.error.location).toBeNull();
    });

    it('should set loading state while pending', () => {
      const store = createTestStore();

      // Simulate a pending state
      store.dispatch(setLocationAsync({
        latitude: 40.7128,
        longitude: -74.006,
      }));

      // Check the loading state
      const state = store.getState().weather;
      expect(state.isLoading.location).toBe(true);
      expect(state.error.location).toBeNull();
    });

    it('should handle errors', async () => {
      const store = createTestStore();

      // Create a mock error that matches the API error type
      const errorMessage = 'Failed to set location';
      const error = new Error(errorMessage) as ExtendedApiError;
      error.message = errorMessage;
      error.name = 'ApiError';

      const locationParams = {
        latitude: 40.7128,
        longitude: -74.006,
      };

      // Create a rejected action to simulate the error
      const action = setLocationAsync.rejected(
        error as Error,   // error payload with correct type
        'requestId',      // requestId (required by redux toolkit)
        locationParams,   // original arguments
        errorMessage      // serialized error message
      );

      // Dispatch the rejected action
      await store.dispatch(action);

      // Check the error state
      const state = store.getState().weather;
      expect(state.isLoading.location).toBe(false);
      expect(state.error.location).toBe(errorMessage);
      expect(state.currentLocation).toBeNull();
    });
  });

  describe('fetchCurrentWeather thunk', () => {
    it('should fetch current weather successfully', async () => {
      // Setup the initial state with a location
      const store = createTestStore({
        currentLocation: mockLocation,
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
      });

      // Mock the API to return weather data
      mockedWeatherApi.getCurrentWeather.mockResolvedValueOnce(mockApiWeatherResponse);

      // Dispatch the action
      await store.dispatch(fetchCurrentWeather());

      // Check if API was called with correct parameters
      expect(mockedWeatherApi.getCurrentWeather).toHaveBeenCalledWith(
        mockLocation.latitude,
        mockLocation.longitude
      );

      // Check the state after action
      const state = store.getState().weather;

      expect(state.currentWeather).toEqual(mockCurrentWeather);
      expect(state.isLoading.currentWeather).toBe(false);
      expect(state.error.currentWeather).toBeNull();
    });

    it('should set loading state while pending', () => {
      // Setup the initial state with a location
      const store = createTestStore({
        currentLocation: mockLocation,
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
      });

      // Mock the API to not resolve immediately
      mockedWeatherApi.getCurrentWeather.mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(() => resolve(mockApiWeatherResponse), global.mockDelay))
      );

      // Dispatch the action
      store.dispatch(fetchCurrentWeather());

      // Check the loading state
      const state = store.getState().weather;
      expect(state.isLoading.currentWeather).toBe(true);
      expect(state.error.currentWeather).toBeNull();
    });

    it('should handle errors when location not set', async () => {
      // Create a store without location
      const store = createTestStore();

      // Dispatch the action
      await store.dispatch(fetchCurrentWeather());

      // Check the error state
      const state = store.getState().weather;
      expect(state.isLoading.currentWeather).toBe(false);
      expect(state.error.currentWeather).toBe('Location not set');
    });

    it('should handle API errors', async () => {
      // Setup the initial state with a location
      const store = createTestStore({
        currentLocation: mockLocation,
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
      });

      // Mock the API to throw an error
      const errorMessage = 'API error';
      const error = new Error(errorMessage) as ExtendedApiError;
      error.message = errorMessage;
      error.name = 'ApiError';

      mockedWeatherApi.getCurrentWeather.mockRejectedValueOnce(error);

      // Dispatch the action
      await store.dispatch(fetchCurrentWeather());

      // Check the error state
      const state = store.getState().weather;
      expect(state.isLoading.currentWeather).toBe(false);
      expect(state.error.currentWeather).toBe(errorMessage);
    });
  });

  describe('fetchForecast thunk', () => {
    it('should fetch forecast successfully', async () => {
      // Setup the initial state with a location
      const store = createTestStore({
        currentLocation: mockLocation,
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
      });

      // Mock the API to return forecast data
      mockedWeatherApi.getForecast.mockResolvedValueOnce(mockApiForecastResponse);

      // Dispatch the action
      await store.dispatch(fetchForecast());

      // Check if API was called with correct parameters
      expect(mockedWeatherApi.getForecast).toHaveBeenCalledWith(
        mockLocation.latitude,
        mockLocation.longitude
      );

      // Check the state after action
      const state = store.getState().weather;

      expect(state.forecast).toEqual(mockForecast);
      expect(state.isLoading.forecast).toBe(false);
      expect(state.error.forecast).toBeNull();
    });

    it('should set loading state while pending', () => {
      // Setup the initial state with a location
      const store = createTestStore({
        currentLocation: mockLocation,
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
      });

      // Mock the API to not resolve immediately
      mockedWeatherApi.getForecast.mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(() => resolve(mockApiForecastResponse), global.mockDelay))
      );

      // Dispatch the action
      store.dispatch(fetchForecast());

      // Check the loading state
      const state = store.getState().weather;
      expect(state.isLoading.forecast).toBe(true);
      expect(state.error.forecast).toBeNull();
    });

    it('should handle errors when location not set', async () => {
      // Create a store without location
      const store = createTestStore();

      // Dispatch the action
      await store.dispatch(fetchForecast());

      // Check the error state
      const state = store.getState().weather;
      expect(state.isLoading.forecast).toBe(false);
      expect(state.error.forecast).toBe('Location not set');
    });

    it('should handle API errors', async () => {
      // Setup the initial state with a location
      const store = createTestStore({
        currentLocation: mockLocation,
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
      });

      // Mock the API to throw an error
      const errorMessage = 'Failed to fetch forecast';
      const error = new Error(errorMessage) as ExtendedApiError;
      error.message = errorMessage;
      error.name = 'ApiError';

      mockedWeatherApi.getForecast.mockRejectedValueOnce(error);

      // Dispatch the action
      await store.dispatch(fetchForecast());

      // Check the error state
      const state = store.getState().weather;
      expect(state.isLoading.forecast).toBe(false);
      expect(state.error.forecast).toBe(errorMessage);
    });
  });
});

