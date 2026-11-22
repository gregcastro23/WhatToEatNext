/**
 * Search core over the REAL catalogs (plan §7 Phase 1 exit criteria, §8 golden
 * set). Recipes come from the static catalog here; the loader passes the live
 * one in production, so ids differ but names and ranking do not.
 */
import { getServerRecipes } from "@/actions/recipes";
import { allCookingMethods } from "@/data/cooking";
import { resolveIngredientSlugMatch } from "@/data/ingredientRecipeIndex";
import { getIngredientCatalog } from "@/lib/ingredients/ingredientCatalog";
import { slugToCuisineKey } from "@/utils/cuisineSlug";
import { DERIVED_HEADS } from "../derivedHeads";
import { buildIngredientKeyResolver } from "../ingredientKeys";
import { createLineAuditor, summarizeLineAudits } from "../lineAudit";
import { buildIndexForRecipes } from "../loader";
import { searchOmnibar } from "../omnibar";
import { rankEntities } from "../rank";
import { keysForLine, type IngredientKeyResolver } from "../recipeIngredientIndex";
import type { SearchIndex } from "../searchIndex";
import { INGREDIENT_SYNONYMS } from "../synonyms";
import { normalizeText } from "../text";
import type { IngredientRecord, OmnibarResult } from "../types";

const SEPTEMBER = new Date("2026-09-23T12:00:00Z");
let index: SearchIndex;
let ingredients: IngredientRecord[];
let keyOf: IngredientKeyResolver;

