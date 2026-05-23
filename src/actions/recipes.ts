"use server";

import { getCuisineData, PRIMARY_CUISINE_KEYS } from "@/data/cuisines/index";
import type { Cuisine } from "@/types/cuisine";
import type { IndexedRecipe, RecipeIndex } from "@/types/indexedRecipe";
import type { Recipe } from "@/types/recipe";
import { computeRecipeNutritionFromIngredients } from "@/utils/ingredientNutritionAggregation";
import {
  calculateRecipeAlchemicalQuantities,
  calculateRecipeElementalFromIngredients,
} from "@/utils/recipeAlchemicalQuantities";
import {
  isPlausibleNutrition,
  normalizeRecipeNutrition,
} from "@/utils/recipeNutrition";
import { getAssetUrl } from "@/utils/urlUtils";

interface NutritionCoverageStats {
  total: number;
  fromSource: number; // had usable nutritionPerServing / nutrition / nutritionalProfile
  fromIngredients: number; // filled via UnifiedIngredientService fallback
  missing: number; // still zero after both paths
  missingNames: string[];
}

let _cachedRecipes: IndexedRecipe[] | null = null;
let _cachedIndex: RecipeIndex | null = null;
let _nutritionStats: NutritionCoverageStats = {
  total: 0,
  fromSource: 0,
  fromIngredients: 0,
  missing: 0,
  missingNames: [],
};

function lowerArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const out = value
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.toLowerCase());
    return out.length ? out : undefined;
  }
  if (typeof value === "string") return [value.toLowerCase()];
  return undefined;
}

/** Coerce a value to a finite number, or `undefined` when it isn't one. */
function toFiniteNumber(value: unknown): number | undefined {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/** Reduce a value to an array of trimmed, non-empty strings, or `undefined`. */
function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out = value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
  return out.length ? out : undefined;
}

// ── Dietary inference (heuristic) ───────────────────────────────────────
//
// The cuisine schema has no isVegetarian/isVegan/etc. fields, so dietary
// flags are inferred from ingredient names. Word-boundary regexes avoid
// the most common false positives — "coconut milk" is not dairy, "rice
// flour" is not gluten, "fish sauce" disqualifies vegetarian.
//
// The inference is conservative: it errs toward *withholding* a positive
// claim. A recipe is only marked gluten-free when no ingredient triggers
// any gluten keyword; "tortilla" (which could be corn or wheat) flags as
// gluten even though some recipes are actually GF. This produces some
// false negatives (recipes that genuinely are GF lose the badge) but
// avoids the worse error of falsely claiming a diet a recipe doesn't meet.

const MEAT_RE =
  /\b(beef|chicken|pork|lamb|mutton|veal|bacon|ham|sausage|turkey|duck|goose|goat|rabbit|venison|prosciutto|pancetta|salami|chorizo|liver|gizzard|tripe|kidney|sweetbread|oxtail|brisket|sirloin|tenderloin|ribeye|loin|jerky|pepperoni|mortadella|guanciale|capicola|bresaola)\b/i;

const FISH_RE =
  /\b(fish|salmon|tuna|cod|shrimp|prawn|lobster|crab|oyster|mussel|clam|octopus|squid|anchov(?:y|ies)|calamari|scallop|bonito|mackerel|sardine|snapper|sole|halibut|trout|eel|caviar|roe|katsuobushi|herring|carp|pollock|tilapia|monkfish|swordfish|mahi)\b/i;

const SEAFOOD_DERIVED_RE =
  /\b(fish sauce|fish stock|oyster sauce|shrimp paste|nam pla|nuoc mam|dashi|bonito flakes|xo sauce)\b/i;

const ANIMAL_DERIVED_RE =
  /\b(gelatin(?:e)?|lard|tallow|suet|isinglass|rennet)\b/i;

const DAIRY_RE =
  /\b(milk|cheese|butter|cream|yogurt|yoghurt|ghee|whey|casein|parmesan|parmigiano|mozzarella|feta|ricotta|cheddar|gouda|brie|camembert|halloumi|manchego|provolone|mascarpone|labneh|paneer|kefir|buttermilk|asiago|gruy[eè]re|fontina|romano|cotija|queso)\b/i;

// "milk"-suffixed plant milks that shouldn't trigger the dairy flag.
const NON_DAIRY_RE =
  /\b(coconut|almond|soy|oat|rice|cashew|hemp|hazelnut|nut)\s+milk\b/i;

const EGG_RE = /\beggs?\b/i;
const HONEY_RE = /\bhoney\b/i;

