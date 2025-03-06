# CLAUDE.md - Odoo React Native App

## Project Overview
This React Native application connects to an Odoo Proxy server using the Model Context Protocol SDK (MCP) to enable voice-based interactions with Odoo services.

## Development Commands

### Setup & Installation
```bash
# Install dependencies
npm install

# Install iOS dependencies
cd ios && pod install && cd ..
```

### Running the App
```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Testing
```bash
# Run tests
npm test

# Run linter
npm run lint

# Type checking
npm run typecheck
```

## Project Structure
- `/src` - Main source code
  - `/api` - API services and MCP SDK integration
  - `/components` - Reusable UI components
  - `/hooks` - Custom React hooks
  - `/navigation` - Navigation configuration
  - `/screens` - Application screens
  - `/services` - Business logic services
  - `/state` - State management (Redux/Context)
  - `/types` - TypeScript type definitions
  - `/utils` - Utility functions

## Code Style Preferences
- Use functional components with hooks instead of class components
- Use TypeScript for all new code
- Follow the Airbnb JavaScript Style Guide
- Use named exports instead of default exports
- Organize imports alphabetically
- Use absolute imports with path aliases

## Important Libraries
- React Navigation for navigation
- Redux Toolkit for state management
- React Native Voice for voice recognition
- React Native Secure Store for token storage
- Axios for HTTP requests (if needed alongside websockets)
- React Native Paper for UI components
- React Native Reanimated for animations
- React Native Skia for complex visual effects

## MCP SDK Integration Notes
- Initialize MCP connection after successful authentication
- Handle websocket reconnection automatically
- Process voice commands through MCP pipeline
- Render different response types based on MCP result type

## Design & Theming
See [theming.md](./theming.md) for comprehensive theming guidelines, including:
- Color palette
- Typography
- Animation principles
- Component styling
- Accessibility considerations
- Voice UI elements
- Implementation guidance