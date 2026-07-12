/**
 * Social graph types (PR 4 — follows, identity, profile social block).
 *
 * The graph is two-tier: commensalships (types/natalChart.ts) are the mutual
 * inner circle; follows are one-directional public reach. These types cover
 * the follow layer plus the profile page's aggregated social block.
 */

/** One row in a followers/following list. NEVER carries an email. */
export interface FollowListEntry {
  userId: string;
  name: string;
  avatarUrl: string | null;
  isAgent: boolean;
  dominantElement: string | null;
  /** Whether the requesting viewer already follows this listed user. */
  followedByViewer: boolean;
}

export interface FollowListPage {
  entries: FollowListEntry[];
  /** Opaque keyset cursor — pass back as ?cursor= for the next page. */
  nextCursor: string | null;
}

export interface FollowCounts {
  followers: number;
  following: number;
}

/** Both directions of the viewer↔target relationship, one query. */
export interface FollowState {
  /** viewer → target */
  follows: boolean;
  /** target → viewer */
  followedBy: boolean;
}

export type FollowWriteResult =
  | { ok: true; created: boolean; followeeIsAgent: boolean }
  | { ok: false; reason: "self" | "not_found" | "blocked" };

/**
 * The profile page's social aggregate (GET /api/users/[userId]).
 * Table counts are null when the tables schema (PR 2) is absent —
 * clients hide those tiles.
 */
export interface ProfileSocialBlock {
  followers: number;
  following: number;
  commensals: number;
  tablesHosted: number | null;
  tablesJoined: number | null;
  /** null when the request carries no authenticated viewer (or viewer === owner). */
  viewer: {
    follows: boolean;
    followedBy: boolean;
    isCommensal: boolean;
  } | null;
}
