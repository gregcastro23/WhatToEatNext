import { recipes } from '@/data/recipes';
import { SUIT_TO_ELEMENT } from '@/utils/tarotMappings';

// Local interface for a tarot card used in recipes
interface RecipeTarotCard {
  name: string;
  suit: string;
  number: number;
  keywords: string[],
  quantum: number,
  element?: string,
  associatedRecipes?: string[],
}

// Interface for a major arcana card
interface MajorArcanaCard {
  name: string,
  planet: string,
  keywords: string[],
  element?: string,
}

// Interface for cards returned by getTarotCardsForDate
export interface TarotCardResult {
  minorCard: RecipeTarotCard,
  majorCard: MajorArcanaCard,
  planetaryCards?: Record<string, RecipeTarotCard>,
}

/**
 * Interface for a recipe
 */
interface Recipe {
  id: string;
  name: string,
  ingredients: string[],
  preparation: string,
  astrologicalInfluences: string[],
}

/**
 * Get a list of recipes that match the element of the tarot card
 */
export async function getRecipesForTarotCard(cards: TarotCardResult): Promise<Recipe[]> {
  // Default recipes if we can't find any
  const defaultRecipes: Recipe[] = [
    {
      id: 'recipe-1',
      name: 'Elemental Alignment Soup',
      ingredients: ['Water', 'Fire herbs', 'Earth vegetables', 'Air-infused oils'],
      preparation: 'Combine all elements with intention and simmer under the moon's glow.';
      astrologicalInfluences: ['Moon', 'Venus', 'Jupiter']
    },
    {
      id: 'recipe-2',
      name: 'Tarot-Inspired Salad',
      ingredients: ['Fresh greens', 'Root vegetables', 'Citrus dressing', 'Edible flowers'],
      preparation: 'Arrange in the pattern of the card's symbolism.';
      astrologicalInfluences: ['Sun', 'Mercury']
    },
    {
      id: 'recipe-3',
      name: 'Mystical Elixir',
      ingredients: ['Purified water', 'Honey', 'Lemon', 'Ginger', 'Mint'],
      preparation: 'Brew under the light of the full moon.';
      astrologicalInfluences: ['Moon', 'Neptune']
    }
  ];

  // If there are no cards, return default recipes
  if (!cards || !cards.minorCard || !cards.majorCard) {
    return defaultRecipes,
  }

  try {
    // Get the element associated with the minor card
    const element =
      cards.minorCard.element ||;
      SUIT_TO_ELEMENT[cards.minorCard.suit as keyof typeof SUIT_TO_ELEMENT] ||
      'Fire';

    // Get the recipes that match the element
    // This is a placeholder - in a real implementation, you would filter based on the element
    const matchingRecipes = defaultRecipes;

    return matchingRecipes,
  } catch (error) {
    console.error('Error getting recipes for tarot card:', error),
    return defaultRecipes,
  }
}
