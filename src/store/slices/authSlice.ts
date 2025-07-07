import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {
  AuthState,
  AuthCredentials,
  RegisterData,
  VerificationRequest,
  AuthResponse,
  AuthError,
  User,
} from '../../types/auth';
import {apiService} from '../../services/apiService';

// Transform API user to app user format
const transformApiUserToAppUser = (apiUser: any): User => ({
  id: apiUser.id,
  name: `${apiUser.firstName} ${apiUser.lastName}`,
  email: apiUser.email,
  isVerified: true, // API users are considered verified
  isAdmin: false, // Default to false unless specified
  createdAt: new Date(),
  updatedAt: new Date(),
  preferences: apiUser.preferences
    ? {
        temperatureUnit: apiUser.preferences.temperatureUnit,
        theme:
          apiUser.preferences.theme === 'system'
            ? 'auto'
            : apiUser.preferences.theme,
        notifications: {
          weatherAlerts: apiUser.preferences.notifications,
          dailyForecast: apiUser.preferences.notifications,
        },
        locations: [],
      }
    : undefined,
});

// Transform app register data to API format
const transformRegisterDataToApi = (data: RegisterData) => ({
  firstName: data.name.split(' ')[0] || data.name,
  lastName: data.name.split(' ').slice(1).join(' ') || '',
  email: data.email,
  password: data.password,
});

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  pendingVerification: null,
  pendingPasswordReset: null,
};

// Async thunks
export const registerUser = createAsyncThunk<
  {success: boolean; message: string; email: string},
  RegisterData,
  {rejectValue: AuthError}
>('auth/register', async (data, {rejectWithValue}) => {
  try {
    await apiService.initialize();
    const apiData = transformRegisterDataToApi(data);
    await apiService.register(apiData);
    return {
      success: true,
      message: 'Registration successful',
      email: data.email,
    };
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'Registration failed',
      code: error.statusCode || 'REGISTRATION_ERROR',
    });
  }
});

export const verifyEmail = createAsyncThunk<
  AuthResponse,
  VerificationRequest,
  {rejectValue: AuthError}
>('auth/verifyEmail', async (request, {rejectWithValue}) => {
  try {
    // For the Hostaway API, email verification is not required
    // Return a mock success response
    return {
      user: {
        id: 'temp-id',
        name: 'User',
        email: request.email,
        isVerified: true,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      token: 'temp-token',
      refreshToken: 'temp-refresh-token',
    };
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'Email verification failed',
      code: error.statusCode || 'VERIFICATION_ERROR',
    });
  }
});

export const loginUser = createAsyncThunk<
  AuthResponse,
  AuthCredentials,
  {rejectValue: AuthError}
>('auth/login', async (credentials, {rejectWithValue}) => {
  try {
    await apiService.initialize();
    const response = await apiService.login(credentials);

    const authResponse: AuthResponse = {
      user: transformApiUserToAppUser(response.user),
      token: response.token,
      refreshToken: response.refreshToken || '',
    };

    return authResponse;
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'Login failed',
      code: error.statusCode || 'LOGIN_ERROR',
    });
  }
});

export const loadCurrentUser = createAsyncThunk<
  User,
  void,
  {rejectValue: AuthError}
>('auth/loadCurrentUser', async (_, {rejectWithValue}) => {
  try {
    await apiService.initialize();
    const isAuth = await apiService.isAuthenticated();

    if (!isAuth) {
      throw new Error('Not authenticated');
    }

    const storedUser = await apiService.getStoredUser();
    if (storedUser) {
      return transformApiUserToAppUser(storedUser);
    }

    // If no stored user, try to fetch from API
    const apiUser = await apiService.getUserProfile();
    return transformApiUserToAppUser(apiUser);
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'Failed to load user',
      code: error.statusCode || 'LOAD_USER_ERROR',
    });
  }
});

export const logoutUser = createAsyncThunk<
  void,
  void,
  {rejectValue: AuthError}
