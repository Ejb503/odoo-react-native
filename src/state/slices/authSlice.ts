import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { authService, AuthResponse } from '../../api/authService';
import { RootState } from '../store';

export interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  refreshToken: string | null;
  username: string | null;
  serverUrl: string | null;
  user: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  token: null,
  refreshToken: null,
  username: null,
  serverUrl: null,
  user: null,
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk<
  AuthResponse, 
  { username: string; password: string; serverUrl: string },
  { rejectValue: string }
>(
  'auth/login',
  async ({ username, password, serverUrl }, { rejectWithValue }) => {
    try {
      return await authService.login(username, password, serverUrl);
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Login failed');
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Logout failed');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.checkAuthStatus();
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to check auth status');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ 
      token: string; 
      refreshToken?: string;
      username: string; 
      serverUrl: string;
      user?: any;
    }>) => {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.username = action.payload.username;
      state.serverUrl = action.payload.serverUrl;
      state.user = action.payload.user || null;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      return initialState;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoggedIn = true;
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken || null;
      state.username = action.payload.user.username;
      state.user = action.payload.user;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Login failed';
    });

    // Logout
    builder.addCase(logoutThunk.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(logoutThunk.fulfilled, () => {
      return initialState;
    });
    builder.addCase(logoutThunk.rejected, (state, action) => {
      state.error = action.payload as string || 'Logout failed';
      // Still logout the user locally even if server logout fails
      return {
        ...initialState,
        error: state.error,
      };
    });

    // Check Auth Status
    builder.addCase(checkAuthStatus.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(checkAuthStatus.fulfilled, (state, action) => {
      if (action.payload.isLoggedIn) {
        state.isLoggedIn = true;
        state.token = action.payload.token || null;
        state.refreshToken = action.payload.refreshToken || null;
        state.username = action.payload.username || null;
        state.serverUrl = action.payload.serverUrl || null;
        state.user = action.payload.user || null;
      }
      state.loading = false;
    });
    builder.addCase(checkAuthStatus.rejected, (state) => {
      state.loading = false;
      // Don't set error - checking auth status is not critical
      // and may happen on app launch or in background
    });
  },
});

// Regular actions
export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectUser = (state: RootState) => state.auth.user;
export const selectUsername = (state: RootState) => state.auth.username;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;