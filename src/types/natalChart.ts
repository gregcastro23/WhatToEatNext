/**
 * Natal Chart and Group Recommendation Types
 *
 * Type definitions for individual natal charts and group dining recommendations
 */

import type {
  Planet,
  ZodiacSignType,
  Element,
  Modality,
  ElementalProperties,
  AlchemicalProperties,
} from "./celestial";

export type {
  Planet,
  ZodiacSignType,
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
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface PlanetInfo {
  name: Planet;
  sign: ZodiacSignType;
  position: number;
}

/**
 * Natal chart calculated from birth data
 * Contains planetary positions and derived properties
 */
export interface NatalChart {
  id?: string;
  name?: string;
  birthData: BirthData;
  planets: PlanetInfo[];
  ascendant: ZodiacSignType;
  planetaryPositions: Record<Planet, ZodiacSignType>;
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

// ─── Social & Multi-Chart Types ──────────────────────────

/**
 * Commensalship status between two registered users (dining companions)
 */
export type CommensalshipStatus = "pending" | "accepted" | "blocked";

/**
 * Commensalship record between two registered users
 * Represents a linked dining companion relationship
 */
export interface Commensalship {
  id: string;
  requesterId: string;
  requesterName?: string;
  requesterEmail?: string;
  addresseeId: string;
  addresseeName?: string;
  addresseeEmail?: string;
  status: CommensalshipStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * A linked commensal in the dining companions list.
 * When a commensalship is accepted, the commensal's chart data is synced here.
 */
export interface LinkedCommensal {
  userId: string;
  name: string;
  email: string;
  natalChart: NatalChart;
  birthData: BirthData;
  commensalshipId: string;
  syncedAt: string;
}

/**
 * Friendship status between two registered users
 * @deprecated Use CommensalshipStatus instead
 */
export type FriendshipStatus = "pending" | "accepted" | "blocked";

/**
 * Friendship record between two registered users
 */
export interface Friendship {
  id: string;
  requesterId: string;
  requesterName?: string;
  requesterEmail?: string;
  addresseeId: string;
  addresseeName?: string;
  addresseeEmail?: string;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * A saved birth chart — can be a primary chart, cosmic identity, or manual companion chart.
 * Decoupled from the monolithic user_profiles JSONB for easier querying and sharing.
 */
export interface SavedChart {
  id: string;
  ownerId: string;
  label: string;
  chartType: "primary" | "cosmic_identity" | "manual";
  birthData: BirthData;
  natalChart: NatalChart;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * A linked friend in the dining companions list.
 * When a friendship is accepted, the friend's chart data is synced here.
 */
export interface LinkedFriend {
  userId: string;
  name: string;
  email: string;
  natalChart: NatalChart;
  birthData: BirthData;
  friendshipId: string;
  syncedAt: string;
}

/**
 * Union type for dining companion entries — either a manual GroupMember or a LinkedFriend
 */
export type DiningCompanion =
  | ({ type: "manual" } & GroupMember)
  | ({ type: "linked" } & LinkedFriend);

/**
 * Extended DiningGroup that supports a mix of manual and linked members
 */
export interface ExtendedDiningGroup extends DiningGroup {
  linkedUserIds?: string[]; // IDs of linked registered users in this group
}
