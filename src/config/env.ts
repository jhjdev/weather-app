/**
 * Environment Configuration
 * 
 * This file centralizes all environment variables used in the application
 * and provides runtime validation to catch missing configuration early.
 */
import { OPENWEATHER_API_KEY, OPENWEATHER_API_URL } from '@env';

// Add immediate console logging
console.log('Environment Variables Loaded:', {
  OPENWEATHER_API_KEY: OPENWEATHER_API_KEY ? 'First 8 chars: ' + OPENWEATHER_API_KEY.substring(0, 8) + '...' : 'undefined',
  OPENWEATHER_API_URL,
});

// Define the shape of our environment configuration
interface EnvironmentConfig {
  weather: {
    apiKey: string;
    apiUrl: string;
  };
}

// Runtime validation: throw error immediately if required variables are missing
const validateEnv = (): EnvironmentConfig => {
  // Validate weather API configuration
  if (!OPENWEATHER_API_KEY) {
    throw new Error(
      'Missing OPENWEATHER_API_KEY in environment variables.\n' +
      'Please check your .env file and make sure this variable is set correctly.'
    );
  }

  if (!OPENWEATHER_API_URL) {
    throw new Error(
      'Missing OPENWEATHER_API_URL in environment variables.\n' +
      'Please check your .env file and make sure this variable is set correctly.'
    );
  }

  // Debug log to see what values are being loaded
  console.log('Loaded Weather API Key:', OPENWEATHER_API_KEY ? 'First 8 chars: ' + OPENWEATHER_API_KEY.substring(0, 8) + '...' : 'undefined');
  console.log('Loaded Weather API URL:', OPENWEATHER_API_URL);

  return {
    weather: {
      apiKey: OPENWEATHER_API_KEY,
      apiUrl: OPENWEATHER_API_URL,
    },
  };
};

// Export the validated configuration
export const env = validateEnv();

// Export a helper to use in tests or mock environments
export const createMockEnv = (overrides?: Partial<EnvironmentConfig>): EnvironmentConfig => ({
  weather: {
    apiKey: 'mock-api-key',
    apiUrl: 'https://api.example.com',
  },
  ...overrides,
});

