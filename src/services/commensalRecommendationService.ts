/**
 * Commensal Recommendation Service
 *
 * Thin, typed wrapper over the recommendation HTTP endpoints used by the
 * guest commensal page and the dashboard. Centralizes the request shape,
 * response parsing, and error handling so consumers (hooks, future server
 * actions) don't reimplement them.
 *
 * Pure data layer — no React, no UI concerns.
 */

import type { CookingMethodSummary } from "@/components/commensal/CookingMethodsList";
import type { ScoredRecipeView } from "@/components/commensal/RecommendedRecipeCard";
import type {
  BirthData,
  CompositeNatalChart,
  GroupMember,
} from "@/types/natalChart";
import type { FoursquarePlace } from "@/types/restaurant";

// ─── Shared request/response types ──────────────────────────

export interface GuestInput {
  name: string;
  birthData: BirthData;
}

export interface GuestRecommendationResponse {
  success: true;
  compositeChart: CompositeNatalChart;
  cuisineRecs: unknown[];
  cookingMethods: CookingMethodSummary[];
  recipes: ScoredRecipeView[];
  groupMembers: GroupMember[];
}

export type GroupAggregationStrategy = "average" | "minimum" | "consensus";

export interface GroupRecommendationInput {
  commensalIds: string[];
  linkedUserIds: string[];
  strategy: GroupAggregationStrategy;
}

export interface GroupCuisineRec {
  cuisineId: string;
  cuisineName: string;
  aggregatedScore: number;
  harmony: number;
  dominantElement: string;
  memberScores: Array<{
    memberId: string;
    memberName: string;
    score: number;
  }>;
  reasons: string[];
}

export interface GroupRecommendationResult {
  success: true;
  composite: CompositeNatalChart;
  recommendations: GroupCuisineRec[];
  memberCount: number;
  strategy: string;
}

export interface RestaurantSearchInput {
  query: string;
  latitude: number;
  longitude: number;
  limit?: number;
}

// ─── Errors ─────────────────────────────────────────────────

export class CommensalRecommendationServiceError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "CommensalRecommendationServiceError";
  }
}

// ─── Internal helpers ───────────────────────────────────────

async function postJson<T extends { success: boolean }>(
  url: string,
  body: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    // Leave data empty; we'll throw with a generic message below.
  }
  if (!res.ok || data.success !== true) {
    const message =
      typeof data.message === "string" ? data.message : "Request failed";
    throw new CommensalRecommendationServiceError(message, res.status);
  }
  return data as unknown as T;
}

// ─── Public API ─────────────────────────────────────────────

/**
 * Generate composite recommendations for a list of guest birth charts.
 * Calls `POST /api/commensal/guest-recommendations`.
 */
export async function fetchGuestRecommendations(
  guests: GuestInput[],
): Promise<GuestRecommendationResponse> {
  return postJson<GuestRecommendationResponse>(
    "/api/commensal/guest-recommendations",
    { guests },
  );
}

/**
 * Generate cuisine + member-harmony recommendations for an authenticated
 * user's selected commensals + linked friends.
 * Calls `POST /api/group-recommendations`.
 */
export async function fetchGroupRecommendations(
  input: GroupRecommendationInput,
): Promise<GroupRecommendationResult> {
  return postJson<GroupRecommendationResult>(
    "/api/group-recommendations",
    input,
  );
}

/**
 * Search for nearby restaurants by cuisine + coordinates.
 * Failures resolve to an empty list — restaurant search is best-effort and
 * should never block the rest of the recommendation pipeline.
 */
export async function searchNearbyRestaurants(
  input: RestaurantSearchInput,
): Promise<FoursquarePlace[]> {
  const qs = new URLSearchParams({
    query: input.query,
    near: `${input.latitude},${input.longitude}`,
    limit: String(input.limit ?? 6),
  });
  try {
    const res = await fetch(`/api/restaurants/search?${qs.toString()}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { success?: boolean; results?: FoursquarePlace[] };
    if (data?.success !== true) return [];
    return data.results ?? [];
  } catch {
    return [];
  }
}
