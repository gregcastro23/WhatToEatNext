/**
 * The crucible's elemental quad-spectrum: each element's share of the summed
 * Fire/Water/Earth/Air across the queued ingredients that carry elemental
 * values. Shares are whole percents that always total exactly 100 (largest
 * remainder), so the gauge's four segments fill the bar and the legend never
 * reads 99% or 101%.
 *
 * @file src/components/recipe-builder/crucible/elementalBalance.ts
 */
import type { SelectedIngredient } from "@/contexts/RecipeBuilderContext";
import type { ClassicalElement } from "@/utils/astrology/signElement";

export const CRUCIBLE_ELEMENTS: readonly ClassicalElement[] = ["Fire", "Water", "Earth", "Air"];

export interface ElementalBalance {
  /** Whole-percent share per element; the four always sum to 100. */
  shares: Record<ClassicalElement, number>;
  /** Queued ingredients that contributed a positive elemental value. */
  indexedCount: number;
}

function emptyRecord(): Record<ClassicalElement, number> {
  return { Fire: 0, Water: 0, Earth: 0, Air: 0 };
}

/** Exact proportions → whole percents summing to 100 (Hamilton's method). */
function toWholeShares(
  totals: Record<ClassicalElement, number>,
  sum: number,
): Record<ClassicalElement, number> {
  const shares = emptyRecord();
  const remainder = emptyRecord();
  let assigned = 0;
  for (const element of CRUCIBLE_ELEMENTS) {
    const exact = (totals[element] / sum) * 100;
    shares[element] = Math.floor(exact);
    remainder[element] = exact - shares[element];
    assigned += shares[element];
  }
  const byRemainder = [...CRUCIBLE_ELEMENTS].sort((a, b) => remainder[b] - remainder[a]);
  for (let i = 0; i < 100 - assigned; i++) {
    const element = byRemainder[i % byRemainder.length];
    if (element) shares[element] += 1;
  }
  return shares;
}

/** Null when no queued ingredient carries a positive elemental value. */
export function computeElementalBalance(
  ingredients: readonly SelectedIngredient[],
): ElementalBalance | null {
  const totals = emptyRecord();
  let indexedCount = 0;

  for (const ingredient of ingredients) {
    const props = ingredient.elementalProperties;
    if (!props) continue;
    let contributed = 0;
    for (const element of CRUCIBLE_ELEMENTS) {
      // Negative or non-finite values carry no share; they cannot shrink another element's.
      const value = props[element] ?? 0;
      const clamped = Number.isFinite(value) && value > 0 ? value : 0;
      totals[element] += clamped;
      contributed += clamped;
    }
    if (contributed > 0) indexedCount += 1;
  }

  const sum = CRUCIBLE_ELEMENTS.reduce((acc, element) => acc + totals[element], 0);
  if (sum <= 0) return null;
  return { shares: toWholeShares(totals, sum), indexedCount };
}
