/**
 * Tests for Restaurant Discovery Service
 *
 * Verifies robust fallback cascades, Nominatim integration with caching & throttling,
 * curated fallbacks, partner matching, dish review stats feedback loop, and signature dish suggestions.
 *
 * @file src/services/__tests__/restaurantDiscoveryService.test.ts
 */

jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn().mockImplementation((sql: string) => {
    if (sql.includes("restaurant_dish_reviews")) {
      return Promise.resolve({
        rows: [
          {
            restaurant_id: "partner_celestial_ramen",
            average_rating: 4.85,
            review_count: 14,
            top_dish: "Truffle Shoyu Ramen",
          },
        ],
        rowCount: 1,
      });
    }
    if (sql.includes("restaurants")) {
      return Promise.resolve({
        rows: [
          {
            internal_restaurant_id: "partner_celestial_ramen",
            external_id: "partner_celestial_ramen",
            external_provider: "curated",
            stripe_connect_account_id: "acct_celestial_123",
            deliverect_location_id: "deliv_celestial_123",
            alchemize_opt_in: true,
          },
        ],
        rowCount: 1,
      });
    }
    if (sql.includes("user_favorite_restaurants")) {
      return Promise.resolve({
        rows: [{ restaurant_id: "partner_celestial_ramen" }],
        rowCount: 1,
      });
    }
    if (sql.includes("restaurant_comments")) {
      return Promise.resolve({
        rows: [{ restaurant_id: "partner_celestial_ramen", count: 5 }],
        rowCount: 1,
      });
    }
    return Promise.resolve({ rows: [], rowCount: 0 });
  }),
}));

import {
  discoverRestaurants,
  getSignatureDishes,
  __clearNominatimCacheForTests,
} from "@/services/restaurantDiscoveryService";

