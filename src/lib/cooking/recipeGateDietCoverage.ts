/** Requested restriction coverage and the evidence limits of text screening. */

import type { GateFinding } from "./recipeGateTypes";

export const EVALUATED_DIET_KEYS = new Set([
  "vegan",
  "vegetarian",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "pescatarian",
]);

export function normalizeDietToken(token: string): string {
  const t = token.toLowerCase().trim().replace(/_/g, "-");
  if (
    t === "glutenfree" ||
    t === "gf" ||
    t === "gluten free" ||
    t === "gluten-free"
  )
    return "gluten-free";
  if (
    t === "dairyfree" ||
    t === "df" ||
    t === "dairy free" ||
    t === "dairy-free" ||
    t === "non-dairy"
  )
    return "dairy-free";
  if (t === "nutfree" || t === "nut free" || t === "nut-free")
    return "nut-free";
  if (t === "veg" || t === "vegetarian") return "vegetarian";
  if (t === "plant-based" || t === "plant based" || t === "vegan")
    return "vegan";
  if (t === "pescetarian" || t === "pescatarian") return "pescatarian";
  return t;
}

export function parseDietRequests(requestedDiet: string): Set<string> {
  const set = new Set<string>();
  if (!requestedDiet) return set;

  const tokens = requestedDiet
    .toLowerCase()
    .split(/[,;&/]|\band\b/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const token of tokens) {
    set.add(normalizeDietToken(token));
  }
  return set;
}

export interface ActiveDietChecks {
  checkVegan: boolean;
  checkVegetarian: boolean;
  checkGlutenFree: boolean;
  checkDairyFree: boolean;
  checkNutFree: boolean;
  checkPescatarian: boolean;
}

export function classifyDietaryCoverage(
  requestedDiet: string,
  currentDietTags: string[],
  advisoryFindings: GateFinding[],
): {
  requestedRestrictions: string[];
  evaluatedRestrictions: string[];
  unevaluatedRestrictions: string[];
} {
  const requestedRestrictions = Array.from(parseDietRequests(requestedDiet));
  const evaluatedRestrictions = requestedRestrictions.filter((key) =>
    EVALUATED_DIET_KEYS.has(key),
  );
  const unevaluatedRestrictions = requestedRestrictions.filter(
    (key) => !EVALUATED_DIET_KEYS.has(key),
  );

  for (const tag of currentDietTags) {
    const normalized = normalizeDietToken(tag);
    if (
      EVALUATED_DIET_KEYS.has(normalized) &&
      !evaluatedRestrictions.includes(normalized)
    ) {
      evaluatedRestrictions.push(normalized);
    }
  }

  for (const unevaluated of unevaluatedRestrictions) {
    advisoryFindings.push({
      code: "UNEVALUATED_DIETARY_RESTRICTION",
      message: `Dietary restriction "${unevaluated}" cannot be deterministically evaluated by the culinary gate.`,
      path: "tags.diet",
      severity: "advisory",
    });
  }

  return {
    requestedRestrictions,
    evaluatedRestrictions,
    unevaluatedRestrictions,
  };
}

export function activeDietChecks(
  requestedDiet: string,
  currentDietTags: string[],
): ActiveDietChecks {
  const requestedSet = parseDietRequests(requestedDiet);
  const taggedSet = new Set(currentDietTags.map(normalizeDietToken));
  const checkVegan = taggedSet.has("vegan") || requestedSet.has("vegan");
  const checkVegetarian =
    checkVegan || taggedSet.has("vegetarian") || requestedSet.has("vegetarian");
  const checkGlutenFree =
    taggedSet.has("gluten-free") || requestedSet.has("gluten-free");
  const checkDairyFree =
    taggedSet.has("dairy-free") || requestedSet.has("dairy-free");
  const checkNutFree =
    taggedSet.has("nut-free") || requestedSet.has("nut-free");
  const checkPescatarian =
    taggedSet.has("pescatarian") || requestedSet.has("pescatarian");

  return {
    checkVegan,
    checkVegetarian,
    checkGlutenFree,
    checkDairyFree,
    checkNutFree,
    checkPescatarian,
  };
}

export function recordUncertifiedDietClaims(
  checks: ActiveDietChecks,
  advisoryFindings: GateFinding[],
): boolean {
  let uncertifiedDietClaims = false;
  if (checks.checkGlutenFree) {
    uncertifiedDietClaims = true;
    advisoryFindings.push({
      code: "UNCERTIFIED_GLUTEN_FREE",
      message:
        "Gluten-free claims require certified manufacturer allergen attestations; gluten-free status cannot be verified.",
      path: "tags.diet",
      severity: "advisory",
    });
  }
  // Text screening can identify a named allergen, but absence in the name is
  // not manufacturer evidence of absence. Keep the existing gluten-free policy
  // for the newly evaluated allergen-sensitive claims too.
  for (const { active, restriction, code } of [
    {
      active: checks.checkDairyFree,
      restriction: "Dairy-free",
      code: "UNCERTIFIED_DAIRY_FREE",
    },
    {
      active: checks.checkNutFree,
      restriction: "Nut-free",
      code: "UNCERTIFIED_NUT_FREE",
    },
  ]) {
    if (!active) continue;
    uncertifiedDietClaims = true;
    advisoryFindings.push({
      code,
      message: `${restriction} claims require verified manufacturer allergen evidence; absence cannot be verified from recipe text.`,
      path: "tags.diet",
      severity: "advisory",
    });
  }

  return uncertifiedDietClaims;
}
