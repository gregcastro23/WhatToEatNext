/**
 * The plan's gate for elemental queries ("earth grains"; plan §3, Phase 5):
 * build them only if ranking a category by one element surfaces distinct
 * ingredients rather than a copied template vector.
 *
 * The check, per category (10+ cards) and element: rank by that element,
 * then the top 10 must hold at least 8 distinct vectors and at most 3 cards
 * may tie for the top value.
 *
 * [MEASURED 2026-09-25] 23 of 52 rankings fail, "earth grains" worst of all
 * (2 distinct vectors in its top 10); one vector, {0.2, 0.2, 0.4, 0.2}, is
 * shared by 189 of 1,002 cards. So elemental queries are not built. When
 * this test fails because the rankings pass, the data supports them.
 */
import { getIngredientCatalog } from "@/lib/ingredients/ingredientCatalog";
import { ingredientRecords } from "../catalogRecords";
import type { ElementalVector, IngredientRecord } from "../types";

const ELEMENTS: ReadonlyArray<keyof ElementalVector> = ["Fire", "Water", "Earth", "Air"];

function failingRankings(cards: readonly IngredientRecord[]): string[] {
  const failing: string[] = [];
  const categories = [...new Set(cards.map((c) => c.category))];
  for (const category of categories) {
    const group = cards.filter((c) => c.category === category && c.elemental !== null);
    if (group.length < 10) continue;
    for (const element of ELEMENTS) {
      const value = (c: IngredientRecord): number => c.elemental?.[element] ?? 0;
      const head = [...group].sort((a, b) => value(b) - value(a) || a.name.localeCompare(b.name)).slice(0, 10);
      const distinct = new Set(head.map((c) => JSON.stringify(c.elemental))).size;
      const tied = group.filter((c) => value(c) === value(head[0] ?? c)).length;
      if (distinct < 8 || tied > 3) failing.push(`${category}/${element}`);
    }
  }
  return failing;
}

describe("elemental queries stay deferred until the catalog's vectors are distinct", () => {
  const failing = failingRankings(ingredientRecords(getIngredientCatalog().entries));

  it("the check still fails, earth grains included", () => {
    expect(failing).toContain("grain/Earth");
    expect(failing.length).toBeGreaterThanOrEqual(20);
  });
});
