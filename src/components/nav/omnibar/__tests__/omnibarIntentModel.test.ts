/**
 * Phase 5 in the omnibar's model, over real responses: the intent chips, and
 * several named ingredients leading with the recipes that use them together.
 */
import type { SearchIndex } from "@/lib/search/searchIndex";
import type { OmnibarResponse } from "@/lib/validation/searchSchemas";
import { buildOmnibarModel, LIMITS, smartEnterTarget, type OmnibarModel } from "../omnibarModel";
import { loadIndex, wire } from "./helpers/wireSearch";

let index: SearchIndex;

beforeAll(async () => {
  index = await loadIndex();
}, 120_000);

function model(query: string, response: OmnibarResponse = wire(index, query)): OmnibarModel {
  return buildOmnibarModel({ query, response, status: "ready", recent: [] });
}

describe("several ingredients", () => {
  it("spinach eggs feta: recipes with all three lead, each saying how many it uses", () => {
    const m = model("spinach eggs feta");
    const [first] = m.sections;
    expect(first?.id).toBe("coverage");
    expect(first?.title).toMatch(/^RECIPES WITH SPINACH \+ CHICKEN EGG \+ FETA · \d+$/);
    expect(first?.rows.length).toBeLessThanOrEqual(LIMITS.containing);
    expect(first?.rows[0]?.hint).toBe("USES 3 OF 3");
    expect(first?.rows.some((r) => /^USES 2 OF 3 · MISSING [A-Z ,]+$/.test(r.hint))).toBe(true);
    expect(first?.rows.every((r) => r.href.startsWith("/recipes/"))).toBe(true);
    expect(m.sections.map((s) => s.id)).not.toContain("hero");
  });

  it("a recipe listed under the coverage is not listed again under RECIPES", () => {
    const m = model("spinach eggs");
    const hrefs = (id: string): string[] => (m.sections.find((s) => s.id === id)?.rows ?? []).map((r) => r.href);
    const covered = new Set(hrefs("coverage"));
    expect(covered.size).toBeGreaterThan(0);
    expect(hrefs("recipes").filter((href) => covered.has(href))).toEqual([]);
  });

  it("Enter opens the full results, where the coverage list is complete", () => {
    const m = model("spinach eggs");
    expect(smartEnterTarget("spinach eggs", m.exactNav, wire(index, "spinach eggs")).href).toBe("/search?q=spinach%20eggs");
  });
});

describe("intent chips", () => {
  it("vegan breakfast: both chips, and the recipes they keep", () => {
    const m = model("vegan breakfast");
    expect(m.chips.map((c) => c.label)).toEqual(["Vegan", "Breakfast"]);
    expect(m.chips.every((c) => c.applied && c.basis.length > 20)).toBe(true);
    expect(m.sections[0]?.id).toBe("recipes");
  });

  it("the hero's recipe count is the filtered count", () => {
    const response = wire(index, "quick chicken");
    const withTitle = model("quick chicken", response).sections.find((s) => s.id === "with")?.title;
    expect(withTitle).toBe(`RECIPES WITH CHICKEN · ${response.recipesContainingTotal}`);
    expect(response.recipesContainingTotal).toBeLessThan(response.hero?.recipeCount ?? 0);
  });

  it("an exact page name suppresses the chips, as it does the correction", () => {
    const response = wire(index, "vegan");
    expect(response.chips.length).toBe(1);
    const suppressed = buildOmnibarModel({ query: "pantry", response: { ...response, query: "pantry" }, status: "ready", recent: [] });
    expect(suppressed.exactNav?.href).toBe("/pantry");
    expect(suppressed.chips).toEqual([]);
  });

  it("a plain name has no chips", () => {
    expect(model("spinach").chips).toEqual([]);
  });
});
