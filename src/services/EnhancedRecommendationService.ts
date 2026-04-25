/**
 * EnhancedRecommendationService
 *
 * Ranks recipes/foods using a weighted blend of signals drawn from the
 * user's food diary history, active nutrition targets, elemental balance,
 * favorites, and optional astrological state.
 *
 * This service is intentionally dependency-light: heavy modules (the recipe
 * catalog, diary service, astrology helpers) are pulled in via dynamic
 * imports so it can be safely imported from both server and client bundles.
 */

import type {
  AlchemicalProperties,
  ElementalProperties,
} from "@/types/alchemy";
import type {
  FoodDiaryEntry,
  FoodSearchResult,
  FoodRecommendation,
} from "@/types/foodDiary";
import type { CompositeNatalChart } from "@/types/natalChart";
import type { NutritionalSummary } from "@/types/nutrition";
import type { Recipe } from "@/types/recipe";

type ElementKey = "Fire" | "Water" | "Earth" | "Air";

export interface EnhancedRecommendationContext {
  userId: string;
  datetime?: Date;
  location?: { latitude: number; longitude: number };
  preferences?: {
    dietaryRestrictions?: string[];
    cuisineTypes?: string[];
    intensity?: "mild" | "moderate" | "intense";
  };
  elementalState?: ElementalProperties;
  /** Override live targets (e.g. remaining macros after today's entries) */
  nutritionalTargets?: Partial<NutritionalSummary>;
}

export interface ScoredRecipe {
  recipe: Recipe;
  score: number;
  scoreBreakdown: {
    nutritionalGap: number;
    elementalMatch: number;
    favoriteBoost: number;
    astrologicalAlignment: number;
    diversityBonus: number;
  };
  reason: string;
}

export interface EnhancedRecommendationResult {
  /** Primary, ordered recommendations */
  recommendations: ScoredRecipe[];
  /** Convenience mirror that older consumers may still rely on */
  items: Recipe[];
  /** Overall confidence across the result set (0-1) */
  confidence: number;
  /** Aggregate top-result score (0-1) */
  score: number;
  context: {
    userId: string;
    datetime: Date;
    location?: { latitude: number; longitude: number };
    dominantElementalGap?: ElementKey;
    topNutritionalGap?: keyof NutritionalSummary;
  };
}

const ELEMENTS: ElementKey[] = ["Fire", "Water", "Earth", "Air"];
const NUTRIENT_PRIORITY: Array<keyof NutritionalSummary> = [
  "protein",
  "fiber",
  "calories",
  "fat",
  "carbs",
];
const BALANCED = 0.25;

/**
 * Determine which element is most under-represented (lowest share).
 */
function findElementalGap(
  balance: ElementalProperties | undefined,
): ElementKey | undefined {
  if (!balance) return undefined;
  const total = ELEMENTS.reduce((sum, el) => sum + (balance[el] || 0), 0);
  if (total === 0) return undefined;
  let gap: ElementKey = "Fire";
  let gapSize = -Infinity;
  for (const el of ELEMENTS) {
    const share = (balance[el] || 0) / total;
    const deficit = BALANCED - share;
    if (deficit > gapSize) {
      gapSize = deficit;
      gap = el;
    }
  }
  return gapSize > 0 ? gap : undefined;
}

/**
 * Determine which nutrient has the largest deficit relative to its target.
 * Returns undefined if the user is already meeting priority targets.
 */
function findNutritionalGap(
  consumed: Partial<NutritionalSummary>,
  targets: Partial<NutritionalSummary>,
): keyof NutritionalSummary | undefined {
  let worst: keyof NutritionalSummary | undefined;
  let worstRatio = 0.95; // only flag when below 95% of target
  for (const nutrient of NUTRIENT_PRIORITY) {
    const target = targets[nutrient];
    if (!target || target <= 0) continue;
    const actual = consumed[nutrient] ?? 0;
    const ratio = actual / target;
    if (ratio < worstRatio) {
      worstRatio = ratio;
      worst = nutrient;
    }
  }
  return worst;
}

