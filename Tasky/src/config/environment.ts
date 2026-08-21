/**
 * Tasky Mobile — Production Environment Configuration
 */

export const ENV = {
  // Application Environment
  APP_ENV: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',

  // Live Cloud API Endpoint or local fallback
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://tasky-backend-g03g.onrender.com/api',

  // Network request timeout (15s)
  API_TIMEOUT_MS: 15000,

  // App Metadata
  APP_NAME: 'Tasky',
  APP_VERSION: '1.0.0',
  ENABLE_ANALYTICS: false,
};

export default ENV;
