/**
 * Planetary Kinetics Client
 *
 * Wraps the kinetics calculation engine with caching and provides
 * real-time planetary kinetic metrics via the P=IV circuit model.
 */

import { calculateKinetics } from "@/calculations/kinetics";
import type {
  GroupDynamicsResponse,
  KineticMetrics as FullKineticMetrics,
} from "@/types/kinetics";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";
import { calculateAspects } from "@/utils/astrologyUtils";
import { computeGroupDynamics } from "@/utils/groupDynamics";
import { logger } from "@/utils/logger";

export interface KineticsOptions {
  includeThermodynamics?: boolean;
  useCache?: boolean;
  cacheTimeout?: number;
}

export interface KineticMetrics {
  velocity: Record<string, number>;
  momentum: Record<string, number>;
  forceMagnitude: number;
  power: number;
  efficiency: number;
  aspectPhase: string;
  thermalDirection: "heating" | "cooling" | "stable";
}

export interface KineticsResponse {
  success: boolean;
  data?: KineticMetrics;
  error?: string;
  timestamp: string;
  cacheHit?: boolean;
}

export interface KineticsLocation {
  latitude: number;
  longitude: number;
}

export class PlanetaryKineticsClient {
  private static instance: PlanetaryKineticsClient;
  private readonly cache: Map<string, { data: KineticMetrics; timestamp: number }> =
    new Map();
  private previousPositions: Record<string, string> | null = null;
  private lastCalculationTime: number = 0;

  private constructor() {}

  public static getInstance(): PlanetaryKineticsClient {
    if (!PlanetaryKineticsClient.instance) {
      PlanetaryKineticsClient.instance = new PlanetaryKineticsClient();
    }
    return PlanetaryKineticsClient.instance;
  }

  /**
   * Get enhanced kinetics for a location using real planetary positions
   */
  async getEnhancedKinetics(
    location: KineticsLocation,
    options: KineticsOptions = {},
  ): Promise<KineticsResponse> {
    try {
      const cacheKey = `kinetics_${location.latitude}_${location.longitude}`;
      const now = Date.now();
      const cacheTimeout = options.cacheTimeout || 5 * 60 * 1000; // 5 minutes

      // Check cache
      if (options.useCache !== false) {
        const cached = this.cache.get(cacheKey);
        if (cached && now - cached.timestamp < cacheTimeout) {
          return {
            success: true,
            data: cached.data,
            timestamp: new Date().toISOString(),
            cacheHit: true,
          };
        }
      }

      // Get real planetary positions
      const rawPositions = getAccuratePlanetaryPositions(new Date());

      // Convert to Record<string, string> (planet → sign) for calculateKinetics
      const currentPositions: Record<string, string> = {};
      const aspectInput: Record<string, { sign: string; degree: number }> = {};

      for (const [planet, data] of Object.entries(rawPositions)) {
        if (data && typeof data === "object" && "sign" in data) {
          currentPositions[planet] = String((data as any).sign);
          aspectInput[planet] = {
            sign: String((data as any).sign),
            degree: Number((data as any).degree) || 0,
          };
        }
      }

      // Calculate time interval from last calculation
      const timeInterval =
        this.lastCalculationTime > 0
          ? (now - this.lastCalculationTime) / 1000
          : 3600; // Default 1 hour on first call

      // Run the P=IV kinetics calculation
      const fullMetrics: FullKineticMetrics = calculateKinetics({
        currentPlanetaryPositions: currentPositions,
        previousPlanetaryPositions: this.previousPositions || undefined,
        timeInterval,
      });

      // Calculate efficiency from aspect harmony
      const efficiency = this.calculateAspectEfficiency(aspectInput);

      // Map full KineticMetrics to simplified client interface
      const data: KineticMetrics = {
        velocity: fullMetrics.velocity,
        momentum: fullMetrics.momentum,
        forceMagnitude: fullMetrics.forceMagnitude,
        power: fullMetrics.power,
        efficiency,
        aspectPhase: fullMetrics.aspectPhase?.type || "stable",
        thermalDirection: fullMetrics.thermalDirection,
      };

      // Save state for next calculation
      this.previousPositions = currentPositions;
      this.lastCalculationTime = now;

      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: now });

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        cacheHit: false,
      };
    } catch (error) {
      logger.error("Error in getEnhancedKinetics:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Calculate efficiency from aspect harmony.
   * Ratio of harmonious aspects (trine, sextile, conjunction) to total aspects.
   */
  private calculateAspectEfficiency(
    positions: Record<string, { sign: string; degree: number }>,
  ): number {
    try {
      const { aspects } = calculateAspects(positions);
      if (!aspects || aspects.length === 0) return 0.5; // neutral default

      const harmoniousTypes = new Set(["trine", "sextile", "conjunction"]);
      const harmoniousCount = aspects.filter((a) =>
        harmoniousTypes.has(String((a as any).type || (a as any).aspectType || "")),
      ).length;

      return aspects.length > 0 ? harmoniousCount / aspects.length : 0.5;
    } catch {
      return 0.5;
    }
  }

  /**
   * Compute group dynamics from per-user elemental profiles.
   *
   * Loads each user's primary saved chart, aggregates elemental balance,
   * and returns pairwise-harmony-based group metrics. Users without a chart
   * on file contribute zero — the response reports how many were found.
   */
  async getGroupDynamics(
    userIds: string[],
    _location: KineticsLocation,
  ): Promise<GroupDynamicsResponse> {
    const start = Date.now();
    const dynamics = await computeGroupDynamics(userIds);
    const computeTimeMs = Date.now() - start;

    if (dynamics.profilesMissing > 0) {
      logger.info(
        `getGroupDynamics: ${dynamics.profilesFound}/${userIds.length} users have elemental profiles on file.`,
      );
    }

    const { profilesFound: _f, profilesMissing: _m, ...data } = dynamics;
    return {
      success: true,
      data,
      computeTimeMs,
      cacheHit: false,
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  /**
   * Health check
   */
  async checkHealth(): Promise<boolean> {
    return true;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.previousPositions = null;
    this.lastCalculationTime = 0;
    logger.debug("PlanetaryKineticsClient cache cleared");
  }
}

// Export singleton instance
export const planetaryKineticsClient = PlanetaryKineticsClient.getInstance();
