/**
 * The hero card links to /ingredients/<name>. That dossier resolves its param
 * through IngredientService.getIngredientByName, which reads the UNIFIED
 * catalog (1,002 entries) and falls back to substring matching. So a catalog
 * ingredient missing from the unified set lands on a different ingredient
 * ("Apple Cider Vinegar" → Apple).
 *
 * [MEASURED 2026-09-23] 906/921 resolve exactly. The 15 below do not. Fixing
 * the resolver is a Phase 3 prerequisite (the hero card ships then). This test
 * pins the set so it can only shrink: fix one, then delete it from the list.
 */
import { allIngredients } from "@/data/ingredients";
import { IngredientService } from "@/services/IngredientService";
import { normalizeText } from "../text";

const KNOWN_MISROUTES = [
  "aged_balsamic",
  "apple_cider_vinegar",
  "balsamic_vinegar",
  "bay_leaves",
  "champagne_rose_vinegar",
  "champagne_vinegar",
  "chickpeas",
  "clarified_butter",
  "curry_leaves",
  "fig_vinegar",
  "malt_vinegar",
  "parmesan",
  "red_wine_vinegar",
  "rice_vinegar",
  "sherry_vinegar",
];

describe("hero href → dossier resolution", () => {
  it("every other catalog ingredient resolves to itself by name", () => {
    const service = IngredientService.getInstance();
    const misroutes = Object.entries(allIngredients)
      .filter(([, ingredient]) => {
        const hit = service.getIngredientByName(ingredient.name);
        return !hit || normalizeText(hit.name).folded !== normalizeText(ingredient.name).folded;
      })
      .map(([key]) => key)
      .sort();
    expect(misroutes).toEqual(KNOWN_MISROUTES);
  });
});
