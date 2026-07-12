/**
 * The Table entity — PR 2 of the Tables program
 * (docs/plans/pr2-table-entity-plan.md).
 *
 * A Table is the atomic social unit for a dining occasion. Lifecycle:
 * planned -> live -> memory (terminal), or planned/live -> cancelled
 * (terminal). Postgres (database/init/60-tables-schema.sql) is the
 * authoritative record across the whole lifecycle; SpacetimeDB is an
 * ephemeral, presence-only UX layer for the live phase (see
 * src/lib/spacetime/config.ts `isLiveTablesEnabled`).
 */

import type { CompositeNatalChart } from "./natalChart";

export type TableStatus = "planned" | "live" | "memory" | "cancelled";

export type TableVenueType = "home" | "restaurant" | "other";

export type TableVisibility = "public" | "commensals" | "private";

export type TableMemberRole = "host" | "guest";

export type TableMemberRsvpStatus = "invited" | "joined" | "declined";

/** Provenance of how a member landed on the table — QR is not a distinct
 * invite kind, just a rendering of the same token; this is where the
 * distinction actually lives. */
export type TableMemberJoinedVia =
  | "host"
  | "link"
  | "qr"
  | "invite"
  | "search"
  | "manual";

export interface TableVenue {
  type: TableVenueType;
  restaurantId?: string;
  name?: string;
  address?: string;
}

export interface TableMenuItem {
  name: string;
  recipeRef?: string;
  course?: string;
}

/** A single member row on a table — either a registered user (human or
 * `is_agent` historical/planetary agent, both participate the same way via
 * `userId`) or an owner's offline manual companion chart. Exactly one of
 * `userId` / `manualCompanionChartId` is set (DB XOR constraint). */
export interface TableMember {
  id: string;
  tableId: string;
  userId?: string;
  manualCompanionChartId?: string;
  role: TableMemberRole;
  rsvpStatus: TableMemberRsvpStatus;
  joinedVia?: TableMemberJoinedVia;
  invitedBy?: string;
  /** Denormalized; required for manual guests, optional display override
   * for registered members. */
  displayName?: string;
  rsvpAt?: string;
  createdAt: string;
  updatedAt: string;
  /** Real identity fields, joined from users/user_profiles on detail reads
   * only — never invented (design-spec §4.8). */
  name?: string;
  avatarUrl?: string;
  isAgent?: boolean;
}

export interface TableInvite {
  id: string;
  tableId: string;
  token: string;
  /** Convenience `/t/<token>` landing URL — same token, two renderings
   * (copy-link and QR). */
  url: string;
  createdBy: string;
  maxUses: number;
  useCount: number;
  expiresAt: string;
  revokedAt?: string | null;
  createdAt: string;
}

/** One scored cuisine recommendation, loosely typed — it round-trips
 * through `tables.composite_snapshot` JSONB and its exact shape is owned by
 * `getCuisineRecommendations` (src/utils/cuisineRecommender.ts). */
export interface CompositeCuisineRec {
  id: string;
  name: string;
  score: number;
  [key: string]: unknown;
}

/** One scored recipe recommendation from
 * `EnhancedRecommendationService.getRecommendationsForComposite` — loosely
 * typed for the same JSONB round-trip reason as `CompositeCuisineRec`. */
export interface CompositeRecipeRec {
  recipe: { id?: string; name?: string; [key: string]: unknown };
  score: number;
  reason?: string;
  [key: string]: unknown;
}

export interface CompositeCookingMethod {
  method: string;
  score: number;
  reasons: string[];
}

/**
 * Frozen (until the next recompute) composite-chart bundle for a table's
 * joined members — persisted to `tables.composite_snapshot`. Computed by
 * `computeAndStoreTableComposite` (src/lib/tables/composite.ts); the API
 * layer only ever reads it back, never recomputes it inline.
 */
export interface CompositeSnapshot {
  version: 1;
  computedAt: string;
  memberCount: number;
  includedMemberIds: string[];
  /** True when more than 12 chart-bearing members joined and the composite
   * was capped to the first 12 by rsvp_at. */
  truncated: boolean;
  compositeChart: CompositeNatalChart;
  cookingMethods: CompositeCookingMethod[];
  cuisineRecs: CompositeCuisineRec[];
  topRecipes: CompositeRecipeRec[];
}

/** A guest in a frozen memory artifact — real identity (name), optionally
 * linked to a user id; manual guests are name-only. */
export interface TableMemoryGuest {
  name: string;
  userId?: string;
}

export interface TableMemoryComposite {
  dominantElement: string;
  dominantModality: string;
  elementalBalance: Record<string, number>;
  alchemicalProperties: Record<string, number>;
}

/**
 * The frozen artifact written once at close — persisted to `tables.memory`
 * AND mirrored verbatim into the `table_memory` feed_events row's
 * `metadata_payload` (src/lib/tables/composite.ts is NOT involved; the close
 * handler builds this directly). `shareName` is always `true`: unlike
 * anonymous-by-default cooked-it cards, a table memory is inherently a named
 * social artifact (see feedDatabaseService's shareName gate).
 */
export interface TableMemoryPayload {
  card: "table_memory";
  tableId: string;
  title: string;
  scheduledAt: string;
  closedAt: string;
  venue: { type: TableVenueType; name?: string };
  guests: TableMemoryGuest[];
  guestCount: number;
  composite?: TableMemoryComposite;
  menu: TableMenuItem[];
  photoUrls: string[];
  shareName: true;
}

export interface TableRecord {
  id: string;
  hostId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  venue: TableVenue;
  status: TableStatus;
  visibility: TableVisibility;
  compositeSnapshot?: CompositeSnapshot | null;
  compositeUpdatedAt?: string | null;
  menu: TableMenuItem[];
  memory?: TableMemoryPayload | null;
  wentLiveAt?: string | null;
  closedAt?: string | null;
  feedEventId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** `GET /api/tables/[tableId]` response shape: the record plus its joined
 * members and photos. `invites` is host-only. */
export interface TableDetail extends TableRecord {
  members: TableMember[];
  photos: TablePhoto[];
  invites?: TableInvite[];
}

/** Public, unauthenticated preview for `/t/[token]` and
 * `GET /api/table-invites/[token]` — card-level only, never the member list. */
export interface TableInvitePreview {
  tableTitle: string;
  hostName: string;
  scheduledAt: string;
  venueName?: string;
  joinedCount: number;
  valid: boolean;
}

export interface TableComment {
  id: string;
  tableId: string;
  authorId: string;
  authorName?: string;
  body: string;
  createdAt: string;
}

export interface TablePhoto {
  id: string;
  tableId: string;
  uploaderId: string;
  url: string;
  createdAt: string;
}
