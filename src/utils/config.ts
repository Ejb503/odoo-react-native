/**
 * Application configuration
 * Contains hardcoded configuration values for the application
 */

// Server configuration
// In a production environment, you would set this to your actual production server
export const PROXY_URL = 'http://172.31.174.192:3000';
export const API_URL = `${PROXY_URL}/api`;
export const SOCKET_URL = PROXY_URL;

// Authentication
export const DEFAULT_ODOO_URL = 'https://meraik-enterprise-ed.odoo.com';

// App information
export const APP_VERSION = '1.0.0';
export const APP_NAME = 'Odoo Voice Assistant';

// Development configuration
export const __DEV__ = process.env.NODE_ENV === 'development';
export const SKIP_AUTH_ENABLED = __DEV__;