/**
 * Planetary API Client
 *
 * Alchemical Principle: This service acts as the "channel" through which
 * elemental energies (astronomical data) flow from the Earth vessel (backend)
 * to the Air vessel (frontend).
 *
 * All planetary calculations are performed on the backend using Swiss Ephemeris,
 * ensuring proper separation of native compilation (Earth) from distributed
 * visualization (Air).
 */

import { z } from "zod";
import { _logger } from "@/lib/logger";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export interface PlanetaryPosition {
  longitude: number; // Ecliptic longitude in degrees (0-360)
  latitude: number; // Ecliptic latitude in degrees
  distance: number; // Distance from Earth in AU
  speed: number; // Degrees per day (negative = retrograde)
}

export interface PlanetaryPositions {
  [planet: string]: PlanetaryPosition;
}

export interface HouseSystem {
  houses: number[]; // 12 house cusps in degrees
  ascendant: number; // Rising sign degree
  mc: number; // Midheaven degree
}

export interface ConsciousnessParameters {
  spirit: number; // Fire element (0-1)
  essence: number; // Air element (0-1)
  matter: number; // Water element (0-1)
  substance: number; // Earth element (0-1)
  monicaConstant: number; // (Spirit × φ + Essence) / (Matter + Substance + 1)
  planetaryInfluences: Record<string, { element: string; strength: number }>;
}

export interface BackendResponse<T> {
  success: boolean;
  data: T;
  metadata?: {
    computeTime?: number;
    requestDate?: string;
    totalPlanets?: number;
    coordinates?: { latitude: number; longitude: number } | null;
    [key: string]: unknown;
  };
  error?: string;
}

export interface AvailablePlanet {
  id: string;
  name: string;
  element: string;
  alchemy: {
    spirit: number;
    essence: number;
    matter: number;
    substance: number;
  };
}

const planetaryPositionSchema: z.ZodType<PlanetaryPosition> = z.object({
  longitude: z.number().finite(),
  latitude: z.number().finite(),
  distance: z.number().finite(),
  speed: z.number().finite(),
});

const planetaryPositionsSchema: z.ZodType<PlanetaryPositions> = z.record(
  z.string(),
  planetaryPositionSchema,
);

const houseSystemSchema: z.ZodType<HouseSystem> = z.object({
  houses: z.array(z.number().finite()).length(12),
  ascendant: z.number().finite(),
  mc: z.number().finite(),
});

const consciousnessParametersSchema: z.ZodType<ConsciousnessParameters> =
  z.object({
    spirit: z.number().finite(),
    essence: z.number().finite(),
    matter: z.number().finite(),
    substance: z.number().finite(),
    monicaConstant: z.number().finite(),
    planetaryInfluences: z.record(
      z.string(),
      z.object({ element: z.string(), strength: z.number().finite() }),
    ),
  });

