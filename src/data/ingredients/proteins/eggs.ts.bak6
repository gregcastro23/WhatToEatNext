import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawEggs = {
  chicken_egg: {
    name: 'Chicken Egg',
    description: 'A common protein source from chickens, versatile in cooking applications.',
    category: 'egg',
    qualities: ['protein-rich', 'versatile', 'binding'],
    sustainabilityScore: 7,
    season: ['all'],
    regionalOrigins: ['global'],
    elementalProperties: {
      Fire: 0.2,
      Water: 0.5,
      Earth: 0.2,
      Air: 0.1
},
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Moon'],
      favorableZodiac: ['Virgo', 'Gemini', 'Cancer'],
      seasonalAffinity: ['all']
    },
    nutritionalProfile: {
      calories: 78,
      protein_g: 6.3,
      fat_g: 5.3,
      carbs_g: 0.6,
      serving_size_oz: 1.8,
      vitamins: ['Vitamin A', 'Vitamin B12', 'Vitamin D', 'Vitamin E', 'Vitamin B2 (Riboflavin)'],
      minerals: ['Iron', 'Phosphorus', 'Selenium', 'Zinc']
    },
    culinaryApplications: {
      poach: { notes: ['Perfect for eggs benedict', 'Great in ramen or brothy dishes'] },
      fry: { notes: ['Classic sunny-side up, over-easyor over-hard preparations'] },
      boil: { notes: ['Hard-boiled for salads', 'Soft-boiled for ramen toppings'] },
      bake: { notes: ['Used in baking as binding agent', 'Can be baked in dishes like shakshuka'] }
    },
    pairings: ['toast', 'avocado', 'bacon', 'spinach', 'tomato'],
    substitutions: ['duck_egg', 'quail_egg', 'egg_substitute'],
    affinities: ['grains', 'dairy', 'vegetables']
  },
  duck_egg: {
    name: 'Duck Egg',
    description: 'Larger than chicken eggs with a richer flavor and higher fat content.',
    category: 'egg',
    qualities: ['rich', 'creamy', 'robust'],
    sustainabilityScore: 6,
    season: ['all'],
    regionalOrigins: ['asia', 'europe'],
    elementalProperties: {
      Fire: 0.2,
      Water: 0.6,
      Earth: 0.1,
      Air: 0.1
},
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Moon'],
      favorableZodiac: ['Virgo', 'Gemini', 'Cancer'],
      seasonalAffinity: ['all']
    },
    nutritionalProfile: {
      calories: 130,
      protein_g: 9.0,
      fat_g: 9.5,
      carbs_g: 1.0,
      serving_size_oz: 2.5,
      vitamins: ['Vitamin A', 'Vitamin B12', 'Vitamin D', 'Vitamin E', 'Vitamin B2 (Riboflavin)'],
      minerals: ['Iron', 'Phosphorus', 'Selenium', 'Zinc']
    },
    culinaryApplications: {
      poach: { notes: ['Creates a luxurious poached egg experience'] },
      fry: { notes: ['Produces a larger, richer fried egg'] },
      bake: {
        notes: ['Excellent for enriching baked goods', 'Creates fluffier cakes and pastries']
      }
    },
    pairings: ['asparagus', 'mushrooms', 'truffles', 'rich sauces'],
    substitutions: ['chicken_egg', 'goose_egg'],
    affinities: ['luxury_ingredients', 'strong_flavors']
  },
  quail_egg: {
    name: 'Quail Egg',
    description: 'Small, delicate eggs with a higher yolk-to-white ratio.',
    category: 'egg',
    qualities: ['delicate', 'miniature', 'gourmet'],
    sustainabilityScore: 5,
    season: ['all'],
    regionalOrigins: ['asia', 'europe', 'middle_east'],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.5,
      Earth: 0.3,
      Air: 0.1
},
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Mercury'],
      favorableZodiac: ['Cancer', 'Gemini', 'Virgo'],
      seasonalAffinity: ['spring', 'summer']
    },
    nutritionalProfile: {
      calories: 14,
      protein_g: 1.2,
      fat_g: 1.0,
      carbs_g: 0.1,
      serving_size_oz: 0.4,
      vitamins: ['Vitamin A', 'Vitamin B12', 'Vitamin D', 'Vitamin E', 'Vitamin B2 (Riboflavin)'],
      minerals: ['Iron', 'Phosphorus', 'Selenium', 'Zinc']
    },
    culinaryApplications: {
      poach: { notes: ['Tiny perfect bites for canapés'] },
      fry: { notes: ['Great garnish for upscale dishes'] },
      boil: { notes: ['Popular in ramen', 'Used in salads for visual appeal'] }
    },
    pairings: ['caviar', 'fine herbs', 'microgreens', 'small toast points'],
    substitutions: ['small_chicken_egg'],
    affinities: ['gourmet_presentations', 'appetizers']
  }
};

export const eggs = fixIngredientMappings(rawEggs) as Record<string, IngredientMapping>;

export default eggs;
