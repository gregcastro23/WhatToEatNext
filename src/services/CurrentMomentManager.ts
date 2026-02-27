/**
 * Central Current Moment Management System
 *
 * This service manages planetary positions, providing current moment data
 * for recommendation calculations and astrological state.
 *
 * NOTE: File-system propagation (writing to .ipynb, .ts files) has been removed.
 * Those operations caused hangs in serverless environments (Vercel) and blocking
 * behavior during concurrent requests. Source files should not be mutated at runtime.
 */

import { FOREST_HILLS_COORDINATES } from "@/config/locationConfig";
import {
  getCurrentPlanetaryPositions,
  getPlanetaryPositionsForDateTime,
} from "@/services/astrologizeApi";
import {
  calculatePlanetaryPositions as calculateLocalPlanetaryPositions,
  type PlanetPosition
} from "@/utils/astrologyUtils";
import { createLogger } from "@/utils/logger";

const logger = createLogger("CurrentMomentManager");

// Current moment data structure
export interface CurrentMomentData {
  timestamp: string;
  date: string;
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  planetaryPositions: Record<string, PlanetPosition>;
  metadata: {
    source: "api" | "calculated" | "fallback";
    apiCallTimestamp?: string;
    lastUpdated: string;
  };
}

// Default location (New York Area)
const DEFAULT_LOCATION = {
  latitude: FOREST_HILLS_COORDINATES.latitude,
  longitude: FOREST_HILLS_COORDINATES.longitude,
  timezone: FOREST_HILLS_COORDINATES.timezone,
};

// Maximum time to wait for an in-flight update before giving up (ms)
const UPDATE_WAIT_TIMEOUT_MS = 10_000;

class CurrentMomentManager {
  private currentMoment: CurrentMomentData | null = null;
  private lastUpdateTime: Date | null = null;
  private updatePromise: Promise<CurrentMomentData> | null = null;

  /**
   * Get current moment data with automatic updates
   */
  async getCurrentMoment(forceRefresh = false): Promise<CurrentMomentData> {
    if (!this.currentMoment || forceRefresh || this.needsUpdate()) {
      return this.updateCurrentMoment();
    }

    return this.currentMoment;
  }

  /**
   * Update current moment from astrologize API.
   *
   * Uses a single shared promise so concurrent callers coalesce into one
   * network request instead of creating a blocking while-loop.
   */
  async updateCurrentMoment(
    customDateTime?: Date,
    customLocation?: { latitude: number; longitude: number },
  ): Promise<CurrentMomentData> {
    // If an update is already in flight, wait for it (with timeout)
    if (this.updatePromise) {
      void logger.info("Update already in progress, awaiting result...");
      try {
        return await Promise.race([
          this.updatePromise,
          new Promise<CurrentMomentData>((_, reject) =>
            setTimeout(() => reject(new Error("Update wait timeout")), UPDATE_WAIT_TIMEOUT_MS)
          ),
        ]);
      } catch {
        // Timed out or existing update failed — return cached data or fallback
        if (this.currentMoment) return this.currentMoment;
        return this.buildFallbackMoment(customDateTime, customLocation);
      }
    }

    // Start a new update and store the promise for deduplication
    this.updatePromise = this.performUpdate(customDateTime, customLocation);

    try {
      const result = await this.updatePromise;
      return result;
    } finally {
      this.updatePromise = null;
    }
  }

  /**
   * Internal update implementation — fetches positions and builds moment data.
   */
  private async performUpdate(
    customDateTime?: Date,
    customLocation?: { latitude: number; longitude: number },
  ): Promise<CurrentMomentData> {
    try {
      void logger.info("Starting current moment update...");

      const targetDate = customDateTime || new Date();
      const location = customLocation || DEFAULT_LOCATION;

      // Get fresh planetary positions from API
      let planetaryPositions: Record<string, PlanetPosition>;
      let source: "api" | "calculated" | "fallback" = "fallback";

      try {
        if (customDateTime) {
          planetaryPositions = await getPlanetaryPositionsForDateTime(
            targetDate,
            location,
          );
        } else {
          planetaryPositions = await getCurrentPlanetaryPositions(location);
        }
        source = "api";
        void logger.info(
          "Successfully retrieved positions from astrologize API",
        );
      } catch (error) {
        void logger.warn(
          "Failed to get positions from API, attempting local calculation fallback",
          error,
        );

        try {
          planetaryPositions = await calculateLocalPlanetaryPositions(targetDate);
          source = "calculated";
          void logger.info("Successfully calculated positions locally as fallback");
        } catch (localError) {
          void logger.error("Local calculation fallback failed, using static fallback", localError);
          planetaryPositions = this.getFallbackPositions();
          source = "fallback";
        }
      }

      this.currentMoment = {
        timestamp: targetDate.toISOString(),
        date: targetDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        }),
        location: {
          ...location,
          timezone: this.getTimezone(targetDate),
        },
        planetaryPositions,
        metadata: {
          source,
          apiCallTimestamp: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        },
      };

