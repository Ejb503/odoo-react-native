# Application Architecture

## Overview
This React Native application serves as a client for an Odoo Proxy server, using voice input and the Model Context Protocol SDK (MCP) to interact with Odoo services via websocket connections.

## Implemented Architecture

### 1. Authentication Layer
- **LoginScreen**: Collects username, password, and Odoo server URL
- **AuthService**: Handles JWT authentication with the Odoo Proxy server
- **AsyncStorage**: Securely stores authentication tokens and session data
- **Redux Auth Slice**: Manages authentication state across the app

### 2. Communication Layer
- **MCPService**: Simulates the Model Context Protocol SDK integration
- **WebSocket simulation**: Mock implementation of connection management
- **Response types**: Support for text, image, list, and table data types
- **Error handling**: Comprehensive error states for connection and request failures

### 3. Voice Processing Layer
- **VoiceInput Component**: Uses React Native Voice for speech recognition
- **Speech-to-text conversion**: Captures and processes voice input
- **Query processing**: Sends text queries to MCP service
- **Visual feedback**: Shows listening and processing states

### 4. UI Layer
- **React Navigation**: Handles screen transitions and navigation stack
- **React Native Paper**: Provides Material Design components
- **LoginScreen**: Beautiful authentication form with validation
- **MainScreen**: Voice-centric interface with response display
- **MCPResponseRenderer**: Renders different response types appropriately

### 5. State Management
- **Redux**: Global state management using Redux Toolkit
- **Auth slice**: Manages authentication state
- **Local state**: Component-level state for UI interactions
- **Query history**: Maintains conversation history

## Project Structure
```
/src
  /api
    - authService.ts     # Authentication API handlers
    - mcpService.ts      # MCP SDK integration
  /components
    - MCPResponseRenderer.tsx  # Display different response types
    - VoiceInput.tsx           # Voice recognition component
  /hooks
    - useAppDispatch.ts  # Typed Redux dispatch hook
    - useAppSelector.ts  # Typed Redux selector hook
  /navigation
    # Navigation configuration (inside App.tsx)
  /screens
    - LoginScreen.tsx    # Authentication screen
    - MainScreen.tsx     # Main voice interaction screen
    /__tests__           # Component tests
  /services
    # Business logic services
  /state
    /slices
      - authSlice.ts     # Redux auth slice
    - store.ts           # Redux store configuration
  /types
    # TypeScript type definitions
  /utils
    - theme.ts           # UI theme configuration
  - App.tsx              # Main application component
```

## Technical Stack

- **Framework**: React Native with Expo (web-focused for development)
- **Navigation**: React Navigation v7 for screen management
- **State Management**: Redux Toolkit with typed hooks
- **Authentication**: JWT token simulation with AsyncStorage
- **Networking**: Simulated MCP SDK for websocket communication
- **Voice Processing**: React Native Voice package
- **UI Components**: React Native Paper for Material Design
- **Testing**: Jest and React Native Testing Library

## Future Enhancements
1. Integrate with actual Odoo Proxy server
2. Implement actual MCP SDK instead of mock
3. Add text-to-speech for voice responses
4. Extend response rendering for more complex data types
5. Add offline mode and request queueing
6. Enhanced error handling and retry mechanisms