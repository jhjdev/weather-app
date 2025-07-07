import {useEffect, useState, useCallback, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../store';
import {
  setLocationAsync,
  fetchCurrentWeather,
  fetchForecast,
} from '../store/slices/weatherSlice';
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

        // Update location in Redux with coordinates
        await dispatch(
          setLocationAsync({
            latitude: coords.latitude,
            longitude: coords.longitude,
            city: 'Current Location',
            country: '',
          }),
        );

        // Fetch weather data using Redux actions
        await Promise.all([
          dispatch(fetchCurrentWeather()),
          dispatch(fetchForecast()),
        ]);
      } catch (locationFetchError) {
        const locationErr = locationFetchError as LocationError;
        setLocationError(locationErr.message);
        console.error('Location error:', locationErr.message);
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
      } catch (weatherFetchError) {
        console.error('Error fetching weather data:', weatherFetchError);
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
