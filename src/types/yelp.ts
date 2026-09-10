/**
 * Yelp Fusion API v3 types + alchm-scored restaurant types.
 *
 * Used server-side by `YelpService` and the POST handler at
 * `/api/restaurants/search`. The Yelp API key never leaves the server.
 */

export interface YelpBusiness {
  id: string;
  name: string;
  url: string;
  phone: string;
  rating: number;
  review_count: number;
  price?: string | undefined;
  distance?: number | undefined;
  categories: Array<{ alias: string; title: string }>;
  location: {
    address1: string;
    city: string;
    state: string;
    zip_code: string;
    display_address: string[];
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  image_url?: string | undefined;
  is_closed: boolean;
}

export interface YelpSearchParams {
  term: string;
  latitude: number;
  longitude: number;
  radius?: number | undefined;
  limit?: number | undefined;
  sort_by?: ("best_match" | "rating" | "review_count" | "distance") | undefined;
  open_now?: boolean | undefined;
}

export interface YelpSearchResponse {
  businesses: YelpBusiness[];
  total: number;
  region: {
    center: { latitude: number; longitude: number };
  };
}

export interface AlchmScoredRestaurant {
  externalId?: string | undefined;
  name?: string | undefined;
  address?: string | undefined;
  rating?: number | undefined;
  imageUrl?: string | undefined;
  business: YelpBusiness;
  alchmScore: number;
  elementalMatch: number;
  planetaryAlignment: number;
  /**
   * Closeness of the cuisine's thermodynamic state to the moment's, in (0, 1]
   * when scored — or exactly `0` when the entry was never scored (no cosmic
   * state available, or scoring threw). Pair it with `alchmScore > 0` to tell
   * the two apart; 0 does NOT mean "maximally distant".
   *
   * Renamed from `monicaCompatibility`: that field held a distance between two
   * monica constants, which was MEASURED to be identical for every cuisine at
   * any given moment. See `@/data/unified/thermodynamicAffinity`.
   */
  thermodynamicAffinity: number;
  dominantElement: "Fire" | "Water" | "Earth" | "Air";
  matchReasons: string[];
  cuisineElement: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  /** True when this provider result maps to a fully active local restaurant partner. */
  isPartner?: boolean | undefined;
  /** Internal restaurant row id, used by Stripe Connect order handoff. */
  partnerRestaurantId?: string | undefined;
  partnerOnboardingStatus?: string | undefined;
  stripeConnectAccountId?: string | undefined;
  deliverectLocationId?: string | undefined;
  /** Human-readable cuisine label derived from the provider's place classification. */
  cuisineLabel?: string | undefined;
  /** Raw provider type identifier (e.g. Google Places primaryType). */
  primaryType?: string | undefined;
  /**
   * Provider-supplied rating badge image URL (Tripadvisor bubble image).
   * When present, the UI MUST render this image instead of its own stars —
   * Tripadvisor's terms require displaying their official rating graphic.
   */
  ratingImageUrl?: string | undefined;
}

export interface CosmicContext {
  currentZodiac: string;
  planetaryHour: string;
  dominantElement: string;
}

/** Provider that produced the restaurant results in a discovery response. */
export type RestaurantDiscoverySource =
  | "olo"
  | "yelp"
  | "foursquare"
  | "google"
  | "osm"
  | "tripadvisor";

export interface RestaurantSearchResponse {
  restaurants: AlchmScoredRestaurant[];
  cosmicContext: CosmicContext;
  /** Provider that produced these results. Foursquare results are unscored. */
  source?: RestaurantDiscoverySource | undefined;
  /**
   * Note shown to the user when scoring/precision is degraded
   * (e.g. Yelp unavailable, falling back to Foursquare without alchm scoring).
   */
  sourceNotice?: string | undefined;
  error?: string | undefined;
}
