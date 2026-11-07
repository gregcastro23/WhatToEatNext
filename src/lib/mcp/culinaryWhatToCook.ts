/**
 * @file src/lib/mcp/culinaryWhatToCook.ts
 *
 * what_to_cook_now composite chef recommendation tool.
 */
import type { Recipe } from "@/types/recipe";
import { toStringArray, type ToolResult } from "./culinaryCommon";
import { fetchAllCatalogRecipes } from "./culinaryGrocery";
import { getUserCulinaryProfile, isRecipeSafeForProfile, type CallerCulinaryProfile } from "./culinaryProfile";
import type { ResolvedCaller } from "./auth";

export function parseCookingMinutes(timeStr?: string | null): number | null {
  if (!timeStr) return null;
  const str = timeStr.toLowerCase().trim();
  let total = 0;
  const hrMatch = str.match(/(\d+)\s*(?:h|hr|hour)/);
  if (hrMatch?.[1]) total += parseInt(hrMatch[1], 10) * 60;
  const minMatch = str.match(/(\d+)\s*(?:m|min|minute)/);
  if (minMatch?.[1]) total += parseInt(minMatch[1], 10);
  if (total > 0) return total;
  const rawNum = parseInt(str, 10);
  return Number.isFinite(rawNum) && rawNum > 0 ? rawNum : null;
}

function isDominantElement(val: unknown): val is "Fire" | "Water" | "Earth" | "Air" {
  return typeof val === "string" && ["Fire", "Water", "Earth", "Air"].includes(val);
}

interface FilterCriteria {
  profileLoaded: boolean;
  profile: CallerCulinaryProfile;
  cuisine: string | null;
  dietary: string[];
  maxActiveMinutes: number | null;
}

function filterSafeCandidates(catalog: Recipe[], criteria: FilterCriteria): Recipe[] {
  return catalog.filter((r) => {
    if (criteria.profileLoaded && !isRecipeSafeForProfile(r, criteria.profile).safe) {
      return false;
    }
    if (criteria.cuisine && !r.cuisine?.toLowerCase().includes(criteria.cuisine)) {
      return false;
    }
    if (criteria.dietary.length > 0) {
      for (const d of criteria.dietary) {
        const dl = d.toLowerCase();
        if (dl.includes("vegan") && !r.isVegan) return false;
        if (dl.includes("vegetarian") && !r.isVegetarian && !r.isVegan) return false;
        if (dl.includes("gluten") && !r.isGlutenFree) return false;
        if (dl.includes("dairy") && !r.isDairyFree) return false;
      }
    }
    if (criteria.maxActiveMinutes !== null) {
      const minutes = parseCookingMinutes(r.timeToMake);
      if (minutes !== null && minutes > criteria.maxActiveMinutes) {
        return false;
      }
    }
    return true;
  });
}

interface ScoredRecipe {
  recipe: Recipe;
  score: number;
  dominantElement: string;
  matchedIngs: string[];
  missingIngs: string[];
}

function findDominantElement(props: Record<string, number>): string {
  let rDom = "Fire";
  let maxVal = -1;
  for (const [el, val] of Object.entries(props)) {
    if (val > maxVal) {
      maxVal = val;
      rDom = el;
    }
  }
  return rDom;
}

function matchPantry(
  ingredients: Recipe["ingredients"],
  available: string[],
): { matchedIngs: string[]; missingIngs: string[]; ratio: number } {
  if (available.length === 0 || ingredients.length === 0) {
    return { matchedIngs: ingredients.map((i) => i.name), missingIngs: [], ratio: 0.5 };
  }
  const matchedIngs: string[] = [];
  const missingIngs: string[] = [];
  for (const ing of ingredients) {
    const ingName = ing.name.toLowerCase();
    const found = available.some((avail) => ingName.includes(avail) || avail.includes(ingName));
    if (found) matchedIngs.push(ing.name);
    else missingIngs.push(ing.name);
  }
  return { matchedIngs, missingIngs, ratio: matchedIngs.length / ingredients.length };
}

