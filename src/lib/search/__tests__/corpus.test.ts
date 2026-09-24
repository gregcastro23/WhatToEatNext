/**
 * Search core over the REAL catalogs (plan §7 Phase 1 exit criteria, §8 golden
 * set). Recipes come from the static catalog here; the loader passes the live
 * one in production, so ids differ but names and ranking do not.
 */
import { getServerRecipes } from "@/actions/recipes";
import { allCookingMethods } from "@/data/cooking";
import { getIngredientCatalog } from "@/lib/ingredients/ingredientCatalog";
import { slugToCuisineKey } from "@/utils/cuisineSlug";
import { buildIndexForRecipes } from "../loader";
import { searchOmnibar } from "../omnibar";
import { rankEntities } from "../rank";
import type { SearchIndex } from "../searchIndex";
import { INGREDIENT_SYNONYMS } from "../synonyms";
import { normalizeText } from "../text";
import type { OmnibarResult } from "../types";

const SEPTEMBER = new Date("2026-09-23T12:00:00Z");
let index: SearchIndex;

beforeAll(async () => {
  index = buildIndexForRecipes(await getServerRecipes());
}, 120_000);

function search(query: string, now: Date = SEPTEMBER): OmnibarResult {
  return searchOmnibar(index, query, { now });
}

/** Deletion, transposition and substitution at the middle of the word. */
function oneEditTypos(word: string): string[] {
  const m = Math.floor(word.length / 2);
  const next = (c: string): string => (c === "z" ? "a" : String.fromCharCode(c.charCodeAt(0) + 1));
  const typos = [word.slice(0, m) + word.slice(m + 1), word.slice(0, m) + next(word.charAt(m)) + word.slice(m + 1)];
  if (word.charAt(m - 1) !== word.charAt(m)) {
    typos.push(word.slice(0, m - 1) + word.charAt(m) + word.charAt(m - 1) + word.slice(m + 1));
  }
  return typos.filter((t) => t !== word);
}

describe("corpus: every catalog ingredient", () => {
  it("finds itself first by its own name (1,002/1,002 union cards, distinct heroes)", () => {
    const heroes = [...index.ingredients.values()].map((r) => search(r.name).hero?.key ?? null);
    expect(heroes).toEqual([...index.ingredients.keys()]);
    expect(new Set(heroes).size).toBe(getIngredientCatalog().entries.length);
  });

  it("recovers one-edit typos in the top 3 (baseline 2,598/2,601)", () => {
    let total = 0;
    const misses: string[] = [];
    for (const record of index.ingredients.values()) {
      const { folded } = normalizeText(record.name);
      if (folded.length < 5) continue;
      for (const typo of oneEditTypos(folded)) {
        total += 1;
        const top3 = rankEntities(index, normalizeText(typo)).slice(0, 3);
        if (!top3.some((h) => h.entity.key === record.key)) misses.push(`${typo}→${record.name}`);
      }
    }
    expect(total).toBeGreaterThan(2500);
    // [MEASURED 2026-09-23] 3 misses, all 4-letter typos that are whole
    // substrings of another word ("aple" ⊂ "maple"). Ratchet: may not grow.
    expect(misses.length).toBeLessThanOrEqual(3);
  });
});

describe("synonyms", () => {
  it.each(INGREDIENT_SYNONYMS.map((s) => [s.term, s.canonical]))("%s → %s points at a real catalog key", (_, canonical) => {
    expect([...index.ingredients.keys()]).toContain(canonical);
  });

  it("no synonym term shadows a real catalog ingredient", () => {
    const names = new Set([...index.ingredients.values()].map((r) => normalizeText(r.name).folded));
    expect(INGREDIENT_SYNONYMS.filter((s) => names.has(normalizeText(s.term).folded))).toEqual([]);
  });
});

describe("destinations resolve", () => {
  it("every cooking-method href names a servable method", () => {
    const methods = index.entities.filter((e) => e.entity.kind === "method");
    expect(methods.length).toBeGreaterThan(20);
    for (const { entity } of methods) expect(Object.keys(allCookingMethods)).toContain(entity.key);
  });

  it("every cuisine href slug maps back to its cuisine", () => {
    for (const { entity } of index.entities.filter((e) => e.entity.kind === "cuisine")) {
      expect(slugToCuisineKey(entity.href.replace("/cuisines/", ""))).toBe(entity.key);
    }
  });
});

