/**
 * API Service for Hostaway Assessment API
 *
 * This service handles authentication and weather data fetching
 * from the Hostaway Assessment API backend.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {env} from '../config/env';

// Storage keys for JWT tokens
const AUTH_TOKEN_KEY = 'hostaway_auth_token';
const REFRESH_TOKEN_KEY = 'hostaway_refresh_token';
const USER_DATA_KEY = 'hostaway_user_data';

// API endpoints
const API_ENDPOINTS = {
  AUTH: '/api/v1/auth',
  WEATHER: '/api/v1/weather',
  PROFILE: '/api/v1/profile',
  HEALTH: '/api/health',
};

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    preferences?: {
      temperatureUnit: 'celsius' | 'fahrenheit';
      theme: 'light' | 'dark' | 'system';
      notifications: boolean;
    };
  };
  token: string;
  refreshToken?: string;
}

// Weather types (matching API response)
export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  timestamp: string;
}

export interface WeatherSearchResult {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  weatherData: {
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  createdAt: string;
}

// Error types
export interface ApiError {
  error: string;
  message: string;
  statusCode?: number;
}

class HostawayApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = env.api.baseUrl;
  }

  // Initialize service by loading stored token
  async initialize(): Promise<void> {
    this.token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  }

  // Build request headers
  private getHeaders(includeAuth: boolean = true): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (includeAuth && this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      includeAuth?: boolean;
    } = {},
  ): Promise<T> {
    const {method = 'GET', body, includeAuth = true} = options;

    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(includeAuth);

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    console.log(`Making ${method} request to: ${url}`);

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          error: data.error || 'Request failed',
          message: data.message || `HTTP ${response.status}`,
          statusCode: response.status,
        };
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      `${API_ENDPOINTS.AUTH}/login`,
      {
        method: 'POST',
        body: credentials,
        includeAuth: false,
      },
    );

    // Store tokens
    if (response.token) {
      this.token = response.token;
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);

      if (response.refreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      }

      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
    }

    return response;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      `${API_ENDPOINTS.AUTH}/register`,
      {
        method: 'POST',
        body: userData,
        includeAuth: false,
      },
    );

    // Store tokens
    if (response.token) {
      this.token = response.token;
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);

      if (response.refreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      }

      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await this.request(`${API_ENDPOINTS.AUTH}/logout`, {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Logout endpoint failed:', error);
    }

    // Clear stored tokens
    this.token = null;
    await AsyncStorage.multiRemove([
      AUTH_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      USER_DATA_KEY,
    ]);
  }

  // Weather methods
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    return this.request<WeatherData>(
      `${API_ENDPOINTS.WEATHER}/current?lat=${lat}&lon=${lon}`,
    );
  }

  async searchWeather(location: string): Promise<WeatherSearchResult> {
    return this.request<WeatherSearchResult>(
      `${API_ENDPOINTS.WEATHER}/search`,
      {
        method: 'POST',
        body: {location},
      },
    );
  }

  async getWeatherHistory(): Promise<WeatherSearchResult[]> {
    return this.request<WeatherSearchResult[]>(
      `${API_ENDPOINTS.WEATHER}/history`,
    );
  }

  // Profile methods
  async getUserProfile(): Promise<AuthResponse['user']> {
    return this.request<AuthResponse['user']>(`${API_ENDPOINTS.PROFILE}`);
  }

  async updateUserProfile(
    updates: Partial<AuthResponse['user']>,
  ): Promise<AuthResponse['user']> {
    return this.request<AuthResponse['user']>(`${API_ENDPOINTS.PROFILE}`, {
      method: 'PUT',
      body: updates,
    });
  }

  // Health check
  async healthCheck(): Promise<{status: string; timestamp: string}> {
    return this.request<{status: string; timestamp: string}>(
      API_ENDPOINTS.HEALTH,
      {includeAuth: false},
    );
  }

  // Token management
  async isAuthenticated(): Promise<boolean> {
    if (!this.token) {
      await this.initialize();
    }
    return this.token !== null;
  }

  async getStoredUser(): Promise<AuthResponse['user'] | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error loading stored user:', error);
      return null;
    }
  }
}

// Export singleton instance
export const hostawayApi = new HostawayApiService();
