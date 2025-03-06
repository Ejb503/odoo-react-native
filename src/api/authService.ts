import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';
import { API_URL } from '../utils/config';

// API URL is imported from config

// Auth-related types
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    name: string;
    username: string;
  };
}

export interface AuthStatus {
  isLoggedIn: boolean;
  token?: string;
  refreshToken?: string;
  username?: string;
  serverUrl?: string;
  user?: any;
}

export interface AuthError extends Error {
  code?: string;
  details?: string;
}

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USERNAME: 'username',
  SERVER_URL: 'server_url',
  USER: 'user',
};

import { APP_VERSION, APP_NAME } from '../utils/config';

// Device info for authentication
const getDeviceInfo = () => {
  return {
    deviceType: Dimensions.get('window').width > 768 ? 'tablet' : 'mobile',
    os: Platform.OS || 'web',
    // Handle different platform versions safely
    osVersion: typeof Platform.Version === 'string' 
      ? Platform.Version 
      : (typeof Platform.Version === 'number' 
        ? Platform.Version.toString() 
        : 'unknown'),
    appVersion: APP_VERSION,
    deviceName: Platform.OS === 'ios' 
      ? 'iOS Device' 
      : (Platform.OS === 'android' ? 'Android Device' : 'Web Browser'),
    screenSize: `${Dimensions.get('window').width}x${Dimensions.get('window').height}`,
  };
};

/**
 * Authentication service for Odoo Proxy integration
 */
