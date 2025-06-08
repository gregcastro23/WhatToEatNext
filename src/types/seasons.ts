export type Season = 'spring' | 'summer' | 'autumn' | 'fall' | 'winter' | 'all';

export interface SeasonalProfile {
  spring: number;
  summer: number;
  autumn: number;
  winter: number;
  [key: string]: number; // Allow indexing with string
}

export interface SeasonalAdjustment {
  season: Season;
  effectStrength: number;
  recommendations: string[];
} 