/**
 * 🌟 Planetary Kinetics API Client
 * Real-time consciousness dynamics and temporal food intelligence
 *
 * Integrates with the enhanced kinetics backend to provide: * - Applying/separating planetary aspects
 * - Power prediction and temporal awareness
 * - Group dining optimization
 * - Enhanced food recommendation timing
 */

import { _logger } from '@/lib/logger';
import type {
    GroupDynamicsResponse,
    KineticsCacheEntry,
    KineticsClientConfig,
    KineticsError,
    KineticsLocation,
    KineticsOptions,
    KineticsResponse
} from '@/types/kinetics';
import { planetaryAgentsAdapter } from './PlanetaryAgentsAdapter';

class PlanetaryKineticsClient {
  private readonly config: KineticsClientConfig,
  private readonly cache = new Map<string, KineticsCacheEntry>();
  private readonly isConfigured: boolean,
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor(config?: Partial<KineticsClientConfig>) {
    const apiUrl = process.env.NEXT_PUBLIC_PLANETARY_KINETICS_URL;

    if (!apiUrl) {
      _logger.warn('PlanetaryKineticsClient', 'No API URL configured, using fallback mode');
    }

    this.config = {
      baseUrl: apiUrl ||
               process.env.NEXT_PUBLIC_BACKEND_URL ||
               'https://your-planetary-agents-backend.onrender.com'
      cacheTTL: Number(process.env.NEXT_PUBLIC_KINETICS_CACHE_TTL) || 300000, // 5 minutes
      timeout: 10000, // 10 seconds,
      retryAttempts: 2,
      ...config
    };

    this.isConfigured = !!apiUrl;
  }

  /**
   * Get enhanced kinetics with real-time consciousness dynamics
   */
  async getEnhancedKinetics(
    location: KineticsLocation,
    options: KineticsOptions = {}): Promise<KineticsResponse> {
    // If not properly configured, return fallback immediately
    if (!this.isConfigured) {
      _logger.debug('PlanetaryKineticsClient: Using fallback due to missing configuration'),
      return this.createFallbackResponse(location);
    }

    const cacheKey = this.generateCacheKey('enhanced', location, options);

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      _logger.debug('PlanetaryKineticsClient: Cache hit for enhanced kinetics'),
      return { ...cached, cacheHit: true };
    }

    // Check if request is already in flight
    const existingRequest = this.requestQueue.get(cacheKey);
    if (existingRequest) {
      _logger.debug('PlanetaryKineticsClient: Request already in flight, waiting...');
      return existingRequest;
    }

    // Create new request
    const requestPromise = this.executeKineticsRequest(location, options, cacheKey);
    this.requestQueue.set(cacheKey, requestPromise);

