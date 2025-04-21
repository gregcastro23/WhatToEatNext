import { PlanetaryAspect, ZodiacSign } from './celestial';
import { ElementalProperties } from './elements';
import { AlchemicalProperties } from './alchemical';

/**
 * Chart state type definition
 */
export interface ChartState {
  planetaryPositions: Record<string, unknown>;
  aspects: PlanetaryAspect[];
  currentSeason: string;
  lastUpdated: Date;
  stelliums: Record<string, string[]>;
  houseEffects: Record<string, number>;
  elementalEffects?: Record<string, number>;
  alchemicalTokens: Record<string, number>;
}

/**
 * Chart data type definition
 */
export interface ChartData {
  planetaryPositions: Record<string, {
    sign: string;
    degree: number;
    isRetrograde?: boolean;
    exactLongitude?: number;
  }>;
  ascendant?: {
    sign: string;
    degree: number;
  };
  midheaven?: {
    sign: string;
    degree: number;
  };
  planets: Record<string, {
    sign: string;
    degree: number;
    isRetrograde?: boolean;
    exactLongitude?: number;
  }>;
  houses?: Record<number, {
    sign: string;
    degree: number;
  }>;
}

/**
 * Chart-related type definitions
 */
import { PlanetaryAspect } from './aspects';

/**
 * Planetary position information
 */
export interface PlanetaryPosition {
  /** Zodiac sign (e.g., 'aries', 'taurus') */
  sign: string;
  /** Degree within the sign (0-29) */
  degree: number;
  /** Whether the planet is in retrograde motion */
  isRetrograde?: boolean;
  /** Exact longitude in degrees (0-360) */
  exactLongitude?: number;
  /** House position (1-12) */
  house?: number;
}

/**
 * All planetary positions in a chart
 */
export interface PlanetaryPositions {
  sun?: PlanetaryPosition;
  moon?: PlanetaryPosition;
  mercury?: PlanetaryPosition;
  venus?: PlanetaryPosition;
  mars?: PlanetaryPosition;
  jupiter?: PlanetaryPosition;
  saturn?: PlanetaryPosition;
  uranus?: PlanetaryPosition;
  neptune?: PlanetaryPosition;
  pluto?: PlanetaryPosition;
  northNode?: PlanetaryPosition;
  southNode?: PlanetaryPosition;
  ascendant?: PlanetaryPosition;
  [key: string]: PlanetaryPosition | undefined;
}

/**
 * Stellium information (3+ planets in same sign)
 */
export interface Stelliums {
  [sign: string]: string[];
}

/**
 * Current astrological chart data
 */
export interface CurrentChart {
  /** Positions of planets in the chart */
  planetaryPositions: PlanetaryPositions;
  /** Aspects between planets */
  aspects: PlanetaryAspect[];
  /** Current season based on sun position */
  currentSeason: string;
  /** When the chart was last updated */
  lastUpdated: Date;
  /** Stelliums (3+ planets in same sign) */
  stelliums: Stelliums;
  /** House effects by element */
  houseEffects: ElementalProperties;
  /** Elemental effects calculated from aspects */
  elementalEffects?: ElementalProperties;
  /** Alchemical token values */
  alchemicalTokens: AlchemicalProperties;
}

/**
 * Type for the chart context
 */
export interface ChartContextType {
  /** The current chart data */
  chart: CurrentChart;
  /** Whether the chart is currently loading */
  loading: boolean;
  /** Any error that occurred during chart creation */
  error: string | null;
  /** Function to refresh the chart data */
  refreshChart: () => Promise<void>;
  /** Function to create an SVG representation of the chart */
  createChartSvg: () => {
    planetPositions: PlanetaryPositions;
    ascendantSign: string;
    svgContent: string;
  };
}

/**
 * Type guard to check if an object is a valid PlanetaryPosition
 */
export function isPlanetaryPosition(obj: unknown): obj is PlanetaryPosition {
  if (!obj || typeof obj !== 'object') return false;
  
  const pos = obj as Record<string, unknown>;
  return (
    typeof pos.sign === 'string' &&
    typeof pos.degree === 'number'
  );
}

/**
 * Type guard to check if an object is valid PlanetaryPositions
 */
export function isPlanetaryPositions(obj: unknown): obj is PlanetaryPositions {
  if (!obj || typeof obj !== 'object') return false;
  
  // Check if at least one key is a valid planetary position
  const positions = obj as Record<string, unknown>;
  return Object.values(positions).some(pos => isPlanetaryPosition(pos));
}

/**
 * Type guard to check if an object is a valid CurrentChart
 */
export function isCurrentChart(obj: unknown): obj is CurrentChart {
  if (!obj || typeof obj !== 'object') return false;
  
  const chart = obj as Record<string, unknown>;
  return (
    isPlanetaryPositions(chart.planetaryPositions) &&
    Array.isArray(chart.aspects) &&
    typeof chart.currentSeason === 'string' &&
    chart.lastUpdated instanceof Date
  );
} 