const GLUTEN_RE =
  /\b(wheat|flour|bread|pasta|couscous|bulgur|semolina|farro|barley|rye|malt|spelt|kamut|panko|breadcrumbs?|udon|soba|ramen|gnocchi|durum|pita|naan|chapati|paratha|tortilla|brioche|cornetto|baguette|focaccia|filo|phyllo|lasagn[ae]|fettuccine|tagliatelle|linguine|spaghetti|orzo|orecchiette|penne|rigatoni|fusilli|ravioli|tortellini|farfalle|cannelloni|pierogi|vareniki|pelmeni|dumpling wrappers?)\b/i;

// Flour types that are gluten-free; allow these to suppress the generic
// `/flour/` rule above.
const GF_FLOUR_RE =
  /\b(rice|almond|coconut|chickpea|gram|corn|tapioca|buckwheat|oat|millet|sorghum|teff|cassava|potato|amaranth|quinoa|hazelnut|nut|cornmeal)\s+flour\b/i;

interface DietaryFlags {
  isVegetarian: boolean;
  isVegan: boolean;
  isDairyFree: boolean;
  isGlutenFree: boolean;
}

function inferDietary(ingredients: unknown[]): DietaryFlags {
  let hasMeat = false;
  let hasFish = false;
  let hasAnimalDerived = false;
  let hasDairy = false;
  let hasEgg = false;
  let hasHoney = false;
  let hasGluten = false;

  for (const ing of ingredients) {
    const name =
      ing && typeof ing === "object" && "name" in ing
        ? String((ing as { name?: unknown }).name ?? "")
        : "";
    if (!name) continue;
    if (MEAT_RE.test(name)) hasMeat = true;
    if (FISH_RE.test(name) || SEAFOOD_DERIVED_RE.test(name)) hasFish = true;
    if (ANIMAL_DERIVED_RE.test(name)) hasAnimalDerived = true;
    if (DAIRY_RE.test(name) && !NON_DAIRY_RE.test(name)) hasDairy = true;
    if (EGG_RE.test(name)) hasEgg = true;
    if (HONEY_RE.test(name)) hasHoney = true;
    if (GLUTEN_RE.test(name) && !GF_FLOUR_RE.test(name)) hasGluten = true;
  }

  const isVegetarian = !hasMeat && !hasFish && !hasAnimalDerived;
  const isVegan = isVegetarian && !hasDairy && !hasEgg && !hasHoney;
  const isDairyFree = !hasDairy;
  const isGlutenFree = !hasGluten;

  return { isVegetarian, isVegan, isDairyFree, isGlutenFree };
}

/**
 * Extract and normalize recipes from the static cuisine data files.
 * This is the authoritative source for the full recipe catalog.
 */
