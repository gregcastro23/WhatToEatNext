/**
 * The guide method that answers a request: the one asked for, else its nearest
 * equivalent (said out loud), else the recommended one with a plain statement
 * that nothing tested covers the request.
 */
import type { FoodGuide, GuideMethod, GuideMethodId } from "@/lib/cooking/foodGuides/schema";

/** Requests that a sibling method honestly answers. */
const NEAR: Readonly<Partial<Record<GuideMethodId, readonly GuideMethodId[]>>> = {
  oven_bake: ["roast"],
  roast: ["oven_bake"],
  pan_fry: ["saute"],
  saute: ["pan_fry", "stir_fry"],
  stir_fry: ["saute"],
  boil: ["simmer"],
  simmer: ["boil"],
  rice_cooker: [],
};

export const METHOD_LABELS: Readonly<Record<GuideMethodId, string>> = {
  oven_bake: "oven baking",
  roast: "roasting",
  pan_fry: "pan frying",
  saute: "sautéing",
  stir_fry: "stir frying",
  deep_fry: "deep frying",
  air_fry: "air frying",
  microwave: "microwaving",
  grill: "grilling",
  broil: "broiling",
  boil: "boiling",
  simmer: "simmering",
  steam: "steaming",
  poach: "poaching",
  scramble: "scrambling",
  braise: "braising",
  slow_cook: "slow cooking",
  pressure_cook: "pressure cooking",
  rice_cooker: "rice cooker",
  sous_vide: "sous vide",
  smoke: "smoking",
};

export function bestMethod(guide: FoodGuide): GuideMethod | undefined {
  return guide.methods.find((method) => method.best) ?? guide.methods[0];
}

export interface PickedMethod {
  method: GuideMethod;
  /** Said to the reader when the answer is not exactly what was asked. */
  note: string | null;
}

export function pickMethod(guide: FoodGuide, requested: GuideMethodId | null): PickedMethod | null {
  const fallback = bestMethod(guide);
  if (!fallback) return null;
  if (requested === null) return { method: fallback, note: null };
  const exact = guide.methods.find((method) => method.id === requested);
  if (exact) return { method: exact, note: null };
  const [near] = (NEAR[requested] ?? []).flatMap((id) => guide.methods.filter((method) => method.id === id));
  const food = guide.name.toLowerCase();
  if (near) {
    return { method: near, note: `Showing ${near.label.charAt(0).toLowerCase()}${near.label.slice(1)}, the closest tested method to ${METHOD_LABELS[requested]} for ${food}.` };
  }
  return {
    method: fallback,
    note: `There are no tested instructions for ${METHOD_LABELS[requested]} ${food} yet. This is the recommended method instead.`,
  };
}
