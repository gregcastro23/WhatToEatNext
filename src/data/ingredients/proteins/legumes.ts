import type { IngredientMapping } from '@/types/alchemy';

export const legumes: Record<string, IngredientMapping> = {
  "black_beans": {
    name: "Black Beans",
    description: "Small, shiny black beans with a dense, meaty texture popular in Latin American cuisine.",
    category: "legume",
    qualities: ["earthy", "dense", "hearty"],
    sustainabilityScore: 9,
    season: ["all"],
    regionalOrigins: ["central_america", "south_america"],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.3,
      Earth: 0.5,
      Air: 0.1
    },
    nutritionalContent: {
      protein: 15,
      fat: 0.9,
      carbs: 41,
      calories: 341
    },
    culinaryApplications: {
      boil: { notes: ["Simmered for soups and stews"] },
      braise: { notes: ["Slow-cooked with aromatics and spices"] }
    },
    pairings: ["rice", "cumin", "corn", "lime", "cilantro"],
    substitutions: ["pinto_beans", "kidney_beans"],
    affinities: ["grains", "vegetables", "herbs"]
  },
  "chickpeas": {
    name: "Chickpeas",
    description: "Round, beige legumes with a nutty flavor and versatile applications.",
    category: "legume",
    qualities: ["nutty", "firm", "versatile"],
    sustainabilityScore: 9,
    season: ["all"],
    regionalOrigins: ["middle_east", "mediterranean", "india"],
    elementalProperties: {
      Fire: 0.2,
      Water: 0.2,
      Earth: 0.5,
      Air: 0.1
    },
    nutritionalContent: {
      protein: 19,
      fat: 6,
      carbs: 61,
      calories: 364
    },
    culinaryApplications: {
      boil: { notes: ["For salads and grain bowls"] },
      roast: { notes: ["Crispy chickpea snacks", "Adds texture to dishes"] },
      puree: { notes: ["Base for hummus and other dips"] }
    },
    pairings: ["tahini", "olive_oil", "lemon", "garlic", "herbs"],
    substitutions: ["white_beans", "lentils"],
    affinities: ["mediterranean_herbs", "grains", "vegetables"]
  },
  "lentils": {
    name: "Lentils",
    description: "Small, lens-shaped legumes available in various colors with quick cooking time.",
    category: "legume",
    qualities: ["earthy", "quick-cooking", "versatile"],
    sustainabilityScore: 9,
    season: ["all"],
    regionalOrigins: ["middle_east", "india", "mediterranean"],
    elementalProperties: {
      Fire: 0.2,
      Water: 0.3,
      Earth: 0.4,
      Air: 0.1
    },
    nutritionalContent: {
      protein: 25,
      fat: 1.1,
      carbs: 63,
      calories: 353
    },
    culinaryApplications: {
      boil: { notes: ["Quick-cooking for soups and stews"] },
      simmer: { notes: ["For dal and lentil dishes"] },
      puree: { notes: ["For spreads and vegetarian patties"] }
    },
    pairings: ["cumin", "coriander", "garlic", "tomato", "carrots"],
    substitutions: ["split_peas", "small_beans"],
    affinities: ["spices", "aromatics", "vegetables"]
  },
  "tempeh": {
    name: "Tempeh",
    description: "Fermented soybean cake with a firm texture and nutty flavor.",
    category: "legume",
    qualities: ["firm", "nutty", "fermented"],
    sustainabilityScore: 8,
    season: ["all"],
    regionalOrigins: ["indonesia"],
    elementalProperties: {
      Fire: 0.2,
      Water: 0.2,
      Earth: 0.4,
      Air: 0.2
    },
    nutritionalContent: {
      protein: 19,
      fat: 11,
      carbs: 9,
      calories: 193
    },
    culinaryApplications: {
      grill: { notes: ["Marinated and grilled for sandwiches or bowls"] },
      fry: { notes: ["Crispy when fried, good for stir-fries"] },
      steam: { notes: ["Traditional preparation in some Indonesian dishes"] }
    },
    pairings: ["soy_sauce", "ginger", "garlic", "chili", "lime"],
    substitutions: ["tofu", "seitan"],
    affinities: ["asian_aromatics", "umami_flavors"]
  }
};

export default legumes; 