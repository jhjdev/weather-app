/**
 * Environment Configuration
 *
 * This file centralizes all environment variables used in the application
 * and provides runtime validation to catch missing configuration early.
 */

// Direct import from @env for React Native
import {
  HOSTAWAY_API_URL,
  API_SECRET_KEY,
  JWT_SECRET,
} from '@env';

// Define the shape of our environment configuration
interface EnvironmentConfig {
  api: {
    baseUrl: string;
    secretKey?: string;
    jwtSecret?: string;
  };
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

// Runtime validation: throw error immediately if required variables are missing
const validateEnv = (): EnvironmentConfig => {
  // Validate API configuration
  if (!HOSTAWAY_API_URL) {
    throw new Error(
      'Missing HOSTAWAY_API_URL in environment variables.\n' +
        'Please check your .env file and make sure this variable is set correctly.',
    );
  }

  // Log environment info in development only
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Environment Variables Loaded:', {
      HOSTAWAY_API_URL,
      API_SECRET_KEY: API_SECRET_KEY
        ? `${API_SECRET_KEY.substring(0, 8)}...`
        : 'undefined',
      JWT_SECRET: JWT_SECRET ? `${JWT_SECRET.substring(0, 8)}...` : 'undefined',
    });
  }

  return {
    api: {
      baseUrl: HOSTAWAY_API_URL,
      secretKey: API_SECRET_KEY,
      jwtSecret: JWT_SECRET,
    },
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  };
};

// Export the validated configuration
export const env = validateEnv();

// Export a helper to use in tests or mock environments
export const createMockEnv = (
  overrides?: Partial<EnvironmentConfig>,
): EnvironmentConfig => ({
  api: {
    baseUrl: 'https://api.example.com',
    secretKey: 'mock-secret-key',
    jwtSecret: 'mock-jwt-secret',
  },
  isDevelopment: false,
  isProduction: false,
  isTest: true,
  ...overrides,
});