function extractRecipesFromCuisines(
  cuisines: Array<{ key: string; cuisine: Cuisine }>,
): IndexedRecipe[] {
  const recipes: IndexedRecipe[] = [];
  const seen = new Set<string>();
  const stats: NutritionCoverageStats = {
    total: 0,
    fromSource: 0,
    fromIngredients: 0,
    missing: 0,
    missingNames: [],
  };

  for (const { key, cuisine } of cuisines) {
    if (!cuisine?.dishes) continue;
    const cuisineName =
      typeof cuisine.name === "string" && cuisine.name.trim().length > 0
        ? cuisine.name
        : key;

    const mealTypes = ["breakfast", "lunch", "dinner", "dessert"] as const;

    for (const mealType of mealTypes) {
      const mealCategory = cuisine.dishes[mealType];
      if (!mealCategory) continue;

      const seasons = ["spring", "summer", "autumn", "winter", "all"] as const;

      for (const season of seasons) {
        const dishes = (mealCategory as Record<string, unknown>)[season];
        if (!Array.isArray(dishes)) continue;

        for (const dish of dishes) {
          if (!dish?.name || typeof dish.name !== "string") continue;

          const key = `${dish.name.toLowerCase().trim()}`;
          if (seen.has(key)) continue;
          seen.add(key);

          const alchemical = (dish.alchemicalProfile ?? {}) as Record<
            string,
            unknown
          >;
          const details =
            ((dish as Record<string, unknown>).details as Record<
              string,
              unknown
            > | undefined) ?? {};
          const classifications =
            ((dish as Record<string, unknown>).classifications as Record<
              string,
              unknown
            > | undefined) ?? {};
          const prepTime = Number(dish.prepTimeMinutes ?? details.prepTimeMinutes ?? 0);
          const cookTime = Number(dish.cookTimeMinutes ?? details.cookTimeMinutes ?? 0);

          const dietaryTags: string[] = [];
          if (dish.isVegetarian || alchemical.vegetarian)
            dietaryTags.push("vegetarian");
          if (dish.isVegan || alchemical.vegan) dietaryTags.push("vegan");
          if (dish.isGlutenFree || alchemical.glutenFree)
            dietaryTags.push("glutenFree");
          if (dish.isDairyFree || alchemical.dairyFree)
            dietaryTags.push("dairyFree");
          // Heuristic fallback when source has no explicit dietary fields
          // (which is every cuisine recipe in this repo today). Inference
          // is conservative — it only claims a diet when the ingredient
          // list reveals no disqualifying keywords.
          if (dietaryTags.length === 0 && Array.isArray(dish.ingredients)) {
            const inferred = inferDietary(dish.ingredients);
            if (inferred.isVegetarian) dietaryTags.push("vegetarian");
            if (inferred.isVegan) dietaryTags.push("vegan");
            if (inferred.isDairyFree) dietaryTags.push("dairyFree");
            if (inferred.isGlutenFree) dietaryTags.push("glutenFree");
          }

          const imageUrl = getAssetUrl((dish.image as string) ?? (dish.image_url as string));

          // ── Rich fields the cuisine schema carries that earlier
          //    extraction silently dropped (cooking methods, the alchemical
          //    SMES grid, the Monica constant, astrological affinities and
          //    ingredient substitutions). ──
          const alchemicalProps = (dish.alchemicalProperties ?? {}) as Record<
            string,
            unknown
          >;
          const thermo = (dish.thermodynamicProperties ?? {}) as Record<
            string,
            unknown
          >;
          const astro = (dish.astrologicalAffinities ?? {}) as Record<
            string,
            unknown
          >;

          // Regional variant — e.g. `details.cuisine: "Italian (Sicily)"`
          // surfaces as a "Sicily" badge on the card.
          const detailsCuisine =
            typeof details.cuisine === "string" ? details.cuisine : "";
          const regionMatch = detailsCuisine.match(/\(([^)]+)\)/);
          const regionalVariant =
            (typeof dish.regionalVariant === "string" &&
              dish.regionalVariant) ||
            (regionMatch ? regionMatch[1].trim() : undefined);

          const cookingMethod = toStringArray(classifications.cookingMethods);
          const planets = toStringArray(astro.planets);
          const signs = toStringArray(astro.signs);
          const lunarPhases = toStringArray(astro.lunarPhases);
          const monicaConstant = toFiniteNumber(thermo.monica);

          const substitutions = (
            Array.isArray(dish.substitutions) ? dish.substitutions : []
          )
            .map((entry: unknown) => {
              const s = (entry ?? {}) as Record<string, unknown>;
              const original =
                (typeof s.original === "string" && s.original) ||
                (typeof s.originalIngredient === "string" &&
                  s.originalIngredient) ||
                "";
              const alternatives =
                toStringArray(s.alternatives) ??
                toStringArray(s.substituteOptions) ??
                [];
              return { original, alternatives };
            })
            .filter((s) => s.original && s.alternatives.length > 0);

          const recipe: IndexedRecipe = {
            id:
              (dish.id as string) ??
              `${cuisineName.toLowerCase()}-${key.replace(/\s+/g, "-")}`,
            name: dish.name,
            image: imageUrl,
            imageUrl,
            description: (dish.description as string) ?? "",
            cuisine:
              (dish.cuisine as string) ??
              (details.cuisine as string) ??
              ((dish.alchemicalProfile as Record<string, unknown>)
                ?.cuisine as string) ??
              cuisineName,
            ingredients: Array.isArray(dish.ingredients)
              ? dish.ingredients.map((ing: unknown) => {
                  if (typeof ing === "string") {
                    return { name: ing, amount: 1, unit: "" };
                  }
                  const i = ing as Record<string, unknown>;
                  return {
                    name: (i.name as string) ?? "",
                    amount: Number(i.amount ?? i.quantity ?? 0),
                    unit: (i.unit as string) ?? "",
                    optional: (i.optional as boolean) ?? false,
                    notes: (i.notes as string) ?? undefined,
                  };
                })
              : [],
            instructions: Array.isArray(dish.instructions)
              ? dish.instructions.map((step: unknown) => {
                  if (typeof step === "string") return step;
                  const s = step as Record<string, unknown>;
                  return (
                    (s.instruction as string) ??
                    (s.text as string) ??
                    (s.step as string) ??
                    String(step)
                  );
                })
              : [],
            prepTime: String(prepTime),
            cookTime: String(cookTime),
            totalTime: String(prepTime + cookTime),
            timeToMake: `${prepTime + cookTime} minutes`,
            mealType:
              (dish.mealType as string[]) ??
              (classifications.mealType as string[]) ??
              [mealType],
            season:
              (dish.season as string[]) ??
              (details.season as string[]) ??
              [season],
            tags: dietaryTags,
            isVegetarian: dietaryTags.includes("vegetarian"),
            isVegan: dietaryTags.includes("vegan"),
            isGlutenFree: dietaryTags.includes("glutenFree"),
            isDairyFree: dietaryTags.includes("dairyFree"),
            numberOfServings:
              Number(
                (dish as { numberOfServings?: unknown }).numberOfServings ??
                  (dish as { servings?: unknown }).servings ??
                  (details.baseServingSize as number | undefined),
              ) || undefined,
            nutrition: undefined,
            elementalProperties:
              (dish.elementalProfile ?? dish.elementalProperties ?? {
                Fire: 0.25,
                Water: 0.25,
                Earth: 0.25,
                Air: 0.25,
              }) as Recipe["elementalProperties"],
            cookingMethod,
            spiceLevel:
              (details.spiceLevel as Recipe["spiceLevel"]) ?? undefined,
            regionalVariant,
            // Alchemical SMES grid + Monica constant — powers the recipe
            // detail page's "Alchemical Scores" panel.
            spirit: toFiniteNumber(alchemicalProps.Spirit),
            essence: toFiniteNumber(alchemicalProps.Essence),
            matter: toFiniteNumber(alchemicalProps.Matter),
            substance: toFiniteNumber(alchemicalProps.Substance),
            monicaScore: toFiniteNumber(dish.monicaScore),
            monicaScoreLabel:
              typeof dish.monicaScoreLabel === "string"
                ? dish.monicaScoreLabel
                : undefined,
            monicaOptimization:
              monicaConstant != null
                ? {
                    originalMonica: monicaConstant,
                    optimizedMonica: monicaConstant,
                    optimizationScore: 0,
                    temperatureAdjustments: [],
                    timingAdjustments: [],
                    intensityModifications: [],
                    planetaryTimingRecommendations: [],
                  }
                : undefined,
            // Astrological affinities — powers the detail page's
            // "Astrological Affinities" panel and planetary scoring.
            planetaryInfluences:
              planets && planets.length > 0
                ? { favorable: planets, unfavorable: [], neutral: [] }
                : undefined,
            zodiacInfluences: signs,
            lunarPhaseInfluences:
              lunarPhases as Recipe["lunarPhaseInfluences"],
            substitutions: substitutions.length > 0 ? substitutions : undefined,
          };

          // ── Nutrition pipeline ──
          //
          // The recipe's nutrition IS the sum of its ingredients' nutrition,
          // scaled by amount and per serving. We compute that first, and
          // only fall back to the per-recipe `nutritionPerServing` block
          // when the ingredient aggregator can't return a plausible total
          // (e.g. the recipe references ingredients the unified DB doesn't
          // know about). If both paths fail, the section is omitted.
          stats.total++;
          const computedNutrition = computeRecipeNutritionFromIngredients(recipe);
          if (computedNutrition && isPlausibleNutrition(computedNutrition)) {
            recipe.nutrition = computedNutrition;
            stats.fromIngredients++;
          } else {
            const normalized = normalizeRecipeNutrition(
              dish as Record<string, unknown>,
            );
            if (normalized && isPlausibleNutrition(normalized)) {
              recipe.nutrition = normalized;
              stats.fromSource++;
            } else {
              stats.missing++;
              if (stats.missingNames.length < 20) {
                stats.missingNames.push(recipe.name);
              }
            }
          }

          // ── Ingredient-derived alchemical & elemental overrides ──
          //
          // ESMS quantities are *additive* across ingredients; the recipe's
          // Spirit = Σ Spirit_ingredient (and similarly E, M, S). Elemental
          // composition is a *percentage* — each ingredient's Fire+Water+
          // Earth+Air sums to 1.0, and the recipe is the ingredient-average
          // share of each element. These computations are the canonical
          // source of truth; the recipe-level values declared in the cuisine
          // files are treated as initial guesses that the ingredient sum
          // overrides whenever it's available.
          const ingredientNames = recipe.ingredients
            .map((ing) => ing.name)
            .filter((n): n is string => typeof n === "string" && n.length > 0);

          if (ingredientNames.length > 0) {
            const alchemicalSummary =
              calculateRecipeAlchemicalQuantities(ingredientNames);
            recipe.spirit = alchemicalSummary.totalSpirit;
            recipe.essence = alchemicalSummary.totalEssence;
            recipe.matter = alchemicalSummary.totalMatter;
            recipe.substance = alchemicalSummary.totalSubstance;
            recipe.ingredientAlchemicalSummary = alchemicalSummary;

            const elementalSummary =
              calculateRecipeElementalFromIngredients(ingredientNames);
            if (elementalSummary) {
              recipe.elementalProperties =
                elementalSummary.elementalProperties;
            }
          }

          // ── Precomputed lowercased fields for perf in the bridge ──
          recipe._lcCuisine = recipe.cuisine?.toLowerCase() ?? "";
          recipe._lcTags = lowerArray(recipe.tags);
          recipe._lcCookingMethod = lowerArray(
            (recipe as { cookingMethod?: unknown }).cookingMethod,
          );
          recipe._lcSeasons = lowerArray(recipe.season);
          recipe._lcMealTypes = lowerArray(recipe.mealType);

          recipes.push(recipe);
        }
      }
    }
  }

  _nutritionStats = stats;

  // Dev-only visibility for any recipes that couldn't be filled by either
  // path. Silent in production to avoid flooding logs.
  if (process.env.NODE_ENV !== "production" && stats.missing > 0) {
    console.warn(
      `[getServerRecipes] ${stats.missing}/${stats.total} recipes have no usable nutrition. ` +
        `Sample: ${stats.missingNames.slice(0, 5).join(", ")}`,
    );
  }

  return recipes;
}

