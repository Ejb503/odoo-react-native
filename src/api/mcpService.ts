import AsyncStorage from '@react-native-async-storage/async-storage';
// Import the socket.io client for WebSocket communication
// For React Native:
// npm install socket.io-client

// MCP Response Types
export type MCPResponseType = 'text' | 'image' | 'list' | 'table' | 'error';

export interface MCPTextResponse {
  type: 'text';
  content: string;
}

export interface MCPImageResponse {
  type: 'image';
  content: string; // URL to image
}

export interface MCPListResponse {
  type: 'list';
  content: {
    title: string;
    items: string[];
  };
}

export interface MCPTableResponse {
  type: 'table';
  content: {
    headers: string[];
    rows: string[][];
  };
}

export interface MCPErrorResponse {
  type: 'error';
  content: string;
  code?: string;
}

export type MCPResponse = 
  | MCPTextResponse 
  | MCPImageResponse 
  | MCPListResponse 
  | MCPTableResponse 
  | MCPErrorResponse;

export interface MCPConnectionOptions {
  reconnectAttempts?: number;
  reconnectInterval?: number;
  timeout?: number;
}

// Import socket.io-client for WebSocket communication
let io: any = null;
try {
  // Using require instead of import to avoid TypeScript dynamic import errors
  const socketIo = require('socket.io-client');
  io = socketIo.io || socketIo.default?.io || socketIo;
} catch (error) {
  console.warn('Failed to import socket.io-client:', error);
}

// Import configuration from config file
import { API_URL, SOCKET_URL } from '../utils/config';

/**
 * Model Context Protocol Service
 * Communicates with an Odoo proxy server via MCP SDK
 */
export class MCPService {
  private isConnected: boolean = false;
  private serverUrl: string | null = null;
  private token: string | null = null;
  private socket: any = null;
  private socketReady: boolean = false;
  private connectionOptions: MCPConnectionOptions = {
    reconnectAttempts: 5,
    reconnectInterval: 2000,
    timeout: 10000
  };
  private connectionListeners: Array<(connected: boolean) => void> = [];
  
  /**
   * Connects to the MCP service endpoint
   * @param serverUrl Server URL to connect to
   * @param token Authentication token
   * @param options Optional connection parameters
   * @returns Success status
   */
  async connect(
    serverUrl: string, 
    token: string, 
    options?: Partial<MCPConnectionOptions>
  ): Promise<boolean> {
    try {
      // Update options if provided
      if (options) {
        this.connectionOptions = { ...this.connectionOptions, ...options };
      }
      
      this.serverUrl = serverUrl;
      this.token = token;
      
      // If Socket.IO is available, try to connect
      if (io) {
        try {
          // Initialize socket with authentication
          this.socket = io(SOCKET_URL, {
            auth: {
              token,
            },
            reconnection: true,
            reconnectionAttempts: this.connectionOptions.reconnectAttempts,
            reconnectionDelay: this.connectionOptions.reconnectInterval,
            reconnectionDelayMax: 5000,
            timeout: this.connectionOptions.timeout,
          });
          
          // Wait for the socket to connect
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Socket connection timeout'));
            }, this.connectionOptions.timeout);
            
            // Handle socket events
            this.socket.on('connect', () => {
              clearTimeout(timeout);
              console.log('[MCP] Socket connected');
              this.socketReady = true;
              resolve();
            });
            
            this.socket.on('connect_error', (error: any) => {
              console.error('[MCP] Socket connect error:', error);
              // Don't reject on connect_error, let the timeout handle that
            });
            
            this.socket.on('connect_timeout', () => {
              clearTimeout(timeout);
              reject(new Error('Socket connection timeout'));
            });
          });
          
