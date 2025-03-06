// Mock implementation of the Model Context Protocol SDK

export interface MCPResponse {
  type: 'text' | 'image' | 'list' | 'table' | 'error';
  content: any;
}

export class MCPService {
  private isConnected: boolean = false;
  private serverUrl: string | null = null;
  private token: string | null = null;

  connect(serverUrl: string, token: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        this.serverUrl = serverUrl;
        this.token = token;
        console.log(`[MCP] Connected to ${serverUrl}`);
        resolve(true);
      }, 500);
    });
  }

  disconnect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = false;
        this.serverUrl = null;
        this.token = null;
        console.log('[MCP] Disconnected');
        resolve();
      }, 200);
    });
  }

  async processQuery(query: string): Promise<MCPResponse> {
    if (!this.isConnected) {
      return {
        type: 'error',
        content: 'Not connected to MCP service'
      };
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, generate different response types based on the query
    if (query.toLowerCase().includes('hello') || query.toLowerCase().includes('hi')) {
      return {
        type: 'text',
        content: 'Hello! How can I assist you with Odoo today?'
      };
    } else if (query.toLowerCase().includes('list') || query.toLowerCase().includes('show me')) {
      return {
        type: 'list',
        content: {
          title: 'Sample List',
          items: [
            'Sales Orders: 24 open orders',
            'Invoices: 12 to approve',
            'Inventory: 5 products low on stock',
            'CRM: 8 opportunities to follow up'
          ]
        }
      };
    } else if (query.toLowerCase().includes('report') || query.toLowerCase().includes('numbers')) {
      return {
        type: 'table',
        content: {
          headers: ['Product', 'Quantity', 'Value'],
          rows: [
            ['Laptop Pro', '125', '$187,500'],
            ['Smartphone X', '310', '$155,000'],
            ['Tablet Mini', '89', '$26,700'],
            ['Accessories', '450', '$13,500']
          ]
        }
      };
    } else if (query.toLowerCase().includes('chart') || query.toLowerCase().includes('graph')) {
      return {
        type: 'image',
        content: 'https://via.placeholder.com/300x200?text=Sample+Chart'
      };
    } else {
      return {
        type: 'text',
        content: `I processed your query: "${query}". How can I help you further?`
      };
    }
  }
}

// Export a singleton instance
export const mcpService = new MCPService();