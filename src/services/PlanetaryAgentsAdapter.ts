/**
 * 🌟 Planetary Agents Backend Adapter
 * Transforms planetary-agents backend responses into kinetics-compatible format
 *
 * This adapter bridges the gap between:
 * - Planetary Agents Backend (localhost:8000)
 * - PlanetaryKineticsClient expectations
 */

import { _logger } from '@/lib/logger';
import type {
  KineticsResponse,
  KineticsRequest,
  KineticsLocation,
  KineticsOptions,
  GroupDynamicsResponse
} from '@/types/kinetics';

interface PlanetaryHourResponse {
  success: boolean,
  data: {
    planet: string,
    dayType: 'day' | 'night'
    hourIndex: number,
    startTime: string,
    endTime: string,
    nextTransition: string,
    modifiers: {
      Spirit?: number,
      Essence?: number,
      Matter?: number,
      Substance?: number,
      Air?: number,
      Fire?: number,
      Water?: number,
      Earth?: number,
      substance?: number; // lowercase variant
    };
  };
  metadata: {
    computeTime: number,
    requestTime: string,
    location: KineticsLocation;
  };
}

interface PlanetaryForecastResponse {
  success: boolean,
  data: {
    hours: Array<{
      planet: string,
      startTime: string,
      endTime: string,
      dayType: 'day' | 'night'
      modifiers: Record<string, number>;
    }>;
  };
  metadata: {
    computeTime: number,
    startDate: string,
    endDate: string,
    location: KineticsLocation;
  };
}

export class PlanetaryAgentsAdapter {
  private baseUrl: string,

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Transform planetary hour data into kinetics response format
   */
  async getEnhancedKinetics(
    location: KineticsLocation,
    options: KineticsOptions = {}
  ): Promise<KineticsResponse> {
    try {
      // Fetch current planetary hour
      const planetaryHour = await this.fetchPlanetaryHour(location);

      // Fetch forecast for power prediction
      const forecast = await this.fetchPlanetaryForecast(location);

      // Transform to kinetics format
      return this.transformToKineticsResponse(planetaryHour, forecast, options);
    } catch (error) {
      _logger.warn('PlanetaryAgentsAdapter: Failed to get enhanced kinetics', error);
      throw error;
    }
  }

  /**
   * Fetch current planetary hour from backend
   */
  private async fetchPlanetaryHour(location: KineticsLocation): Promise<PlanetaryHourResponse> {
    const response = await fetch(`${this.baseUrl}/api/planetary/current-hour`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location,
        datetime: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    });

