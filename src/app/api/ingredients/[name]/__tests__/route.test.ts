/**
 * GET /api/ingredients/[name] resolves exactly over the union catalog
 * (omnibar Phase 2.5a). Only the rate limiter and the recipe service are
 * mocked; the catalog and the recipe index are real.
 */
jest.mock("@/lib/rateLimit", () => ({ rateLimit: jest.fn() }));
jest.mock("@/services/UnifiedRecipeService", () => ({
  UnifiedRecipeService: { getInstance: () => ({ getAllRecipes: jest.fn().mockResolvedValue([]) }) },
}));

import { rateLimit } from "@/lib/rateLimit";
import { GET } from "../route";

interface Body {
  success: boolean;
  slug: string | null;
  ingredient: { name: string; category?: string } | null;
}

async function get(param: string): Promise<{ status: number; body: Body }> {
  const res = await GET(new Request(`http://localhost/api/ingredients/${encodeURIComponent(param)}`), {
    params: Promise.resolve({ name: encodeURIComponent(param) }),
  });
  const body: Body = await res.json();
  return { status: res.status, body };
}

beforeEach(() => {
  jest.mocked(rateLimit).mockResolvedValue({ allowed: true, remaining: 59, resetMs: 60_000 });
});

describe("GET /api/ingredients/[name]", () => {
  it("resolves a name the old substring fallback sent to Apple", async () => {
    const { status, body } = await get("Apple Cider Vinegar");
    expect(status).toBe(200);
    expect(body.slug).toBe("apple-cider-vinegar");
    expect(body.ingredient?.name).toBe("Apple Cider Vinegar");
  });

  it("resolves a slug to a unified-only card (eggs)", async () => {
    const { body } = await get("chicken-egg");
    expect(body.slug).toBe("chicken-egg");
    expect(body.ingredient).toMatchObject({ name: "Chicken Egg", category: "protein" });
  });

  it("an unknown name is a 200 with no card, never a near miss", async () => {
    const { status, body } = await get("fresh basil leaves");
    expect(status).toBe(200);
    expect(body).toMatchObject({ success: true, slug: null, ingredient: null });
  });
});
