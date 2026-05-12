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
  price?: string;
  distance?: number;
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
  image_url?: string;
  is_closed: boolean;
}

export interface YelpSearchParams {
  term: string;
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
  sort_by?: "best_match" | "rating" | "review_count" | "distance";
  open_now?: boolean;
}

export interface YelpSearchResponse {
  businesses: YelpBusiness[];
  total: number;
  region: {
    center: { latitude: number; longitude: number };
  };
}

export interface AlchmScoredRestaurant {
  externalId?: string;
  name?: string;
  address?: string;
  rating?: number;
  imageUrl?: string;
  business: YelpBusiness;
  alchmScore: number;
  elementalMatch: number;
  planetaryAlignment: number;
  monicaCompatibility: number;
  dominantElement: "Fire" | "Water" | "Earth" | "Air";
  matchReasons: string[];
  cuisineElement: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  /** True when this provider result maps to a fully active local restaurant partner. */
  isPartner?: boolean;
  /** Internal restaurant row id, used by Stripe Connect order handoff. */
  partnerRestaurantId?: string;
  partnerOnboardingStatus?: string;
  stripeConnectAccountId?: string;
  deliverectLocationId?: string;
}

export interface CosmicContext {
  currentZodiac: string;
  planetaryHour: string;
  dominantElement: string;
}

/** Provider that produced the restaurant results in a discovery response. */
export type RestaurantDiscoverySource = "olo" | "yelp" | "foursquare";

export interface RestaurantSearchResponse {
  restaurants: AlchmScoredRestaurant[];
  cosmicContext: CosmicContext;
  /** Provider that produced these results. Foursquare results are unscored. */
  source?: RestaurantDiscoverySource;
  /**
   * Note shown to the user when scoring/precision is degraded
   * (e.g. Yelp unavailable, falling back to Foursquare without alchm scoring).
   */
  sourceNotice?: string;
  error?: string;
}
