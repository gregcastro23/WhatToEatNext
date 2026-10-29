import { GET, POST } from "../route";
import { NextRequest } from "next/server";

const mockExecuteQuery = jest.fn(async (_query: string, params?: unknown[]) => {
  if (params && params[0] === "partner_alchm_trattoria") {
    return {
      rows: [
        {
          restaurant_id: "partner_alchm_trattoria",
          restaurant_name: "Alchm Italian Trattoria",
          source_url: "https://alchm-trattoria.example.com/menu",
          source_type: "partner_seeded",
          elemental_signature: { Fire: 15, Water: 25, Earth: 45, Air: 15, dominant: "Earth" },
          top_ingredients: [
            "Black Truffle",
            "Parmigiano-Reggiano",
            "Egg Tagliolini",
            "Mountain Butter",
            "San Marzano Tomatoes",
          ],
          dishes: [
            {
              id: "dish_tagliolini_truffle",
              name: "Tagliolini al Tartufo Nero",
              category: "Primi",
              description:
                "Handmade egg tagliolini with fresh black winter truffle, mountain butter, and 24-month Parmigiano-Reggiano.",
              price: "$28.00",
              ingredients: ["Black Truffle", "Parmigiano-Reggiano", "Egg Tagliolini", "Mountain Butter"],
              elementalProfile: { Fire: 0, Water: 15, Earth: 70, Air: 15 },
              dominantElement: "Earth",
              techniques: ["Hand-Rolled", "Emulsified"],
              textures: ["Velvety", "Al Dente"],
              dietaryTags: ["Vegetarian"],
            },
          ],
          summary: {
            archetype: "The Earth Sanctuary Hearth",
            dishCount: 1,
            dominantElement: "Earth",
            dominantPct: 45,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    };
  }
  return { rows: [] };
});

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (query: string, params?: unknown[]) => mockExecuteQuery(query, params),
}));

describe("Restaurant Menu Alchemy API (/api/restaurants/alchemize-menu)", () => {
  it("GET /api/restaurants/alchemize-menu returns 400 when restaurantId is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/restaurants/alchemize-menu");
    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("restaurantId");
  });

  it("GET /api/restaurants/alchemize-menu returns seeded alchemized menu for partner", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/restaurants/alchemize-menu?restaurantId=partner_alchm_trattoria",
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.menu.restaurantName).toBe("Alchm Italian Trattoria");
    expect(data.menu.topIngredients).toContain("Black Truffle");
    expect(data.menu.dishes.length).toBeGreaterThan(0);
    expect(data.menu.elementalSignature.dominant).toBe("Earth");
  });

  it("POST /api/restaurants/alchemize-menu returns 400 on missing restaurantId", async () => {
    const req = new NextRequest("http://localhost:3000/api/restaurants/alchemize-menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("POST /api/restaurants/alchemize-menu alchemizes dishes from menu text and returns deconstructed ingredients", async () => {
    const menuText = `
Starters:
Charred Octopus: Spanish octopus with smoked paprika, meyer lemon, and crispy fingerling potatoes. $18
Mains:
Wild Truffle Tagliatelle: Handmade pasta with black winter truffle, mountain butter, and parmigiano-reggiano. $26
    `;

    const req = new NextRequest("http://localhost:3000/api/restaurants/alchemize-menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId: "test_bistro_alchemy",
        restaurantName: "Bistro Alchemy",
        menuText,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.menu.restaurantId).toBe("test_bistro_alchemy");
    expect(data.menu.dishes.length).toBe(2);
    expect(data.menu.topIngredients).toContain("Black Truffle");
    expect(data.menu.dishes[1].techniques).toContain("Hand-Rolled");
  });
});