/** Build the mealType × season lookup index from a flat recipe array. */
function buildRecipeIndex(recipes: IndexedRecipe[]): RecipeIndex {
  const index: RecipeIndex = new Map();
  const mealTypes = ["breakfast", "lunch", "dinner", "dessert"] as const;
  const seasons = ["spring", "summer", "autumn", "winter", "all"] as const;

  for (const mt of mealTypes) {
    for (const s of seasons) {
      index.set(`${mt}-${s}`, []);
    }
  }

  for (const r of recipes) {
    const recipeMealTypes =
      r._lcMealTypes && r._lcMealTypes.length > 0
        ? r._lcMealTypes
        : ["breakfast", "lunch", "dinner"];
    const recipeSeasons =
      r._lcSeasons && r._lcSeasons.length > 0 ? r._lcSeasons : ["all"];

    for (const mt of mealTypes) {
      const mtMatches =
        recipeMealTypes.includes(mt) ||
        recipeMealTypes.some((m) => m.includes(mt));
      if (!mtMatches) continue;

      for (const s of recipeSeasons) {
        const seasonKey =
          s === "fall" ? "autumn" : s === "all" ? "all" : s;
        const bucketKey = `${mt}-${seasonKey}`;
        const bucket = index.get(bucketKey);
        if (bucket) bucket.push(r);
      }
    }
  }

  return index;
}

