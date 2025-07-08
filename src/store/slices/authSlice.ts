import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  createdAt: new Date().toISOString(), // Use ISO string instead of Date object
  updatedAt: new Date().toISOString(), // Use ISO string instead of Date object
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
  AuthResponse,
  RegisterData,
  {rejectValue: AuthError}
>('auth/register', async (data, {rejectWithValue}) => {
  try {
    await apiService.initialize();
    const apiData = transformRegisterDataToApi(data);
    const registerResponse = await apiService.register(apiData);
    
    // Immediately verify the user automatically
    await apiService.verifyEmail({
      email: data.email,
      token: registerResponse.verificationCode,
    });
    
    // Now login to get the auth tokens
    const loginResponse = await apiService.login({
      email: data.email,
      password: data.password,
    });
    
    return {
      user: transformApiUserToAppUser(loginResponse.user),
      token: loginResponse.token,
      refreshToken: loginResponse.refreshToken || '',
    };
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'Registration failed',
      code: error.statusCode || 'REGISTRATION_ERROR',
    });
  }
});

export const verifyEmail = createAsyncThunk<
  {success: boolean; message: string},
  VerificationRequest,
  {rejectValue: AuthError}
>('auth/verifyEmail', async (request, {rejectWithValue}) => {
  try {
    await apiService.initialize();
    const response = await apiService.verifyEmail({
      email: request.email,
      token: request.code,
    });
    return {
      success: true,
      message: response.message || 'Email verified successfully',
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

// Restore session from storage
export const restoreSession = createAsyncThunk<
  {user: User; token: string; refreshToken?: string} | null,
  void,
  {rejectValue: AuthError}
>('auth/restoreSession', async (_, {rejectWithValue}) => {
  try {
    await apiService.initialize();
    const isAuth = await apiService.isAuthenticated();

    if (!isAuth) {
      return null;
    }

    const storedUser = await apiService.getStoredUser();
    const token = apiService.getToken();
    
    if (storedUser && token) {
      // Try to get refresh token from storage
      let refreshToken = '';
      try {
        refreshToken = await AsyncStorage.getItem('hostaway_refresh_token') || '';
      } catch (error) {
        console.warn('Failed to load refresh token:', error);
      }
      
      return {
        user: transformApiUserToAppUser(storedUser),
        token,
        refreshToken,
      };
    }

    return null;
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'Failed to restore session',
      code: error.statusCode || 'RESTORE_SESSION_ERROR',
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

export const deleteProfile = createAsyncThunk<
  void,
  void,
  {rejectValue: AuthError}
>('auth/deleteProfile', async (_, {rejectWithValue}) => {
  try {
    await apiService.deleteUserProfile();
    // After successful deletion, clear local storage
    await apiService.logout();
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'Failed to delete profile',
      code: error.statusCode || 'DELETE_PROFILE_ERROR',
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
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.isAuthenticated = true;
        state.pendingVerification = null;
        state.error = null;
        apiService.setToken(action.payload.token);
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
        state.pendingVerification = null;
        state.error = null;
        // Email verification only confirms the email is verified
        // User still needs to login to get authenticated
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
        state.refreshToken = action.payload.refreshToken || null;
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

    // Restore session
    builder
      .addCase(restoreSession.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken || null;
          state.isAuthenticated = true;
          apiService.setToken(action.payload.token);
        } else {
          state.isAuthenticated = false;
        }
        state.error = null;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        // Don't set error for restore session failure - it's normal when no session exists
        state.error = null;
        apiService.clearToken();
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

    // Delete profile
    builder
      .addCase(deleteProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProfile.fulfilled, state => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        apiService.clearToken();
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = {
          message: action.payload?.message || 'Failed to delete profile',
          code: action.payload?.code || 'DELETE_PROFILE_ERROR',
        };
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
