# Odoo React Native

A React Native app that integrates with Odoo through a proxy server using the Model Context Protocol (MCP) SDK. This application provides a voice-based interface to interact with Odoo services.

## Features

- **Authentication**: Secure login with username, password, and server URL
- **Voice Input**: Speak to interact with Odoo
- **MCP SDK Integration**: Connects to Odoo proxy via websocket
- **Response Rendering**: Display different response types (text, lists, tables, images)
- **Mock Mode**: Generate sample responses for testing

## Tech Stack

- React Native with Expo
- TypeScript
- Redux Toolkit for state management
- React Navigation for routing
- React Native Paper for UI components
- React Native Voice for speech recognition
- Jest for testing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/odoo-react-native.git
   cd odoo-react-native
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Choose to run on web, Android or iOS:
   ```
   w - web
   a - android
   i - iOS
   ```

## Project Structure

The project follows a well-organized structure:

- `/src` - Main source code
  - `/api` - API services and MCP SDK integration
  - `/components` - Reusable UI components
  - `/hooks` - Custom React hooks
  - `/navigation` - Navigation configuration
  - `/screens` - Application screens
  - `/services` - Business logic
  - `/state` - Redux state management
  - `/utils` - Utility functions

## Development

### Running Tests

```
npm test
```

### Type Checking

```
npm run typecheck
```

## Architecture

Detailed architecture documentation is available in [architecture.md](./architecture.md).

## Implementation Plan

See [plan.md](./plan.md) for the project implementation plan and roadmap.

## License

ISC

## Acknowledgments

- Odoo Community
- React Native Community
- MCP SDK developers
