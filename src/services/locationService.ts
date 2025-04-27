import {Platform, PermissionsAndroid, Alert} from 'react-native';
import Geolocation, {
  GeoPosition,
  GeoError,
  GeoOptions,
} from 'react-native-geolocation-service';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationError {
  code: number;
  message: string;
}

// Default location for simulator (New York City)
/* eslint-disable @typescript-eslint/no-unused-vars */
const DEFAULT_LOCATION: LocationCoordinates = {
  latitude: 40.7128,
  longitude: -74.006,
};

// Location options
const locationOptions: GeoOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
};

/**
 * Request location permissions on Android
 */
const requestAndroidLocationPermission = async (): Promise<boolean> => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message:
          'HostAway needs access to your location to show weather information.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('Error requesting location permission:', err);
    return false;
  }
};

/**
 * Request location permissions based on platform
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    try {
      const status = await Geolocation.requestAuthorization('whenInUse');
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting iOS location permission:', error);
      return false;
    }
  } else {
    return requestAndroidLocationPermission();
  }
};

/**
 * Get current location
 */
export const getCurrentLocation = async (): Promise<LocationCoordinates> => {
  // To replace the simulator locations with a hard coded location:
  // Use Command + / to uncomment/comment a single line (Mac)
  // Use Shift + Command + / to comment/uncomment a block (Mac)
  // if (__DEV__ && Platform.OS === 'ios') {
  //   console.log('Using default location for simulator');
  //   return Promise.resolve(DEFAULT_LOCATION);
  // }

  const hasPermission = await requestLocationPermission();

  if (!hasPermission) {
    throw {
      code: 1,
      message: 'Location permission denied',
    };
  }

  return new Promise<LocationCoordinates>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position: GeoPosition) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error: GeoError) => {
        let errorMessage = 'Failed to get location';

        switch (error.code) {
          case 1:
            errorMessage = 'Location permission denied';
            break;
          case 2:
            errorMessage = 'Location unavailable';
            break;
          case 3:
            errorMessage = 'Getting location timed out';
            break;
        }

        reject({
          code: error.code,
          message: errorMessage,
        });
      },
      locationOptions,
    );
  });
};

/**
 * Check if location services are enabled
 */
export const checkLocationServices = async (): Promise<boolean> => {
  return new Promise(resolve => {
    Geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false),
      {timeout: 5000},
    );
  });
};

/**
 * Handle location errors with appropriate UI feedback
 */
export const handleLocationError = (error: LocationError): void => {
  let message = 'Unable to get your location. Please check your settings.';

  if (error.code === 1) {
    message =
      'Location access denied. Please enable location permissions in settings.';
  } else if (error.code === 2) {
    message = 'Location unavailable. Please check your device settings.';
  } else if (error.code === 3) {
    message = 'Getting location timed out. Please try again.';
  }

  Alert.alert('Location Error', message);
};
