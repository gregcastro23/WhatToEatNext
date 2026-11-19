/**
 * Elemental & Alchemical ESMS display helpers for the weekly planner.
 * Maps recipe elemental properties onto the app's element tokens
 * (Fire / Water / Earth / Air) and provides strictly orthogonal helpers for
 * the four Alchemical ESMS quantities (Spirit / Essence / Matter / Substance).
 *
 * @file src/components/menu-planner/redesign/elementUtils.ts
 */

export type ElementName = "Fire" | "Water" | "Earth" | "Air";
export type EsmsName = "Spirit" | "Essence" | "Matter" | "Substance";

export const ALL_ESMS_NAMES: readonly EsmsName[] = [
  "Spirit",
  "Essence",
  "Matter",
  "Substance",
];

/** Tailwind background tokens for the small per-meal element dot. */
export const ELEMENT_DOT: Record<ElementName, string> = {
  Fire: "bg-fire-spirit",
  Water: "bg-water-essence",
  Earth: "bg-earth-matter",
  Air: "bg-air-substance",
};

/** Tailwind text tokens for element labels. */
export const ELEMENT_TEXT: Record<ElementName, string> = {
  Fire: "text-fire-spirit",
  Water: "text-water-essence",
  Earth: "text-earth-matter",
  Air: "text-air-substance",
};

/** Metadata for the four orthogonal Alchemical ESMS quantities. */
export const ESMS_META: Record<
  EsmsName,
  { symbol: string; label: EsmsName; bar: string; text: string; principle: string }
> = {
  Spirit: {
    symbol: "🝇",
    label: "Spirit",
    bar: "bg-amber-400",
    text: "text-amber-400",
    principle: "Volatile aromatic spark, active consciousness, and solar vitality.",
  },
  Essence: {
    symbol: "🝑",
    label: "Essence",
    bar: "bg-sky-400",
    text: "text-sky-400",
    principle: "Soulful flavor depth, lunar cohesion, and restorative extraction.",
  },
  Matter: {
    symbol: "🝙",
    label: "Matter",
    bar: "bg-emerald-400",
    text: "text-emerald-400",
    principle: "Tangible culinary structure, satiety, and embodied nourishment.",
  },
  Substance: {
    symbol: "🝉",
    label: "Substance",
    bar: "bg-purple-400",
    text: "text-purple-400",
    principle: "Subtle quintessence, enzymatic transformation, and harmonic synthesis.",
  },
};

export interface RecipeEsmsQuantities {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
  totalASharp: number;
}

export interface EsmsCarrier {
  spirit?: number;
  essence?: number;
  matter?: number;
  substance?: number;
  mappedAlchemy?: {
    Spirit?: number;
    Essence?: number;
    Matter?: number;
    Substance?: number;
  } | null;
  ingredientAlchemicalSummary?: {
    totalSpirit?: number;
    totalEssence?: number;
    totalMatter?: number;
    totalSubstance?: number;
  } | null;
}

/**
 * Read a normalized elemental record, tolerating both capitalized
 * (Fire/Water/…) and lowercase (fire/water/…) keys.
 */
export function readElemental(
  ep?: Record<string, number> | null,
): Record<ElementName, number> {
  return {
    Fire: ep?.Fire ?? ep?.fire ?? 0,
    Water: ep?.Water ?? ep?.water ?? 0,
    Earth: ep?.Earth ?? ep?.earth ?? 0,
    Air: ep?.Air ?? ep?.air ?? 0,
  };
}

/** The dominant element of a recipe, or null when no elemental data is present. */
export function dominantElement(
  ep?: Record<string, number> | null,
): ElementName | null {
  if (!ep) return null;
  const vals = readElemental(ep);
  const keys: ElementName[] = ["Fire", "Water", "Earth", "Air"];
  let bestKey: ElementName = "Fire";
  let bestVal = vals.Fire;
  for (const key of keys) {
    if (vals[key] > bestVal) {
      bestVal = vals[key];
      bestKey = key;
    }
  }
  return bestVal > 0 ? bestKey : null;
}

function isNonNegativeNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0;
}

function fromEsmsQuad(
  s: unknown,
  e: unknown,
  m: unknown,
  u: unknown,
  scale: number,
): RecipeEsmsQuantities | null {
  if (
    !isNonNegativeNumber(s) ||
    !isNonNegativeNumber(e) ||
    !isNonNegativeNumber(m) ||
    !isNonNegativeNumber(u)
  ) {
    return null;
  }
  const Spirit = s * scale;
  const Essence = e * scale;
  const Matter = m * scale;
  const Substance = u * scale;
  const totalASharp = Spirit + Essence + Matter + Substance;
  return totalASharp > 0 ? { Spirit, Essence, Matter, Substance, totalASharp } : null;
}

/**
 * Extract a recipe's real Alchemical ESMS quantities (Spirit, Essence, Matter,
 * Substance, and total A#), scaled by servings. Never derives ESMS from
 * classical elements; returns null when no positive ESMS data exists.
 */
export function readRecipeEsms(
  recipe?: EsmsCarrier | null,
  servings = 1,
): RecipeEsmsQuantities | null {
  if (!recipe) return null;
  const scale = Number.isFinite(servings) && servings > 0 ? servings : 1;
  return (
    fromEsmsQuad(recipe.spirit, recipe.essence, recipe.matter, recipe.substance, scale) ??
    fromEsmsQuad(
      recipe.mappedAlchemy?.Spirit,
      recipe.mappedAlchemy?.Essence,
      recipe.mappedAlchemy?.Matter,
      recipe.mappedAlchemy?.Substance,
      scale,
    ) ??
    fromEsmsQuad(
      recipe.ingredientAlchemicalSummary?.totalSpirit,
      recipe.ingredientAlchemicalSummary?.totalEssence,
      recipe.ingredientAlchemicalSummary?.totalMatter,
      recipe.ingredientAlchemicalSummary?.totalSubstance,
      scale,
    )
  );
}

/** The dominant ESMS quantity, or null when no positive ESMS quantity is present. */
export function dominantEsms(
  esms?: Pick<RecipeEsmsQuantities, EsmsName> | null,
): EsmsName | null {
  if (!esms) return null;
  let bestKey: EsmsName | null = null;
  let bestVal = 0;
  for (const key of ALL_ESMS_NAMES) {
    const val = esms[key];
    if (typeof val === "number" && Number.isFinite(val) && val > bestVal) {
      bestVal = val;
      bestKey = key;
    }
  }
  return bestKey;
}

export interface WeeklyEsmsSnapshot {
  totals: Record<EsmsName, number>;
  dist: Record<EsmsName, number>;
  totalASharp: number;
  mealsWithEsms: number;
  dominant: EsmsName | null;
}

/**
 * Aggregate orthogonal ESMS quantities across a list of meal slots.
 */
export function computeWeeklyEsmsSnapshot(
  meals?: ReadonlyArray<{ recipe?: EsmsCarrier | null; servings?: number }> | null,
): WeeklyEsmsSnapshot {
  const totals: Record<EsmsName, number> = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
  let mealsWithEsms = 0;
  for (const meal of meals ?? []) {
    if (!meal.recipe) continue;
    const q = readRecipeEsms(meal.recipe, meal.servings ?? 1);
    if (!q) continue;
    totals.Spirit += q.Spirit;
    totals.Essence += q.Essence;
    totals.Matter += q.Matter;
    totals.Substance += q.Substance;
    mealsWithEsms += 1;
  }
  const totalASharp = totals.Spirit + totals.Essence + totals.Matter + totals.Substance;
  const dist: Record<EsmsName, number> =
    totalASharp > 0
      ? {
          Spirit: totals.Spirit / totalASharp,
          Essence: totals.Essence / totalASharp,
          Matter: totals.Matter / totalASharp,
          Substance: totals.Substance / totalASharp,
        }
      : { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 };
  return { totals, dist, totalASharp, mealsWithEsms, dominant: dominantEsms(totals) };
}
