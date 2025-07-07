import AsyncStorage from '@react-native-async-storage/async-storage';
import {env} from '../config/env';

// Storage keys
const AUTH_TOKEN_KEY = 'hostaway_auth_token';
const REFRESH_TOKEN_KEY = 'hostaway_refresh_token';
const USER_DATA_KEY = 'hostaway_user_data';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferences: {
    temperatureUnit: 'celsius' | 'fahrenheit';
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

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

class ApiAuthService {
  private baseUrl = env.api.baseUrl;
  private authToken: string | null = null;

  constructor() {
    this.loadTokenFromStorage();
  }

  private async loadTokenFromStorage(): Promise<void> {
    try {
      this.authToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error loading auth token:', error);
    }
  }

  private async saveTokenToStorage(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      this.authToken = token;
    } catch (error) {
      console.error('Error saving auth token:', error);
    }
  }

  private async saveUserData(user: AuthUser): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  private async removeAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        AUTH_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_DATA_KEY,
      ]);
      this.authToken = null;
    } catch (error) {
      console.error('Error removing auth data:', error);
    }
  }

  public async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  public getAuthToken(): string | null {
    return this.authToken;
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();

    // Save auth data
    await this.saveTokenToStorage(data.token);
    await this.saveUserData(data.user);

    return data;
  }

  public async register(registerData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const data: AuthResponse = await response.json();

    // Save auth data
    await this.saveTokenToStorage(data.token);
    await this.saveUserData(data.user);

    return data;
  }

  public async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      if (this.authToken) {
        await fetch(`${this.baseUrl}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Error calling logout endpoint:', error);
    } finally {
      await this.removeAuthData();
    }
  }

  public async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({refreshToken}),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      await this.saveTokenToStorage(data.token);
      return data.token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  public async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = this.getAuthToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && {Authorization: `Bearer ${token}`}),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Try to refresh token
      const newToken = await this.refreshToken();
      if (newToken) {
        // Retry the request with new token
        return this.makeAuthenticatedRequest(endpoint, options);
      } else {
        // Token refresh failed, logout user
        await this.logout();
        throw new Error('Authentication expired. Please log in again.');
      }
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }

    return response.json();
  }

  public isAuthenticated(): boolean {
    return !!this.authToken;
  }
}

export const apiAuthService = new ApiAuthService();
