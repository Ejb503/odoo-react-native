# React Native Integration Guide for Odoo Proxy

This guide provides instructions for integrating a React Native mobile app with the Odoo Proxy server. It covers authentication flow, API usage, WebSocket integration, and best practices for maintaining separation of concerns between your React Native app and the Odoo Proxy server.

## Separation of Concerns

The Odoo Proxy architecture is designed with a clear separation of concerns to maintain clean boundaries between your React Native app and the Odoo backend:

### Server-Side (Odoo Proxy)
- **Authentication Management**: Handles token generation, validation, and refresh
- **Session Management**: Manages user sessions and device registration
- **Data Transformation**: Converts Odoo data models into API-friendly formats
- **Caching**: Implements efficient data caching to improve performance
- **Error Handling**: Provides consistent error responses and logging
- **Security**: Enforces access controls and data validation

### Client-Side (React Native)
- **UI/UX**: Renders the interface and handles user interactions
- **State Management**: Manages application state using Context, Redux, etc.
- **Token Storage**: Securely stores authentication tokens
- **Network Communication**: Makes API requests to the Odoo Proxy server

This separation ensures that:
1. Your mobile app doesn't need to understand Odoo's internal API structure
2. Changes to Odoo's API won't directly impact your mobile app
3. Security is properly enforced at the server level
4. Business logic is consistently applied across all clients

## Authentication Flow

### Setup

```javascript
// auth-service.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const API_URL = 'https://your-odoo-proxy-server.com/api';

// Storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const DEVICE_ID_KEY = 'device_id';
const USER_KEY = 'user';

// Get device info for authentication
const getDeviceInfo = async () => {
  return {
    deviceType: DeviceInfo.isTablet() ? 'tablet' : 'mobile',
    os: Platform.OS,
    osVersion: Platform.Version.toString(),
    appVersion: DeviceInfo.getVersion(),
    deviceName: await DeviceInfo.getDeviceName(),
    screenSize: `${Dimensions.get('window').width}x${Dimensions.get('window').height}`,
  };
};
```

### Login

```javascript
// Login with Odoo credentials
export const login = async (username, password, odooUrl) => {
  try {
    // Get device info for authentication
    const deviceInfo = await getDeviceInfo();
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        odooUrl,
        username,
        password,
        deviceInfo: {
          name: deviceInfo.deviceName,
          type: deviceInfo.deviceType,
          os: deviceInfo.os,
          osVersion: deviceInfo.osVersion,
          appVersion: deviceInfo.appVersion,
        }
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Login failed');
    }
    
    // Store tokens and user data
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    return {
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
```

### Token Refresh

```javascript
// Refresh access token
export const refreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const deviceInfo = await getDeviceInfo();
    
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
    
    const data = await response.json();
    
    if (!response.ok) {
      // Clear tokens if refresh failed
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      throw new Error(data.error || data.message || 'Token refresh failed');
    }
    
    // Store new tokens
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    
    // Store new refresh token if provided
    if (data.refreshToken) {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    
    return data.accessToken;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};
```

### Authenticated API Requests

