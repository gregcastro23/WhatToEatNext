'use client';

import { ElementalProperties } from '../../types/elements';
import { AlchemicalProperties } from '../../types/alchemical';

/**
 * Represents an astrological aspect between two planets
 */
export interface PlanetaryAspect {
  /** First planet in the aspect */
  planet1: string;
  /** Second planet in the aspect */
  planet2: string;
  /** Type of aspect (conjunction, trine, etc.) */
  type: string;
  /** Orb value (distance from exact aspect in degrees) */
  orb: number;
  /** Strength of the aspect (0-1) */
  strength: number;
}

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
 * Chart data containing raw planetary positions and house information
 */
export interface ChartData {
  /** Raw planetary positions */
  planetaryPositions: PlanetaryPositions;
  /** Ascendant sign */
  ascendant?: string;
  /** Midheaven sign */
  midheaven?: string;
  /** Additional planet details */
  planets: Record<string, PlanetaryPosition>;
  /** House cusps by house number */
  houses?: Record<number, {
    sign: string;
    degree: number;
  }>;
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
  alchemicalTokens?: AlchemicalProperties;
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