/**
 * What each chart-priced tool costs, shared by the server-side charge
 * (featureCharge.ts) and the vault's price list so the two cannot drift. Pure
 * data: safe to import from client components.
 *
 * Base totals are the owner's ruling of 2026-09-28. A base is a TOTAL across
 * Spirit, Essence, Matter and Substance (the convention of
 * database/init/40), scaled per axis at charge time by the caller's natal chart
 * and the current sky.
 *
 * @file src/lib/economy/featurePrices.ts
 */

export type ChargedFeature =
  | "alchemicalMidpoint"
  | "groupRecommendations"
  | "dailyInsight"
  | "tiltSkillet";

/** Base ESMS total per use (owner ruling 2026-09-28). */
export const FEATURE_BASE_ESMS: Readonly<Record<ChargedFeature, number>> = {
  alchemicalMidpoint: 3,
  groupRecommendations: 5,
  dailyInsight: 2,
  tiltSkillet: 5,
};

export const FEATURE_LABEL: Readonly<Record<ChargedFeature, string>> = {
  alchemicalMidpoint: "Alchemical Midpoint",
  groupRecommendations: "Group recommendations",
  dailyInsight: "Daily AI insight",
  tiltSkillet: "Tilt Skillet batch plan",
};

const FEATURE_DESCRIPTION: Readonly<Record<ChargedFeature, string>> = {
  alchemicalMidpoint: "Composite chart and a harmonizing meal for two constitutions",
  groupRecommendations: "Cuisine harmony across your dining companions",
  dailyInsight: "An on-demand daily insight (the one made at sign-in is free)",
  tiltSkillet: "Plan a large-batch recipe as a circuit",
};

const CHARGED_ORDER: readonly ChargedFeature[] = [
  "alchemicalMidpoint",
  "groupRecommendations",
  "dailyInsight",
  "tiltSkillet",
];

export interface PricedTool {
  key: string;
  title: string;
  description: string;
  price: string;
}

/**
 * The vault's price list. The two recipe generators are priced from their shop
 * items in the database, so they show how they are priced rather than a copy
 * of a number that lives elsewhere.
 */
export const PRICED_TOOLS: readonly PricedTool[] = [
  {
    key: "cosmicRecipe",
    title: "Cosmic recipe",
    description: "Generate an AI cosmic recipe tuned to planetary transits",
    price: "1 free a day, then chart-priced",
  },
  {
    key: "recipeGeneration",
    title: "Recipe generation",
    description: "Generate recipe recommendations for a day",
    price: "Chart-priced",
  },
  ...CHARGED_ORDER.map((feature) => ({
    key: feature,
    title: FEATURE_LABEL[feature],
    description: FEATURE_DESCRIPTION[feature],
    price: `${FEATURE_BASE_ESMS[feature]} ESMS base`,
  })),
];