```javascript
// Create authenticated API client
export const createApiClient = () => {
  let accessToken = null;
  let tokenRefreshPromise = null;
  
  const getToken = async () => {
    if (!accessToken) {
      accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return accessToken;
  };
  
  // Fetch with automatic token refresh
  const fetchWithAuth = async (url, options = {}) => {
    // If there's already a token refresh in progress, wait for it to complete
    if (tokenRefreshPromise) {
      await tokenRefreshPromise;
    }
    
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated. Please login first.');
    }
    
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
          tokenRefreshPromise = refreshToken();
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
          // If refresh fails, redirect to login
          accessToken = null;
          tokenRefreshPromise = null;
          await logout();
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
    getRecords: (model, params = {}) => 
      fetchWithAuth(`${API_URL}/api/odoo/models/${model}?${new URLSearchParams(params)}`),
    
    getRecord: (model, id, params = {}) => 
      fetchWithAuth(`${API_URL}/api/odoo/models/${model}/${id}?${new URLSearchParams(params)}`),
    
    createRecord: (model, data) => 
      fetchWithAuth(`${API_URL}/api/odoo/models/${model}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    
    updateRecord: (model, id, data) => 
      fetchWithAuth(`${API_URL}/api/odoo/models/${model}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    
    deleteRecord: (model, id) => 
      fetchWithAuth(`${API_URL}/api/odoo/models/${model}/${id}`, {
        method: 'DELETE',
      }),
    
    // Direct Odoo API call (more flexible)
    callOdooMethod: (model, method, args = [], kwargs = {}) => 
      fetchWithAuth(`${API_URL}/api/odoo/call`, {
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
    get: (url, options = {}) => 
      fetchWithAuth(`${API_URL}${url}`, { ...options, method: 'GET' }),
    
    post: (url, data, options = {}) => 
      fetchWithAuth(`${API_URL}${url}`, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      }),
    
    put: (url, data, options = {}) => 
      fetchWithAuth(`${API_URL}${url}`, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      }),
    
    delete: (url, options = {}) => 
      fetchWithAuth(`${API_URL}${url}`, { ...options, method: 'DELETE' }),
  };
};
```

### Logout

```javascript
export const logout = async () => {
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    
    if (token && refreshToken) {
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
      }).catch((error) => {
        // Log but don't block on logout errors
        console.warn('Logout request failed:', error);
      });
    }
    
    // Close active WebSocket connections
    if (typeof closeSocket === 'function') {
      closeSocket();
    }
    
    // Clear auth data from storage
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    
    // Optionally clear any cached data
    // Here you would clear any app-specific cached data
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Still remove tokens even if server logout failed
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    
    return false;
  }
};
```

## WebSocket Connection

### Socket.IO Setup

```javascript
// socket-service.js
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'https://your-odoo-proxy-server.com';

let socket = null;

export const initializeSocket = async () => {
  // Only initialize once
  if (socket && socket.connected) return socket;
  
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  // Initialize socket with authentication
  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });
  
  // Handle socket events
  socket.on('connect', () => {
    console.log('Socket connected');
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`Socket reconnection attempt ${attemptNumber}`);
  });
  
  socket.on('reconnect_error', (error) => {
    console.error('Socket reconnection error:', error);
  });
  
  socket.on('reconnect_failed', () => {
    console.error('Socket reconnection failed');
  });
  
  // Handle token refresh
  socket.on('auth_error', async () => {
    try {
      const newToken = await refreshToken();
      socket.auth.token = newToken;
      socket.connect();
    } catch (error) {
      console.error('Socket authentication error:', error);
    }
  });
  
  return socket;
};

// Get active socket or initialize
export const getSocket = async () => {
  if (!socket || !socket.connected) {
    return initializeSocket();
  }
  return socket;
};

// Close socket on logout
export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

### Using WebSocket for Odoo Data

```javascript
// Example: Subscribing to Odoo model changes
export const subscribeToModel = async (modelName, domain = []) => {
  const socket = await getSocket();
  
  return new Promise((resolve, reject) => {
    socket.emit('subscribe_model', { model: modelName, domain }, (response) => {
      if (response.error) {
        reject(new Error(response.error));
      } else {
        resolve(response);
      }
    });
  });
};

// Example: Handling model updates
export const listenForModelChanges = async (modelName, callback) => {
  const socket = await getSocket();
  
  socket.on(`model_updated:${modelName}`, (data) => {
    callback(data);
  });
  
  return () => {
    socket.off(`model_updated:${modelName}`);
  };
};

// Example: Execute Odoo method through WebSocket
export const callOdooMethod = async (model, method, args = [], kwargs = {}) => {
  const socket = await getSocket();
  
  return new Promise((resolve, reject) => {
    socket.emit('call_method', { model, method, args, kwargs }, (response) => {
      if (response.error) {
        reject(new Error(response.error));
      } else {
        resolve(response.result);
      }
    });
  });
};
```

## App Component Integration

### React Navigation Setup

```javascript
// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import MainApp from './screens/MainApp';
import { refreshToken } from './services/auth-service';
import { initializeSocket, closeSocket } from './services/socket-service';

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check for existing token on app start
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        
        if (token) {
          // Try to refresh token
          try {
            await refreshToken();
            await initializeSocket();
            setIsAuthenticated(true);
          } catch (error) {
            console.log('Token refresh failed:', error);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Bootstrapping error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    bootstrapAsync();
    
    return () => {
      closeSocket();
    };
  }, []);
  
  if (isLoading) {
    return <SplashScreen />;
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainApp} options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
```

### Login Screen Example

```javascript
// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { login } from '../services/auth-service';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverUrl, setServerUrl] = useState('https://demo.odoo.com');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async () => {
    if (!username || !password || !serverUrl) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(username, password, serverUrl);
      // Login successful, App.js will redirect to main app
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20, textAlign: 'center' }}>
        Odoo Mobile Login
      </Text>
      
      <TextInput
        placeholder="Server URL"
        value={serverUrl}
        onChangeText={setServerUrl}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        autoCapitalize="none"
      />
      
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        autoCapitalize="none"
      />
      
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      
      <Button
        title={isLoading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={isLoading}
      />
    </View>
  );
};