    if (!response.ok) {
      throw new Error(`Planetary hour fetch failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetch planetary forecast from backend
   */
  private async fetchPlanetaryForecast(location: KineticsLocation): Promise<PlanetaryForecastResponse> {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const response = await fetch(`${this.baseUrl}/api/planetary/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location,
        startDate: now.toISOString(),
        endDate: tomorrow.toISOString(),
        interval: 60 // hourly intervals
      })
    });

    if (!response.ok) {
      _logger.warn('PlanetaryAgentsAdapter: Forecast fetch failed, using fallback');
      return this.createFallbackForecast(location);
    }

    return response.json();
  }

  /**
   * Transform planetary data to kinetics format
   */
  private transformToKineticsResponse(
    planetaryHour: PlanetaryHourResponse,
    forecast: PlanetaryForecastResponse,
    options: KineticsOptions
  ): KineticsResponse {
    const currentHour = new Date().getHours();
    const { planet, modifiers } = planetaryHour.data;

    // Calculate power based on planetary hour
    const planetaryPower = this.calculatePlanetaryPower(planet, planetaryHour.data.dayType);

    // Extract elemental totals from modifiers
    const elementalTotals = this.extractElementalTotals(modifiers);

    // Generate power predictions for next 24 hours
    const powerPredictions = this.generatePowerPredictions(forecast, currentHour);

    // Determine trend based on power predictions
    const trend = this.determineTrend(powerPredictions);

    return {
      success: true,
      data: {
        base: {
          power: powerPredictions,
          timing: {
            planetaryHours: this.extractPlanetarySequence(forecast),
            seasonalInfluence: this.getCurrentSeason()
          },
          elemental: {
            totals: elementalTotals
          }
        },
        agentOptimization: options.includeAgentOptimization ? {
          recommendedAgents: [planet.toLowerCase()],
          powerAmplification: planetaryPower * 2,
          harmonyScore: planetaryPower
        } : undefined,
        powerPrediction: options.includePowerPrediction ? {
          nextPeak: this.findNextPeak(powerPredictions),
          trend,
          confidence: 0.85
} : undefined,
        resonanceMap: options.includeResonanceMap ? {
          nodes: this.generateResonanceNodes(planet, elementalTotals),
          connections: []
        } : undefined
      },
      computeTimeMs: planetaryHour.metadata.computeTime,
      cacheHit: false,
      metadata: {
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Calculate power level based on planetary ruler
   */
  private calculatePlanetaryPower(planet: string, dayType: 'day' | 'night'): number {
    const planetPowers: Record<string, number> = {
      'Sun': 1.0,
      'Moon': 0.9,
      'Mercury': 0.7,
      'Venus': 0.8,
      'Mars': 0.85,
      'Jupiter': 0.95,
      'Saturn': 0.6,
    };

    const basePower = planetPowers[planet] || 0.5;

    // Adjust for day/night
    if (dayType === 'day' && planet === 'Sun') return 1.0;
    if (dayType === 'night' && planet === 'Moon') return 0.95;

    return basePower * (dayType === 'day' ? 1.1 : 0.9);
  }

  /**
   * Extract elemental totals from modifiers
   */
  private extractElementalTotals(modifiers: Record<string, number>): Record<string, number> {
    const elements = ['Fire', 'Water', 'Earth', 'Air'];
    const totals: Record<string, number> = {};

    elements.forEach(element => {
      totals[element] = modifiers[element] || 2.5, // Default baseline
    });

    // Add alchemical properties influence
    if (modifiers.Spirit) totals.Fire += modifiers.Spirit * 2;
    if (modifiers.Essence) totals.Water += modifiers.Essence * 2;
    if (modifiers.Matter) totals.Earth += modifiers.Matter * 2;
    if (modifiers.Substance || modifiers.substance) {
      totals.Air += (modifiers.Substance || modifiers.substance || 0) * 2;
    }

    return totals;
  }

  /**
   * Generate power predictions for next 24 hours
   */
  private generatePowerPredictions(
    forecast: PlanetaryForecastResponse,
    currentHour: number
  ): Array<{ hour: number; power: number; planetary: string }> {
    const predictions: Array<{ hour: number; power: number; planetary: string }> = [];

    // Use forecast data if available
    if (forecast.data?.hours?.length > 0) {
      forecast.data.hours.slice(0, 24).forEach((hourData, index) => {
        const hour = (currentHour + index) % 24;
        const power = this.calculatePlanetaryPower(
          hourData.planet,
          hourData.dayType
        );
        predictions.push({ hour, power, planetary: hourData.planet });
      });
    } else {
      // Fallback: Generate synthetic predictions
      for (let i = 0; i < 24; i++) {
        const hour = (currentHour + i) % 24;
        const planet = this.getPlanetForHour(hour);
        const dayType = hour >= 6 && hour < 18 ? 'day' : 'night',
        predictions.push({
          hour,
          power: this.calculatePlanetaryPower(planet, dayType),
          planetary: planet
        });
      }
    }

    return predictions;
  }

  /**
   * Extract planetary sequence from forecast
   */
  private extractPlanetarySequence(forecast: PlanetaryForecastResponse): string[] {
    if (forecast.data?.hours?.length > 0) {
      return [...new Set(forecast.data.hours.map(h => h.planet))].slice(0, 3);
    }
    return ['Sun', 'Venus', 'Mercury']; // Default sequence
  }

  /**
   * Determine power trend
   */
  private determineTrend(predictions: Array<{ hour: number, power: number, planetary: string }>
  ): 'ascending' | 'descending' | 'stable' {
    if (predictions.length < 3) return 'stable';

    const firstThird = predictions.slice(0, 8).reduce((sum, p) => sum + p.power, 0) / 8;
    const lastThird = predictions.slice(16, 24).reduce((sum, p) => sum + p.power, 0) / 8;

    const diff = lastThird - firstThird;
    if (Math.abs(diff) < 0.1) return 'stable';
    return diff > 0 ? 'ascending' : 'descending';
  }

  /**
   * Find next power peak time
   */
  private findNextPeak(predictions: Array<{ hour: number, power: number, planetary: string }>
  ): string {
    const maxPower = Math.max(...predictions.map(p => p.power));
    const peakPrediction = predictions.find(p => p.power === maxPower);

    if (!peakPrediction) {
      return new Date(Date.now() + 3600000).toISOString();
    }

    const now = new Date();
    const peakTime = new Date(now);
    peakTime.setHours(peakPrediction.hour, 0, 0, 0);

    if (peakTime < now) {
      peakTime.setDate(peakTime.getDate() + 1);
    }

    return peakTime.toISOString();
  }

  /**
   * Generate resonance nodes for visualization
   */
  private generateResonanceNodes(
    planet: string,
    elementalTotals: Record<string, number>
  ): Array<{ id: string; power: number; element: string }> {
    return Object.entries(elementalTotals).map(([element, power]) => ({
      id: `${planet}-${element}`,
      power,
      element
    }));
  }

  /**
   * Get current season
   */
  private getCurrentSeason(): 'Winter' | 'Spring' | 'Summer' | 'Autumn' {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Autumn';
    return 'Winter';
  }

  /**
   * Get planet for a given hour (Chaldean order)
   */
  private getPlanetForHour(hour: number): string {
    const planets = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
    return planets[hour % 7];
  }

  /**
   * Create fallback forecast response
   */
  private createFallbackForecast(location: KineticsLocation): PlanetaryForecastResponse {
    return {
      success: true,
      data: { hours: [] },
      metadata: {
        computeTime: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        location
      }
    };
  }

  /**
   * Transform group dynamics (placeholder for future implementation)
   */
  async getGroupDynamics(
    userIds: string[],
    location: KineticsLocation
  ): Promise<GroupDynamicsResponse> {
    // For now, return a simple harmonized response
    const individualContributions: { [key: string]: { powerContribution: number; harmonyImpact: number } } = {},

    userIds.forEach(id => {
      individualContributions[id] = {
        powerContribution: 0.7 + Math.random() * 0.3,
        harmonyImpact: 0.6 + Math.random() * 0.4
      };
    });

    return {
      success: true,
      data: {
        harmony: 0.75,
        powerAmplification: 1.2,
        momentumFlow: 'harmonious',
        groupResonance: 0.8,
        individualContributions
      },
      computeTimeMs: 10,
      cacheHit: false,
      metadata: {
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Export singleton instance
export const planetaryAgentsAdapter = new PlanetaryAgentsAdapter(
  process.env.NEXT_PUBLIC_PLANETARY_KINETICS_URL || 'http://localhost:8000'
);