>('auth/logout', async (_, {rejectWithValue}) => {
  try {
    await apiService.logout();
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'Logout failed',
      code: error.statusCode || 'LOGOUT_ERROR',
    });
  }
});

export const resendVerification = createAsyncThunk<
  {success: boolean; message: string},
  string,
  {rejectValue: AuthError}
>(
  'auth/resendVerification',
  async (_email, {rejectWithValue: _rejectWithValue}) => {
    // For Hostaway API, verification is not needed
    return {
      success: true,
      message: 'Email verification not required.',
    };
  },
);

export const updateUserProfile = createAsyncThunk<
  User,
  Partial<User>,
  {rejectValue: AuthError}
>('auth/updateProfile', async (updates, {rejectWithValue}) => {
  try {
    await apiService.initialize();

    // Transform app user updates to API format
    const apiUpdates: any = {};

    if (updates.name) {
      const nameParts = updates.name.split(' ');
      apiUpdates.firstName = nameParts[0] || '';
      apiUpdates.lastName = nameParts.slice(1).join(' ') || '';
    }

    if (updates.email) {
      apiUpdates.email = updates.email;
    }

    if (updates.preferences) {
      apiUpdates.preferences = {
        temperatureUnit: updates.preferences.temperatureUnit,
        theme:
          updates.preferences.theme === 'auto'
            ? 'system'
            : updates.preferences.theme,
        notifications: updates.preferences.notifications.weatherAlerts,
      };
    }

    const updatedUser = await apiService.updateUserProfile(apiUpdates);
    await apiService.storeUser(updatedUser);

    return transformApiUserToAppUser(updatedUser);
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'Profile update failed',
      code: error.statusCode || 'PROFILE_UPDATE_ERROR',
    });
  }
});

// Create the slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearPendingVerification: state => {
      state.pendingVerification = null;
    },
    clearPendingPasswordReset: state => {
      state.pendingPasswordReset = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      apiService.setToken(action.payload);
    },
    clearAuth: state => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      apiService.clearToken();
    },
  },
  extraReducers: builder => {
    // Register user
    builder
      .addCase(registerUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingVerification = action.payload.email;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = {
          message: action.payload?.message || 'Registration failed',
          code: action.payload?.code || 'REGISTRATION_ERROR',
        };
      });

    // Verify email
    builder
      .addCase(verifyEmail.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.pendingVerification = null;
        state.error = null;
        apiService.setToken(action.payload.token);
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = {
          message: action.payload?.message || 'Email verification failed',
          code: action.payload?.code || 'VERIFICATION_ERROR',
        };
      });

    // Login user
    builder
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
        apiService.setToken(action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = {
          message: action.payload?.message || 'Login failed',
          code: action.payload?.code || 'LOGIN_ERROR',
        };
      });

    // Load current user
    builder
      .addCase(loadCurrentUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loadCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = {
          message: action.payload?.message || 'Failed to load user',
          code: action.payload?.code || 'LOAD_USER_ERROR',
        };
        apiService.clearToken();
      });

    // Logout user
    builder
      .addCase(logoutUser.pending, state => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        apiService.clearToken();
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        // Still clear auth state even if logout failed
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = {
          message: action.payload?.message || 'Logout failed',
          code: action.payload?.code || 'LOGOUT_ERROR',
        };
        apiService.clearToken();
      });

    // Update profile
    builder
      .addCase(updateUserProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = {
          message: action.payload?.message || 'Profile update failed',
          code: action.payload?.code || 'UPDATE_PROFILE_ERROR',
        };
      });

    // Resend verification
    builder
      .addCase(resendVerification.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, state => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = {
          message: action.payload?.message || 'Failed to resend verification',
          code: action.payload?.code || 'RESEND_VERIFICATION_ERROR',
        };
      });
  },
});

export const {
  clearError,
  clearPendingVerification,
  clearPendingPasswordReset,
  setToken,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;
