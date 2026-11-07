/**
 * @file src/lib/mcp/culinaryWhatToCook.ts
 *
 * what_to_cook_now composite chef recommendation tool.
 */
import type { Recipe } from "@/types/recipe";
import { findSolarReturnForYear } from "@/utils/historicalEchoFinder";
import { toStringArray, type ToolResult } from "./culinaryCommon";
import { fetchAllCatalogRecipes } from "./culinaryGrocery";
import { getUserCulinaryProfile, isRecipeSafeForProfile, type CallerCulinaryProfile } from "./culinaryProfile";
import {
  buildWhatToCookResult,
  formatRecommendationCard,
  type ProfileFiltersResult,
  type RecommendationCard,
  type ScoredRecipe,
} from "./culinaryRecommendationCard";
import type { ResolvedCaller } from "./auth";

export type { RecommendationCard };

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
  solarReturnCuisines: string[] = [],
  solarReturnElement: string | null = null,
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

  if (solarReturnCuisines.length > 0 && r.cuisine) {
    const rc = r.cuisine.toLowerCase();
    if (solarReturnCuisines.some((c) => rc.includes(c) || c.includes(rc))) {
      score += 0.15;
    }
  }
  if (solarReturnElement && rDom === solarReturnElement) {
    score += 0.1;
  }

  const finalScore = Math.min(Math.max(Math.round(score * 100) / 100, 0.1), 0.99);
  return { recipe: r, score: finalScore, dominantElement: rDom, matchedIngs, missingIngs };
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
  solarReturnYear: number | null;
  limit: number;
}

function parseWhatToCookCriteria(args: Record<string, unknown>): WhatToCookCriteria {
  const rawYear = typeof args.solarReturnYear === "number" ? Math.floor(args.solarReturnYear) : null;
  const maxYear = new Date().getUTCFullYear() - 1;
  const solarReturnYear =
    rawYear !== null && rawYear >= 1800 && rawYear <= maxYear ? rawYear : null;

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
    solarReturnYear,
    limit: typeof args.limit === "number" ? Math.min(Math.max(1, args.limit), 10) : 3,
  };
}

async function resolveSolarReturnSynergy(year: number | null): Promise<{
  solarReturnMeta: {
    year: number;
    moment: string;
    matchedCuisines: string[];
    dominantElement: string;
  } | null;
  srCuisines: string[];
  srElement: string | null;
}> {
  if (year === null) return { solarReturnMeta: null, srCuisines: [], srElement: null };
  try {
    const echo = await findSolarReturnForYear(year);
    const srCuisines = (echo.cuisineMatches ?? []).map((c) => c.name.toLowerCase());
    const srElement = findDominantElement(echo.echo.alchemical.elementalProperties);
    return {
      solarReturnMeta: {
        year,
        moment: echo.echo.iso,
        matchedCuisines: (echo.cuisineMatches ?? []).map((c) => c.name),
        dominantElement: srElement,
      },
      srCuisines,
      srElement,
    };
  } catch {
    return { solarReturnMeta: null, srCuisines: [], srElement: null };
  }
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

  const { solarReturnMeta, srCuisines, srElement } = await resolveSolarReturnSynergy(
    criteria.solarReturnYear,
  );

  const scored = safeCandidates.map((r) =>
    scoreCandidate(
      r,
      criteria.availableIngredients,
      criteria.targetElement,
      criteria.mood,
      criteria.season,
      srCuisines,
      srElement,
    ),
  );
  scored.sort((a, b) => b.score - a.score || a.missingIngs.length - b.missingIngs.length);

  const recommendations = scored
    .slice(0, criteria.limit)
    .map((s) =>
      formatRecommendationCard(s, criteria.servings, parseCookingMinutes(s.recipe.timeToMake) ?? 30),
    );
  const dominantElement =
    criteria.targetElement ?? srElement ?? (recommendations[0] ? scored[0]?.dominantElement : null) ?? "Fire";

  return buildWhatToCookResult(
    safeCandidates.length,
    recommendations,
    appliedProfileFilters,
    dominantElement,
    solarReturnMeta,
  );
}
