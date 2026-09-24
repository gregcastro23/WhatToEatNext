/**
 * GET /api/ingredients/[name] over the union catalog (omnibar Phase 2.5a):
 * an exact identity first, then the legacy match for recipe lines. Only the
 * rate limiter and the recipe service are mocked; the catalogs and the recipe
 * index are real.
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

  it("a recipe line that is no identity keeps the legacy match (the drawer's card)", async () => {
    const { body } = await get("ground beef (80/20)");
    expect(body.ingredient?.name).toBe("Beef");
    expect(body.slug).toBe("beef");
  });

  it("a name nothing matches is a 200 with no card", async () => {
    const { status, body } = await get("xqzv");
    expect(status).toBe(200);
    expect(body).toMatchObject({ success: true, slug: null, ingredient: null });
  });
});
