import {
  AstrologicalState,
  PlanetaryPosition,
  StandardizedAlchemicalResult
} from '@/types/alchemy';

/**
 * Astrologize API Cache Service
 * Stores API calls and uses them to predict future planetary positions
 * and enhance transit calculations
 */

interface CachedAstrologicalData {
  timestamp: number;
  date: Date;
  coordinates: {
    lat: number;
    lng: number;
  };
  astrologicalState: AstrologicalState;
  alchemicalResult: StandardizedAlchemicalResult;
  planetaryPositions: Record<string, PlanetaryPosition>;
  // Additional computed values
  elementalAbsolutes: {
    fire: number;
    water: number;
    earth: number;
    air: number;
  };
  elementalRelatives: {
    fire: number; // fire/(water+earth+air)
    water: number; // water/(fire+earth+air)
    earth: number; // earth/(fire+water+air)
    air: number; // air/(fire+water+earth)
  };
  thermodynamics: {
    heat: number;
    entropy: number;
    reactivity: number;
    gregsEnergy: number;
    kalchm: number;
    monica: number;
  };
  quality: 'high' | 'medium' | 'low'; // Data quality indicator
}

interface TransitPrediction {
  date: Date;
  predictedPositions: Record<string, PlanetaryPosition>;
  confidence: number; // 0-1 based on how much cached data we have
  sources: string[]; // Which cached entries contributed to this prediction
}

