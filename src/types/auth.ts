export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  createdAt: string; // Use ISO string instead of Date object for Redux compatibility
  updatedAt: string; // Use ISO string instead of Date object for Redux compatibility
  preferences?: UserPreferences;
}

export interface UserPreferences {
  temperatureUnit: 'celsius' | 'fahrenheit';
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    weatherAlerts: boolean;
    dailyForecast: boolean;
  };
  locations: SavedLocation[];
}

export interface SavedLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  user: User;
  token: string;
  refreshToken?: string;
}

export interface VerificationRequest {
  email: string;
  code: string;
}

export interface AuthError {
  message: string;
  code: string;
  field?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  pendingVerification: string | null; // email awaiting verification
  pendingPasswordReset: string | null; // email awaiting password reset
}
