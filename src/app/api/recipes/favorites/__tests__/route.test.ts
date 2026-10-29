import { NextRequest } from "next/server";
import { GET, POST, DELETE } from "../route";

const mockExecuteQuery = jest.fn();

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: jest.fn().mockResolvedValue("user_recipe_master"),
}));

describe("Favorite Recipes & Ingredient Tracking API (/api/recipes/favorites)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/recipes/favorites", () => {
    it("returns empty favorites and ingredients when user has none", async () => {
      mockExecuteQuery
        .mockResolvedValueOnce({ rows: [] }) // favorites query
        .mockResolvedValueOnce({ rows: [] }) // tracked ingredients
        .mockResolvedValueOnce({ rows: [] }); // liked ingredients

      const req = new NextRequest("http://localhost:3000/api/recipes/favorites");
      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.favorites).toEqual([]);
      expect(json.favoriteIds).toEqual([]);
      expect(json.topTrackedIngredients).toEqual([]);
      expect(json.topLikedIngredients).toEqual([]);
    });

    it("returns favorited recipes with aggregated top tracked ingredients", async () => {
      const mockFavorite = {
        id: "fav_1",
        user_id: "user_recipe_master",
        recipe_id: "recipe_truffle_pasta",
        recipe_name: "Truffle Tagliatelle",
        cuisine: "Italian",
        ingredients: ["Egg Tagliolini", "Black Truffle", "Parmigiano-Reggiano", "Butter"],
        liked_ingredients: ["Black Truffle", "Parmigiano-Reggiano"],
        elemental_profile: { Earth: 70, Water: 20, Air: 10 },
        notes: "Cook pasta 1 min less than package instructions",
        created_at: new Date().toISOString(),
      };

      mockExecuteQuery
        .mockResolvedValueOnce({ rows: [mockFavorite] }) // favorites
        .mockResolvedValueOnce({
          rows: [
            { name: "Black Truffle", count: "4" },
            { name: "Egg Tagliolini", count: "3" },
            { name: "Parmigiano-Reggiano", count: "3" },
          ],
        }) // tracked ingredients
        .mockResolvedValueOnce({
          rows: [
            { name: "Black Truffle", count: "4" },
            { name: "Parmigiano-Reggiano", count: "2" },
          ],
        }); // liked ingredients

      const req = new NextRequest("http://localhost:3000/api/recipes/favorites");
      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.favorites.length).toBe(1);
      expect(json.favoriteIds).toContain("recipe_truffle_pasta");
      expect(json.topTrackedIngredients[0]).toEqual({ name: "Black Truffle", count: 4 });
      expect(json.topLikedIngredients[0]).toEqual({ name: "Black Truffle", count: 4 });
    });
  });

  describe("POST /api/recipes/favorites", () => {
    it("returns 400 on invalid or missing JSON body", async () => {
      const req = new NextRequest("http://localhost:3000/api/recipes/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it("returns 400 when recipeId or recipeName is missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/recipes/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: "recipe_1" }), // missing recipeName
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe("Validation failed");
    });

    it("inserts new favorite recipe and returns updated ingredient frequencies", async () => {
      mockExecuteQuery
        .mockResolvedValueOnce({ rows: [] }) // check existing -> none
        .mockResolvedValueOnce({
          rows: [
            {
              id: "fav_2",
              user_id: "user_recipe_master",
              recipe_id: "recipe_ramen",
              recipe_name: "Tonkotsu Ramen",
              cuisine: "Japanese",
              ingredients: ["Ramen Noodles", "Pork Broth", "Garlic", "Scallions"],
              liked_ingredients: ["Garlic"],
              elemental_profile: { Water: 60, Fire: 30, Earth: 10 },
              notes: null,
              created_at: new Date().toISOString(),
            },
          ],
        }) // insert
        .mockResolvedValueOnce({
          rows: [{ name: "Garlic", count: "3" }],
        }) // tracked
        .mockResolvedValueOnce({
          rows: [{ name: "Garlic", count: "2" }],
        }); // liked

      const req = new NextRequest("http://localhost:3000/api/recipes/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: "recipe_ramen",
          recipeName: "Tonkotsu Ramen",
          cuisine: "Japanese",
          ingredients: ["Ramen Noodles", "Pork Broth", "Garlic", "Scallions"],
          likedIngredients: ["Garlic"],
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.isFavorite).toBe(true);
      expect(json.favorite.recipe_id).toBe("recipe_ramen");
      expect(json.topTrackedIngredients).toEqual([{ name: "Garlic", count: 3 }]);
    });

    it("explicitly removes favorite when isFavorite is false", async () => {
      mockExecuteQuery
        .mockResolvedValueOnce({ rows: [] }) // delete
        .mockResolvedValueOnce({ rows: [] }) // tracked
        .mockResolvedValueOnce({ rows: [] }); // liked

      const req = new NextRequest("http://localhost:3000/api/recipes/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: "recipe_ramen",
          recipeName: "Tonkotsu Ramen",
          isFavorite: false,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.isFavorite).toBe(false);
      expect(json.recipeId).toBe("recipe_ramen");
    });

    it("toggles OFF an existing favorite when isFavorite is omitted", async () => {
      mockExecuteQuery
        .mockResolvedValueOnce({ rows: [{ id: "fav_existing" }] }) // check existing -> found
        .mockResolvedValueOnce({ rows: [] }) // delete
        .mockResolvedValueOnce({ rows: [] }) // tracked
        .mockResolvedValueOnce({ rows: [] }); // liked

      const req = new NextRequest("http://localhost:3000/api/recipes/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: "recipe_ramen",
          recipeName: "Tonkotsu Ramen",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.isFavorite).toBe(false);
      expect(json.recipeId).toBe("recipe_ramen");
    });
  });

  describe("DELETE /api/recipes/favorites", () => {
    it("returns 400 when recipeId is missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/recipes/favorites", {
        method: "DELETE",
      });
      const res = await DELETE(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("recipeId is required");
    });

    it("deletes favorite via query parameter ?recipeId=...", async () => {
      mockExecuteQuery
        .mockResolvedValueOnce({ rows: [] }) // delete
        .mockResolvedValueOnce({ rows: [] }) // tracked
        .mockResolvedValueOnce({ rows: [] }); // liked

      const req = new NextRequest(
        "http://localhost:3000/api/recipes/favorites?recipeId=recipe_truffle_pasta",
        { method: "DELETE" },
      );
      const res = await DELETE(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.isFavorite).toBe(false);
      expect(json.recipeId).toBe("recipe_truffle_pasta");
    });

    it("deletes favorite via JSON body", async () => {
      mockExecuteQuery
        .mockResolvedValueOnce({ rows: [] }) // delete
        .mockResolvedValueOnce({ rows: [] }) // tracked
        .mockResolvedValueOnce({ rows: [] }); // liked

      const req = new NextRequest("http://localhost:3000/api/recipes/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: "recipe_truffle_pasta" }),
      });
      const res = await DELETE(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.isFavorite).toBe(false);
      expect(json.recipeId).toBe("recipe_truffle_pasta");
    });
  });
});
