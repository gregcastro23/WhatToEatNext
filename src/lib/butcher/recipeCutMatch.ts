import type { SpeciesId } from "@/lib/butcher/types";
import type { Recipe } from "@/types/recipe";

/**
 * Lightweight server-side matcher linking protein ingredients and site recipes
 * to `/kitchen-lab/butcher?species=...&cut=...`.
 *
 * Intentionally keeps a compact static keyword table (zero Three.js, zero heavy
 * 3D/USDA tables) so importing this from server components adds 0 B to client
 * bundles like `/recipes/[recipeId]` and `/ingredients/[slug]`.
 *
 * @file src/lib/butcher/recipeCutMatch.ts
 */

export interface ButcherDeepLinkMatch {
  readonly speciesId: SpeciesId;
  readonly cutId: string;
  readonly cutName: string;
  readonly href: string;
}

interface CutMatchRule {
  readonly speciesId: SpeciesId;
  readonly cutId: string;
  readonly cutName: string;
  readonly terms: readonly string[];
}

const SPECIFIC_CUT_RULES: readonly CutMatchRule[] = [
  // Beef cuts (most specific first)
  { speciesId: "beef", cutId: "spinalis-cap", cutName: "Spinalis Ribeye Cap", terms: ["spinalis", "ribeye cap"] },
  { speciesId: "beef", cutId: "ribeye", cutName: "Ribeye Steak", terms: ["ribeye", "rib eye", "rib-eye", "entrecote", "cote de boeuf"] },
  { speciesId: "beef", cutId: "prime-rib", cutName: "Standing Rib Roast", terms: ["prime rib", "standing rib roast", "rib roast"] },
  { speciesId: "beef", cutId: "short-ribs", cutName: "Beef Short Ribs", terms: ["short rib", "short ribs", "galbi", "kalbi"] },
  { speciesId: "beef", cutId: "porterhouse", cutName: "Porterhouse", terms: ["porterhouse", "bistecca"] },
  { speciesId: "beef", cutId: "t-bone", cutName: "T-Bone Steak", terms: ["t-bone", "t bone"] },
  { speciesId: "beef", cutId: "ny-strip", cutName: "New York Strip", terms: ["new york strip", "ny strip", "strip steak"] },
  { speciesId: "beef", cutId: "tenderloin-filet", cutName: "Tenderloin / Filet Mignon", terms: ["filet mignon", "beef tenderloin", "chateaubriand", "tournedos"] },
  { speciesId: "beef", cutId: "outside-skirt", cutName: "Outside Skirt Steak", terms: ["outside skirt", "skirt steak", "carne asada", "fajita steak"] },
  { speciesId: "beef", cutId: "inside-skirt", cutName: "Inside Skirt Steak", terms: ["inside skirt"] },
  { speciesId: "beef", cutId: "hanger", cutName: "Hanger Steak", terms: ["hanger steak", "onglet"] },
  { speciesId: "beef", cutId: "flank-steak", cutName: "Flank Steak", terms: ["flank steak", "bavette"] },
  { speciesId: "beef", cutId: "brisket-flat", cutName: "Brisket", terms: ["brisket", "corned beef", "pastrami"] },
  { speciesId: "beef", cutId: "osso-buco-shank", cutName: "Beef Shank (Osso Buco)", terms: ["osso buco", "ossobuco", "beef shank"] },
  { speciesId: "beef", cutId: "flat-iron", cutName: "Flat Iron Steak", terms: ["flat iron", "top blade"] },
  { speciesId: "beef", cutId: "denver-steak", cutName: "Denver Steak", terms: ["denver steak"] },
  { speciesId: "beef", cutId: "chuck-roast", cutName: "Chuck Pot Roast", terms: ["chuck roast", "pot roast", "beef chuck", "beef bourguignon", "beef stew"] },
  { speciesId: "beef", cutId: "picanha", cutName: "Picanha", terms: ["picanha", "coulotte"] },
  { speciesId: "beef", cutId: "tri-tip", cutName: "Tri-Tip Roast", terms: ["tri-tip", "tri tip"] },
  { speciesId: "beef", cutId: "top-sirloin", cutName: "Top Sirloin", terms: ["top sirloin", "sirloin steak", "sirloin"] },
  { speciesId: "beef", cutId: "eye-of-round", cutName: "Eye of Round", terms: ["eye of round", "roast beef"] },
  { speciesId: "beef", cutId: "top-round", cutName: "Top Round", terms: ["top round", "london broil"] },

  // Pork cuts
  { speciesId: "pork", cutId: "pork-belly", cutName: "Pork Belly", terms: ["pork belly", "chashu", "pancetta", "guanciale"] },
  { speciesId: "pork", cutId: "baby-back-ribs", cutName: "Baby Back Ribs", terms: ["baby back ribs", "baby back"] },
  { speciesId: "pork", cutId: "spare-ribs", cutName: "Spare Ribs", terms: ["spare ribs", "spareribs", "pork ribs"] },
  { speciesId: "pork", cutId: "boston-butt", cutName: "Pork Shoulder (Boston Butt)", terms: ["pork shoulder", "boston butt", "pulled pork", "carnitas"] },
  { speciesId: "pork", cutId: "pork-tenderloin", cutName: "Pork Tenderloin", terms: ["pork tenderloin"] },
  { speciesId: "pork", cutId: "pork-loin-chop", cutName: "Pork Loin Chop", terms: ["pork chop", "pork chops", "pork loin", "tonkatsu"] },
  { speciesId: "pork", cutId: "pork-hock", cutName: "Pork Hock", terms: ["pork hock", "ham hock", "schweinshaxe"] },

  // Lamb cuts
  { speciesId: "lamb", cutId: "rack-of-lamb", cutName: "Rack of Lamb", terms: ["rack of lamb", "lamb chop", "lamb chops"] },
  { speciesId: "lamb", cutId: "lamb-shank", cutName: "Lamb Shank", terms: ["lamb shank", "lamb shanks"] },
  { speciesId: "lamb", cutId: "leg-of-lamb", cutName: "Leg of Lamb", terms: ["leg of lamb", "lamb leg"] },
  { speciesId: "lamb", cutId: "lamb-shoulder-roast", cutName: "Lamb Shoulder", terms: ["lamb shoulder"] },

  // Poultry cuts
  { speciesId: "poultry", cutId: "breast-supreme", cutName: "Chicken Breast", terms: ["chicken breast", "chicken cutlet", "chicken piccata", "chicken parmesan"] },
  { speciesId: "poultry", cutId: "chicken-thigh", cutName: "Chicken Thigh", terms: ["chicken thigh", "chicken thighs", "coq au vin", "chicken curry"] },
  { speciesId: "poultry", cutId: "chicken-drumstick", cutName: "Chicken Drumstick", terms: ["drumstick", "chicken leg"] },
  { speciesId: "poultry", cutId: "chicken-wing", cutName: "Chicken Wing", terms: ["chicken wing", "chicken wings", "buffalo wings"] },
  { speciesId: "poultry", cutId: "chicken-tenderloin", cutName: "Chicken Tenderloin", terms: ["chicken tender", "chicken tenders", "chicken tenderloin"] },

  // Salmon / Finfish cuts
  { speciesId: "finfish", cutId: "belly-toro", cutName: "Salmon Belly (Toro)", terms: ["salmon belly"] },
  { speciesId: "finfish", cutId: "collar-kama", cutName: "Salmon Collar", terms: ["salmon collar", "kama"] },
  { speciesId: "finfish", cutId: "center-fillet", cutName: "Salmon Fillet", terms: ["atlantic salmon", "salmon fillet", "grilled salmon", "baked salmon", "salmon"] },
];

