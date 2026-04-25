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
}

export interface CosmicContext {
  currentZodiac: string;
  planetaryHour: string;
  dominantElement: string;
}

export interface RestaurantSearchResponse {
  restaurants: AlchmScoredRestaurant[];
  cosmicContext: CosmicContext;
  error?: string;
}