function scoreCandidate(
  r: Recipe,
  availableIngredients: string[],
  targetElement: string | null,
  mood: string | null,
  season: string | null,
): ScoredRecipe {
  const { matchedIngs, missingIngs, ratio } = matchPantry(r.ingredients, availableIngredients);
  let score = availableIngredients.length > 0 && r.ingredients.length > 0 ? ratio * 0.6 + 0.2 : 0.5;

  const rDom = findDominantElement(r.elementalProperties);
  if (targetElement && rDom === targetElement) {
    score += 0.2;
  }

  const textBlob = `${r.name} ${r.description ?? ""} ${r.cuisine ?? ""}`.toLowerCase();
  if (mood && (textBlob.includes(mood) || mood.split(/\s+/).some((m) => textBlob.includes(m)))) {
    score += 0.15;
  }
  if (season && textBlob.includes(season)) {
    score += 0.1;
  }

  const finalScore = Math.min(Math.max(Math.round(score * 100) / 100, 0.1), 0.99);
  return { recipe: r, score: finalScore, dominantElement: rDom, matchedIngs, missingIngs };
}

function getFinishingTouch(element: string): string {
  if (element === "Fire") {
    return "Finish with a swirl of chili-infused extra virgin oil and fresh lemon zest to heighten thermal contrast.";
  }
  if (element === "Water") {
    return "Finish with a gentle drizzle of cold-pressed oil and fine sea salt to preserve delicate cohesive moisture.";
  }
  if (element === "Earth") {
    return "Finish with toasted pepitas and aged balsamic reduction for grounding crunch and umami.";
  }
  if (element === "Air") {
    return "Finish with freshly torn soft herbs (dill, parsley, or chives) to release aromatic volatile oils.";
  }
  return "Finish with flaky sea salt and cracked black pepper right before serving.";
}

export interface RecommendationCard {
  id: string;
  name: string;
  cuisine: string | null;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  matchScore: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  flavorStar: Record<string, number>;
  finishingTouch: string;
  sensoryCheckpoints: string[];
  zeroWasteTip: string;
  resourceUri: string;
}

function formatRecommendationCard(scored: ScoredRecipe, servings: number | null): RecommendationCard {
  const { recipe: r, score, dominantElement: rDom, matchedIngs, missingIngs } = scored;
  const totalMins = parseCookingMinutes(r.timeToMake) ?? 30;
  const prepMins = Math.round(totalMins * 0.4);
  const cookMins = totalMins - prepMins;
  const props = r.elementalProperties;

  const flavorStar = {
    sweet: Math.round((props.Earth * 0.7 + props.Water * 0.3) * 100) / 100,
    salty: Math.round((props.Water * 0.6 + props.Earth * 0.4) * 100) / 100,
    sour: Math.round((props.Air * 0.7 + props.Fire * 0.3) * 100) / 100,
    bitter: Math.round((props.Fire * 0.5 + props.Air * 0.5) * 100) / 100,
    umami: Math.round((props.Earth * 0.5 + props.Water * 0.5) * 100) / 100,
  };

  return {
    id: r.id,
    name: r.name,
    cuisine: r.cuisine ?? null,
    prepTimeMinutes: prepMins,
    cookTimeMinutes: cookMins,
    totalTimeMinutes: totalMins,
    servings: servings ?? r.numberOfServings ?? 4,
    matchScore: score,
    matchedIngredients: matchedIngs,
    missingIngredients: missingIngs,
    flavorStar,
    finishingTouch: getFinishingTouch(rDom),
    sensoryCheckpoints: [
      "Aromatics soften and release fragrance into the cooking fat without burning",
      "Liquid reduces until bubbles turn glossy and sauce clings lightly to the back of a spoon",
      "Rest off heat for 2-3 minutes before plating so flavors coalesce seamlessly",
    ],
    zeroWasteTip:
      "Save vegetable peelings, mushroom stems, and allium trimmings in a freezer container to simmer into homemade mineral stock.",
    resourceUri: `alchm://recipes/${r.id}`,
  };
}

