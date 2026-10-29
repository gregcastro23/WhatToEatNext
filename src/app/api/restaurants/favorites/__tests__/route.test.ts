import { NextRequest } from "next/server";
import { GET, POST, DELETE } from "../route";

const mockExecuteQuery = jest.fn();

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: jest.fn().mockResolvedValue("user_test_fav"),
}));

describe("Restaurant Favorites API (/api/restaurants/favorites)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/restaurants/favorites", () => {
    it("returns user favorites and favoriteIds", async () => {
      mockExecuteQuery.mockResolvedValueOnce({
        rows: [
          {
            id: "fav_1",
            user_id: "user_test_fav",
            restaurant_id: "partner_celestial_ramen",
            restaurant_name: "Celestial Ramen House",
            cuisine: "Japanese",
            source: "osm",
            notes: "Best truffle shoyu in town",
            favorite_dishes: ["Truffle Shoyu Ramen"],
            created_at: new Date().toISOString(),
          },
        ],
      });

      const request = new NextRequest("http://localhost:3000/api/restaurants/favorites");
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.favoriteIds).toEqual(["partner_celestial_ramen"]);
      expect(json.favorites).toHaveLength(1);
    });
  });

  describe("POST /api/restaurants/favorites", () => {
    it("returns 400 on malformed body", async () => {
      const request = new NextRequest("http://localhost:3000/api/restaurants/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json",
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("returns 400 when restaurantId is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/restaurants/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantName: "Test Spot" }),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("explicitly sets favorite to true (upsert)", async () => {
      mockExecuteQuery.mockResolvedValueOnce({
        rows: [
          {
            id: "fav_new",
            user_id: "user_test_fav",
            restaurant_id: "partner_celestial_ramen",
            restaurant_name: "Celestial Ramen House",
            cuisine: "Japanese",
            source: "osm",
            notes: "My cozy sanctuary",
            favorite_dishes: ["Truffle Shoyu Ramen"],
            created_at: new Date().toISOString(),
          },
        ],
      });

      const request = new NextRequest("http://localhost:3000/api/restaurants/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: "partner_celestial_ramen",
          restaurantName: "Celestial Ramen House",
          cuisine: "Japanese",
          notes: "My cozy sanctuary",
          favoriteDishes: ["Truffle Shoyu Ramen"],
          isFavorite: true,
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.isFavorite).toBe(true);
      expect(json.favorite.restaurant_id).toBe("partner_celestial_ramen");
    });

    it("explicitly removes favorite when isFavorite is false", async () => {
      mockExecuteQuery.mockResolvedValueOnce({ rows: [] });

      const request = new NextRequest("http://localhost:3000/api/restaurants/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: "partner_celestial_ramen",
          restaurantName: "Celestial Ramen House",
          isFavorite: false,
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.isFavorite).toBe(false);
    });
  });

  describe("DELETE /api/restaurants/favorites", () => {
    it("deletes a favorite by query parameter", async () => {
      mockExecuteQuery.mockResolvedValueOnce({ rows: [] });

      const request = new NextRequest(
        "http://localhost:3000/api/restaurants/favorites?restaurantId=partner_celestial_ramen",
        { method: "DELETE" },
      );

      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.isFavorite).toBe(false);
      expect(json.restaurantId).toBe("partner_celestial_ramen");
    });
  });
});