/**
 * Score a recipe against an elemental gap (0-1). A recipe that is dominant
 * in the missing element scores high; a balanced recipe scores ~0.5; one
 * that deepens the existing excess scores low.
 */
function scoreElementalMatch(
  recipe: Recipe,
  gap: ElementKey | undefined,
): number {
  const elementalProperties = (recipe as Recipe & {
    elementalProperties?: ElementalProperties;
  }).elementalProperties;
  if (!gap || !elementalProperties) return 0.5;
  const share = elementalProperties[gap] ?? 0.25;
  // Max share per element is ~1.0 (summed to 1). 0.4+ is notable dominance.
  return Math.max(0, Math.min(1, (share - 0.25) / 0.5 + 0.5));
}

/**
 * Score a recipe against a nutritional gap (0-1). Recipes rich in the
 * deficient nutrient score higher.
 */
function scoreNutritionalMatch(
  recipe: Recipe,
  gap: keyof NutritionalSummary | undefined,
): number {
  if (!gap) return 0.5;
  const nutrition = (recipe as Recipe & {
    nutrition?: NutritionalSummary;
  }).nutrition;
  const value = nutrition?.[gap];
  if (typeof value !== "number" || value <= 0) return 0.3;
  // Rough per-serving thresholds considered "high" for the key nutrients.
  const highThreshold: Partial<Record<keyof NutritionalSummary, number>> = {
    protein: 25,
    fiber: 8,
    calories: 400,
    fat: 15,
    carbs: 40,
  };
  const threshold = highThreshold[gap] ?? 10;
  return Math.min(1, value / threshold);
}

/**
 * Score based on the user's history: favorites and top-rated foods.
 */
function scoreFavoriteBoost(
  recipe: Recipe,
  favoriteNames: Set<string>,
  highRatedCuisines: Set<string>,
): number {
  const name = recipe.name?.toLowerCase() ?? "";
  if (favoriteNames.has(name)) return 1;
  const cuisine = (recipe.cuisine ?? "").toLowerCase();
  if (cuisine && highRatedCuisines.has(cuisine)) return 0.7;
  return 0.4;
}

/**
 * Penalize recipes the user ate recently to promote diversity.
 */
function scoreDiversity(
  recipe: Recipe,
  recentNames: Map<string, number>,
): number {
  const name = recipe.name?.toLowerCase() ?? "";
  const recentCount = recentNames.get(name) ?? 0;
  if (recentCount === 0) return 1;
  if (recentCount === 1) return 0.65;
  if (recentCount === 2) return 0.35;
  return 0.1;
}

/**
 * Score astrological alignment between an optional elemental state (current
 * sky/natal snapshot) and the recipe's elemental properties. Returns 0.5
 * when no elemental state is available so it does not skew results.
 */
function scoreAstrologicalAlignment(
  recipe: Recipe,
  elementalState: ElementalProperties | undefined,
): number {
  if (!elementalState) return 0.5;
  const elementalProperties = (recipe as Recipe & {
    elementalProperties?: ElementalProperties;
  }).elementalProperties;
  if (!elementalProperties) return 0.5;
  let diff = 0;
  for (const el of ELEMENTS) {
    diff += Math.abs(
      (elementalProperties[el] ?? 0.25) - (elementalState[el] ?? 0.25),
    );
  }
  // Average element diff is in [0, 0.5]; invert so closer = higher score.
  const avgDiff = diff / ELEMENTS.length;
  return Math.max(0, 1 - avgDiff * 2);
}