interface ProfileFiltersResult {
  profileLoaded: boolean;
  ignored: boolean;
  excludedAllergens: string[];
  dietaryFrameworks: string[];
  dislikedIngredients: string[];
}

function resolveProfileFilters(
  caller: ResolvedCaller,
  args: Record<string, unknown>,
  profile: CallerCulinaryProfile,
): ProfileFiltersResult {
  const profileLoaded = Boolean(caller.userId && !args.ignoreSavedProfile && profile.authenticated);
  return {
    profileLoaded,
    ignored: Boolean(args.ignoreSavedProfile),
    excludedAllergens: profileLoaded ? profile.allergens : [],
    dietaryFrameworks: profileLoaded ? profile.dietaryFrameworks : [],
    dislikedIngredients: profileLoaded ? profile.dislikedIngredients : [],
  };
}

interface WhatToCookCriteria {
  availableIngredients: string[];
  maxActiveMinutes: number | null;
  mood: string | null;
  season: string | null;
  servings: number | null;
  dietary: string[];
  cuisine: string | null;
  targetElement: "Fire" | "Water" | "Earth" | "Air" | null;
  limit: number;
}

function parseWhatToCookCriteria(args: Record<string, unknown>): WhatToCookCriteria {
  return {
    availableIngredients: toStringArray(args.availableIngredients).map((s) => s.toLowerCase().trim()),
    maxActiveMinutes: typeof args.maxActiveMinutes === "number" ? args.maxActiveMinutes : null,
    mood: typeof args.moodOrCraving === "string" ? args.moodOrCraving.toLowerCase() : null,
    season: typeof args.seasonOrWeather === "string" ? args.seasonOrWeather.toLowerCase() : null,
    servings: typeof args.servings === "number" ? args.servings : null,
    dietary: toStringArray(args.dietary),
    cuisine: typeof args.cuisine === "string" ? args.cuisine.toLowerCase() : null,
    targetElement:
      typeof args.dominantElement === "string" && isDominantElement(args.dominantElement)
        ? args.dominantElement
        : null,
    limit: typeof args.limit === "number" ? Math.min(Math.max(1, args.limit), 10) : 3,
  };
}

export async function whatToCookNowHandler(
  args: Record<string, unknown>,
  caller: ResolvedCaller,
): Promise<ToolResult> {
  const criteria = parseWhatToCookCriteria(args);
  const profile = await getUserCulinaryProfile(caller);
  const appliedProfileFilters = resolveProfileFilters(caller, args, profile);

  const catalog = await fetchAllCatalogRecipes();
  const safeCandidates = filterSafeCandidates(catalog, {
    profileLoaded: appliedProfileFilters.profileLoaded,
    profile,
    cuisine: criteria.cuisine,
    dietary: criteria.dietary,
    maxActiveMinutes: criteria.maxActiveMinutes,
  });

  const scored = safeCandidates.map((r) =>
    scoreCandidate(r, criteria.availableIngredients, criteria.targetElement, criteria.mood, criteria.season),
  );
  scored.sort((a, b) => b.score - a.score || a.missingIngs.length - b.missingIngs.length);

  const recommendations = scored.slice(0, criteria.limit).map((s) => formatRecommendationCard(s, criteria.servings));
  const dominantElement =
    criteria.targetElement ?? (recommendations[0] ? scored[0]?.dominantElement : null) ?? "Fire";

  return {
    ok: true,
    data: {
      totalCandidates: safeCandidates.length,
      dominantElement,
      appliedProfileFilters,
      recommendations,
    },
    summary: {
      totalCandidates: safeCandidates.length,
      returnedCount: recommendations.length,
      dominantElement,
      topRecommendation: recommendations[0]?.name ?? null,
    },
  };
}
