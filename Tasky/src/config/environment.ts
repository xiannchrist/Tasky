const getApiBaseUrl = (): string => {
  const rawUrl = process.env.EXPO_PUBLIC_API_URL || 'https://tasky-backend-g03g.onrender.com/api';
  const clean = rawUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

export const ENV = {
  // Application Environment
  APP_ENV: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',

  // Live Cloud API Endpoint (auto-normalized with /api)
  API_BASE_URL: getApiBaseUrl(),

  // Network request timeout (30s to handle Render free-tier spin-up/cold starts)
  API_TIMEOUT_MS: 30000,

  // App Metadata
  APP_NAME: 'Tasky',
  APP_VERSION: '1.0.0',
  ENABLE_ANALYTICS: false,
};

export default ENV;