/**
 * Server action to fetch all recipes from the static cuisine data files.
 * Prevents database code from being bundled into client components.
 */
export async function getServerRecipes(): Promise<Recipe[]> {
  try {
    if (_cachedRecipes) {
      return _cachedRecipes;
    }
    const cuisines = (
      await Promise.all(
        PRIMARY_CUISINE_KEYS.map(async (key) => {
          const cuisine = await getCuisineData(key);
          return cuisine ? { key, cuisine } : null;
        }),
      )
    ).filter(
      (entry): entry is { key: string; cuisine: Cuisine } => entry !== null,
    );
    const recipes = extractRecipesFromCuisines(cuisines);
    _cachedRecipes = recipes;
    _cachedIndex = buildRecipeIndex(recipes);
    console.log(
      `[getServerRecipes] Loaded ${recipes.length} recipes from static cuisine data ` +
        `(nutrition: ${_nutritionStats.fromSource} from source, ${_nutritionStats.fromIngredients} computed, ${_nutritionStats.missing} missing)`,
    );
    return recipes;
  } catch (error) {
    console.error("Failed to load recipes from cuisine data:", error);
    return [];
  }
}

/**
 * Return the prebuilt mealType × season index, building it on demand if
 * `getServerRecipes` hasn't been called yet. Used by the recommendation
 * bridge to avoid scanning the entire recipe catalog on every request.
 */
export async function getServerRecipeIndex(): Promise<RecipeIndex> {
  if (!_cachedIndex) {
    await getServerRecipes();
  }
  return _cachedIndex ?? new Map();
}

/**
 * Diagnostics: how many of the cached recipes have real nutrition data and
 * from which source. Returned as a plain object so it can be serialized to
 * a diagnostics page.
 */
export async function getNutritionCoverageStats(): Promise<NutritionCoverageStats> {
  if (!_cachedRecipes) {
    await getServerRecipes();
  }
  return { ..._nutritionStats };
}
