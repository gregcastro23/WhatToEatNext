import { PlanetaryHourCalculator } from '@/lib/PlanetaryHourCalculator';
import type { Planet } from '@/types/celestial';

type Coordinates = { latitude: number, longitude: number };

export interface PlanetaryHourResult {
  planet: Planet,
  hourNumber?: number,
  isDaytime: boolean,
  start?: Date,
  end?: Date
}

interface BackendPlanetaryHourPayload {
  planet: Planet,
  hourNumber?: number,
  isDaytime: boolean,
  start?: string,
  end?: string
}

function parseBackendResult(data: unknown): PlanetaryHourResult | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  const planet = obj.planet;
  const isDaytime = obj.isDaytime;

  if (typeof planet !== 'string' || typeof isDaytime !== 'boolean') return null;

  const hourNumber = typeof obj.hourNumber === 'number' ? obj.hourNumber : undefined;
  const start = typeof obj.start === 'string' ? new Date(obj.start) : undefined;
  const end = typeof obj.end === 'string' ? new Date(obj.end) : undefined;

  return { planet: planet as Planet, hourNumber, isDaytime, start, end };
}

/**
 * Env flags required (set in .env.local):
 * - NEXT_PUBLIC_BACKEND_URL: e.g., http://localhost:8000
 * - NEXT_PUBLIC_WEBSOCKET_URL: e.g., ws://localhost:8001 (used by usePlanetaryWebSocket)
 * - NEXT_PUBLIC_PLANETARY_HOURS_BACKEND: 'true' to enable backend-first calls
 */
export class PlanetaryHoursClient {
  private readonly backendUrl: string | undefined;
  private readonly useBackend: boolean;

  constructor() {
    this.backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    this.useBackend = String(process.env.NEXT_PUBLIC_PLANETARY_HOURS_BACKEND).toLowerCase() === 'true';
  }

  async getCurrentPlanetaryHour(params: {
    datetime?: Date,
    location?: Coordinates
  } = {}): Promise<PlanetaryHourResult> {
    const targetDate = params.datetime || new Date();
    const location = params.location;

    if (this.useBackend && this.backendUrl) {
      try {
        const url = new URL('/api/planetary/current', this.backendUrl);
        if (location) {
          url.searchParams.set('lat', String(location.latitude));
          url.searchParams.set('lon', String(location.longitude));
        }
        url.searchParams.set('timestamp', targetDate.toISOString());

        const res = await fetch(url.toString(), {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error(`Backend error ${res.status}`);

        const data = (await res.json()) as BackendPlanetaryHourPayload | Record<string, unknown>;
        const parsed = parseBackendResult(data);
        if (parsed) return parsed;
      } catch (error) {
        // Fall through to local calculation
        // eslint-disable-next-line no-console
        console.warn('PlanetaryHoursClient backend failed, using local calculator:', error);
      }
    }

    // Local fallback using PlanetaryHourCalculator
    const calculator = new PlanetaryHourCalculator(
      location?.latitude,
      location?.longitude,
    );
    const detailed = calculator.getCurrentPlanetaryHourDetailed(targetDate);
    return {
      planet: detailed.planet,
      hourNumber: detailed.hourNumber,
      isDaytime: detailed.isDaytime,
      start: detailed.start,
      end: detailed.end
    };
  }
}

export const planetaryHoursClient = new PlanetaryHoursClient();
