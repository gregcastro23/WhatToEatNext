import {_getCurrentPlanetaryPositions as apiGetCurrent, getPlanetaryPositionsForDateTime} from '@/services/astrologizeApi';
import {_getAccuratePlanetaryPositions as engGetAccurate} from '@/utils/astrology/positions';
import type { PlanetPosition } from '@/utils/astrologyUtils';
import {createLogger} from '@/utils/logger';

const logger = createLogger('PlanetaryPositionsService')

type PositionRecord = Record<string, PlanetPosition>;

interface CacheEntry {
  key: string,
  positions: PositionRecord,
  timestamp: number
}

const CACHE_TTL_MS = 60 * 1000; // 1 minute
let cache: CacheEntry | null = null;

function makeKey(date?: Date, lat?: number, lon?: number, system?: 'tropical' | 'sidereal') {
  return JSON.stringify({
    t: date ? date.toISOString() : 'now',
    lat: typeof lat === 'number' ? Number(lat.toFixed(3)) : undefined,
    lon: typeof lon === 'number' ? Number(lon.toFixed(3)) : undefined,
    sys: system || 'tropical'
  })
}

function isFresh(entry: CacheEntry | null, key: string): entry is CacheEntry {
  return !!entry && entry.key === key && Date.now() - entry.timestamp < CACHE_TTL_MS
}

function normalizeFromEngine(raw: Record<string, { sign: any; degree: number; exactLongitude: number; isRetrograde: boolean }>): PositionRecord {
  const out: PositionRecord = {};
  Object.entries(raw || {}).forEach(([planet, p]) => {
    out[planet] = {
      sign: (String(p?.sign || 'aries').toLowerCase() as any),
      degree: Number(p?.degree || 0),
      minute: 0,
      exactLongitude: Number(p?.exactLongitude || 0),
      isRetrograde: !!p?.isRetrograde
    };
  })
  return out;
}

export class PlanetaryPositionsService {
  async getCurrent(
    location?: { latitude: number, longitude: number },
    zodiacSystem: 'tropical' | 'sidereal' = 'tropical'
  ): Promise<PositionRecord> {
    const key = makeKey(undefined, location?.latitude, location?.longitude, zodiacSystem)
    if (isFresh(cache, key)) return cache.positions;

    try {
      // Primary: local astrologize API wrapper
      const positions = await apiGetCurrent(location, zodiacSystem)
      cache = { key, positions, timestamp: Date.now() };
      return positions;
    } catch (err) {
      logger.warn('Primary current positions failed, falling back to engine', err)
      const raw = engGetAccurate(new Date())
      const norm = normalizeFromEngine(raw as any)
      cache = { key, positions: norm, timestamp: Date.now() };
      return norm;
    }
  }

  async getForDate(
    date: Date,
    location?: { latitude: number, longitude: number },
    zodiacSystem: 'tropical' | 'sidereal' = 'tropical'
  ): Promise<PositionRecord> {
    const key = makeKey(date, location?.latitude, location?.longitude, zodiacSystem)
    if (isFresh(cache, key)) return cache.positions;

    try {
      // Primary: local astrologize API wrapper
      const positions = await getPlanetaryPositionsForDateTime(date, location, zodiacSystem)
      cache = { key, positions, timestamp: Date.now() };
      return positions;
    } catch (err) {
      logger.warn('Primary dated positions failed, falling back to engine', err)
      const raw = engGetAccurate(date)
      const norm = normalizeFromEngine(raw as any)
      cache = { key, positions: norm, timestamp: Date.now() };
      return norm;
    }
  }
}

export const _planetaryPositionsService = new PlanetaryPositionsService()
