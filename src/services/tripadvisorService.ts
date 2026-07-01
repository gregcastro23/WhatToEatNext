/**
 * Tripadvisor Content API client (server-side).
 *
 * The ONLY researched provider with an *ongoing* free tier (5,000 calls/month)
 * that returns real crowd ratings + review counts + price + cuisine + the
 * official rating-bubble image. It fills the quality gap OpenStreetMap leaves.
 *
 * ⚠️ Licensing constraints baked into how this is used elsewhere:
 *   - Rating / reviews / photos MUST be fetched fresh per display — the
 *     best-match route therefore does NOT cache Tripadvisor responses.
 *   - The rating-bubble image (`ratingImageUrl`) must be shown instead of our
 *     own stars, and a "Powered by Tripadvisor" credit + link back is required.
 *   - Quota is small, so callers hydrate only the top N results (see
 *     TRIPADVISOR_DETAIL_LIMIT) rather than every candidate.
 *
 * The API key never leaves the server. Set `TRIPADVISOR_API_KEY` to enable.
 * If the key's referrer restriction is enabled in the Tripadvisor console,
 * also set `TRIPADVISOR_REFERER` to an allowed domain (otherwise configure the
 * key for your server IP / leave it unrestricted).
 *
 * @file src/services/tripadvisorService.ts
 */

import { createLogger } from "@/utils/logger";

const logger = createLogger("TripadvisorService");

const TA_BASE = "https://api.content.tripadvisor.com/api/v1";
const REQUEST_TIMEOUT_MS = 8000;

/** Lightweight search hit (before details hydration). */
export interface TripadvisorSearchHit {
  locationId: string;
  name: string;
}

/** Fully-hydrated location details used to build a normalized restaurant. */
export interface TripadvisorDetails {
  locationId: string;
  name: string;
  webUrl?: string;
  /** 0–5. */
  rating?: number;
  numReviews?: number;
  /** e.g. "$$ - $$$". */
  priceLevel?: string;
  /** Official Tripadvisor rating-bubble image URL — must be displayed. */
  ratingImageUrl?: string;
  cuisine: string[];
  latitude?: number;
  longitude?: number;
  addressString?: string;
}

interface TaSearchResponse {
  data?: Array<{ location_id?: string; name?: string }>;
}

interface TaDetailsResponse {
  location_id?: string;
  name?: string;
  web_url?: string;
  rating?: string;
  num_reviews?: string;
  price_level?: string;
  rating_image_url?: string;
  latitude?: string;
  longitude?: string;
  address_obj?: { address_string?: string };
  cuisine?: Array<{ name?: string; localized_name?: string }>;
}

function numOrUndefined(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

class TripadvisorService {
  private static instance: TripadvisorService;
  private readonly apiKey: string;
  private readonly referer: string | undefined;

  private constructor() {
    this.apiKey = process.env.TRIPADVISOR_API_KEY ?? "";
    this.referer = process.env.TRIPADVISOR_REFERER || undefined;
    if (!this.apiKey) {
      logger.info(
        "TripadvisorService: no TRIPADVISOR_API_KEY — provider disabled (finder falls back to OpenStreetMap).",
      );
    }
  }

  static getInstance(): TripadvisorService {
    if (!TripadvisorService.instance) {
      TripadvisorService.instance = new TripadvisorService();
    }
    return TripadvisorService.instance;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  private headers(): HeadersInit {
    const h: Record<string, string> = { Accept: "application/json" };
    // Tripadvisor keys can be referrer-restricted; send it only when configured
    // so we never send a mismatching Referer that would trigger a 403.
    if (this.referer) h.Referer = this.referer;
    return h;
  }

  private async getJson<T>(url: URL): Promise<T | null> {
    try {
      const response = await fetch(url.toString(), {
        headers: this.headers(),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        logger.warn(
          `Tripadvisor API ${response.status}: ${body.slice(0, 160) || response.statusText}`,
        );
        return null;
      }
      return (await response.json()) as T;
    } catch (err) {
      logger.warn(
        `Tripadvisor request failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }

  /**
   * Find restaurants matching a cuisine near a point. Uses `/location/search`
   * with the cuisine as the query so results are cuisine-relevant + nearby.
   * Returns up to ~10 hits (Tripadvisor's cap); hydrate with `getDetails`.
   */
  async searchLocations(params: {
    latitude: number;
    longitude: number;
    query: string;
    radiusKm: number;
  }): Promise<TripadvisorSearchHit[]> {
    if (!this.isConfigured()) return [];

    const url = new URL(`${TA_BASE}/location/search`);
    url.searchParams.set("key", this.apiKey);
    url.searchParams.set(
      "searchQuery",
      params.query.trim() || "restaurant",
    );
    url.searchParams.set("category", "restaurants");
    url.searchParams.set(
      "latLong",
      `${params.latitude},${params.longitude}`,
    );
    url.searchParams.set("radius", String(Math.max(1, Math.round(params.radiusKm))));
    url.searchParams.set("radiusUnit", "km");
    url.searchParams.set("language", "en");

    const data = await this.getJson<TaSearchResponse>(url);
    if (!data?.data) return [];

    return data.data
      .filter((d): d is { location_id: string; name: string } =>
        Boolean(d.location_id && d.name),
      )
      .map((d) => ({ locationId: d.location_id, name: d.name }));
  }

  /** Hydrate a location with rating / reviews / price / cuisine / coords. */
  async getDetails(locationId: string): Promise<TripadvisorDetails | null> {
    if (!this.isConfigured()) return null;

    const url = new URL(`${TA_BASE}/location/${locationId}/details`);
    url.searchParams.set("key", this.apiKey);
    url.searchParams.set("language", "en");
    url.searchParams.set("currency", "USD");

    const d = await this.getJson<TaDetailsResponse>(url);
    if (!d || !d.name) return null;

    return {
      locationId,
      name: d.name,
      webUrl: d.web_url,
      rating: numOrUndefined(d.rating),
      numReviews: numOrUndefined(d.num_reviews),
      priceLevel: d.price_level,
      ratingImageUrl: d.rating_image_url,
      cuisine: (d.cuisine ?? [])
        .map((c) => c.localized_name || c.name || "")
        .filter(Boolean),
      latitude: numOrUndefined(d.latitude),
      longitude: numOrUndefined(d.longitude),
      addressString: d.address_obj?.address_string,
    };
  }
}

export const tripadvisorService = {
  isConfigured(): boolean {
    return TripadvisorService.getInstance().isConfigured();
  },
  searchLocations(
    params: Parameters<TripadvisorService["searchLocations"]>[0],
  ): ReturnType<TripadvisorService["searchLocations"]> {
    return TripadvisorService.getInstance().searchLocations(params);
  },
  getDetails(
    locationId: string,
  ): ReturnType<TripadvisorService["getDetails"]> {
    return TripadvisorService.getInstance().getDetails(locationId);
  },
};
