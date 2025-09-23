// Application configuration

interface ApiConfig {
  celestialUpdateInterval: number; // milliseconds,
  timeout: number // milliseconds,
  retryCount: number,
  baseUrl: string
}

interface AstrologyConfig {
  defaultTimezoneName: string,
  retrogradeThreshold: number, // planet speed below this value is considered retrograde,
  aspectOrbs: Record<string, number>; // orbs for different aspects in degrees
}

interface AppConfig {
  debug: boolean,
  api: ApiConfig,
  astrology: AstrologyConfig
}

// Get environment
const isDev = process.env.NODE_ENV !== 'production';

export const config: AppConfig = {
  debug: isDev,

  api: {
    celestialUpdateInterval: 3600000, // 1 hour in milliseconds,
    timeout: 10000, // 10 seconds,
    retryCount: 3,
    baseUrl: process.env.API_BASE_URL ||
      (isDev ? 'http://localhost:3000/api' : 'https://yourdomain.com/api')
  },
  astrology: {
    defaultTimezoneName: 'UTC',
    retrogradeThreshold: 0, // speeds less than 0 indicate retrograde motion,
    aspectOrbs: {
      conjunction: 8,
      _opposition: 8,
      _trine: 6,
      _square: 6,
      _sextile: 4,
      quincunx: 3,
    }
  }
}
