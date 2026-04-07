/**
 * Tests for the Instacart recipe route.
 * Verifies pantry-aware exclusion before the upstream IDP call.
 */

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
  NextRequest: class MockNextRequest {
    url: string;
    method?: string;
    body?: string;
    constructor(url: string, init?: { method?: string; body?: string }) {
      this.url = url;
      this.method = init?.method;
      this.body = init?.body;
    }
    async json() {
      return this.body ? JSON.parse(this.body) : null;
    }
  },
}));

jest.mock("@/lib/instacart/idpClient", () => ({
  fetchInstacartIdp: jest.fn(),
  InstacartConfigurationError: class InstacartConfigurationError extends Error {},
  mapInstacartProxyError: jest.fn((response, text, fallback) => {
    if (response.status === 401) {
      return { statusCode: 401, details: "Unauthorized: Invalid API key" };
    }
    return { statusCode: 502, details: fallback };
  }),
}));

import { POST } from "../route";
import { fetchInstacartIdp } from "@/lib/instacart/idpClient";

describe("Instacart Recipe API (/api/instacart/recipe)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should exclude pantry-covered ingredients before calling Instacart", async () => {
    (fetchInstacartIdp as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        products_link_url: "https://connect.instacart.com/mock-recipe",
      }),
    });

    const req = new (jest.requireMock("next/server").NextRequest)(
      "http://localhost:3000/api/instacart/recipe",
      {
        method: "POST",
        body: JSON.stringify({
          title: "Roast Chicken",
          external_reference_id: "recipe-123",
          inventory: ["olive oil", "salt"],
          ingredients: [
            { name: "olive oil", display_text: "2 tbsp olive oil" },
            { name: "salt", display_text: "1 tsp salt" },
            { name: "chicken thighs", display_text: "2 lb chicken thighs" },
          ],
        }),
      },
    );

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(fetchInstacartIdp).toHaveBeenCalledWith(
      "products/recipe",
      expect.objectContaining({
        method: "POST",
        body: expect.objectContaining({
          ingredients: [{ name: "chicken thighs", display_text: "2 lb chicken thighs" }],
        }),
      }),
    );
    expect(data.ingredient_count).toBe(1);
    expect(data.excluded_pantry_items).toEqual(["olive oil", "salt"]);
  });

  it("should return 400 when pantry inventory covers every ingredient", async () => {
    const req = new (jest.requireMock("next/server").NextRequest)(
      "http://localhost:3000/api/instacart/recipe",
      {
        method: "POST",
        body: JSON.stringify({
          title: "Pantry Pasta",
          inventory: ["pasta", "olive oil"],
          ingredients: [
            { name: "pasta", display_text: "1 lb pasta" },
            { name: "olive oil", display_text: "2 tbsp olive oil" },
          ],
        }),
      },
    );

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(fetchInstacartIdp).not.toHaveBeenCalled();
    expect(data.error).toContain("pantry inventory");
    expect(data.excluded_pantry_items).toEqual(["pasta", "olive oil"]);
  });

  it("should return cached response when same recipe and inventory are requested", async () => {
    (fetchInstacartIdp as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        products_link_url: "https://connect.instacart.com/first-call",
      }),
    });

    const payload = {
      title: "Shared Recipe",
      external_reference_id: "shared-1",
      inventory: ["water"],
      ingredients: [{ name: "water" }, { name: "flour" }],
    };

    const req1 = new (jest.requireMock("next/server").NextRequest)(
      "http://localhost:3000/api/instacart/recipe",
      { method: "POST", body: JSON.stringify(payload) }
    );

    await POST(req1); // Fill cache

    const req2 = new (jest.requireMock("next/server").NextRequest)(
      "http://localhost:3000/api/instacart/recipe",
      { method: "POST", body: JSON.stringify(payload) }
    );

    const response = await POST(req2);
    const data = await response.json();

    expect(data.cached).toBe(true);
    expect(fetchInstacartIdp).toHaveBeenCalledTimes(1); // Only once
  });

  it("should bypass cache when inventory changes", async () => {
    (fetchInstacartIdp as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        products_link_url: "https://connect.instacart.com/url",
      }),
    });

    const basePayload = {
      title: "Variable Recipe",
      external_reference_id: "var-1",
      ingredients: [{ name: "item1" }, { name: "item2" }],
    };

    // First call with inventory A
    await POST(new (jest.requireMock("next/server").NextRequest)(
      "http://localhost:3000/api/instacart/recipe",
      { method: "POST", body: JSON.stringify({ ...basePayload, inventory: ["item1"] }) }
    ));

    // Second call with inventory B (different)
    const response = await POST(new (jest.requireMock("next/server").NextRequest)(
      "http://localhost:3000/api/instacart/recipe",
      { method: "POST", body: JSON.stringify({ ...basePayload, inventory: ["item2"] }) }
    ));

    const data = await response.json();
    expect(data.cached).toBeUndefined(); // Should be a miss
    expect(fetchInstacartIdp).toHaveBeenCalledTimes(2);
  });

  it("should handle IDP backend errors gracefully", async () => {
    (fetchInstacartIdp as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Invalid Key",
    });

    const req = new (jest.requireMock("next/server").NextRequest)(
      "http://localhost:3000/api/instacart/recipe",
      {
        method: "POST",
        body: JSON.stringify({
          title: "Error Recipe",
          ingredients: [{ name: "void" }],
        }),
      },
    );

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.details).toBe("Unauthorized: Invalid API key");
  });
});
