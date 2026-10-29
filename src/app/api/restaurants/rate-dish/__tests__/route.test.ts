/**
 * Unit & Integration Tests for Restaurant Dish Rating & Review API
 *
 * Route: /api/restaurants/rate-dish (GET & POST)
 *
 * @file src/app/api/restaurants/rate-dish/__tests__/route.test.ts
 */

import { NextRequest } from "next/server";

const mockExecuteQuery = jest.fn();
const mockGetUserIdFromRequest = jest.fn();
const mockCreateEntry = jest.fn();
const mockUpdateEntry = jest.fn();
const mockRecordInteraction = jest.fn();

jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: () => mockGetUserIdFromRequest(),
}));

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (query: string, params?: unknown[]) => mockExecuteQuery(query, params),
}));

jest.mock("@/services/FoodDiaryService", () => ({
  foodDiaryService: {
    createEntry: (...args: unknown[]) => mockCreateEntry(...args),
    updateEntry: (...args: unknown[]) => mockUpdateEntry(...args),
  },
}));

jest.mock("@/services/userInteractionsService", () => ({
  recordInteraction: (...args: unknown[]) => mockRecordInteraction(...args),
}));

jest.mock("@/lib/logger", () => ({
  _logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { GET, POST } from "../route";

describe("Restaurant Dish Reviews API (/api/restaurants/rate-dish)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/restaurants/rate-dish", () => {
    it("returns 400 when restaurantId is missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/restaurants/rate-dish");
      const res = await GET(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/restaurantId query parameter is required/i);
    });

    it("returns 200 and reviews when restaurantId is provided", async () => {
      const mockReviews = [
        {
          id: "rev-1",
          restaurant_id: "partner_celestial_ramen",
          restaurant_name: "Celestial Shoyu Ramen",
          dish_name: "Truffle Shoyu Ramen",
          user_name: "AstroGourmet",
          rating: 4.5,
          comment: "Incredible broth depth and firm noodles.",
          mood_tags: ["energized", "satisfied"],
          would_eat_again: true,
          created_at: new Date().toISOString(),
        },
      ];

      mockExecuteQuery.mockResolvedValueOnce({
        rows: mockReviews,
        rowCount: 1,
      });

      const req = new NextRequest(
        "http://localhost:3000/api/restaurants/rate-dish?restaurantId=partner_celestial_ramen",
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.reviews).toHaveLength(1);
      expect(data.reviews[0].dish_name).toBe("Truffle Shoyu Ramen");
    });

    it("handles database errors gracefully with 500", async () => {
      mockExecuteQuery.mockRejectedValueOnce(new Error("DB connection timeout"));

      const req = new NextRequest(
        "http://localhost:3000/api/restaurants/rate-dish?restaurantId=partner_celestial_ramen",
      );
      const res = await GET(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/Failed to retrieve dish reviews/i);
    });
  });

  describe("POST /api/restaurants/rate-dish", () => {
    it("returns 400 on malformed JSON body", async () => {
      const req = new NextRequest("http://localhost:3000/api/restaurants/rate-dish", {
        method: "POST",
        body: "invalid-json",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/Invalid JSON in request body/i);
    });

    it("returns 400 when missing required fields (dishName)", async () => {
      const req = new NextRequest("http://localhost:3000/api/restaurants/rate-dish", {
        method: "POST",
        body: JSON.stringify({
          restaurantId: "partner_celestial_ramen",
          restaurantName: "Celestial Shoyu Ramen",
          rating: 5,
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/Validation (failed|error)/i);
    });

    it("returns 400 when rating is outside valid range [0.5, 5]", async () => {
      const req = new NextRequest("http://localhost:3000/api/restaurants/rate-dish", {
        method: "POST",
        body: JSON.stringify({
          restaurantId: "partner_celestial_ramen",
          restaurantName: "Celestial Shoyu Ramen",
          dishName: "Truffle Shoyu Ramen",
          rating: 6.5,
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/Validation (failed|error)/i);
    });

    it("successfully creates a review, logs to Food Diary, and records interaction", async () => {
      mockGetUserIdFromRequest.mockResolvedValueOnce("usr_12345678");

      const mockSavedReview = {
        id: "rev-saved-100",
        restaurant_id: "partner_celestial_ramen",
        restaurant_name: "Celestial Shoyu Ramen",
        dish_name: "Truffle Shoyu Ramen",
        user_id: "usr_12345678",
        user_name: "GourmetTraveler",
        rating: 5,
        comment: "Rich savory flavor perfectly aligned with solar hour.",
        mood_tags: ["energized", "satisfied"],
        would_eat_again: true,
        order_id: "ord_abc_99",
        created_at: new Date().toISOString(),
      };

      mockExecuteQuery
        .mockResolvedValueOnce({
          rows: [{ name: "GourmetTraveler" }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          rows: [mockSavedReview],
          rowCount: 1,
        });

      mockCreateEntry.mockResolvedValueOnce({
        id: "diary-entry-555",
      });

      const payload = {
        restaurantId: "partner_celestial_ramen",
        restaurantName: "Celestial Shoyu Ramen",
        dishName: "Truffle Shoyu Ramen",
        userName: "GourmetTraveler",
        rating: 5,
        comment: "Rich savory flavor perfectly aligned with solar hour.",
        moodTags: ["energized", "satisfied"],
        wouldEatAgain: true,
        orderId: "ord_abc_99",
        addToDiary: true,
      };

      const req = new NextRequest("http://localhost:3000/api/restaurants/rate-dish", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.review.dish_name).toBe("Truffle Shoyu Ramen");
      expect(data.diaryEntryId).toBe("diary-entry-555");

      // Verify DB calls made (user lookup + insert)
      expect(mockExecuteQuery).toHaveBeenCalledTimes(2);
      expect(mockExecuteQuery.mock.calls[1][0]).toContain(
        "INSERT INTO restaurant_dish_reviews",
      );

      // Verify Food Diary called with expected fields
      expect(mockCreateEntry).toHaveBeenCalledWith(
        "usr_12345678",
        expect.objectContaining({
          foodName: "Truffle Shoyu Ramen",
          brandName: "Celestial Shoyu Ramen",
          foodSource: "restaurant",
        }),
      );

      expect(mockUpdateEntry).toHaveBeenCalledWith(
        "usr_12345678",
        expect.objectContaining({
          id: "diary-entry-555",
          rating: 5,
          moodTags: ["energized", "satisfied"],
          wouldEatAgain: true,
        }),
      );

      // Verify interaction recorded
      expect(mockRecordInteraction).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "usr_12345678",
          type: "food_rating",
          payload: expect.objectContaining({
            dishName: "Truffle Shoyu Ramen",
            restaurantId: "partner_celestial_ramen",
          }),
        }),
      );
    });

    it("succeeds for anonymous user without creating Food Diary entry", async () => {
      mockGetUserIdFromRequest.mockResolvedValueOnce(null);

      const mockSavedReview = {
        id: "rev-anon-1",
        restaurant_id: "partner_sol_taqueria",
        restaurant_name: "Sol Taqueria & Mezcal Bar",
        dish_name: "Charred Birria Tacos",
        user_id: null,
        user_name: "Anonymous Foodie",
        rating: 4.5,
        comment: "Spicy and crisp shell.",
        mood_tags: ["satisfied"],
        would_eat_again: true,
        order_id: null,
        created_at: new Date().toISOString(),
      };

      mockExecuteQuery.mockResolvedValueOnce({
        rows: [mockSavedReview],
        rowCount: 1,
      });

      const payload = {
        restaurantId: "partner_sol_taqueria",
        restaurantName: "Sol Taqueria & Mezcal Bar",
        dishName: "Charred Birria Tacos",
        userName: "Anonymous Foodie",
        rating: 4.5,
        comment: "Spicy and crisp shell.",
        moodTags: ["satisfied"],
        wouldEatAgain: true,
        addToDiary: true,
      };

      const req = new NextRequest("http://localhost:3000/api/restaurants/rate-dish", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.review.id).toBe("rev-anon-1");
      expect(data.diaryEntryId).toBeUndefined();

      // foodDiaryService.createEntry should NOT be called for unauthenticated user
      expect(mockCreateEntry).not.toHaveBeenCalled();
    });
  });
});