export default LoginScreen;
```

### WebSocket Usage Example

```javascript
// components/PartnerList.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { callOdooMethod, listenForModelChanges } from '../services/socket-service';

const PartnerList = () => {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadPartners = async () => {
      try {
        // Load partners through WebSocket
        const result = await callOdooMethod(
          'res.partner',
          'search_read',
          [[]],  // Domain
          { fields: ['id', 'name', 'email', 'phone'] }  // Fields to fetch
        );
        
        setPartners(result);
      } catch (error) {
        console.error('Failed to load partners:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPartners();
    
    // Subscribe to partner changes
    const subscribeToChanges = async () => {
      try {
        // Set up real-time updates
        const unsubscribe = await listenForModelChanges('res.partner', (data) => {
          if (data.operation === 'create') {
            setPartners(prev => [...prev, data.record]);
          } else if (data.operation === 'write') {
            setPartners(prev => 
              prev.map(partner => 
                partner.id === data.id ? { ...partner, ...data.values } : partner
              )
            );
          } else if (data.operation === 'unlink') {
            setPartners(prev => 
              prev.filter(partner => partner.id !== data.id)
            );
          }
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Failed to subscribe to partner changes:', error);
      }
    };
    
    const unsubscribe = subscribeToChanges();
    
    return () => {
      // Clean up WebSocket listeners
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);
  
  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }
  
  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', margin: 10 }}>Partners</Text>
      <FlatList
        data={partners}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            {item.email && <Text>{item.email}</Text>}
            {item.phone && <Text>{item.phone}</Text>}
          </View>
        )}
      />
    </View>
  );
};

export default PartnerList;
```

## Best Practices

1. **Token Management:**
   - Store tokens securely using AsyncStorage or a more secure alternative like EncryptedStorage
   - Implement automatic token refresh before expiration
   - Clear tokens on logout

2. **Error Handling:**
   - Implement global error handling for API requests
   - Show appropriate messages for authentication errors
   - Automatically navigate to login on authentication failures

3. **Offline Support:**
   - Cache critical data for offline access
   - Queue operations when offline
   - Sync when connection is restored

4. **Performance:**
   - Minimize WebSocket message size
   - Use pagination for large datasets
   - Implement efficient list rendering with FlatList
   - Implement request batching for multiple related requests

5. **Security:**
   - Never store raw passwords
   - Use HTTPS for all communication
   - Implement certificate pinning for added security
   - Secure storage of tokens using encrypted storage when possible
   - Clear sensitive data from memory when not needed

6. **Rate Limiting and Throttling:**
   - Implement retry with exponential backoff for failed requests
   - Respect server-side rate limits (check response headers)
   - Bundle requests where possible to reduce API calls
   - Cache responses to avoid duplicate requests

7. **User Experience:**
   - Provide background reconnection with visual indicators
   - Implement graceful degradation when WebSocket is unavailable
   - Use skeleton screens during loading
   - Provide feedback for long-running operations

## Troubleshooting

1. **Authentication Issues:**
   - Verify server URL is correct and accessible
   - Check network connectivity
   - Inspect token expiration times

2. **WebSocket Connection Problems:**
   - Verify WebSocket URL is correct
   - Check if the server supports Socket.IO
   - Ensure authentication token is valid
   - Check for firewall or proxy issues

3. **Data Synchronization Issues:**
   - Verify subscription to correct models
   - Check event name formats
   - Implement retry mechanisms for failed operations