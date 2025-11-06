import type { Season } from "@/types/alchemy";
import type {
  PlanetaryAspect,
  PlanetaryPosition,
  ZodiacSign,
} from "@/types/celestial";

/**
 * Sign vector components capture multi-dimensional expression of a sign
 * - Modality axes: cardinal, fixed, mutable
 * - Elemental axes: Fire, Water, Earth, Air
 * - Seasonal _axis: seasonal (alignment with current season)
 */
export interface SignVectorComponents {
  // Modality components
  cardinal: number;
  fixed: number;
  mutable: number;

  // Elemental components
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;

  // Seasonal component (0-1 alignment with active season)
  seasonal: number;
}

export type SignDirection = "cardinal" | "fixed" | "mutable";
export interface SignVector {
  sign: any;
  _magnitude: number; // 0-1: intensity of sign expression at the moment
  direction: SignDirection; // dominant modality expression
  components: SignVectorComponents; // multi-dimensional breakdown
}

export interface SignVectorCalculationInput {
  planetaryPositions: Record<string, PlanetaryPosition>;
  aspects?: PlanetaryAspect[];
  season?: Season;
}

export type SignVectorMap = Record<ZodiacSign, SignVector>;

export interface SignVectorCompatibilityResult {
  similarity: number; // 0-1 cosine similarity across components
  dominantSharedAxis: "modality" | "elemental" | "seasonal" | "none";
}

export function signVectorComponentsToArray(
  components: SignVectorComponents,
): number[] {
  return [
    components.cardinal,
    components.fixed,
    components.mutable,
    components.Fire,
    components.Water,
    components.Earth,
    components.Air,
    components.seasonal,
  ];
}
