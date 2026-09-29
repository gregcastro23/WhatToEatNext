/**
 * Every static recipe has its own id, so recipe pages, the sitemap and every
 * map keyed by id see each dish. On master (2026-09-28) getServerRecipes()
 * served 1,084 recipes under 1,082 ids: two HSCA ids each carried two dishes,
 * and anything keyed by id saw only one of each pair.
 */
import { getServerRecipes } from "@/actions/recipes";
import type { Recipe } from "@/types/recipe";

/** The identity index's exact-name key: lowercase, punctuation runs collapsed. */
function exactName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function ingredientList(recipe: Recipe): string {
  return recipe.ingredients.map((i) => `${i.amount} ${i.unit} ${i.name}`).join(" | ");
}

describe("static recipe ids", () => {
  it("are unique across getServerRecipes()", async () => {
    const ids = (await getServerRecipes()).map((r) => r.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it("keep the first dish on its id and number a different dish of the same slug", async () => {
    const byId = new Map((await getServerRecipes()).map((r) => [r.id, r]));
    // Production serves this URL today (308 → live b1025b54…, the soft-tofu recipe).
    const first = byId.get("hsca-lunch-all-tofu-sour-cream");
    expect(first?.name).toBe('TOFU "SOUR CREAM"');
    expect(first?.ingredients[0]?.name).toBe("soft tofu");
    const second = byId.get("hsca-lunch-all-tofu-sour-cream-2");
    expect(second?.name).toBe("TOFU SOUR CREAM");
    expect(second?.ingredients[0]?.name).toBe("firm tofu");
  });

  it("serve two recipes of one exact name only when they are different dishes", async () => {
    // The loader keeps one recipe per case-insensitive name, so recipes that
    // share an exact-name key differ only in punctuation. The identity index
    // treats them as different dishes; one with the same ingredients is a
    // duplicate transcription (the archive had Rich Almond Milk (for Almond
    // Fruit Tart) twice) and belongs removed at the source.
    const groups = new Map<string, Recipe[]>();
    for (const recipe of await getServerRecipes()) {
      const key = exactName(recipe.name);
      groups.set(key, [...(groups.get(key) ?? []), recipe]);
    }
    const duplicates = [...groups.values()]
      .filter((group) => new Set(group.map(ingredientList)).size < group.length)
      .map((group) => group.map((r) => `${r.id}: ${r.name}`));
    expect(duplicates).toEqual([]);
  });
});
