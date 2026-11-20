/**
 * Pure pantry-matching utility for sauce key ingredients.
 *
 * @file src/lib/sauces/pantryMatch.ts
 */

export interface PantryMatchResult {
  matched: string[];
  missing: string[];
  total: number;
  ratio: number;
}

function normalizePhrase(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isIngredientMatch(sauceIng: string, pantryItems: readonly string[]): boolean {
  const target = normalizePhrase(sauceIng);
  if (target.length < 2) return false;
  for (const pantryRaw of pantryItems) {
    const pantry = normalizePhrase(pantryRaw);
    if (pantry.length < 2) continue;
    if (target === pantry) return true;
    const paddedTarget = ` ${target} `;
    const paddedPantry = ` ${pantry} `;
    if (paddedTarget.includes(paddedPantry) || paddedPantry.includes(paddedTarget)) {
      return true;
    }
  }
  return false;
}

export function computePantryMatch(
  sauceIngredients: readonly string[],
  pantryNames: readonly string[],
): PantryMatchResult {
  const unique = Array.from(
    new Set(sauceIngredients.map((item) => item.trim()).filter((item) => item.length > 0)),
  );
  if (unique.length === 0 || pantryNames.length === 0) {
    return {
      matched: [],
      missing: unique,
      total: unique.length,
      ratio: 0,
    };
  }

  const matched: string[] = [];
  const missing: string[] = [];
  for (const ing of unique) {
    if (isIngredientMatch(ing, pantryNames)) {
      matched.push(ing);
    } else {
      missing.push(ing);
    }
  }

  return {
    matched,
    missing,
    total: unique.length,
    ratio: matched.length / unique.length,
  };
}
