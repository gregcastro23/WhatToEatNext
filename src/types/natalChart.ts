/**
 * Natal Chart and Group Recommendation Types
 *
 * Type definitions for individual natal charts and group dining recommendations
 */

import type {
  Planet,
  ZodiacSign,
  Element,
  Modality,
  ElementalProperties,
  AlchemicalProperties,
} from "./celestial";

/**
 * Birth data required to generate a natal chart
 */
export interface BirthData {
  dateTime: string; // ISO 8601 format
  latitude: number;
  longitude: number;
  timezone?: string;
}

/**
 * Natal chart calculated from birth data
 * Contains planetary positions and derived properties
 */
export interface NatalChart {
  id?: string;
  name?: string;
  birthData: BirthData;
  planetaryPositions: Record<Planet, ZodiacSign>;
  dominantElement: Element;
  dominantModality: Modality;
  elementalBalance: ElementalProperties;
  alchemicalProperties: AlchemicalProperties;
  calculatedAt: string; // ISO timestamp
}

/**
 * Group member with their own natal chart
 */
export interface GroupMember {
  id: string;
  name: string;
  relationship?: "family" | "friend" | "partner" | "colleague" | "other";
  birthData: BirthData;
  natalChart: NatalChart;
  createdAt: string;
}

/**
 * Dining group composed of multiple members
 */
export interface DiningGroup {
  id: string;
  name: string;
  memberIds: string[]; // References to GroupMember ids
  createdAt: string;
  updatedAt: string;
}

/**
 * Composite natal chart for a group
 * Combines multiple natal charts into aggregate properties
 */
export interface CompositeNatalChart {
  groupId: string;
  memberCount: number;
  dominantElement: Element;
  dominantModality: Modality;
  elementalBalance: ElementalProperties;
  alchemicalProperties: AlchemicalProperties;
  elementalDistribution: Record<Element, number>; // Percentage of group for each element
  modalityDistribution: Record<Modality, number>; // Percentage of group for each modality
  calculatedAt: string;
}

/**
 * Individual member's score for a recipe
 */
export interface MemberRecipeScore {
  memberId: string;
  memberName: string;
  score: number; // 0-1
  compatibility: number; // 0-1
  reasons: string[];
}

/**
 * Group recommendation result with per-member breakdown
 */
export interface GroupRecipeScore {
  recipeId: string;
  recipeName: string;
  groupScore: number; // 0-1 (aggregated)
  groupCompatibility: number; // 0-1
  harmony: number; // 0-1 (how well everyone agrees)
  memberScores: MemberRecipeScore[];
  aggregationStrategy: "average" | "minimum" | "weighted" | "consensus";
  reasons: string[];
}

/**
 * Scoring strategy options for group recommendations
 */
export interface GroupScoringStrategy {
  type: "average" | "minimum" | "weighted" | "consensus";
  weights?: Record<string, number>; // Optional member weights (memberId -> weight)
  minimumConsensus?: number; // For consensus strategy (0-1)
}
