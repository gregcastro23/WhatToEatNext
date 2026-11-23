import { getServerRecipes } from "@/actions/recipes";
import { resolveIngredientSlugMatch } from "@/data/ingredientRecipeIndex";
import { buildIngredientKeyResolver } from "../ingredientKeys";
import { createLineAuditor } from "../lineAudit";
import { AUDIT_FLAG_ALLOWLIST, auditAllowlistGaps } from "../lineAuditAllowlist";
import {
  CLASS_HEAD_RULES,
  FALSE_COMPOUND_ALIASES,
  MEAT_CUT_RULES,
  matchClassHead,
  matchFalseCompound,
  matchMeatCut,
  stripParentheses,
} from "../lineRulings";
import { buildIndexForRecipes } from "../loader";
import { keysForLine, splitOutsideParens, type IngredientKeyResolver } from "../recipeIngredientIndex";
import type { SearchIndex } from "../searchIndex";
import type { IngredientRecord } from "../types";

let index: SearchIndex;
let ingredients: IngredientRecord[];
let keyOf: IngredientKeyResolver;
let distinctLines: string[];

beforeAll(async () => {
  index = buildIndexForRecipes(await getServerRecipes());
  ingredients = [...index.ingredients.values()];
  keyOf = buildIngredientKeyResolver(ingredients, resolveIngredientSlugMatch);
  distinctLines = [...new Set([...index.recipes.values()].flatMap((r) => r.ingredientLines))].sort();
}, 120_000);

