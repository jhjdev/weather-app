/**
 * TypeScript declarations for environment variables
 * This ensures that environment variables imported from '@env'
 * are properly typed throughout the application.
 */

declare module '@env' {
  /**
   * OpenWeather API Key
   * Used for all weather data API calls including current weather,
   * forecasts, and location search (geocoding)
   *
   * Format: 32-character hexadecimal string
   * Obtain from: https://openweathermap.org/api
   */
  export const OPENWEATHER_API_KEY: string;

  /**
   * OpenWeather API Base URL
   * The base URL for all OpenWeather API requests
   *
   * Format: URL string (e.g., 'https://api.openweathermap.org')
   */
  export const OPENWEATHER_API_URL: string;
}
