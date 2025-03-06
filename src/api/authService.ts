import AsyncStorage from '@react-native-async-storage/async-storage';

// This would be replaced with actual API calls to the Odoo Proxy server
export const authService = {
  login: async (username: string, password: string, serverUrl: string): Promise<{ token: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, always succeed with a mock token
    const token = `mock-jwt-token-${Math.random().toString(36).substring(2, 15)}`;
    
    // Store auth info in AsyncStorage
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('username', username);
    await AsyncStorage.setItem('server_url', serverUrl);
    
    return { token };
  },
  
  logout: async (): Promise<void> => {
    // Clear stored auth info
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('server_url');
  },
  
  checkAuthStatus: async (): Promise<{ isLoggedIn: boolean, token?: string, username?: string, serverUrl?: string }> => {
    const token = await AsyncStorage.getItem('auth_token');
    const username = await AsyncStorage.getItem('username');
    const serverUrl = await AsyncStorage.getItem('server_url');
    
    if (token && username && serverUrl) {
      return { isLoggedIn: true, token, username, serverUrl };
    }
    
    return { isLoggedIn: false };
  }
};