/**
 * Yelp Fusion API Service
 *
 * Server-side singleton that queries Yelp's Business Search endpoint and
 * returns alchm-scored restaurants. The Yelp API key (`YELP_API_KEY`) is read
 * from the environment and never exposed to the client.
 *
 * Scoring reuses existing alchemical utilities — it does NOT reimplement
 * elemental match or Monica calculation.
 */

import { scoreCuisineAgainstMoment } from "@/services/restaurantScoring";
import type {
  AstrologicalState,
  AlchemicalProperties,
} from "@/types/celestial";
import type {
  YelpSearchParams,
  YelpSearchResponse,
  AlchmScoredRestaurant,
} from "@/types/yelp";
import { createLogger } from "@/utils/logger";

const logger = createLogger("YelpService");

// ─── Constants ─────────────────────────────────────────────────────────────

const YELP_BASE_URL = "https://api.yelp.com/v3";

// ─── Service ───────────────────────────────────────────────────────────────

interface FetchResult<T> {
  data: T | null;
  error: string | null;
}

class YelpService {
  private static instance: YelpService;
  private apiKey: string;

  private constructor() {
    this.apiKey = process.env.YELP_API_KEY ?? "";
    if (!this.apiKey) {
      logger.warn(
        "YelpService initialized without YELP_API_KEY — scored search will return graceful empty.",
      );
    } else {
      logger.info("YelpService initialized");
    }
  }

  public static getInstance(): YelpService {
    if (!YelpService.instance) {
      YelpService.instance = new YelpService();
    }
    return YelpService.instance;
  }

  /** Whether the Yelp integration is configured (API key present). */
  public isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  // ─── HTTP ─────────────────────────────────────────────────────────────

  /**
   * Generic GET against Yelp Fusion. Never throws — surfaces errors via
   * the returned `error` field for graceful degradation.
   */
  private async fetchYelp<T>(
    endpoint: string,
    params: Record<string, string | number | boolean>,
  ): Promise<FetchResult<T>> {
    if (!this.apiKey) {
      return { data: null, error: "Yelp API key not configured" };
    }

    const url = new URL(`${YELP_BASE_URL}${endpoint}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    try {
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        logger.warn(`Yelp API ${response.status}: ${body.slice(0, 200) || response.statusText}`, {
          endpoint,
        });
        return { data: null, error: "Yelp unavailable" };
      }

      const data = (await response.json()) as T;
      return { data, error: null };
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Unknown Yelp request error";
      logger.error("Yelp request failed", { endpoint, error });
      return { data: null, error };
    }
  }

  // ─── Search ───────────────────────────────────────────────────────────

  /**
   * Raw business search — no scoring applied. Returns the Yelp response
   * payload unmodified.
   */
  public async searchRestaurants(
    params: YelpSearchParams,
  ): Promise<FetchResult<YelpSearchResponse>> {
    const search: Record<string, string | number | boolean> = {
      term: params.term,
      latitude: params.latitude,
      longitude: params.longitude,
      limit: Math.min(params.limit ?? 20, 50),
    };
    if (params.radius !== undefined) {
      search.radius = Math.min(params.radius, 40000);
    }
    if (params.sort_by) search.sort_by = params.sort_by;
    if (params.open_now !== undefined) search.open_now = params.open_now;

    return this.fetchYelp<YelpSearchResponse>("/businesses/search", search);
  }

  // ─── Scored Search ────────────────────────────────────────────────────

  /**
   * Search Yelp by cuisine + location, score every result against the
   * current astrological moment, and return the list sorted by `alchmScore`
   * (descending).
   */
  public async getScoredRestaurants(params: {
    cuisineType: string;
    latitude: number;
    longitude: number;
    astrologicalState: AstrologicalState;
    alchemicalProperties: AlchemicalProperties;
    diurnal: boolean;
    radius?: number;
    limit?: number;
  }): Promise<FetchResult<AlchmScoredRestaurant[]>> {
    const { data, error } = await this.searchRestaurants({
      term: params.cuisineType,
      latitude: params.latitude,
      longitude: params.longitude,
      radius: params.radius,
      limit: params.limit ?? 20,
      sort_by: "best_match",
    });

    if (!data) return { data: null, error };

    const scored = data.businesses
      .filter((b) => !b.is_closed)
      .map((business) =>
        scoreCuisineAgainstMoment(
          business,
          params.cuisineType,
          params.astrologicalState,
          params.alchemicalProperties,
          params.diurnal,
        ),
      )
      .sort((a, b) => b.alchmScore - a.alchmScore);

    return { data: scored, error: null };
  }
}

export const yelpService = {
  isConfigured(): boolean {
    return YelpService.getInstance().isConfigured();
  },
  searchRestaurants(
    params: Parameters<YelpService["searchRestaurants"]>[0],
  ): ReturnType<YelpService["searchRestaurants"]> {
    return YelpService.getInstance().searchRestaurants(params);
  },
  getScoredRestaurants(
    params: Parameters<YelpService["getScoredRestaurants"]>[0],
  ): ReturnType<YelpService["getScoredRestaurants"]> {
    return YelpService.getInstance().getScoredRestaurants(params);
  },
};