function passesDietaryRestrictions(
  recipe: Recipe,
  restrictions: string[] | undefined,
): boolean {
  if (!restrictions || restrictions.length === 0) return true;
  const haystack = [
    (recipe as Recipe & { dietaryInfo?: string[] }).dietaryInfo?.join(" "),
    (recipe as Recipe & { tags?: string[] }).tags?.join(" "),
    recipe.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  for (const r of restrictions) {
    const token = r.toLowerCase();
    // Explicit positive signals ("vegetarian", "vegan", "gluten-free") should
    // appear in recipe metadata to pass the filter; if none match, allow so we
    // do not over-filter a sparse catalog.
    if (haystack.includes(token)) return true;
  }
  // If recipe metadata is empty we keep the recipe rather than drop it.
  return haystack.length === 0;
}

/**
 * Score how closely a recipe's alchemical properties (ESMS) align with a
 * target chart. Uses cosine similarity on the four-component vector. When
 * either side is missing the data we fall back to a neutral 0.5 so this
 * signal does not skew composite recommendations.
 */
function scoreAlchemicalAlignment(
  recipe: Recipe,
  target: AlchemicalProperties | undefined,
): number {
  if (!target) return 0.5;
  const recipeAlchemy = (recipe as Recipe & {
    alchemicalProperties?: AlchemicalProperties;
  }).alchemicalProperties;
  if (!recipeAlchemy) return 0.5;
  const keys: Array<keyof AlchemicalProperties> = [
    "Spirit",
    "Essence",
    "Matter",
    "Substance",
  ];
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const k of keys) {
    const a = Number(recipeAlchemy[k] ?? 0);
    const b = Number(target[k] ?? 0);
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }
  if (magA === 0 || magB === 0) return 0.5;
  return Math.max(0, Math.min(1, dot / (Math.sqrt(magA) * Math.sqrt(magB))));
}

function buildReason(
  recipe: Recipe,
  breakdown: ScoredRecipe["scoreBreakdown"],
  gaps: {
    elemental?: ElementKey;
    nutritional?: keyof NutritionalSummary;
  },
): string {
  const parts: string[] = [];
  if (breakdown.favoriteBoost >= 0.9) {
    parts.push("one of your favorites");
  } else if (breakdown.favoriteBoost >= 0.65) {
    parts.push(`matches cuisines you've rated highly`);
  }
  if (gaps.nutritional && breakdown.nutritionalGap >= 0.6) {
    parts.push(`rich in ${gaps.nutritional}`);
  }
  if (gaps.elemental && breakdown.elementalMatch >= 0.7) {
    parts.push(`brings more ${gaps.elemental} energy`);
  }
  if (breakdown.astrologicalAlignment >= 0.8) {
    parts.push("aligned with today's sky");
  }
  if (breakdown.diversityBonus <= 0.4) {
    parts.push("you've had this recently — maybe rotate it");
  }
  if (parts.length === 0) {
    return `Solid pick based on your recent eating.`;
  }
  return `Recommended because it ${parts.join(", ")}.`;
}

