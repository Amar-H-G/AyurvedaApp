/**
 * Environment configuration
 * In production this would use react-native-config or similar.
 * Values are set here as constants for the assignment (mock app).
 */

export const ENV = {
  APP_ENV: 'development' as 'development' | 'staging' | 'production',
  API_BASE_URL: 'https://api.ayurvedaapp.mock',
  API_TIMEOUT_MS: 10_000,
  MOCK_API_LATENCY_MS: 800,
  MOCK_FAILURE_RATE: 0.05, // 5% random failure rate for demo
  PAGE_SIZE_DOCTORS: 20,
  PAGE_SIZE_PRODUCTS: 20,
  PAGE_SIZE_RECORDS: 30,
  SEARCH_DEBOUNCE_MS: 300,
  SYNC_RETRY_MAX: 3,
  SYNC_RETRY_DELAY_MS: 2000,
  LOG_LEVEL: 'debug' as 'debug' | 'info' | 'warn' | 'error' | 'none',
  FEATURE_FLAGS_REFRESH_INTERVAL_MS: 60_000,
} as const;

export type AppEnv = typeof ENV.APP_ENV;
export type LogLevel = typeof ENV.LOG_LEVEL;