          // Set up other event handlers
          this.setupSocketEventHandlers();
          this.isConnected = true;
          
        } catch (socketError) {
          console.warn('[MCP] Socket connection failed, falling back to REST:', socketError);
          // Use REST API fallback for MCP
          this.isConnected = true; // For mock/fallback implementation
        }
      } else {
        console.warn('[MCP] Socket.IO not available, using REST fallback');
        // Use REST API fallback for MCP
        this.isConnected = true; // For mock/fallback implementation
      }
      
      // Notify any connection listeners
      this.notifyConnectionListeners();
      
      console.log(`[MCP] Connected to ${serverUrl}`);
      return this.isConnected;
    } catch (error) {
      console.error('[MCP] Connection error:', error);
      this.isConnected = false;
      this.notifyConnectionListeners();
      return false;
    }
  }

  /**
   * Disconnects from the MCP service
   */
  async disconnect(): Promise<void> {
    try {
      if (this.socket && this.socketReady) {
        this.socket.disconnect();
        this.socket = null;
        this.socketReady = false;
      }
      
      this.isConnected = false;
      this.serverUrl = null;
      this.token = null;
      
      // Notify any connection listeners
      this.notifyConnectionListeners();
      
      console.log('[MCP] Disconnected');
    } catch (error) {
      console.error('[MCP] Disconnect error:', error);
      throw new Error('Failed to disconnect from MCP service');
    }
  }

  /**
   * Set up socket event handlers
   */
  private setupSocketEventHandlers(): void {
    if (!this.socket) return;
    
    this.socket.on('disconnect', (reason: string) => {
      console.log('[MCP] Socket disconnected:', reason);
      this.socketReady = false;
      // Do not set isConnected to false here, as the socket may reconnect
      // Let socket.io handle reconnections
    });
    
    this.socket.on('error', (error: any) => {
      console.error('[MCP] Socket error:', error);
    });
    
    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`[MCP] Socket reconnected after ${attemptNumber} attempts`);
      this.socketReady = true;
    });
    
    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`[MCP] Socket reconnection attempt ${attemptNumber}`);
    });
    
    this.socket.on('reconnect_error', (error: any) => {
      console.error('[MCP] Socket reconnection error:', error);
    });
    
    this.socket.on('reconnect_failed', () => {
      console.error('[MCP] Socket reconnection failed');
      this.isConnected = false;
      this.socketReady = false;
      this.notifyConnectionListeners();
    });
    
    // Handle token refresh
    this.socket.on('auth_error', async () => {
      try {
        // Get new token from AsyncStorage
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          this.socket.auth.token = token;
          this.socket.connect();
        } else {
          console.error('[MCP] No token available for auth refresh');
          this.isConnected = false;
          this.socketReady = false;
          this.notifyConnectionListeners();
        }
      } catch (error) {
        console.error('[MCP] Socket authentication error:', error);
        this.isConnected = false;
        this.socketReady = false;
        this.notifyConnectionListeners();
      }
    });
  }

  /**
   * Notify all connection listeners of the current connection state
   */
  private notifyConnectionListeners(): void {
    for (const listener of this.connectionListeners) {
      try {
        listener(this.isConnected);
      } catch (error) {
        console.error('[MCP] Error in connection listener:', error);
      }
    }
  }

  /**
   * Add a connection state change listener
   * @param listener Function to call when connection state changes
   * @returns Function to remove the listener
   */
  addConnectionListener(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.push(listener);
    // Call the listener immediately with the current state
    listener(this.isConnected);
    
    // Return a function to remove the listener
    return () => {
      const index = this.connectionListeners.indexOf(listener);
      if (index !== -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  /**
   * Checks connection status
   * @returns True if connected
   */
  isActive(): boolean {
    return this.isConnected;
  }

  /**
   * Process a voice query through the MCP
   * @param query User query string
   * @returns Structured response based on query content
   */
  async processQuery(query: string): Promise<MCPResponse> {
    try {
      // Validate input
      if (!query.trim()) {
        return {
          type: 'error',
          content: 'Query cannot be empty',
          code: 'EMPTY_QUERY'
        };
      }
      
      // Check connection
      if (!this.isConnected) {
        return {
          type: 'error',
          content: 'Not connected to MCP service',
          code: 'NOT_CONNECTED'
        };
      }

      // Try to use WebSocket if available
      if (this.socket && this.socketReady) {
        try {
          return await this.processQueryViaWebSocket(query);
        } catch (socketError) {
          console.error('[MCP] Socket query failed:', socketError);
          // Try REST API fallback if WebSocket fails
          return this.processQueryViaREST(query);
        }
      } else {
        // Use REST API if socket is not available
        return this.processQueryViaREST(query);
      }
    } catch (error) {
      console.error('[MCP] Query processing error:', error);
      return {
        type: 'error',
        content: error instanceof Error ? error.message : 'Failed to process your query',
        code: 'PROCESSING_ERROR'
      };
    }
  }

  /**
   * Process a query via WebSocket
   * @param query The query to process
   * @returns MCP response
   */
  private processQueryViaWebSocket(query: string): Promise<MCPResponse> {
    return new Promise<MCPResponse>((resolve, reject) => {
      if (!this.socket || !this.socketReady) {
        reject(new Error('Socket not connected'));
        return;
      }
      
      // Set timeout for socket response
      const timeout = setTimeout(() => {
        reject(new Error('Socket response timeout'));
      }, this.connectionOptions.timeout);
      
      // Emit query to socket
      this.socket.emit('process_query', { query }, (response: any) => {
        clearTimeout(timeout);
        
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.result);
        }
      });
    });
  }

  /**
   * Process a query via REST API
   * @param query The query to process
   * @returns MCP response
   */
  private async processQueryViaREST(query: string): Promise<MCPResponse> {
    try {
      // Get token for authentication
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Make REST API call
      const response = await fetch(`${API_URL}/mcp/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query,
          format: 'structured' // Request structured response format
        })
      });

      // Handle errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `Query failed with status ${response.status}`;
        
        throw new Error(errorMessage);
      }

      // Parse and return response
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('[MCP] REST API query error:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        return {
          type: 'error',
          content: `Cannot connect to MCP API at ${API_URL}. Please check your network connection.`,
          code: 'NETWORK_ERROR'
        };
      }
      
      // Return error response
      return {
        type: 'error',
        content: error instanceof Error ? error.message : 'Failed to process query via REST API',
        code: 'REST_API_ERROR'
      };
    }
  }
}

// Export a singleton instance
export const mcpService = new MCPService();