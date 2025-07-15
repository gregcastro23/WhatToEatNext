/**
 * Lunar Phase Types
 * This file contains lunar phase related interfaces and utilities
 * Note: LunarPhase type is now imported from @/types/alchemy
 */

import type { LunarPhase } from './alchemy';

// Interface for lunar phase modifier
export interface LunarPhaseModifier {
  elementalModifiers: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  elementalBoost?: Record<string, number>;
  description: string;
  keywords: string[];
  preparationTips?: string[];
}

// Interface for lunar influence
export interface LunarInfluence {
  phase: LunarPhase;
  strength: number;
  elements: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  description: string;
}

// Type for mapping lunar phases to modifiers
export type LunarPhaseMap = Record<LunarPhase, LunarPhaseModifier>;

// Lunar phase mappings are now handled by @/utils/lunarPhaseUtils.ts
// This file now only contains interfaces and utilities that depend on the canonical LunarPhase type 