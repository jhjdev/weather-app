/**
 * Shared types for all test scripts
 */

export interface ApiResponse {
  message: string;
  uptime: number;
  version: string;
  timestamp: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface AuthenticatedApiResponse extends ApiResponse {
  token?: string;
}

export interface WeatherHistoryResponse {
  success: boolean;
  data: {
    location: string;
    records: Array<{
      date: string;
      temperature: number;
      humidity: number;
      conditions: string;
    }>;
  };
}

export interface ErrorResponse {
  error: string;
  message?: string;
  details?: string;
}

// Common configuration
export const API_URL = 'https://hostaway-assessment-api.onrender.com';
export const API_SECRET =
  '089103b8338f761b820ed1cc2622535dc0daf41d6e2922c74b7395f805030f08';