const SPECIES_FALLBACK_RULES: readonly CutMatchRule[] = [
  { speciesId: "beef", cutId: "ribeye", cutName: "Beef (Ribeye)", terms: ["beef", "steak"] },
  { speciesId: "pork", cutId: "pork-loin-chop", cutName: "Pork (Center Loin)", terms: ["pork"] },
  { speciesId: "lamb", cutId: "rack-of-lamb", cutName: "Lamb (Rack)", terms: ["lamb"] },
  { speciesId: "poultry", cutId: "breast-supreme", cutName: "Chicken (Breast)", terms: ["chicken"] },
  { speciesId: "finfish", cutId: "center-fillet", cutName: "Salmon (Fillet)", terms: ["salmon"] },
];

function containsTerm(haystack: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(haystack);
}

function buildMatch(rule: CutMatchRule): ButcherDeepLinkMatch {
  return {
    speciesId: rule.speciesId,
    cutId: rule.cutId,
    cutName: rule.cutName,
    href: `/kitchen-lab/butcher?species=${encodeURIComponent(rule.speciesId)}&cut=${encodeURIComponent(rule.cutId)}`,
  };
}

export function matchTextToButcherCut(text: string): ButcherDeepLinkMatch | null {
  const normalized = text.trim().toLowerCase();
  if (normalized === "") return null;

  for (const rule of SPECIFIC_CUT_RULES) {
    if (rule.terms.some((term) => containsTerm(normalized, term))) {
      return buildMatch(rule);
    }
  }
  for (const rule of SPECIES_FALLBACK_RULES) {
    if (rule.terms.some((term) => containsTerm(normalized, term))) {
      return buildMatch(rule);
    }
  }
  return null;
}

export function matchIngredientToButcherCut(
  slug: string,
  name: string,
): ButcherDeepLinkMatch | null {
  const cleanedSlug = slug.replace(/[-_]/g, " ");
  return matchTextToButcherCut(`${name} ${cleanedSlug}`);
}

export function matchRecipeToButcherCut(recipe: Recipe): ButcherDeepLinkMatch | null {
  if (recipe.isVegan === true || recipe.isVegetarian === true) return null;

  // Check recipe title first for highest precision (e.g. "Braised Short Ribs")
  const nameMatch = matchTextToButcherCut(recipe.name);
  if (nameMatch) return nameMatch;

  // Scan protein ingredients next (specifically cut terms first across all ingredients)
  const ingredientText = recipe.ingredients
    .map((ing) => `${ing.name} ${ing.preparation ?? ""}`)
    .join(" ");
  return matchTextToButcherCut(ingredientText);
}