export const authService = {
  /**
   * Authenticates user with Odoo proxy server
   * @param username User's login name
   * @param password User's password
   * @param serverUrl Odoo server URL
   * @returns Authentication response with tokens and user info
   * @throws {AuthError} If authentication fails
   */
  login: async (username: string, password: string, serverUrl: string): Promise<AuthResponse> => {
    try {
      // Validate inputs
      if (!username.trim()) {
        throw Object.assign(new Error('Username is required'), { code: 'INVALID_INPUT' });
      }
      if (!password.trim()) {
        throw Object.assign(new Error('Password is required'), { code: 'INVALID_INPUT' });
      }
      if (!serverUrl.trim()) {
        throw Object.assign(new Error('Server URL is required'), { code: 'INVALID_INPUT' });
      }

      // In development mode, if the proxy server isn't available, use mock data
      let response;
      try {
        // Get device info for authentication
        const deviceInfo = getDeviceInfo();
        
        console.log(`Calling proxy server at ${API_URL}/auth/login`);
        
        // Call the Odoo Proxy server
        response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            odooUrl: serverUrl,     // The actual Odoo server URL the user wants to connect to
            username,               // The Odoo username
            password,               // The Odoo password
            deviceInfo: {
              name: deviceInfo.deviceName,
              type: deviceInfo.deviceType,
              os: deviceInfo.os,
              osVersion: deviceInfo.osVersion,
              appVersion: deviceInfo.appVersion,
            }
          }),
        });
        
        // Check for network error or if server is unreachable
        if (!response.ok) {
          // Parse error message from the server if available
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || errorData.message || `Authentication failed with status ${response.status}`;
          
          // Throw a more informative error
          throw Object.assign(new Error(errorMessage), { 
            code: 'AUTH_FAILED',
            details: JSON.stringify(errorData)
          });
        }
        
        const data = await response.json();
        
        // Save authentication data
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken),
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken),
          AsyncStorage.setItem(STORAGE_KEYS.USERNAME, username),
          AsyncStorage.setItem(STORAGE_KEYS.SERVER_URL, serverUrl),
          AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user)),
        ]);
        
        return data;
      } catch (error) {
        console.error('Authentication error:', error);
        
        // Handle network errors specifically
        if (error instanceof TypeError && error.message.includes('Network request failed')) {
          throw Object.assign(new Error(`Cannot connect to proxy server at ${API_URL}. Please check your network connection.`), { 
            code: 'NETWORK_ERROR' 
          });
        }
        
        // Re-throw the error to be handled by the caller
        throw error;
      }
    } catch (error) {
      // Rethrow with proper typing
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Authentication failed');
    }
  },
  
  /**
   * Refreshes the access token using the refresh token
   * @returns New access token
   * @throws {Error} If refresh fails
   */
  refreshToken: async (): Promise<string> => {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const deviceInfo = getDeviceInfo();
      
      // Call the Odoo Proxy server
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken,
          deviceInfo: {
            name: deviceInfo.deviceName,
            type: deviceInfo.deviceType,
            os: deviceInfo.os,
            osVersion: deviceInfo.osVersion,
            appVersion: deviceInfo.appVersion,
          }
        }),
      });
      
      // If server returns error
      if (!response.ok) {
        // Parse error message from the server if available
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `Token refresh failed with status ${response.status}`;
        
        // Throw a more informative error
        throw Object.assign(new Error(errorMessage), { 
          code: 'REFRESH_FAILED',
          details: JSON.stringify(errorData)
        });
      }
      
      const data = await response.json();
      
      // Store new tokens
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      
      // Store new refresh token if provided
      if (data.refreshToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      }
      
      return data.accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw Object.assign(new Error(`Cannot connect to proxy server at ${API_URL}. Please check your network connection.`), { 
          code: 'NETWORK_ERROR' 
        });
      }
      
      throw error;
    }
  },
  
  /**
   * Logs out the current user and clears authentication data
   * @throws {Error} If logout fails
   */
  logout: async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (token && refreshToken) {
        try {
          // Call logout endpoint
          await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              refreshToken,
            }),
          });
        } catch (error) {
          // Log but don't block on logout errors
          console.warn('Logout request failed:', error);
        }
      }
      
      // Clear stored auth info
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USERNAME),
        AsyncStorage.removeItem(STORAGE_KEYS.SERVER_URL),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
      ]);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout');
    }
  },
  
  /**
   * Checks if user is already authenticated
   * @returns Auth status with user info if logged in
   */
  checkAuthStatus: async (): Promise<AuthStatus> => {
    try {
      const [token, refreshToken, username, serverUrl, userJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USERNAME),
        AsyncStorage.getItem(STORAGE_KEYS.SERVER_URL),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);
      
      if (token && username && serverUrl) {
        const user = userJson ? JSON.parse(userJson) : undefined;
        return { 
          isLoggedIn: true, 
          token, 
          refreshToken: refreshToken || undefined,
          username, 
          serverUrl,
          user 
        };
      }
      
      return { isLoggedIn: false };
    } catch (error) {
      console.error('Error checking auth status:', error);
      return { isLoggedIn: false };
    }
  },
  
  /**
   * Creates an authenticated API client for making requests to the Odoo Proxy
   * @returns API client object
   */
  createApiClient: () => {
    let accessToken: string | null = null;
    let tokenRefreshPromise: Promise<string> | null = null;
    
    const getToken = async (): Promise<string> => {
      if (!accessToken) {
        accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      }
      if (!accessToken) {
        throw new Error('Not authenticated');
      }
      return accessToken;
    };
    
    // Fetch with automatic token refresh
    const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
      // If there's already a token refresh in progress, wait for it to complete
      if (tokenRefreshPromise) {
        await tokenRefreshPromise;
      }
      
      const token = await getToken();
      
      const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      };
      
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });
        
        // If unauthorized, try to refresh token
        if (response.status === 401) {
          try {
            // Create a single refresh promise to prevent multiple refresh attempts
            tokenRefreshPromise = authService.refreshToken();
            accessToken = await tokenRefreshPromise;
            tokenRefreshPromise = null;
            
            // Retry request with new token
            return fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${accessToken}`,
              },
            });
          } catch (refreshError) {
            // If refresh fails, clear tokens
            accessToken = null;
            tokenRefreshPromise = null;
            await authService.logout();
            throw new Error('Session expired. Please log in again.');
          }
        }
        
        // Parse JSON response
        if (response.ok) {
          if (response.headers.get('content-type')?.includes('application/json')) {
            const data = await response.json();
            return data;
          }
          return response;
        } else {
          // Handle error responses
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
        }
      } catch (error) {
        console.error('API request error:', error);
        throw error;
      }
    };
    
    return {
      // Generic Odoo model access
      getRecords: (model: string, params = {}) => 
        fetchWithAuth(`${API_URL}/odoo/models/${model}?${new URLSearchParams(params as Record<string, string>)}`),
      
      getRecord: (model: string, id: number, params = {}) => 
        fetchWithAuth(`${API_URL}/odoo/models/${model}/${id}?${new URLSearchParams(params as Record<string, string>)}`),
      
      createRecord: (model: string, data: any) => 
        fetchWithAuth(`${API_URL}/odoo/models/${model}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      
      updateRecord: (model: string, id: number, data: any) => 
        fetchWithAuth(`${API_URL}/odoo/models/${model}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      
      deleteRecord: (model: string, id: number) => 
        fetchWithAuth(`${API_URL}/odoo/models/${model}/${id}`, {
          method: 'DELETE',
        }),
      
      // Direct Odoo API call (more flexible)
      callOdooMethod: (model: string, method: string, args: any[] = [], kwargs: Record<string, any> = {}) => 
        fetchWithAuth(`${API_URL}/odoo/call`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            method,
            args,
            kwargs
          }),
        }),
      
      // Standard REST methods
      get: (url: string, options: RequestInit = {}) => 
        fetchWithAuth(`${API_URL}${url}`, { ...options, method: 'GET' }),
      
      post: (url: string, data: any, options: RequestInit = {}) => 
        fetchWithAuth(`${API_URL}${url}`, {
          ...options,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          body: JSON.stringify(data),
        }),
      
      put: (url: string, data: any, options: RequestInit = {}) => 
        fetchWithAuth(`${API_URL}${url}`, {
          ...options,
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          body: JSON.stringify(data),
        }),
      
      delete: (url: string, options: RequestInit = {}) => 
        fetchWithAuth(`${API_URL}${url}`, { ...options, method: 'DELETE' }),
    };
  }
};