describe("golden queries (plan §8)", () => {
  it("spinach: hero, recipes that name it in the title first, no correction", () => {
    const r = search("spinach");
    expect(r.hero?.key).toBe("spinach");
    expect(r.corrected).toBeNull();
    expect(r.hero?.recipeCount).toBeGreaterThanOrEqual(15);
    expect(r.recipesContaining[0]?.name.toLowerCase()).toContain("spinach");
  });

  it.each([
    ["pinach", "mid-word"],
    ["spinich", "edit-distance"],
    ["palak", "synonym"],
  ])("%s → spinach, corrected by %s", (query, basis) => {
    const r = search(query);
    expect(r.hero?.key).toBe("spinach");
    expect(r.corrected).toEqual({ from: query, to: "spinach", basis });
  });

  it("tomatoe → tomato, not cherry tomatoes", () => {
    expect(search("tomatoe").hero?.key).toBe("tomato");
  });

  it("aubergine → eggplant by synonym", () => {
    const r = search("aubergine");
    expect(r.hero?.key).toBe("eggplant");
    expect(r.corrected?.basis).toBe("synonym");
  });

  it("béarnaise and bearnaise reach Hollandaise through its variant", () => {
    for (const query of ["béarnaise", "bearnaise"]) expect(search(query).sauces[0]?.name).toBe("Hollandaise");
  });

  it("carbonara and dan dan find their recipes", () => {
    expect(search("carbonara").recipes.map((x) => x.name)).toContain("Authentic Spaghetti alla Carbonara");
    const danDan = search("dan dan");
    expect(danDan.hero).toBeNull();
    expect(danDan.recipes.slice(0, 2).map((x) => x.name).sort()).toEqual([
      "Authentic Dan Dan Noodles",
      "Authentic Sichuan Dan Dan Noodles",
    ]);
  });

  it("thai → the Thai cuisine page; braise → the braising method", () => {
    expect(search("thai").cuisines[0]).toMatchObject({ name: "Thai", href: "/cuisines/thai" });
    expect(search("braise").methods[0]).toMatchObject({ key: "braising", href: "/cooking-methods/braising" });
  });

  it("oatmilk → oat milk", () => {
    expect(search("oatmilk").hero?.key).toBe("oat_milk");
  });

  it("egg and eggs → Chicken Egg by synonym, with the recipes that use eggs", () => {
    for (const query of ["egg", "eggs"]) {
      const r = search(query);
      expect(r.hero).toMatchObject({ key: "chicken_egg", href: "/ingredients/chicken-egg" });
      expect(r.corrected?.basis).toBe("synonym");
      expect(r.hero?.recipeCount).toBeGreaterThanOrEqual(100);
    }
  });

  it.each([
    ["spinach", "ingredient", "/ingredients/spinach", true],
    ["aubergine", "ingredient", "/ingredients/eggplant", true],
    ["thai", "cuisine", "/cuisines/thai", true],
    ["carbonara", "sauce", "/sauces", true],
    ["pinach", "ingredient", "/ingredients/spinach", false],
    ["spinich", "ingredient", "/ingredients/spinach", false],
  ])("top hit for %s: %s at %s, exact=%s (tier 0 only)", (query, kind, href, exact) => {
    expect(search(query).top).toMatchObject({ kind, href, exact });
  });

  it("nonsense returns nothing rather than a wild guess", () => {
    expect(search("xqzv").top).toBeNull();
    expect(search("xqzv").total).toEqual({ ingredient: 0, recipe: 0, cuisine: 0, method: 0, sauce: 0 });
  });

  it("in season now follows the date (spinach: autumn yes, summer no)", () => {
    const seasons = index.ingredients.get("spinach")?.seasons ?? [];
    expect(seasons).toContain("autumn");
    expect(seasons).not.toContain("summer");
    expect(search("spinach", new Date("2026-10-15T12:00:00Z")).hero?.inSeasonNow).toBe(true);
    expect(search("spinach", new Date("2026-07-15T12:00:00Z")).hero?.inSeasonNow).toBe(false);
  });
});