describe("Step 4 curated rulings over the real corpus (Rulings 5, 6, 7, 8, 15)", () => {
  it.each([
    // Ruling 5: class heads
    ["aged napa cabbage kimchi, with juice", ["kimchi"], false, []],
    ["chopped jalapeno pepper", ["jalapenos"], false, []],
    ["jalapeño peppers", ["jalapenos"], false, []],
    ["grated parmesan cheese", ["parmesan"], false, []],
    ["semolina flour", ["semolina"], false, []],
    ["fine semolina flour", ["semolina"], false, []],
    ["grape tomatoes", ["tomato"], false, []],
    ["pistachio nuts", ["pistachios"], false, []],
    ["potato starch flour", ["potato_starch"], false, []],
    ["tapioca starch flour", ["tapioca_starch"], false, []],
    ["strong espresso coffee", ["strong_espresso"], false, []],
    ["lemongrass pork", ["pork"], false, []],
    ["honey-mustard yogurt", ["yogurt"], false, []],
    ["plain whole-milk yogurt", ["yogurt"], false, []],
    ["mellow barley miso", ["miso"], false, []],
    // Ruling 6: part words (zest, peel, rind, sprigs, stick, root, pods, fat, bones, blood)
    ["lemon zest", ["lemon"], false, []],
    ["zest of 2 limes", ["lime"], false, []],
    ["lemon peel", ["lemon"], false, []],
    ["parmesan rind", ["parmesan"], false, []],
    ["thyme sprigs", ["thyme"], false, []],
    ["cinnamon stick", ["cinnamon"], false, []],
    ["ginger root", ["ginger"], false, []],
    ["star anise pods", ["star_anise"], false, []],
    ["duck fat", ["duck"], false, []],
    ["rendered duck fat", ["duck"], false, []],
    ["chicken fat", ["chicken"], false, []],
    ["pork back fat", ["pork"], false, []],
    ["beef leg bones", ["beef"], false, []],
    ["pork blood", ["pork"], false, []],
    ["congealed pork blood (huyết)", ["pork"], false, []],
    // Ruling 7: meat cuts without cards vs dedicated cut cards
    ["ribeye steak", ["beef"], false, []],
    ["ox leg and knuckle bones", ["beef"], false, []],
    ["cooked ham", ["ham"], false, []],
    ["salmon fillet", ["atlantic_salmon"], false, []],
    ["smoked salmon", ["atlantic_salmon"], false, []],
    ["bone-in lamb shoulder", ["lamb_shoulder"], false, []],
    ["lamb chops", ["lamb_chops"], false, []],
    ["beef sirloin or flank steak", ["beef", "flank_steak"], true, []],
    // Ruling 8: false-compound aliases
    ["ripe mission or brown turkey figs", ["fig"], true, []],
    ["pickled mustard greens", [], false, []],
    ["pickled mustard greens (chai poh)", [], false, []],
    ["morning glory (water spinach)", [], false, []],
    ["sui mi ya cai (preserved mustard greens)", ["sui_mi_ya_cai"], false, []],
    ["extra white bread flour for kneading", ["flour"], false, []],
    ["unbleached white bread flour", ["flour"], false, []],
    ["pomegranate molasses", ["pomegranate"], false, []],
    // Ruling 15: parentheses — outside decides, gloss only on miss, exact whole-line cards kept
    ["gochujang (korean chili paste)", ["gochujang"], false, []],
    ["paneer (indian cottage cheese)", ["paneer"], false, []],
    ["niter kibbeh (spiced clarified butter)", ["niter_kibbeh"], false, []],
    ["garaetteok (cylindrical rice cakes)", ["garaetteok"], false, []],
    ["haricots verts (green beans)", ["haricots_verts"], false, []],
    ["mam ruoc (fermented shrimp paste)", ["mam_ruoc"], false, []],
    ["sev (fried chickpea noodles)", ["sev"], false, []],
    ["slab bacon (lardons)", ["bacon"], false, []],
    ["sashimi-grade salmon (sake)", ["atlantic_salmon"], false, []],
    ["grilled salted salmon flakes (sake flakes)", ["atlantic_salmon"], false, []],
    ["besan (chickpea flour)", ["chickpeas"], false, ["chickpeas"]],
    ["jambon blanc (cooked ham)", ["ham"], false, []],
    ["asafoetida (hing)", ["asafoetida_hing"], false, []],
    ["tvorog (farmer's cheese)", ["tvorog_farmer_s_cheese"], false, []],
    ["white miso paste (shiro miso)", ["white_miso_paste_shiro_miso"], false, []],
    ["firm cooking apples (braeburn or cox)", ["apple"], false, []],
    ["short-grain rice (carolina or arborio)", ["short_grain_rice"], false, []],
    ["yellow lentils (toor dal or moong dal)", ["lentils"], false, []],
  ])("%s → %j (alt=%s, derived=%j)", (line, keys, alternative, derived) => {
    expect(keysForLine(line, keyOf)).toEqual({ keys, alternative, derived });
  });

  it("Ruling 17: every curated rule has a basis, valid catalog card, and live corpus hit", () => {
    const cardKeys = new Set(index.ingredients.keys());
    const sides = distinctLines.flatMap((line) => splitOutsideParens(line, /\s+or\s+/i));

    expect(new Set(FALSE_COMPOUND_ALIASES.map((r) => r.phrase)).size).toBe(FALSE_COMPOUND_ALIASES.length);
    for (const row of FALSE_COMPOUND_ALIASES) {
      expect(row.basis.trim().length).toBeGreaterThan(10);
      if (row.target !== null) expect(cardKeys.has(row.target)).toBe(true);
      expect(sides.some((side) => matchFalseCompound(side)?.phrase === row.phrase)).toBe(true);
    }

    const chIds = CLASS_HEAD_RULES.map((r) => `${r.modifier}::${r.head}`);
    expect(new Set(chIds).size).toBe(CLASS_HEAD_RULES.length);
    for (const row of CLASS_HEAD_RULES) {
      expect(row.basis.trim().length).toBeGreaterThan(10);
      expect(cardKeys.has(row.winner)).toBe(true);
      expect(
        sides.some((side) => {
          const hit = matchClassHead(side);
          return hit?.modifier === row.modifier && hit.head === row.head;
        }),
      ).toBe(true);
    }

    expect(new Set(MEAT_CUT_RULES.map((r) => r.cut)).size).toBe(MEAT_CUT_RULES.length);
    const isCard = (slug: string): boolean => cardKeys.has(slug);
    for (const row of MEAT_CUT_RULES) {
      expect(row.basis.trim().length).toBeGreaterThan(10);
      expect(cardKeys.has(row.target)).toBe(true);
      const hasDecidingHit = sides.some((side) => {
        const outside = stripParentheses(side);
        if (!outside || resolveIngredientSlugMatch(outside, isCard) !== null) return false;
        const resolved = keysForLine(side, keyOf);
        return matchMeatCut(side)?.cut === row.cut && resolved.keys.includes(row.target);
      });
      expect(hasDecidingHit).toBe(true);
    }
  });
});

describe("Step 6 zero-unruled-flag allowlist ratchet (Rulings 17 & 20)", () => {
  it("every allowlist row has a basis and valid card key, with zero unruled flags and zero stale rows", () => {
    const cardKeys = new Set(index.ingredients.keys());
    const allowLines = AUDIT_FLAG_ALLOWLIST.map((row) => row.line);
    expect(new Set(allowLines).size).toBe(AUDIT_FLAG_ALLOWLIST.length);
    for (const row of AUDIT_FLAG_ALLOWLIST) {
      expect(row.basis.trim().length).toBeGreaterThan(10);
      expect(row.flags.length).toBeGreaterThan(0);
      for (const key of row.keys) expect(cardKeys.has(key)).toBe(true);
    }

    const audits = distinctLines.map(createLineAuditor(ingredients, keyOf));
    const { unruled, stale } = auditAllowlistGaps(audits, AUDIT_FLAG_ALLOWLIST);
    expect(unruled).toEqual([]);
    expect(stale).toEqual([]);
  });
});
