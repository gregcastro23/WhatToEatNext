import type { IngredientMapping } from '@/types/alchemy';

export const dairy: Record<string, IngredientMapping> = {
  "greek_yogurt": {
    name: "Greek Yogurt",
    description: "Strained yogurt with higher protein content and thick texture.",
    category: "dairy",
    qualities: ["tangy", "creamy", "thick"],
    sustainabilityScore: 6,
    season: ["all"],
    regionalOrigins: ["mediterranean", "middle_east"],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.6,
      Earth: 0.2,
      Air: 0.1
    },
    nutritionalContent: {
      protein: 10,
      fat: 5,
      carbs: 3.6,
      calories: 100
    },
    culinaryApplications: {
      raw: { notes: ["Base for breakfast bowls", "Topping for savory dishes"] },
      mix: { notes: ["Base for dips and sauces", "Used in marinades"] },
      bake: { notes: ["Adds moisture to baked goods"] }
    },
    pairings: ["honey", "berries", "nuts", "cucumber", "garlic"],
    substitutions: ["labneh", "skyr", "cottage_cheese"],
    affinities: ["fruits", "herbs", "spices"]
  },
  "cottage_cheese": {
    name: "Cottage Cheese",
    description: "Fresh cheese curd product with mild flavor and varying textures.",
    category: "dairy",
    qualities: ["mild", "soft", "fresh"],
    sustainabilityScore: 5,
    season: ["all"],
    regionalOrigins: ["europe", "north_america"],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.5,
      Earth: 0.3,
      Air: 0.1
    },
    nutritionalContent: {
      protein: 12,
      fat: 4.3,
      carbs: 3.4,
      calories: 98
    },
    culinaryApplications: {
      raw: { notes: ["Eaten plain or with fruits"] },
      mix: { notes: ["Added to salads", "Used in dips"] },
      bake: { notes: ["Filling for crepes", "Added to casseroles and lasagna"] }
    },
    pairings: ["peaches", "pineapple", "tomatoes", "herbs", "pepper"],
    substitutions: ["ricotta", "greek_yogurt"],
    affinities: ["fruits", "vegetables", "herbs"]
  },
  "paneer": {
    name: "Paneer",
    description: "Fresh, non-melting cheese common in South Asian cuisine.",
    category: "dairy",
    qualities: ["firm", "mild", "versatile"],
    sustainabilityScore: 6,
    season: ["all"],
    regionalOrigins: ["south_asia"],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.4,
      Earth: 0.4,
      Air: 0.1
    },
    nutritionalContent: {
      protein: 18,
      fat: 22,
      carbs: 3.4,
      calories: 265
    },
    culinaryApplications: {
      fry: { notes: ["Lightly fried before adding to curries"] },
      grill: { notes: ["Marinated and grilled as tikka"] },
      curry: { notes: ["Added to spinach for saag paneer", "Used in various curry dishes"] }
    },
    pairings: ["spinach", "tomato", "peas", "Indian_spices", "fenugreek"],
    substitutions: ["halloumi", "firm_tofu", "queso_blanco"],
    affinities: ["spices", "vegetables", "curries"]
  },
  "halloumi": {
    name: "Halloumi",
    description: "Semi-hard, brined cheese with high melting point, popular for grilling.",
    category: "dairy",
    qualities: ["salty", "firm", "squeaky"],
    sustainabilityScore: 5,
    season: ["all"],
    regionalOrigins: ["cyprus", "middle_east"],
    elementalProperties: {
      Fire: 0.3,
      Water: 0.3,
      Earth: 0.3,
      Air: 0.1
    },
    nutritionalContent: {
      protein: 22,
      fat: 25,
      carbs: 2.2,
      calories: 330
    },
    culinaryApplications: {
      grill: { notes: ["Grilled until golden with characteristic grill marks"] },
      fry: { notes: ["Pan-fried until crispy outside, soft inside"] },
      raw: { notes: ["Can be eaten raw, though typically cooked"] }
    },
    pairings: ["watermelon", "mint", "lemon", "olive_oil", "za'atar"],
    substitutions: ["paneer", "bread_cheese", "queso_para_freir"],
    affinities: ["mediterranean_flavors", "fresh_herbs", "citrus"]
  }
};

export default dairy; 