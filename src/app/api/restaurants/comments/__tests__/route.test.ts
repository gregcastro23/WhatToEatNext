import { NextRequest } from "next/server";
import { GET, POST } from "../route";

const mockExecuteQuery = jest.fn();

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: jest.fn().mockResolvedValue("user_commenter"),
}));

describe("Restaurant Comments API (/api/restaurants/comments)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/restaurants/comments", () => {
    it("returns 400 when restaurantId is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/restaurants/comments");
      const response = await GET(request);
      expect(response.status).toBe(400);
    });

    it("returns comments for a restaurant", async () => {
      mockExecuteQuery.mockResolvedValueOnce({
        rows: [
          {
            id: "com_1",
            restaurant_id: "partner_celestial_ramen",
            menu_item_id: "item_truffle_ramen",
            dish_name: "Truffle Shoyu Ramen",
            user_id: "user_commenter",
            user_display_name: "Alchemist #user_c",
            comment: "Ask for extra scallions, it balances the earthy broth perfectly!",
            helpful_count: 3,
            elemental_note: "Water-Earth grounding harmony",
            created_at: new Date().toISOString(),
          },
        ],
      });

      const request = new NextRequest(
        "http://localhost:3000/api/restaurants/comments?restaurantId=partner_celestial_ramen",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.comments).toHaveLength(1);
      expect(json.comments[0].dish_name).toBe("Truffle Shoyu Ramen");
    });
  });

  describe("POST /api/restaurants/comments", () => {
    it("returns 400 when comment is empty", async () => {
      const request = new NextRequest("http://localhost:3000/api/restaurants/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: "partner_celestial_ramen",
          comment: "",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("successfully creates a comment with dish/menu item reference", async () => {
      mockExecuteQuery.mockResolvedValueOnce({
        rows: [
          {
            id: "com_2",
            restaurant_id: "partner_celestial_ramen",
            menu_item_id: "item_truffle_ramen",
            dish_name: "Truffle Shoyu Ramen",
            user_id: "user_commenter",
            user_display_name: "Gourmet Chef",
            comment: "Pairs beautifully with warm jasmine tea.",
            helpful_count: 0,
            elemental_note: "Air elevation",
            liked_ingredients: ["Black Garlic", "House Noodles"],
            dish_features: ["Charred Mayu", "Silky Broth"],
            texture_notes: ["Velvety"],
            created_at: new Date().toISOString(),
          },
        ],
      });

      const request = new NextRequest("http://localhost:3000/api/restaurants/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: "partner_celestial_ramen",
          menuItemId: "item_truffle_ramen",
          dishName: "Truffle Shoyu Ramen",
          userDisplayName: "Gourmet Chef",
          comment: "Pairs beautifully with warm jasmine tea.",
          elementalNote: "Air elevation",
          likedIngredients: ["Black Garlic", "House Noodles"],
          dishFeatures: ["Charred Mayu", "Silky Broth"],
          textureNotes: ["Velvety"],
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.comment.comment).toBe("Pairs beautifully with warm jasmine tea.");
      expect(json.comment.liked_ingredients).toContain("Black Garlic");
      expect(json.comment.dish_features).toContain("Charred Mayu");
    });
  });
});