describe("restaurantDiscoveryService", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    __clearNominatimCacheForTests();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("getSignatureDishes", () => {
    it("returns signature dishes for known partner restaurants", () => {
      const celestialDishes = getSignatureDishes("Celestial Ramen House");
      expect(celestialDishes).toContain("Rich Tonkotsu Ramen");
      expect(celestialDishes).toContain("Black Garlic Shoyu Ramen");

      const solDishes = getSignatureDishes("Sol & Luna Cantina");
      expect(solDishes).toContain("Birria de Res Tacos");
      expect(solDishes).toContain("Enchiladas Mole Poblano");
    });

    it("returns cuisine-specific signature dishes when restaurant is not specifically known", () => {
      const italianDishes = getSignatureDishes("Local Trattoria", "Italian");
      expect(italianDishes).toContain("Truffle Cacio e Pepe");
      expect(italianDishes).toContain("Fire Roasted Flatbread");

      const thaiDishes = getSignatureDishes("Unknown Spot", "Thai");
      expect(thaiDishes).toContain("Traditional Pad Thai");
      expect(thaiDishes).toContain("Tom Yum Goong");

      const mexicanDishes = getSignatureDishes("Corner Cantina", "Mexican");
      expect(mexicanDishes).toContain("Birria de Res Tacos");
    });

    it("returns sensible default fallback dishes when cuisine is unrecognised", () => {
      const defaultDishes = getSignatureDishes("Random Mystery Diner", "Martian Fusion");
      expect(defaultDishes.length).toBeGreaterThan(0);
      expect(defaultDishes).toContain("Chef's Signature Tasting");
    });
  });

  describe("discoverRestaurants", () => {
    it("discovers restaurants via keyless Nominatim provider and scores them", async () => {
      // Mock Nominatim response
      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (typeof url === "string" && url.includes("nominatim.openstreetmap.org")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => [
              {
                place_id: 101,
                osm_type: "node",
                osm_id: 5001,
                lat: "40.7130",
                lon: "-74.0062",
                display_name: "Tokyo Noodle Bar, 45 Broadway, New York, NY",
                name: "Tokyo Noodle Bar",
                address: {
                  road: "45 Broadway",
                  city: "New York",
                  state: "NY",
                  postcode: "10004",
                },
              },
            ],
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      });

      const res = await discoverRestaurants({
        cuisine: "Japanese",
        lat: 40.7128,
        lng: -74.006,
        radiusMeters: 5000,
      });

      expect(res.restaurants).toBeDefined();
      expect(res.restaurants.length).toBeGreaterThan(0);
      expect(res.source).toBe("osm");
      expect(res.cosmicContext).toBeDefined();

      const [first] = res.restaurants;
      expect(first.business.name).toBe("Tokyo Noodle Bar");
      expect(typeof first.alchmScore).toBe("number");
      expect(first.alchmScore).toBeGreaterThanOrEqual(0);
      expect(first.alchmScore).toBeLessThanOrEqual(1);
      expect(["Fire", "Water", "Earth", "Air"]).toContain(first.dominantElement);
    });

    it("uses in-memory cached Nominatim results on repeated searches without extra network requests", async () => {
      const fetchSpy = jest.fn().mockImplementation((url: string) => {
        if (typeof url === "string" && url.includes("nominatim.openstreetmap.org")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => [
              {
                place_id: 202,
                osm_type: "node",
                osm_id: 6002,
                lat: "40.7130",
                lon: "-74.0062",
                display_name: "Cached Bistro, 100 Main St, New York, NY",
                name: "Cached Bistro",
                address: { road: "100 Main St", city: "New York", state: "NY" },
              },
            ],
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      });
      global.fetch = fetchSpy;

      // First query caches result
      const res1 = await discoverRestaurants({
        cuisine: "Bistro",
        lat: 40.75,
        lng: -73.98,
      });
      expect(res1.restaurants.length).toBeGreaterThan(0);
      const callCountAfterFirst = fetchSpy.mock.calls.length;
      expect(callCountAfterFirst).toBeGreaterThan(0);

      // Second identical query should hit cache without calling fetch again
      const res2 = await discoverRestaurants({
        cuisine: "Bistro",
        lat: 40.75,
        lng: -73.98,
      });
      expect(res2.restaurants.length).toBeGreaterThan(0);
      expect(fetchSpy.mock.calls.length).toBe(callCountAfterFirst);
    });

    it("falls back to curated authentic spots, matches partners, and incorporates dish review feedback", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network offline"));

      const res = await discoverRestaurants({
        cuisine: "Japanese",
        lat: 40.7128,
        lng: -74.006,
      });

      expect(res.restaurants.length).toBeGreaterThan(0);
      expect(res.source).toBe("curated");
      expect(res.error).toBeUndefined();

      // Find partner restaurant in curated set
      const partner = res.restaurants.find((r) => r.isPartner === true);
      expect(partner).toBeDefined();
      expect(partner?.partnerRestaurantId).toBe("partner_celestial_ramen");
      expect(partner?.business.name).toBe("Celestial Ramen House");

      // Verify community dish ratings loop
      expect(partner?.dishReviewStats).toBeDefined();
      expect(partner?.dishReviewStats?.averageRating).toBe(4.85);
      expect(partner?.dishReviewStats?.reviewCount).toBe(14);
      expect(partner?.dishReviewStats?.topDish).toBe("Truffle Shoyu Ramen");

      // Match reasons include community review highlight
      const communityReason = partner?.matchReasons.find((r) => r.includes("Community favorite"));
      expect(communityReason).toBeDefined();
      expect(communityReason).toContain("Truffle Shoyu Ramen");

      // Verify Alchemized partner integration and comment count
      expect(partner?.isAlchemizedPartner).toBe(true);
      expect(partner?.matchReasons).toContain("✨ Alchemized Kitchen Partner");
      expect(partner?.commentCount).toBe(5);
    });

    it("boosts favorite sanctuaries by +0.06 and adds sanctuary match reason", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network offline"));

      const resWithoutFav = await discoverRestaurants({
        cuisine: "Japanese",
        lat: 40.7128,
        lng: -74.006,
      });

      const partnerUnfav = resWithoutFav.restaurants.find(
        (r) => r.partnerRestaurantId === "partner_celestial_ramen",
      );
      expect(partnerUnfav).toBeDefined();

      const resWithFav = await discoverRestaurants({
        cuisine: "Japanese",
        lat: 40.7128,
        lng: -74.006,
        favoriteIds: ["partner_celestial_ramen"],
      });

      const partnerFav = resWithFav.restaurants.find(
        (r) => r.partnerRestaurantId === "partner_celestial_ramen",
      );
      expect(partnerFav).toBeDefined();
      expect(partnerFav?.isFavorite).toBe(true);
      expect(partnerFav?.matchReasons).toContain("❤️ In your Favorite Sanctuaries");
      expect((partnerFav?.alchmScore ?? 0)).toBeGreaterThan(partnerUnfav?.alchmScore ?? 0);
    });

    it("returns non-empty curated results even for niche cuisines", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network offline"));

      const res = await discoverRestaurants({
        cuisine: "Vietnamese",
        lat: 34.0522,
        lng: -118.2437,
      });

      expect(res.restaurants.length).toBeGreaterThan(0);
      expect(res.source).toBe("curated");
      const names = res.restaurants.map((r) => r.business.name);
      expect(names).toContain("Pho Saigon Heritage");
    });
  });
});