      this.lastUpdateTime = new Date();

      void logger.info("Current moment update completed successfully");

      return this.currentMoment;
    } catch (error) {
      void logger.error("Current moment update failed", error);
      // On failure, return cached data or a fallback — never throw and leave callers hanging
      if (this.currentMoment) return this.currentMoment;
      return this.buildFallbackMoment(customDateTime, customLocation);
    }
  }

  /**
   * Build a fallback moment when all else fails, so the app never hangs.
   */
  private buildFallbackMoment(
    customDateTime?: Date,
    customLocation?: { latitude: number; longitude: number },
  ): CurrentMomentData {
    const targetDate = customDateTime || new Date();
    const location = customLocation || DEFAULT_LOCATION;

    return {
      timestamp: targetDate.toISOString(),
      date: targetDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }),
      location: {
        ...location,
        timezone: this.getTimezone(targetDate),
      },
      planetaryPositions: this.getFallbackPositions(),
      metadata: {
        source: "fallback",
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  /**
   * Get timezone for date
   */
  private getTimezone(date: Date): string {
    // Simple timezone detection - could be enhanced
    const month = date.getMonth();
    return month >= 2 && month <= 10 ? "EDT" : "EST";
  }

  /**
   * Check if current moment needs updating (older than 15 minutes)
   */
  private needsUpdate(): boolean {
    if (!this.lastUpdateTime) return true;
    const timeDiff = Date.now() - this.lastUpdateTime.getTime();
    return timeDiff > 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Get fallback positions when API fails
   */
  private getFallbackPositions(): Record<string, PlanetPosition> {
    return {
      Sun: {
        sign: "cancer",
        degree: 10,
        minute: 45,
        exactLongitude: 100.75,
        isRetrograde: false,
      },
      Moon: {
        sign: "libra",
        degree: 18,
        minute: 19,
        exactLongitude: 198.32,
        isRetrograde: false,
      },
      Mercury: {
        sign: "leo",
        degree: 2,
        minute: 9,
        exactLongitude: 122.15,
        isRetrograde: false,
      },
      Venus: {
        sign: "leo",
        degree: 14,
        minute: 51,
        exactLongitude: 134.85,
        isRetrograde: false,
      },
      Mars: {
        sign: "taurus",
        degree: 25,
        minute: 25,
        exactLongitude: 55.42,
        isRetrograde: false,
      },
      Jupiter: {
        sign: "gemini",
        degree: 12,
        minute: 44,
        exactLongitude: 72.73,
        isRetrograde: false,
      },
      Saturn: {
        sign: "pisces",
        degree: 19,
        minute: 17,
        exactLongitude: 349.28,
        isRetrograde: false,
      },
      Uranus: {
        sign: "taurus",
        degree: 26,
        minute: 9,
        exactLongitude: 56.15,
        isRetrograde: false,
      },
      Neptune: {
        sign: "aries",
        degree: 29,
        minute: 55,
        exactLongitude: 29.92,
        isRetrograde: false,
      },
      Pluto: {
        sign: "aquarius",
        degree: 1,
        minute: 53,
        exactLongitude: 301.88,
        isRetrograde: true,
      },
      Ascendant: {
        sign: "capricorn",
        degree: 20,
        minute: 45,
        exactLongitude: 290.75,
        isRetrograde: false,
      },
    };
  }

  /**
   * Trigger an update when alchemize API is called
   */
  async onAlchemizeApiCall(
    planetaryPositions?: Record<string, PlanetPosition>,
  ): Promise<void> {
    if (planetaryPositions) {
      this.currentMoment = {
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        }),
        location: DEFAULT_LOCATION,
        planetaryPositions,
        metadata: {
          source: "api",
          apiCallTimestamp: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        },
      };
      this.lastUpdateTime = new Date();
    } else {
      await this.updateCurrentMoment();
    }
  }

  /**
   * Trigger an update when astrologize API is called
   */
  async onAstrologizeApiCall(
    planetaryPositions?: Record<string, PlanetPosition>,
  ): Promise<void> {
    return this.onAlchemizeApiCall(planetaryPositions);
  }
}

// Export singleton instance
export const currentMomentManager = new CurrentMomentManager();

// Export convenience functions
export const getCurrentMoment = (forceRefresh = false) =>
  currentMomentManager.getCurrentMoment(forceRefresh);
export const updateCurrentMoment = (
  date?: Date,
  location?: { latitude: number; longitude: number },
) => {
  void currentMomentManager.updateCurrentMoment(date, location);
};
export const onAlchemizeApiCall = (
  positions?: Record<string, PlanetPosition>,
) => {
  void currentMomentManager.onAlchemizeApiCall(positions);
};
export const onAstrologizeApiCall = (
  positions?: Record<string, PlanetPosition>,
) => {
  void currentMomentManager.onAstrologizeApiCall(positions);
};
