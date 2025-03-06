declare module '@env' {
  export const PROXY_URL: string;
  export const API_URL: string;
  export const TEST_USER_URL: string;
  export const TEST_USER_USERNAME: string;
  export const TEST_USER_PASSWORD: string;
  export const APP_ENV: 'development' | 'production' | 'test';
  export const APP_VERSION: string;
}