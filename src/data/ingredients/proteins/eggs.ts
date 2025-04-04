import type { IngredientMapping } from '@/types/alchemy';

export const eggs: Record<string, IngredientMapping> = {
  "chicken_egg": {
    name: "Chicken Egg",
    description: "A common protein source from chickens, versatile in cooking applications.",
    category: "egg",
    qualities: ["protein-rich", "versatile", "binding"],
    sustainabilityScore: 7,
    season: ["all"],
    regionalOrigins: ["global"],
    elementalProperties: {
      Fire: 0.2,
      Water: 0.5,
      Earth: 0.2,
      Air: 0.1
    },
    nutritionalContent: {
      protein: 6,
      fat: 5,
      carbs: 0.6,
      calories: 78
    },
    culinaryApplications: {
      poach: { notes: ["Perfect for eggs benedict", "Great in ramen or brothy dishes"] },
      fry: { notes: ["Classic sunny-side up, over-easy, or over-hard preparations"] },
      boil: { notes: ["Hard-boiled for salads", "Soft-boiled for ramen toppings"] },
      bake: { notes: ["Used in baking as binding agent", "Can be baked in dishes like shakshuka"] }
    },
    pairings: ["toast", "avocado", "bacon", "spinach", "tomato"],
    substitutions: ["duck_egg", "quail_egg", "egg_substitute"],
    affinities: ["grains", "dairy", "vegetables"]
  },
  "duck_egg": {
    name: "Duck Egg",
    description: "Larger than chicken eggs with a richer flavor and higher fat content.",
    category: "egg",
    qualities: ["rich", "creamy", "robust"],
    sustainabilityScore: 6,
    season: ["all"],
    regionalOrigins: ["asia", "europe"],
    elementalProperties: {
      Fire: 0.2,
      Water: 0.6,
      Earth: 0.1,
      Air: 0.1
    },
    nutritionalContent: {
      protein: 9,
      fat: 9.5,
      carbs: 1.0,
      calories: 130
    },
    culinaryApplications: {
      poach: { notes: ["Creates a luxurious poached egg experience"] },
      fry: { notes: ["Produces a larger, richer fried egg"] },
      bake: { notes: ["Excellent for enriching baked goods", "Creates fluffier cakes and pastries"] }
    },
    pairings: ["asparagus", "mushrooms", "truffles", "rich sauces"],
    substitutions: ["chicken_egg", "goose_egg"],
    affinities: ["luxury_ingredients", "strong_flavors"]
  },
  "quail_egg": {
    name: "Quail Egg",
    description: "Small, delicate eggs with a higher yolk-to-white ratio.",
    category: "egg",
    qualities: ["delicate", "miniature", "gourmet"],
    sustainabilityScore: 5,
    season: ["all"],
    regionalOrigins: ["asia", "europe", "middle_east"],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.5,
      Earth: 0.3,
      Air: 0.1
    },
    nutritionalContent: {
      protein: 1.2,
      fat: 1.0,
      carbs: 0.1,
      calories: 14
    },
    culinaryApplications: {
      poach: { notes: ["Tiny perfect bites for canapés"] },
      fry: { notes: ["Great garnish for upscale dishes"] },
      boil: { notes: ["Popular in ramen", "Used in salads for visual appeal"] }
    },
    pairings: ["caviar", "fine herbs", "microgreens", "small toast points"],
    substitutions: ["small_chicken_egg"],
    affinities: ["gourmet_presentations", "appetizers"]
  }
};

export default eggs; 