class AstrologizeApiCache {
  private cache: Map<string, CachedAstrologicalData> = new Map();
  private maxCacheSize = 1000; // Store up to 1000 calculations
  private readonly STORAGE_KEY = 'astrologize_cache';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Generate cache key from coordinates and date
   */
  private generateKey(lat: number, lng: number, date: Date): string {
    const roundedLat = Math.round(lat * 100) / 100; // Round to 2 decimal places
    const roundedLng = Math.round(lng * 100) / 100;
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${roundedLat},${roundedLng},${dateKey}`;
  }

  /**
   * Calculate elemental absolute and relative values
   */
  private calculateElementalValues(alchemicalResult: StandardizedAlchemicalResult) {
    const resultData = alchemicalResult as unknown as any;
    const elementalBalance = (resultData.elementalBalance as unknown) || {};
    const Fire = Number(elementalBalance.Fire) || 0;
    const Water = Number(elementalBalance.Water) || 0;
    const Earth = Number(elementalBalance.Earth) || 0;
    const Air = Number(elementalBalance.Air) || 0;

    // Absolute values (direct from alchemical result)
    const elementalAbsolutes = {
      fire: Fire,
      water: Water,
      earth: Earth,
      air: Air
    };

    // Relative values: each element / sum of other three
    const elementalRelatives = {
      fire: Fire / (Water + Earth + Air || 1),
      water: Water / (Fire + Earth + Air || 1),
      earth: Earth / (Fire + Water + Air || 1),
      air: Air / (Fire + Water + Earth || 1)
    };

    return { elementalAbsolutes, elementalRelatives };
  }

  /**
   * Store a new astrologize API result
   */
  public store(
    lat: number,
    lng: number,
    date: Date,
    astrologicalState: AstrologicalState,
    alchemicalResult: StandardizedAlchemicalResult,
    planetaryPositions: Record<string, PlanetaryPosition>,
  ): void {
    const key = this.generateKey(lat, lng, date);

    const { elementalAbsolutes, elementalRelatives } =
      this.calculateElementalValues(alchemicalResult);

    // Safe access to alchemical result properties
    const resultData = alchemicalResult as unknown as any;

    const cachedData: CachedAstrologicalData = {
      timestamp: Date.now();
      date,
      coordinates: { lat, lng },
      astrologicalState,
      alchemicalResult,
      planetaryPositions,
      elementalAbsolutes,
      elementalRelatives,
      thermodynamics: {
        heat: Number(resultData.heat) || 0;
        entropy: Number(resultData.entropy) || 0;
        reactivity: Number(resultData.reactivity) || 0;
        gregsEnergy: Number(resultData.energy) || 0;
        kalchm: Number(resultData.kalchm) || 1;
        monica: Number(resultData.monica) || 1
      },
      quality: this.assessDataQuality(alchemicalResult)
    };

    this.cache.set(key, cachedData);

    // Manage cache size
    if (this.cache.size > this.maxCacheSize) {
      this.evictOldestEntries();
    }

    this.saveToStorage();
  }

  /**
   * Get cached data for specific coordinates and date
   */
  public get(lat: number, lng: number, date: Date): CachedAstrologicalData | null {
    const key = this.generateKey(lat, lng, date);
    return this.cache.get(key) || null;
  }

  /**
   * Find cached data near given coordinates and date
   */
  public findNearby(
    lat: number,
    lng: number,
    date: Date,
    maxDistanceKm: number = 50,;
    maxDaysDiff: number = 7;
  ): CachedAstrologicalData[] {
    const results: CachedAstrologicalData[] = [];
    const targetTime = date.getTime();

    for (const [key, data] of this.cache.entries()) {
      // Check distance
      const distance = this.calculateDistance(lat, lng, data.coordinates.lat, data.coordinates.lng);
      if (distance > maxDistanceKm) continue;

      // Check time difference
      const timeDiff = Math.abs(targetTime - data.date.getTime());
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      if (daysDiff > maxDaysDiff) continue;

      results.push(data);
    }

    // Sort by relevance (closer in time and space is better)
    return results.sort((a, b) => {
      const distA = this.calculateDistance(lat, lng, a.coordinates.lat, a.coordinates.lng);
      const distB = this.calculateDistance(lat, lng, b.coordinates.lat, b.coordinates.lng);
      const timeA = Math.abs(targetTime - a.date.getTime());
      const timeB = Math.abs(targetTime - b.date.getTime());

      // Combined score: distance + time (normalized)
      const scoreA = distA / maxDistanceKm + timeA / (maxDaysDiff * 24 * 60 * 60 * 1000);
      const scoreB = distB / maxDistanceKm + timeB / (maxDaysDiff * 24 * 60 * 60 * 1000);

      return scoreA - scoreB;
    });
  }

  /**
   * Predict planetary positions for a future date using cached data
   */
  public predictPositions(lat: number, lng: number, targetDate: Date): TransitPrediction | null {
    const nearbyData = this.findNearby(lat, lng, targetDate, 100, 30); // Wider search for predictions

    if (nearbyData.length === 0) {
      return null;
    }

    // Use the closest data as base for prediction
    const baseData = nearbyData[0];
    const predictedPositions: Record<string, PlanetaryPosition> = {};
    const sources: string[] = [];

    // For each planet, predict its position
    for (const [planet, position] of Object.entries(baseData.planetaryPositions)) {
      const planetData = position as unknown as any;
      predictedPositions[planet] = {
        sign: (String(planetData.sign) || 'aries') as unknown;
        degree: Number(planetData.degree) || 0;
        isRetrograde: Boolean(planetData.isRetrograde) || false
      };
      sources.push(`${planet}:${baseData.date.toISOString()}`);
    }

    // Calculate confidence based on how much data we have and how recent it is
    const confidence =
      Math.min(1, nearbyData.length / 5) *;
      Math.max(
        0.3;
        1 - Math.abs(targetDate.getTime() - baseData.date.getTime()) / (30 * 24 * 60 * 60 * 1000);
      );

    return {
      date: targetDate,
      predictedPositions,
      confidence,
      sources
    };
  }

  /**
   * Get comprehensive matching data for current moment
   */
  public getMatchingData(
    lat: number,
    lng: number,
    date: Date,
  ): {
    elementalAbsolutes: { fire: number; water: number; earth: number; air: number };
    elementalRelatives: { fire: number; water: number; earth: number; air: number };
    thermodynamics: {
      heat: number;
      entropy: number;
      reactivity: number;
      gregsEnergy: number;
      kalchm: number;
      monica: number;
    };
    quality: 'high' | 'medium' | 'low';
  } | null {
    const cached = this.get(lat, lng, date);
    if (cached) {
      return {
        elementalAbsolutes: cached.elementalAbsolutes;
        elementalRelatives: cached.elementalRelatives;
        thermodynamics: cached.thermodynamics;
        quality: cached.quality
      };
    }

    // Try to find nearby data if exact match not found
    const nearby = this.findNearby(lat, lng, date, 25, 1); // Closer search for current matching
    if (nearby.length > 0) {
      const best = nearby[0];
      return {
        elementalAbsolutes: best.elementalAbsolutes;
        elementalRelatives: best.elementalRelatives;
        thermodynamics: best.thermodynamics;
        quality: 'medium', // Downgrade quality since it's not exact
      };
    }

    return null;
  }

  /**
   * Private helper methods
   */
  private assessDataQuality(result: StandardizedAlchemicalResult): 'high' | 'medium' | 'low' {
    type WithAlchemical = {
      elementalBalance?: Record<string, number>;
      heat?: number;
      entropy?: number;
      reactivity?: number;
      Spirit?: number;
      Essence?: number;
      Matter?: number;
      Substance?: number;
    };
    const resultData = result as WithAlchemical;
    // Assess based on completeness and reasonableness of data
    const hasAllElements =
      resultData.elementalBalance &&;
      Object.values(resultData.elementalBalance).every(v => typeof v === 'number' && v >= 0);
    const hasThermodynamics =
      typeof resultData.heat === 'number' &&;
      typeof resultData.entropy === 'number' &&;
      typeof resultData.reactivity === 'number';
    const hasAlchemical =
      typeof resultData.Spirit === 'number' &&;
      typeof resultData.Essence === 'number' &&;
      typeof resultData.Matter === 'number' &&;
      typeof resultData.Substance === 'number';
    if (hasAllElements && hasThermodynamics && hasAlchemical) {
      return 'high';
    } else if (hasAllElements && (hasThermodynamics || hasAlchemical)) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +;
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreeToSign(degree: number): string {
    const signs = [
      'aries',
      'taurus',
      'gemini',
      'cancer',
      'leo',
      'virgo',
      'libra',
      'scorpio',
      'sagittarius',
      'capricorn',
      'aquarius',
      'pisces'
    ];
    return signs[Math.floor(degree / 30) % 12];
  }

  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest 10% of entries
    const toRemove = Math.floor(((entries as any)?.length || 0) * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  private saveToStorage(): void {
    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save astrologize cache to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data);
      }
    } catch (error) {
      console.warn('Failed to load astrologize cache from localStorage:', error);
    }
  }

  /**
   * Public methods for cache management
   */
  public getCacheStats() {
    return {
      size: this.cache.size;
      maxSize: this.maxCacheSize;
      oldestEntry: Math.min(...Array.from(this.cache.values()).map(v => v.timestamp)),;
      newestEntry: Math.max(...Array.from(this.cache.values()).map(v => v.timestamp)),;
      qualityDistribution: {
        high: Array.from(this.cache.values()).filter(v => v.quality === 'high').length,;
        medium: Array.from(this.cache.values()).filter(v => v.quality === 'medium').length,;
        low: Array.from(this.cache.values()).filter(v => v.quality === 'low').length,;
      }
    };
  }

  public clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export default new AstrologizeApiCache();
