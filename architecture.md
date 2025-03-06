# Application Architecture

## Overview
This React Native application serves as a client for an Odoo Proxy server, using voice input and the Model Context Protocol SDK (MCP) to interact with Odoo services via secure WebSocket connections and REST API endpoints.

## Implemented Architecture

### 1. Authentication Layer
- **LoginScreen**: Collects username, password, and Odoo server URL
- **AuthService**: Handles JWT authentication with the Odoo Proxy server
- **AsyncStorage**: Securely stores authentication tokens and session data
- **Redux Auth Slice**: Manages authentication state across the app
- **Token Refresh**: Automatic refresh of expired tokens with error handling

### 2. Communication Layer
- **MCPService**: Real-time communication with the Odoo Proxy server via MCP SDK
- **WebSocket Connection**: Maintains persistent connection for real-time updates
- **REST API Fallback**: Alternative communication channel when WebSockets unavailable
- **Response types**: Support for text, image, list, and table data types
- **Error handling**: Comprehensive error handling for network failures and API errors

### 3. Voice Processing Layer
- **VoiceInput Component**: Uses React Native Voice for speech recognition
- **Speech-to-text conversion**: Captures and processes voice input
- **Query processing**: Sends text queries to MCP service
- **Visual feedback**: Shows listening and processing states

### 4. UI Layer
- **React Navigation**: Handles screen transitions and navigation stack
- **React Native Paper**: Provides Material Design components
- **LoginScreen**: Authentication form with real-time validation
- **MainScreen**: Voice-centric interface with dynamic response display
- **MCPResponseRenderer**: Renders different response types with appropriate visualizations

### 5. State Management
- **Redux**: Global state management using Redux Toolkit
- **Auth slice**: Manages authentication state and tokens
- **Local state**: Component-level state for UI interactions
- **Query history**: Maintains conversation history
- **Persistent storage**: Saves session data between app launches

### 6. Configuration Management
- **Config Module**: Centralized configuration management
- **Environment Variables**: Default values for development and production
- **Constants**: Application-wide constants for consistent usage

## Project Structure
```
/src
  /api
    - authService.ts     # Authentication API with token management
    - mcpService.ts      # MCP SDK integration with WebSocket and REST
  /components
    - MCPResponseRenderer.tsx  # Display different response types
    - VoiceInput.tsx           # Voice recognition component
  /hooks
    - useAppDispatch.ts  # Typed Redux dispatch hook
    - useAppSelector.ts  # Typed Redux selector hook
  /screens
    - LoginScreen.tsx    # Authentication screen
    - MainScreen.tsx     # Main voice interaction screen
    /__tests__           # Component tests
  /state
    /slices
      - authSlice.ts     # Redux auth slice with async thunks
    - store.ts           # Redux store configuration
  /utils
    - config.ts          # App configuration and constants
    - theme.ts           # UI theme configuration
  - App.tsx              # Main application component with navigation
```

## Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation for screen management
- **State Management**: Redux Toolkit with typed hooks
- **Authentication**: JWT token-based authentication with refresh
- **Networking**: WebSocket for real-time communication with REST fallback
- **Storage**: AsyncStorage for secure token and session storage
- **Voice Processing**: React Native Voice package
- **UI Components**: React Native Paper for Material Design
- **Testing**: Jest and React Native Testing Library

## Integration with Odoo Proxy

The application now integrates with a real Odoo Proxy server, handling:

1. **Authentication**: Real JWT token acquisition and management
2. **Token Validation**: Endpoint verification for token validity
3. **WebSocket Communication**: Real-time messaging with the MCP service
4. **REST API Fallback**: Alternative API access when WebSockets are unavailable
5. **Error Handling**: Proper error states for various failure scenarios
6. **Security**: Secure token storage and transmission

## Verified Functionality

1. ✅ Authentication with real Odoo credentials
2. ✅ Token acquisition and validation
3. ✅ Secure token storage
4. ✅ Token refresh mechanism
5. ✅ Error handling for connection failures
6. ✅ WebSocket connections to Odoo Proxy

## Next Steps
1. Enhance voice recognition with additional language support
2. Implement text-to-speech for voice responses
3. Add offline mode with request queueing
4. Extend response rendering for complex business data (charts, forms)
5. Implement push notifications for important Odoo events