const availablePlanetSchema: z.ZodType<AvailablePlanet> = z.object({
  id: z.string(),
  name: z.string(),
  element: z.string(),
  alchemy: z.object({
    spirit: z.number().finite(),
    essence: z.number().finite(),
    matter: z.number().finite(),
    substance: z.number().finite(),
  }),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readPayloadError(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined;
  return typeof payload.error === "string" ? payload.error : undefined;
}

async function readResponseError(response: Response): Promise<string> {
  const payload: unknown = await response.json().catch(() => null);
  return readPayloadError(payload) ?? "";
}

async function readBackendData<T>(
  response: Response,
  schema: z.ZodType<T>,
): Promise<T> {
  const payload: unknown = await response.json();
  if (!isRecord(payload) || typeof payload.success !== "boolean") {
    throw new Error("Backend response did not match the expected envelope");
  }
  if (!payload.success) {
    throw new Error(readPayloadError(payload) ?? "Backend returned unsuccessful response");
  }

  const parsed = schema.safeParse(payload.data);
  if (!parsed.success) {
    throw new Error("Backend response data did not match the expected contract");
  }
  return parsed.data;
}

export class PlanetaryAPIClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get planetary positions for a given moment in time
   * Traditional correspondence: Queries the celestial sphere positions
   */
  async getPlanetaryPositions(
    date: Date,
    latitude?: number,
    longitude?: number,
    planets?: string[],
  ): Promise<PlanetaryPositions> {
    try {
      const response = await fetch(`${this.baseUrl}/api/planets/positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: date.toISOString(),
          latitude,
          longitude,
          planets: planets ?? [
            'sun',
            'moon',
            'mercury',
            'venus',
            'mars',
            'jupiter',
            'saturn',
            'uranus',
            'neptune',
            'pluto',
          ],
        }),
      });

      if (!response.ok) {
        const errorMessage = await readResponseError(response);
        throw new Error(
          `Failed to fetch planetary positions: ${response.statusText} - ${errorMessage}`,
        );
      }

      return await readBackendData(response, planetaryPositionsSchema);
    } catch (error) {
      _logger.error("[PlanetaryAPIClient] getPlanetaryPositions error", error);
      throw error;
    }
  }

  /**
   * Get planetary positions in batch
   */
  async getBatchPlanetaryPositions(
    requests: Array<{ date: Date; planet: string }>,
  ): Promise<Array<{ date: string; planet: string; position: PlanetaryPosition | null }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/planets/batch-positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: requests.map((req) => ({
            date: req.date.toISOString(),
            planet: req.planet,
          })),
        }),
      });

      if (!response.ok) {
        const errorMessage = await readResponseError(response);
        throw new Error(
          `Failed to fetch batch planetary positions: ${response.statusText} - ${errorMessage}`,
        );
      }

      const batchSchema = z.array(
        z.object({
          date: z.string(),
          planet: z.string(),
          position: planetaryPositionSchema.nullable(),
        }),
      );
      return await readBackendData(response, batchSchema);
    } catch (error) {
      _logger.error(
        "[PlanetaryAPIClient] getBatchPlanetaryPositions error",
        error,
      );
      throw error;
    }
  }

  /**
   * Calculate house system for a birth chart
   * Traditional correspondence: Divides the celestial sphere into 12 houses
   */
  async getHouseSystem(
    date: Date,
    latitude: number,
    longitude: number,
    houseSystem = "P", // Placidus
  ): Promise<HouseSystem> {
    try {
      const response = await fetch(`${this.baseUrl}/api/planets/houses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: date.toISOString(),
          latitude,
          longitude,
          houseSystem,
        }),
      });

      if (!response.ok) {
        const errorMessage = await readResponseError(response);
        throw new Error(
          `Failed to fetch house system: ${response.statusText} - ${errorMessage}`,
        );
      }

      return await readBackendData(response, houseSystemSchema);
    } catch (error) {
      _logger.error("[PlanetaryAPIClient] getHouseSystem error", error);
      throw error;
    }
  }

  /**
   * Calculate consciousness parameters from birth data and current transits
   * Traditional correspondence: Synthesizes elemental energies from planetary configurations
   */
  async calculateConsciousness(
    birthDate: Date,
    birthLatitude?: number,
    birthLongitude?: number,
    currentDate?: Date,
  ): Promise<ConsciousnessParameters> {
    try {
      const response = await fetch(`${this.baseUrl}/api/planets/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData: {
            date: birthDate.toISOString(),
            latitude: birthLatitude,
            longitude: birthLongitude,
          },
          currentDate: (currentDate ?? new Date()).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorMessage = await readResponseError(response);
        throw new Error(
          `Failed to calculate consciousness: ${response.statusText} - ${errorMessage}`,
        );
      }

      return await readBackendData(response, consciousnessParametersSchema);
    } catch (error) {
      _logger.error("[PlanetaryAPIClient] calculateConsciousness error", error);
      throw error;
    }
  }

  /**
   * Get available planets for calculation
   */
  async getAvailablePlanets(): Promise<AvailablePlanet[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/planets/available`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch available planets: ${response.statusText}`,
        );
      }

      return await readBackendData(response, z.array(availablePlanetSchema));
    } catch (error) {
      _logger.error("[PlanetaryAPIClient] getAvailablePlanets error", error);
      throw error;
    }
  }

  /**
   * Health check for backend connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      return response.ok;
    } catch (error) {
      _logger.error("[PlanetaryAPIClient] Health check failed", error);
      return false;
    }
  }
}

// Export singleton instance
export const planetaryAPI = new PlanetaryAPIClient();
