/**
 * 🌟 Planetary Kinetics API Types
 * Real-time consciousness dynamics and aspect calculations
 */

export interface KineticsLocation {
  lat: number;
  lon: number;
}

export interface KineticsOptions {
  includeAgentOptimization?: boolean;
  includePowerPrediction?: boolean;
  includeResonanceMap?: boolean;
  agentIds?: string[];
}

export interface KineticsPowerData {
  hour: number;
  power: number;
  planetary: string;
}

export interface KineticsTimingData {
  planetaryHours: string[];
  seasonalInfluence: 'Winter' | 'Spring' | 'Summer' | 'Autumn';
}

export interface KineticsElementalTotals {
  Fire: number;
  Water: number;
  Air: number;
  Earth: number;
}

export interface KineticsBaseData {
  power: KineticsPowerData[];
  timing: KineticsTimingData;
  elemental: {
    totals: KineticsElementalTotals;
  };
}

export interface KineticsAgentOptimization {
  recommendedAgents: string[];
  powerAmplification: number;
  harmonyScore: number;
}

export interface KineticsPowerPrediction {
  nextPeak: string; // ISO date string
  trend: 'ascending' | 'stable' | 'descending';
  confidence: number;
}

export interface KineticsResonanceMap {
  [agentId: string]: {
    resonance: number;
    compatibility: number;
  };
}

export interface KineticsResponseData {
  base: KineticsBaseData;
  agentOptimization?: KineticsAgentOptimization;
  powerPrediction?: KineticsPowerPrediction;
  resonanceMap?: KineticsResonanceMap;
}

export interface KineticsResponse {
  success: boolean;
  data: KineticsResponseData;
  computeTimeMs: number;
  cacheHit: boolean;
  metadata: {
    timestamp: string;
  };
}

export interface KineticsRequest {
  location: KineticsLocation;
  options?: KineticsOptions;
}

// Group Dynamics Types
export interface GroupDynamicsRequest {
  agentIds: string[];
  location: KineticsLocation;
}

export interface GroupDynamicsData {
  harmony: number;
  powerAmplification: number;
  momentumFlow: 'accelerating' | 'sustained' | 'decelerating';
  groupResonance: number;
  individualContributions: {
    [agentId: string]: {
      powerContribution: number;
      harmonyImpact: number;
    };
  };
}

export interface GroupDynamicsResponse {
  success: boolean;
  data: GroupDynamicsData;
  computeTimeMs: number;
  cacheHit: boolean;
  metadata: {
    timestamp: string;
  };
}

// Food Recommendation Integration Types
export type FoodEnergyCategory = 'energizing' | 'grounding' | 'balanced';

export interface TemporalFoodRecommendation {
  categories: string[];
  timing: string;
  note: string;
  powerLevel: number;
  dominantElement: keyof KineticsElementalTotals;
}

export interface AspectPhase {
  type: 'applying' | 'exact' | 'separating';
  description: string;
  velocityBoost?: number;
  powerBoost?: number;
}

export interface KineticsEnhancedRecommendation extends TemporalFoodRecommendation {
  aspectPhase?: AspectPhase;
  groupHarmony?: number;
  portionModifier: number;
  seasonalTags: string[];
}

// Cache Types
export interface KineticsCacheEntry {
  data: KineticsResponse;
  timestamp: number;
}

// Error Types
export interface KineticsError extends Error {
  statusCode?: number;
  isKineticsError: true;
}

// Client Configuration
export interface KineticsClientConfig {
  baseUrl: string;
  cacheTTL: number;
  timeout: number;
  retryAttempts: number;
}