    return requestPromise.finally(() => {
      this.requestQueue.delete(cacheKey);
    });
  }

  private async executeKineticsRequest(
    location: KineticsLocation,
    options: KineticsOptions,
    cacheKey: string): Promise<KineticsResponse> {
    const mergedOptions = {
      includeAgentOptimization: true,
      includePowerPrediction: true,
      includeResonanceMap: false,
      ...options
    };

    try {
      // Use the adapter to get data from planetary agents backend
      const response = await planetaryAgentsAdapter.getEnhancedKinetics(location, mergedOptions);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      _logger.warn('PlanetaryKineticsClient: Enhanced kinetics failed, using fallback', error);
      return this.createFallbackResponse(location);
    }
  }

  /**
   * Get group dynamics for multiple users/agents
   */
  async getGroupDynamics(
    userIds: string[],
    location: KineticsLocation): Promise<GroupDynamicsResponse> {
    const cacheKey = this.generateCacheKey('group', location, { agentIds: userIds }),

    const cached = this.getFromCache(cacheKey);
    if (cached) {
      _logger.debug('PlanetaryKineticsClient: Cache hit for group dynamics'),
      return cached as GroupDynamicsResponse;
    }

    try {
      // Use the adapter for group dynamics
      const response = await planetaryAgentsAdapter.getGroupDynamics(userIds, location);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      _logger.warn('PlanetaryKineticsClient: Group dynamics failed, using fallback', error);
      return this.createFallbackGroupResponse(userIds, location);
    }
  }

  /**
   * Get individual consciousness calculations
   */
  async getConsciousnessData(
    userId: string,
    location: KineticsLocation): Promise<KineticsResponse> {
    const options: KineticsOptions = {
      includeResonanceMap: true,
      agentIds: [userId]
    };

    return this.getEnhancedKinetics(location, options);
  }

  /**
   * Health check for kinetics API
   */
  async checkHealth(): Promise<{ status: 'healthy' | 'degraded' | 'offline'; latency: number }> {
    const start = performance.now();

    try {
      const response = await fetch(`${this.config.baseUrl}/api/kinetics/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(this.config.timeout)
      });

      const latency = performance.now() - start;

      if (response.ok) {
        return { status: 'healthy', latency };
      } else {
        return { status: 'degraded', latency };
      }
    } catch (error) {
      const latency = performance.now() - start;
      _logger.warn('PlanetaryKineticsClient: Health check failed', error);
      return { status: 'offline', latency };
    }
  }

  /**
   * Clear cache (useful for debugging or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
    _logger.debug('PlanetaryKineticsClient: Cache cleared');
  }

  // Private Methods

  private async makeRequest<T = KineticsResponse>(
    endpoint: string,
    data: KineticsRequest | GroupDynamicsRequest): Promise<T> {
    let lastError: Error,

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'WhatToEatNext-KineticsClient/1.0' },
        body: JSON.stringify(data),
          signal: AbortSignal.timeout(this.config.timeout)
        });

        if (!response.ok) {
          const error: KineticsError = new Error(
            `Kinetics API error: ${response.status} ${response.statusText}`) as KineticsError,
          error.statusCode = response.status;
          error.isKineticsError = true;
          throw error;
        }

        const result = await response.json();
        _logger.debug(`PlanetaryKineticsClient: Successful ${endpoint} request`, {
          attempt,
          computeTimeMs: result.computeTimeMs
        });

        return result;
      } catch (error) {
        lastError = error as Error;
        _logger.warn(`PlanetaryKineticsClient: Request failed (attempt ${attempt}/${this.config.retryAttempts})`, error);

        // Don't retry on client errors (4xx)
        if (error instanceof Error && 'statusCode' in error &&
            (error as KineticsError).statusCode &&
            (error as KineticsError).statusCode! >= 400 &&
            (error as KineticsError).statusCode! < 500) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.config.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError!;
  }

  private generateCacheKey(
    type: string,
    location: KineticsLocation,
    options?: KineticsOptions | { agentIds?: string[] }
  ): string {
    const locationKey = `${location.lat.toFixed(1)},${location.lon.toFixed(1)}`;
    const optionsKey = options ? JSON.stringify(options) : '',
    return `kinetics: ${type}:${locationKey}:${optionsKey}`;
  }

  private getFromCache(key: string): KineticsResponse | GroupDynamicsResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.config.cacheTTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache(key: string, data: KineticsResponse | GroupDynamicsResponse): void {
    // Prevent cache from growing too large
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private createFallbackResponse(location: KineticsLocation): KineticsResponse {
    const currentHour = new Date().getHours();

    return {
      success: true,
      data: {
        base: {
          power: [{
            hour: currentHour,
            power: 0.5,
            planetary: 'Sun'
}],
          timing: {
            planetaryHours: ['Sun', 'Venus', 'Mercury'],
            seasonalInfluence: this.getCurrentSeason()
          },
          elemental: {
            totals: {
              Fire: 2.5,
              Water: 2.5,
              Air: 2.5,
              Earth: 2.5
}
          }
        },
        agentOptimization: {
          recommendedAgents: ['sun'],
          powerAmplification: 1.0,
          harmonyScore: 0.5
},
        powerPrediction: {
          nextPeak: new Date(Date.now() + 3600000).toISOString(),
          trend: 'stable',
          confidence: 0.5
}
      },
      computeTimeMs: 5,
      cacheHit: false,
      metadata: {
        timestamp: new Date().toISOString()
      }
    };
  }

  private createFallbackGroupResponse(userIds: string[], location: KineticsLocation): GroupDynamicsResponse {
    const individualContributions: { [key: string]: { powerContribution: number; harmonyImpact: number } } = {},
    userIds.forEach(id => {
      individualContributions[id] = {
        powerContribution: 0.5,
        harmonyImpact: 0.5
},
    });

    return {
      success: true,
      data: {
        harmony: 0.5,
        powerAmplification: 1.0,
        momentumFlow: 'sustained',
        groupResonance: 0.5,
        individualContributions
      },
      computeTimeMs: 5,
      cacheHit: false,
      metadata: {
        timestamp: new Date().toISOString()
      }
    };
  }

  private getCurrentSeason(): 'Winter' | 'Spring' | 'Summer' | 'Autumn' {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Autumn';
    return 'Winter';
  }
}

// Singleton instance
export const planetaryKineticsClient = new PlanetaryKineticsClient();

// Named export for dependency injection
export { PlanetaryKineticsClient };