export class EnhancedRecommendationService {
  /**
   * Build ranked recommendations for a user.
   */
  static async getRecommendations(
    ctx: EnhancedRecommendationContext,
    limit = 10,
  ): Promise<EnhancedRecommendationResult> {
    const datetime = ctx.datetime ?? new Date();
    const {
      entries,
      favoriteNames,
      highRatedCuisines,
      recentNames,
      consumedToday,
    } = await this.gatherUserSignals(ctx.userId);

    // Load the live recipe catalog via server action (cached internally).
    let recipes: Recipe[] = [];
    try {
      const mod = await import("@/actions/recipes");
      recipes = await mod.getServerRecipes();
    } catch {
      recipes = [];
    }

    // Determine gaps — prefer explicit targets if given, otherwise load live.
    let targets: Partial<NutritionalSummary> = ctx.nutritionalTargets ?? {};
    if (!ctx.nutritionalTargets) {
      try {
        const mod = await import("@/services/NutritionTrackingService");
        targets = mod.getNutritionTrackingService().getDailyTargets();
      } catch {
        targets = {};
      }
    }

    const elementalBalance = this.aggregateElementalBalance(entries);
    const elementalGap = findElementalGap(elementalBalance);
    const nutritionalGap = findNutritionalGap(consumedToday, targets);

    const filtered = recipes.filter((r) =>
      passesDietaryRestrictions(r, ctx.preferences?.dietaryRestrictions),
    );

    const preferredCuisines = new Set(
      (ctx.preferences?.cuisineTypes ?? []).map((c) => c.toLowerCase()),
    );

    const scored: ScoredRecipe[] = filtered.map((recipe) => {
      const elementalMatch = scoreElementalMatch(recipe, elementalGap);
      const nutritionalGapScore = scoreNutritionalMatch(recipe, nutritionalGap);
      const favoriteBoost = scoreFavoriteBoost(
        recipe,
        favoriteNames,
        highRatedCuisines,
      );
      const astrologicalAlignment = scoreAstrologicalAlignment(
        recipe,
        ctx.elementalState,
      );
      const diversityBonus = scoreDiversity(recipe, recentNames);

      // Cuisine preference nudge on top of favoriteBoost
      const cuisine = (recipe.cuisine ?? "").toLowerCase();
      const cuisineBoost =
        preferredCuisines.size > 0 && preferredCuisines.has(cuisine) ? 0.1 : 0;

      const breakdown = {
        nutritionalGap: nutritionalGapScore,
        elementalMatch,
        favoriteBoost: Math.min(1, favoriteBoost + cuisineBoost),
        astrologicalAlignment,
        diversityBonus,
      };

      const composite =
        breakdown.nutritionalGap * 0.3 +
        breakdown.elementalMatch * 0.2 +
        breakdown.favoriteBoost * 0.2 +
        breakdown.astrologicalAlignment * 0.15 +
        breakdown.diversityBonus * 0.15;

      return {
        recipe,
        score: Math.max(0, Math.min(1, composite)),
        scoreBreakdown: breakdown,
        reason: buildReason(recipe, breakdown, {
          elemental: elementalGap,
          nutritional: nutritionalGap,
        }),
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, limit);

    const topScore = top[0]?.score ?? 0;
    const avgScore =
      top.length > 0
        ? top.reduce((sum, r) => sum + r.score, 0) / top.length
        : 0;
    const confidence =
      entries.length === 0
        ? Math.min(0.4, avgScore) // low confidence when we have no history
        : Math.min(1, avgScore + Math.min(0.2, entries.length / 100));

    return {
      recommendations: top,
      items: top.map((r) => r.recipe),
      score: topScore,
      confidence,
      context: {
        userId: ctx.userId,
        datetime,
        location: ctx.location,
        dominantElementalGap: elementalGap,
        topNutritionalGap: nutritionalGap,
      },
    };
  }

  /**
   * Score every recipe in the catalog against a group's composite natal
   * chart. Stateless: no user, diary, or favorites are consulted, which makes
   * this safe for guest/anonymous flows. Reuses the same per-signal helpers
   * as `getRecommendations` but reweights for an aligning (not gap-filling)
   * objective and zeroes out user-only signals.
   */
  static async getRecommendationsForComposite(
    composite: CompositeNatalChart,
    limit = 5,
  ): Promise<EnhancedRecommendationResult> {
    const datetime = new Date();

    let recipes: Recipe[] = [];
    try {
      const mod = await import("@/actions/recipes");
      recipes = await mod.getServerRecipes();
    } catch {
      recipes = [];
    }

    // Rebuild the elemental balance into the alchemy.ts shape (with index
    // signature) so it satisfies the helper signatures without casts.
    const elementalState: ElementalProperties = {
      Fire: composite.elementalBalance.Fire,
      Water: composite.elementalBalance.Water,
      Earth: composite.elementalBalance.Earth,
      Air: composite.elementalBalance.Air,
    };
    const alchemicalTarget: AlchemicalProperties = {
      Spirit: composite.alchemicalProperties.Spirit,
      Essence: composite.alchemicalProperties.Essence,
      Matter: composite.alchemicalProperties.Matter,
      Substance: composite.alchemicalProperties.Substance,
    };

    const scored: ScoredRecipe[] = recipes.map((recipe) => {
      // For composite mode we want recipes that ALIGN with the group's
      // chart, not fill an individual gap — so pass `gap = undefined` and let
      // the astrological/alchemical alignment signals do the work.
      const elementalMatch = scoreElementalMatch(recipe, undefined);
      const astrologicalAlignment = scoreAstrologicalAlignment(
        recipe,
        elementalState,
      );
      const alchemicalAlignment = scoreAlchemicalAlignment(
        recipe,
        alchemicalTarget,
      );
      // Diversity is scoped to user history, which we don't have — so leave
      // it neutral. Same for nutritional/favorite signals.
      const breakdown = {
        nutritionalGap: 0.5,
        elementalMatch,
        favoriteBoost: 0.5,
        astrologicalAlignment,
        diversityBonus: 0.5,
      };

      const composite_score =
        astrologicalAlignment * 0.45 +
        alchemicalAlignment * 0.3 +
        elementalMatch * 0.15 +
        breakdown.diversityBonus * 0.1;

      const reasonParts: string[] = [];
      if (astrologicalAlignment >= 0.8) {
        reasonParts.push("aligns with your group's elemental signature");
      } else if (astrologicalAlignment >= 0.65) {
        reasonParts.push("matches your group's elemental flavor");
      }
      if (alchemicalAlignment >= 0.75) {
        reasonParts.push(
          `resonates with the group's ${composite.dominantElement.toLowerCase()}-leaning alchemy`,
        );
      }
      if (elementalMatch >= 0.6 && reasonParts.length === 0) {
        reasonParts.push(
          `carries strong ${composite.dominantElement} character`,
        );
      }
      const reason =
        reasonParts.length === 0
          ? `Balanced pick for a ${composite.memberCount}-member group leaning ${composite.dominantElement}.`
          : `Recommended because it ${reasonParts.join(", ")}.`;

      return {
        recipe,
        score: Math.max(0, Math.min(1, composite_score)),
        scoreBreakdown: breakdown,
        reason,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, limit);
    const topScore = top[0]?.score ?? 0;
    const avgScore =
      top.length > 0
        ? top.reduce((sum, r) => sum + r.score, 0) / top.length
        : 0;

    return {
      recommendations: top,
      items: top.map((r) => r.recipe),
      score: topScore,
      confidence: Math.min(1, avgScore),
      context: {
        userId: composite.groupId,
        datetime,
        dominantElementalGap: undefined,
        topNutritionalGap: undefined,
      },
    };
  }

  /**
   * Lightweight recommendation helper: returns `FoodRecommendation` objects
   * from the quick-food preset catalog when the user needs a quick suggestion
   * (e.g. empty state, "what should I snack on?"). Works without hitting the
   * recipe catalog.
   */
  static async getQuickRecommendations(
    userId: string,
    limit = 5,
  ): Promise<FoodRecommendation[]> {
    const { entries, consumedToday } = await this.gatherUserSignals(userId);
    const balance = this.aggregateElementalBalance(entries);
    const elementalGap = findElementalGap(balance);

    let nutritionalGap: keyof NutritionalSummary | undefined;
    try {
      const nutritionMod = await import("@/services/NutritionTrackingService");
      const targets = nutritionMod
        .getNutritionTrackingService()
        .getDailyTargets();
      nutritionalGap = findNutritionalGap(consumedToday, targets);
    } catch {
      // best-effort
    }

    let presets: FoodSearchResult[] = [];
    try {
      const mod = await import("@/services/FoodDiaryService");
      const all = await mod.foodDiaryService.getQuickFoodPresets();
      presets = all.map((p) => ({
        id: p.id,
        name: p.name,
        source: "quick",
        category: p.category,
        nutritionPer100g: p.nutritionPer100g,
        matchScore: 0.5,
      }));
    } catch {
      presets = [];
    }

    const scored = presets
      .map<FoodRecommendation>((p) => {
        const proteinFit =
          nutritionalGap === "protein"
            ? Math.min(1, (p.nutritionPer100g?.protein ?? 0) / 20)
            : 0.5;
        const fiberFit =
          nutritionalGap === "fiber"
            ? Math.min(1, (p.nutritionPer100g?.fiber ?? 0) / 5)
            : 0.5;
        const baseScore = Math.max(proteinFit, fiberFit);
        return {
          id: `rec_${p.id}`,
          type: nutritionalGap ? "fill_gap" : "balanced_choice",
          food: p,
          reason: nutritionalGap
            ? `Helps cover your ${nutritionalGap} target today.`
            : "A well-rounded option based on your day so far.",
          confidence: baseScore,
          nutritionalBenefit: nutritionalGap
            ? `High in ${nutritionalGap}`
            : undefined,
          elementalBenefit: elementalGap
            ? `Adds ${elementalGap} balance`
            : undefined,
          basedOn: {
            nutrientGap: nutritionalGap,
          },
        };
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);

    return scored;
  }

  // ---------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------

  private static async gatherUserSignals(userId: string): Promise<{
    entries: FoodDiaryEntry[];
    favoriteNames: Set<string>;
    highRatedCuisines: Set<string>;
    recentNames: Map<string, number>;
    consumedToday: Partial<NutritionalSummary>;
  }> {
    let entries: FoodDiaryEntry[] = [];
    let favoriteNames = new Set<string>();
    const highRatedCuisines = new Set<string>();

    try {
      const mod = await import("@/services/FoodDiaryService");
      const svc = mod.foodDiaryService;
      entries = await svc.getEntries(userId);
      const favs = await svc.getFavorites(userId);
      favoriteNames = new Set(favs.map((f) => f.foodName.toLowerCase()));

      // Cuisines of top-rated entries (rating >= 4)
      const cuisineTally = new Map<string, { sum: number; count: number }>();
      for (const e of entries) {
        if ((e.rating ?? 0) < 4) continue;
        const key = ((e as FoodDiaryEntry & { cuisine?: string }).cuisine ?? "")
          .toString()
          .toLowerCase();
        if (!key) continue;
        const bucket = cuisineTally.get(key) ?? { sum: 0, count: 0 };
        bucket.sum += e.rating ?? 0;
        bucket.count += 1;
        cuisineTally.set(key, bucket);
      }
      for (const [cuisine, { sum, count }] of cuisineTally) {
        if (count >= 2 && sum / count >= 4) {
          highRatedCuisines.add(cuisine);
        }
      }
    } catch {
      // Best effort only — diary may not be available in all contexts.
    }

    const recentNames = new Map<string, number>();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    for (const e of entries) {
      const ts = new Date(e.date).getTime();
      if (ts < sevenDaysAgo) continue;
      const key = e.foodName.toLowerCase();
      recentNames.set(key, (recentNames.get(key) ?? 0) + 1);
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const consumedToday: Partial<NutritionalSummary> = {};
    for (const e of entries) {
      const day = new Date(e.date).toISOString().split("T")[0];
      if (day !== todayStr) continue;
      for (const [k, v] of Object.entries(e.nutrition)) {
        if (typeof v !== "number") continue;
        const key = k as keyof NutritionalSummary;
        consumedToday[key] = (consumedToday[key] ?? 0) + v;
      }
    }

    return {
      entries,
      favoriteNames,
      highRatedCuisines,
      recentNames,
      consumedToday,
    };
  }

  private static aggregateElementalBalance(
    entries: FoodDiaryEntry[],
  ): ElementalProperties | undefined {
    const todayStr = new Date().toISOString().split("T")[0];
    const today = entries.filter(
      (e) => new Date(e.date).toISOString().split("T")[0] === todayStr,
    );
    if (today.length === 0) return undefined;

    const balance: ElementalProperties = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0,
    };
    let count = 0;
    for (const e of today) {
      if (!e.elementalProperties) continue;
      for (const el of ELEMENTS) {
        balance[el] += e.elementalProperties[el] ?? 0;
      }
      count++;
    }
    if (count === 0) return undefined;
    for (const el of ELEMENTS) balance[el] /= count;
    return balance;
  }
}

export default EnhancedRecommendationService;