beforeAll(async () => {
  index = buildIndexForRecipes(await getServerRecipes());
  ingredients = [...index.ingredients.values()];
  // The resolver the loader builds, rebuilt here so lines can be probed one at a time.
  keyOf = buildIngredientKeyResolver(ingredients, resolveIngredientSlugMatch);
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
    // [MEASURED 2026-10-03] 4 misses, all 4-letter typos that are whole
    // substrings of another word ("aple" ⊂ "maple"). Was 3 on 2026-09-23: the
    // restored Tomato "Cream" Sauce (for Vegetable-Polenta Napoleons) is a second
    // recipe title holding "leon" ⊂ "napoleons". Ratchet: may not grow.
    expect(misses.length).toBeLessThanOrEqual(4);
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

describe("reverse index: a recipe line is filed under its head ingredient", () => {
  it.each([
    ["garlic cloves", ["garlic"], false, []],
    ["-4 cloves garlic", ["garlic"], false, []],
    ["ground cloves", ["cloves"], false, []],
    ["fresh lemon juice", ["lemon"], false, []],
    ["lemon juice", ["lemon"], false, []],
    ["freshly squeezed lime juice", ["lime"], false, []],
    ["lemon or lime juice", ["lemon", "lime"], true, []],
    ["unsweetened peanut butter", ["peanuts"], false, ["peanuts"]],
    ["peanut butter", ["peanuts"], false, ["peanuts"]],
    ["coconut butter", ["coconut"], false, ["coconut"]],
    ["almond flour", ["almonds"], false, ["almonds"]],
    ["corn flour", ["corn"], false, ["corn"]],
    ["oat flour", ["oats"], false, ["oats"]],
    ["garbanzo flour", ["chickpeas"], false, ["chickpeas"]],
    ["almond meal", ["almonds"], false, ["almonds"]],
    ["cashew cream", ["cashews"], false, ["cashews"]],
    ["coconut water", ["coconut"], false, ["coconut"]],
    ["lemon oil", ["lemon"], false, ["lemon"]],
    ["umeboshi vinegar", ["umeboshi"], false, ["umeboshi"]],
    ["anise extract", ["anise"], false, ["anise"]],
    ["rice syrup", ["rice"], false, ["rice"]],
    ["shrimp stock", ["shrimp"], false, ["shrimp"]],
    ["shrimp stock or water", ["shrimp", "water"], true, ["shrimp"]],
    ["dashi broth", ["dashi"], false, ["dashi"]],
    ["peanut sauce", ["peanuts"], false, ["peanuts"]],
    ["ginger-garlic paste", ["ginger", "garlic"], false, ["ginger", "garlic"]],
    ["dashi-soy sauce", ["dashi", "soy_sauce"], false, ["dashi"]],
    ["creamy almond butter", ["almond_butter"], false, []],
    ["salted butter", ["butter"], false, []],
    ["salted water", ["water"], false, []],
    ["ice water", ["water"], false, []],
    ["anchovies in oil", ["anchovies"], false, []],
    ["oil-cured black olives", ["black_olives"], false, []],
    ["tomato sauce/vinegar", ["tomato_sauce"], false, []],
    ["potato starch flour", ["potato_starch"], false, []],
    ["lamb or mutton", ["lamb", "mutton"], true, []],
    ["lamb, beef, or chicken", ["lamb", "beef", "chicken"], true, []],
    // An index slug with no catalog card is skipped, not a dead end.
    ["ground beef or lamb", ["beef", "lamb"], true, []],
    ["beef chuck", ["beef"], false, []],
    ["boneless chicken thighs", ["chicken"], false, []],
    ["whole vanilla bean", ["vanilla"], false, []],
    // Plurals and accents in the line.
    ["juice of 2 lemons", ["lemon"], false, []],
    ["navel oranges", ["orange"], false, []],
    ["-2 jalapeño peppers", ["jalapenos"], false, []],
  ])("%s → %j (alt=%s, derived=%j)", (line, keys, alternative, derived) => {
    expect(keysForLine(line, keyOf)).toEqual({ keys, alternative, derived });
  });

  it("derived-head table (Ruling 17) is well-formed and active heads resolve real corpus lines", () => {
    const heads = DERIVED_HEADS.map((entry) => entry.head);
    expect(new Set(heads).size).toBe(heads.length);
    for (const entry of DERIVED_HEADS) {
      expect(entry.head).toMatch(/^[a-z]+$/);
      expect(entry.basis.trim().length).toBeGreaterThan(10);
    }
    const lines = [...new Set([...index.recipes.values()].flatMap((r) => r.ingredientLines))];
    const activeDerivedHeads = [
      "butter", "flour", "meal", "cream", "water", "oil", "vinegar",
      "extract", "syrup", "stock", "broth", "sauce", "paste",
    ];
    for (const head of activeDerivedHeads) {
      const hasSingleClauseHit = lines.some((line) => {
        if (/\bor\b/i.test(line)) return false;
        const tokens = normalizeText(line).tokens;
        const hasWord = tokens.some((t) => t === head || t === `${head}s` || t === `${head}es`);
        return hasWord && keysForLine(line, keyOf).derived.length > 0;
      });
      expect(hasSingleClauseHit).toBe(true);
    }
  });

  it("the probe flags a resolver that files a line under a portion, generic or modifier card", () => {
    // Control: without it, zero flags below could mean a probe that cannot flag.
    const wrong = (key: string): IngredientKeyResolver => () => key;
    expect(createLineAuditor(ingredients, wrong("cloves"))("garlic cloves").flags).toEqual(["unit-word"]);
    expect(createLineAuditor(ingredients, wrong("juice"))("juice of 1 lemon").flags).toEqual(["generic"]);
    expect(createLineAuditor(ingredients, wrong("peanuts"))("peanut butter").flags).toEqual(["modifier"]);
    expect(
      createLineAuditor(ingredients, () => ({ key: "turkey", derived: true }))("brown turkey figs").flags,
    ).toEqual(["modifier"]);
  });

  it("no line is filed under a unit word; generic, modifier and unresolved lines may not grow", () => {
    const lines = [...new Set([...index.recipes.values()].flatMap((r) => r.ingredientLines))];
    const summary = summarizeLineAudits(lines.map(createLineAuditor(ingredients, keyOf)));
    expect(summary.lines).toBeGreaterThan(2500);
    // [MEASURED 2026-09-24] over 2,880 distinct lines: master before #882 → #882 → step 1
    //   unit-word   8 →   0 →   0  ("garlic cloves" → cloves)
    //   generic    43 →   7 →   6  ("lemon juice" → juice; left: corn/oat flour → flour,
    //                               ice water → water, date sugar → sugar)
    //   modifier   46 →  41 →  41  (for review, not all wrong: "jalapeno pepper" →
    //                               jalapeno is right; "almond flour" awaits the derived flag)
    //   unresolved 373 → 377 → 273 (step 1: non-card slugs skipped, plurals, accents)
    // [MEASURED 2026-10-03] 36 recipes restored from the PDF added lines, not defects:
    //   generic     6 →   7  "garbanzo flour" → flour (the corn/oat flour class)
    //   modifier   41 →  44  "honey-mustard yogurt" (a parent's reference line),
    //                        "pistachio nuts", "potato starch flour"
    //   unresolved 259 → 270 stays under 273: six ingredients with no catalog card (aqua
    //                        faba, burdock root, cous-cous, marjoram leaf, roquefort
    //                        cheese, the "muhammara" reference) and five range or comma
    //                        splits ("2-3 tablespoons ...", "skinless, boneless ...")
    // [MEASURED 2026-10-05] after the importer's parser was corrected and hsca.ts rebuilt
    // (ranges, Unicode fractions, "of ...", "to taste", size patterns, adjective lists), over
    // 2,675 distinct lines: generic 7 → 5, modifier 44 → 44, unresolved 270 → 248.
    // [MEASURED 2026-11-22] step 2 (derived products + hyphen compound splitting) over
    // 2,675 distinct lines: generic 5 → 2 (corn/garbanzo/oat flour resolved; date sugar &
    // ice water left), modifier 44 → 19, unresolved 248 → 243 (peanut/coconut butter,
    // white miso paste), derived 80.
    expect(summary.flagged["unit-word"]).toBe(0);
    expect(summary.flagged.generic).toBeLessThanOrEqual(2);
    expect(summary.flagged.modifier).toBeLessThanOrEqual(19);
    expect(summary.unresolved).toBeLessThanOrEqual(243);
    expect(summary.derived).toBeGreaterThanOrEqual(75);
  });

  it("hero recipe counts follow the head and derived products rank after required direct uses (Ruling 12)", () => {
    const count = (query: string): number => search(query).hero?.recipeCount ?? -1;
    // [MEASURED 2026-09-24] static catalog, master before #882 → #882 → step 1:
    // lemon 61 → 172 → 174, lime 22 → 64 → 64, garlic 267 → 280 → 280,
    // juice 203 → 6 → 3, cloves 33 → 20 → 20, beef 45 → 43 → 86 (24 lines such as
    // ground beef, chuck, shank, sirloin), chicken 82 → 82 → 92 (thigh, pieces).
    expect(count("lemon")).toBeGreaterThanOrEqual(170);
    expect(count("lime")).toBeGreaterThanOrEqual(60);
    expect(count("garlic")).toBeGreaterThanOrEqual(275);
    expect(count("juice")).toBeLessThanOrEqual(5);
    expect(count("cloves")).toBeLessThanOrEqual(25);
    expect(count("beef")).toBeGreaterThanOrEqual(80);
    expect(count("chicken")).toBeGreaterThanOrEqual(90);
    expect(count("peanuts")).toBeGreaterThanOrEqual(25);
    expect(count("oats")).toBeGreaterThanOrEqual(10);
    expect(count("ginger")).toBeGreaterThanOrEqual(120);

    const peanuts = searchOmnibar(index, "peanuts", { now: SEPTEMBER, containingLimit: 30 }).recipesContaining;
    const directIdx = peanuts.findIndex((r) => r.name === "Authentic Cameroonian Ndolé");
    const derivedIdx = peanuts.findIndex((r) => r.name === "Authentic Goi Cuon (Fresh Spring Rolls)");
    expect(directIdx).toBeGreaterThanOrEqual(0);
    expect(derivedIdx).toBeGreaterThan(directIdx);
    expect(peanuts[directIdx]?.derived).toBe(false);
    expect(peanuts[derivedIdx]?.derived).toBe(true);
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
    ["carbonara", "sauce", "/sauces?focus=carbonara", true],
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
