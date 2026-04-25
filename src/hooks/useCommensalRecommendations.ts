/**
 * useCommensalRecommendations
 *
 * Hook layer over `commensalRecommendationService`. Exposes two hooks that
 * mirror the existing data flows:
 *
 *   useGuestRecommendations  → for the public /commensal page (guest birth
 *                              charts → composite + recipes + methods + restaurants)
 *   useGroupRecommendations  → for the dashboard's GroupRecommendationsPanel
 *                              (commensal/linked IDs → cuisine + member scores)
 *
 * Behaviour mirrors the previously-inlined logic byte-for-byte so callers
 * can swap their state machines for the hook without UI changes.
 */

"use client";

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import {
  CommensalRecommendationServiceError,
  fetchGroupRecommendations,
  fetchGuestRecommendations,
  searchNearbyRestaurants,
  type GroupAggregationStrategy,
  type GroupRecommendationInput,
  type GroupRecommendationResult,
  type GuestInput,
} from "@/services/commensalRecommendationService";
import type { CookingMethodSummary } from "@/components/commensal/CookingMethodsList";
import type { ScoredRecipeView } from "@/components/commensal/RecommendedRecipeCard";
import type {
  BirthData,
  CompositeNatalChart,
  GroupMember,
  NatalChart,
} from "@/types/natalChart";
import type { FoursquarePlace } from "@/types/restaurant";

// ─── Shared types ───────────────────────────────────────────

export type GuestRecommendationPhase =
  | "idle"
  | "composing"
  | "scoring"
  | "searching"
  | "done";

export interface SearchLocation {
  displayName: string;
  latitude: number;
  longitude: number;
}

export interface SavableGuest {
  name: string;
  birthData: BirthData;
  natalChart: NatalChart;
}

interface GuestState {
  phase: GuestRecommendationPhase;
  composite: CompositeNatalChart | null;
  recipes: ScoredRecipeView[];
  cookingMethods: CookingMethodSummary[];
  cuisineRecs: unknown[];
  restaurants: FoursquarePlace[];
  savableGuests: SavableGuest[];
  error: string | null;
}

const INITIAL_GUEST_STATE: GuestState = {
  phase: "idle",
  composite: null,
  recipes: [],
  cookingMethods: [],
  cuisineRecs: [],
  restaurants: [],
  savableGuests: [],
  error: null,
};

type GuestAction =
  | { type: "RESET" }
  | { type: "START" }
  | {
      type: "RECS_OK";
      payload: Pick<
        GuestState,
        "composite" | "recipes" | "cookingMethods" | "cuisineRecs" | "savableGuests"
      >;
    }
  | { type: "SEARCHING" }
  | { type: "RESTAURANTS"; payload: FoursquarePlace[] }
  | { type: "DONE" }
  | { type: "ERROR"; message: string };

function guestReducer(state: GuestState, action: GuestAction): GuestState {
  switch (action.type) {
    case "RESET":
      return INITIAL_GUEST_STATE;
    case "START":
      return { ...INITIAL_GUEST_STATE, phase: "composing" };
    case "RECS_OK":
      return { ...state, ...action.payload, phase: "scoring" };
    case "SEARCHING":
      return { ...state, phase: "searching" };
    case "RESTAURANTS":
      return { ...state, restaurants: action.payload };
    case "DONE":
      return { ...state, phase: "done" };
    case "ERROR":
      return {
        ...INITIAL_GUEST_STATE,
        error: action.message,
        phase: "idle",
      };
    default:
      return state;
  }
}

function pickCuisineName(rec: unknown): string {
  if (typeof rec === "string") return rec;
  if (rec && typeof rec === "object") {
    const obj = rec as { cuisineName?: string; name?: string };
    return obj.cuisineName ?? obj.name ?? "Restaurant";
  }
  return "Restaurant";
}

// ─── useGuestRecommendations ───────────────────────────────

interface RunArgs {
  guests: GuestInput[];
  location?: SearchLocation | null;
}

export interface UseGuestRecommendationsApi extends GuestState {
  run: (args: RunArgs) => Promise<void>;
  reset: () => void;
}

export function useGuestRecommendations(): UseGuestRecommendationsApi {
  const [state, dispatch] = useReducer(guestReducer, INITIAL_GUEST_STATE);
  const runIdRef = useRef(0);

  const run = useCallback(async ({ guests, location }: RunArgs) => {
    if (guests.length === 0) return;
    const myRunId = ++runIdRef.current;
    dispatch({ type: "START" });

    try {
      const data = await fetchGuestRecommendations(guests);
      if (runIdRef.current !== myRunId) return;

      const savableGuests: SavableGuest[] = (data.groupMembers ?? []).map(
        (m: GroupMember, i: number) => ({
          name: m.name ?? guests[i]?.name ?? `Guest ${i + 1}`,
          birthData: m.birthData ?? guests[i]?.birthData,
          natalChart: m.natalChart,
        }),
      );

      dispatch({
        type: "RECS_OK",
        payload: {
          composite: data.compositeChart,
          recipes: data.recipes ?? [],
          cookingMethods: data.cookingMethods ?? [],
          cuisineRecs: data.cuisineRecs ?? [],
          savableGuests,
        },
      });

      if (location) {
        dispatch({ type: "SEARCHING" });
        const cuisineName = pickCuisineName(data.cuisineRecs?.[0]);
        const restaurants = await searchNearbyRestaurants({
          query: cuisineName,
          latitude: location.latitude,
          longitude: location.longitude,
          limit: 6,
        });
        if (runIdRef.current !== myRunId) return;
        dispatch({ type: "RESTAURANTS", payload: restaurants });
      }

      dispatch({ type: "DONE" });
    } catch (err) {
      if (runIdRef.current !== myRunId) return;
      const message =
        err instanceof CommensalRecommendationServiceError
          ? err.message
          : "Network error — please try again";
      dispatch({ type: "ERROR", message });
    }
  }, []);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return { ...state, run, reset };
}

// ─── useGroupRecommendations ───────────────────────────────

export interface UseGroupRecommendationsApi {
  result: GroupRecommendationResult | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Auto-fetches whenever any of the inputs change. Mirrors the original
 * dashboard behaviour: refetches on commensalIds, linkedUserIds, or
 * strategy changes; clears the result when there is nothing selected.
 */
export function useGroupRecommendations(args: {
  commensalIds: string[];
  linkedUserIds: string[];
  strategy: GroupAggregationStrategy;
}): UseGroupRecommendationsApi {
  const { commensalIds, linkedUserIds, strategy } = args;
  const [result, setResult] = useState<GroupRecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runIdRef = useRef(0);

  const refetch = useCallback(async () => {
    if (commensalIds.length === 0 && linkedUserIds.length === 0) {
      setResult(null);
      return;
    }
    const myRunId = ++runIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const input: GroupRecommendationInput = {
        commensalIds,
        linkedUserIds,
        strategy,
      };
      const data = await fetchGroupRecommendations(input);
      if (runIdRef.current !== myRunId) return;
      setResult(data);
    } catch (err) {
      if (runIdRef.current !== myRunId) return;
      const message =
        err instanceof CommensalRecommendationServiceError
          ? err.message
          : "Failed to load group recommendations";
      setError(message);
    } finally {
      if (runIdRef.current === myRunId) setLoading(false);
    }
  }, [commensalIds, linkedUserIds, strategy]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { result, loading, error, refetch };
}
