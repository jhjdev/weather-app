import {useEffect, useState, useCallback, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../store';
import {
  setLocationAsync,
  fetchCurrentWeather,
  fetchForecast,
} from '../store/slices/weatherSlice';
import { getCurrentWeather } from '../services/weatherApi';
import {
  getCurrentLocation,
  LocationCoordinates,
  LocationError,
} from '../services/locationService';

interface UseWeatherReturn {
  loading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
}

/**
 * Hook for managing weather data
 */
export const useWeather = (): UseWeatherReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const {isLoading, error, currentLocation} = useSelector(
    (state: RootState) => state.weather,
  );

  // Local loading state for location fetching
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Use a ref to track if initial fetch has been triggered
  const initialFetchDone = useRef<boolean>(false);

  /**
   * Fetch location and weather data in one go
   */
  const fetchWeatherData = useCallback(async (): Promise<void> => {
    // Skip if already loading
    if (
      locationLoading ||
      isLoading.location ||
      isLoading.currentWeather ||
      isLoading.forecast
    ) {
      return;
    }

    // Fetch location if not available
    if (!currentLocation) {
      setLocationLoading(true);

      try {
        // Get user location
        const coords: LocationCoordinates = await getCurrentLocation();

        // Initially update location in Redux with coordinates only
        await dispatch(
          setLocationAsync({
            latitude: coords.latitude,
            longitude: coords.longitude,
          }),
        );

        try {
          // Get city and country directly from the API before any transformation
          console.log('Fetching weather data for coordinates:', coords);
          const weatherData = await getCurrentWeather(coords.latitude, coords.longitude);

          // Log the weather data response for debugging
          console.log('Weather API response:', JSON.stringify(weatherData, null, 2));

          if (weatherData && weatherData.location) {
            // Update Redux store with the actual city name and country from the weather API
            console.log('Updating location with city:', weatherData.location.name);
            await dispatch(
              setLocationAsync({
                latitude: coords.latitude,
                longitude: coords.longitude,
                city: weatherData.location.name || 'Current Location',
                country: weatherData.location.country || '',
              }),
            );
          } else {
            console.warn('Weather API response missing location data');
          }
        } catch (error) {
          console.error('Error fetching city data from weather API:', error);
          // If there's an error getting the city name, continue with the current location placeholder
        }

        // Now fetch and store the weather data in Redux
        await Promise.all([
          dispatch(fetchCurrentWeather()),
          dispatch(fetchForecast()),
        ]);
      } catch (error) {
        const locationError = error as LocationError;
        setLocationError(locationError.message);
        console.error('Location error:', locationError.message);
      } finally {
        setLocationLoading(false);
      }
    } else {
      // If location is available, just update weather data
      try {
        await Promise.all([
          dispatch(fetchCurrentWeather()),
          dispatch(fetchForecast()),
        ]);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    }
  }, [
    dispatch,
    currentLocation,
    locationLoading,
    isLoading.location,
    isLoading.currentWeather,
    isLoading.forecast,
  ]);

  // Refresh weather data (for manual refresh)
  const refreshWeather = useCallback(async (): Promise<void> => {
    await fetchWeatherData();
  }, [fetchWeatherData]);

  // Initialize weather data on mount
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchWeatherData();
    }
  }, [fetchWeatherData]);

  // Combine loading states
  const loading =
    isLoading.location ||
    isLoading.currentWeather ||
    isLoading.forecast ||
    locationLoading;

  // Combine error states
  const combinedError =
    locationError || error.location || error.currentWeather || error.forecast;

  return {
    loading,
    error: combinedError,
    refreshWeather,
  };
};

export default useWeather;
