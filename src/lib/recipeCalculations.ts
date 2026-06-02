import { _logger } from "@/lib/logger";
import type { Recipe } from "@/types/recipe";
import { SUIT_TO_ELEMENT } from "@/utils/tarotMappings";

// Local interface for a tarot card used in recipes
interface RecipeTarotCard {
  name: string;
  suit: string;
  number: number;
  keywords: string[];
  quantum: number;
  element?: string;
  associatedRecipes?: string[];
}

// Interface for a major arcana card
interface MajorArcanaCard {
  name: string;
  planet: string;
  keywords: string[];
  element?: string;
}

// Interface for cards returned by getTarotCardsForDate
export interface TarotCardResult {
  minorCard: RecipeTarotCard;
  majorCard: MajorArcanaCard;
  planetaryCards?: Record<string, RecipeTarotCard>;
}

/**
 * Minimal recipe shape returned by getRecipesForTarotCard.
 * Exported so callers don't redeclare it (see components/AlchmKitchen.tsx).
 * Not to be confused with the full Recipe type in @/types/recipe.
 */
export interface TarotRecipe {
  id: string;
  name: string;
  ingredients: string[];
  preparation: string;
  astrologicalInfluences: string[];
}

/** Map a full catalog Recipe down to the minimal TarotRecipe shape. */
function toTarotRecipe(r: Recipe): TarotRecipe {
  const rawIngredients = (r as { ingredients?: unknown }).ingredients;
  const ingredients = Array.isArray(rawIngredients)
    ? rawIngredients
        .map((ing) =>
          typeof ing === "string" ? ing : (ing as { name?: string })?.name,
        )
        .filter((n): n is string => Boolean(n))
    : [];
  const instructions = (r as { instructions?: unknown }).instructions;
  const preparation =
    (r as { description?: string }).description ||
    (Array.isArray(instructions) ? instructions.join(" ") : "") ||
    "Prepare with intention, aligned to the card's element.";
  const astro = (r as { astrologicalInfluences?: unknown }).astrologicalInfluences;
  return {
    id: (r as { id?: string }).id || r.name,
    name: r.name,
    ingredients,
    preparation,
    astrologicalInfluences: Array.isArray(astro) ? (astro as string[]) : [],
  };
}

/**
 * Get a list of recipes that match the element of the tarot card
 */
export async function getRecipesForTarotCard(
  cards: TarotCardResult,
): Promise<TarotRecipe[]> {
  // Default recipes if we can\'t find any
  const defaultRecipes: TarotRecipe[] = [
    {
      id: "recipe-1",
      name: "Elemental Alignment Soup",
      ingredients: [
        "Water",
        "Fire herbs",
        "Earth vegetables",
        "Air-infused oils",
      ],
      preparation:
        "Combine all elements with intention and simmer under the moon's glow.",
      astrologicalInfluences: ["Moon", "Venus", "Jupiter"],
    },
    {
      id: "recipe-2",
      name: "Tarot-Inspired Salad",
      ingredients: [
        "Fresh greens",
        "Root vegetables",
        "Citrus dressing",
        "Edible flowers",
      ],
      preparation: "Arrange in the pattern of the card's symbolism.",
      astrologicalInfluences: ["Sun", "Mercury"],
    },
    {
      id: "recipe-3",
      name: "Mystical Elixir",
      ingredients: ["Purified water", "Honey", "Lemon", "Ginger", "Mint"],
      preparation: "Brew under the light of the full moon.",
      astrologicalInfluences: ["Moon", "Neptune"],
    },
  ];

  // If there are no cards, return default recipes
  if (!cards || !cards.minorCard || !cards.majorCard) {
    return defaultRecipes;
  }

  try {
    // Element associated with the minor card (Wands→Fire, Cups→Water, …).
    const element =
      cards.minorCard.element ||
      SUIT_TO_ELEMENT[cards.minorCard.suit as keyof typeof SUIT_TO_ELEMENT] ||
      "Fire";

    // Rank the full recipe catalog by strength in the card's element and
    // return the top matches (was a placeholder that ignored the card).
    const { getAllRecipes } = await import("@/data/recipes");
    const recipes = await getAllRecipes();
    const matchingRecipes = recipes
      .filter((r) => r.elementalProperties)
      .map((r) => ({
        r,
        score: (r.elementalProperties as Record<string, number>)[element] ?? 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ r }) => toTarotRecipe(r));

    return matchingRecipes.length > 0 ? matchingRecipes : defaultRecipes;
  } catch (error) {
    _logger.error("Error getting recipes for tarot card: ", error);
    return defaultRecipes;
  }
}
