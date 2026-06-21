import type { TokenType } from "@/types/economy";

/** Four-coin amount, lowercase keys to match the economy's EsmsCost shape. */
export interface CoinAmounts {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

/** How an ingredient's per-unit ESMS was resolved. */
export type IngredientResolution = "catalog" | "curated" | "default";

/** Per-ingredient slice of the recipe's alchemical fingerprint. */
export interface IngredientFingerprint {
  name: string;
  /** Canonical ingredient-DB key (or curated id), null only when defaulted. */
  key: string | null;
  /** True when resolved to real values (catalog or curated), false only when defaulted. */
  matched: boolean;
  /** Provenance of the per-unit ESMS used. */
  source: IngredientResolution;
  /** Intrinsic per-unit ESMS for the ingredient (before quantity weighting). */
  esms: CoinAmounts;
  /** Spirit + Essence + Matter + Substance for this ingredient (per-unit). */
  aSharp: number;
  /** Per-ingredient elemental shares, when known (curated/catalog-declared). */
  elemental?: ElementalShares;
  /** As written on the recipe. */
  quantity: string;
  unit: string;
  /** Estimated mass in grams (from quantity/unit, household hint when clearer). */
  massGrams: number;
  /** True when mass came from a rough count unit (e.g. "2 medium") with no precise measure. */
  gramsEstimated: boolean;
  /** Catalog/curated potency (intensity); 5 = neutral. */
  potency: number;
  /** potency / 5, clamped — the multiplier applied to mass. */
  potencyFactor: number;
  /** Potency-weighted contribution: massGrams × potencyFactor. */
  weight: number;
}

/** Normalized Fire/Water/Earth/Air, summing to 1. Index signature mirrors
 *  `ElementalProperties` so it's accepted by the thermodynamics calculator. */
export interface ElementalShares {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: number;
}

/** The physics derived from the recipe's aggregate ESMS + elemental shares. */
export interface RecipePhysics {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number;
  monica: number;
}

/**
 * The full alchemical fingerprint of a recipe — the immutable quantities that
 * get committed into the recipe NFT (and hashed into its `contentHash`).
 */
export interface RecipeFingerprint {
  ingredients: IngredientFingerprint[];
  /** Additive recipe ESMS totals (the cost basis). */
  totals: CoinAmounts;
  /** The recipe "#": Spirit + Essence + Matter + Substance across all ingredients. */
  aSharp: number;
  elemental: ElementalShares;
  physics: RecipePhysics;
  /** Fraction of ingredients resolved to REAL values (catalog or curated), i.e. not defaulted (0-1). */
  matchRate: number;
  /** Fraction resolved specifically via the ingredient catalog (transparency vs curated overrides). */
  catalogMatchRate: number;
  /** Fraction of total mass that came from precise measures (not rough count units). */
  massPrecision: number;
  /** Authored servings on the recipe (display fallback). */
  yields: number;
  /** Smart default servings (yield-limiting) — what the per-serving totals are divided by. */
  smartServings: number;
  /** The structural staple that limits the serving count, when one drove it (else null). */
  servingsLimitedBy: string | null;
  /** How per-ingredient ESMS were aggregated into the totals. */
  aggregationMode: "unweighted_v1" | "quantity_weighted_v1" | "potency_weighted_v2";
  /** Source of the elemental shares feeding physics. */
  elementalSource: "authored" | "ingredient-derived";
  /** Alchemical engine version that produced these quantities (uint64, non-zero). */
  engineVersion: number;
}

/** A live mint-cost quote in all four coins, plus the premium redistribution preview. */
export interface MintQuote {
  /** Raw recipe-ESMS cost before any live multiplier. */
  baseCost: CoinAmounts;
  /** Cost after the live sky × (optional) chart multiplier — what a standard mint charges. */
  liveCost: CoinAmounts;
  /**
   * Premium "chart-weighted redistribution" preview: for each possible dominant
   * coin, what the same mint would cost if shifted toward that coin at live swap
   * rates (value-preserving). The UI shows this as the premium perk.
   */
  redistributePreview: Record<TokenType, CoinAmounts>;
  pricing: {
    multiplier: number;
    aNumber: number;
    dominantElement: string;
    personalized: boolean;
    timestamp: string;
  };
  swap: {
    rulingHourPlanet: string;
    rulingDayPlanet: string;
    validUntil: string;
  };
}
