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
  /**
   * The birth WALL CLOCK, labelled `Z` but not a UTC instant.
   *
   * Produced by `new Date(<datetime-local value>).toISOString()`, so a Brooklyn
   * birth at 14:24 is stored `1991-06-23T14:24:00.000Z`. The true instant is
   * 18:24Z — see {@link BirthData.utcInstant}.
   *
   * Deliberately NOT renamed or corrected in place: this is the field every
   * existing reader already treats as a wall clock, and it is the field SECT
   * must read (`isSectDiurnal` is a 06:00–18:00 LOCAL window; sourcing it from
   * the true instant flips day↔night on 6 of the 8 measured prod rows).
   */
  dateTime: string; // ISO 8601 format
  /**
   * The absolute UTC instant of birth = {@link BirthData.dateTime} interpreted
   * as local time in {@link BirthData.timezone}. Written by
   * `scripts/backfillBirthInstant.ts`.
   *
   * This is what the EPHEMERIS must be queried at. Absent on rows that predate
   * the temporal migration, and absent by design on rows where no defensible
   * instant exists (agent sentinels, fabricated pins) — never fabricated, so
   * `undefined` genuinely means "unknown" and callers fall back to `dateTime`.
   */
  utcInstant?: string;
  latitude: number;
  longitude: number;
  /** IANA zone name. Never a raw `UTC±N` offset — those cannot express DST. */
  timezone?: string;
  /** How `timezone` was decided. See `ZoneBasis` in `utils/astrology/birthTimezone`. */
  timezoneBasis?: "DERIVED_FROM_COORDINATES" | "STORED_IANA_STRING" | "ABSENT";
  /** The pre-migration `timezone` string, kept for audit when it was replaced. */
  timezoneStoredBefore?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface PlanetInfo {
  name: Planet;
  sign: ZodiacSignType;
  /**
   * Ecliptic longitude in decimal degrees (0-360), sub-arcminute where measured.
   *
   * ⚠️ `0` is NOT a sentinel for "unknown" in anything written after 2026-07-27.
   * It used to be — `position: rawPositions[p]?.exactLongitude ?? 0` — and that is
   * precisely the defect `src/lib/astrology/natalBodies.ts` exists to remove: a
   * fabricated zero survives `Number.isFinite`, satisfies NOT NULL, stops a `??`
   * chain, and reads as 0° Aries to every consumer. New writers either state a
   * measured longitude, DERIVE one from sign+degree (consistent with the sign), or
   * refuse to produce the chart at all.
   *
   * Rows written before then may still carry a `0` that means nothing. Treat a 0 on
   * legacy data as suspect rather than as a placement.
   */
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
  relationship?: "self" | "family" | "friend" | "partner" | "colleague" | "other";
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
 * Union type for dining companion entries — either a manual GroupMember or a linked LinkedCommensal
 */
export type DiningCompanion =
  | ({ type: "manual" } & GroupMember)
  | ({ type: "linked" } & LinkedCommensal);

/**
 * Extended DiningGroup that supports a mix of manual and linked members
 */
export interface ExtendedDiningGroup extends DiningGroup {
  linkedUserIds?: string[]; // IDs of linked registered users in this group
}
