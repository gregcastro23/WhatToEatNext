// Template for all cuisine files
import { Cuisine } from '@/types/cuisine';

export const cuisine: Cuisine = {
  id: "template_cuisine",
  name: "Cuisine Name",
  description: "Comprehensive description of cuisine traditions and characteristics",
  dishes: {
    breakfast: {
      all: [
        {
          name: "Example Dish",
          description: "Description of the dish",
          cuisine: "Example Cuisine",
          cookingMethods: ["Bake", "Fry"],
          tools: ["Pan", "Oven"],
          preparationSteps: ["Step 1", "Step 2"],
          ingredients: [
            {
              name: "Ingredient 1",
              amount: "1",
              unit: "cup",
              category: "protein",
              swaps: ["Alternative 1"],
              optional: false
            }
          ],
          substitutions: { "Ingredient 1": ["Substitute 1"] },
          servingSize: 2,
          allergens: ["Gluten"],
          prepTime: "10 minutes",
          cookTime: "20 minutes",
          culturalNotes: "Traditional dish from...",
          pairingSuggestions: ["Wine", "Side dish"],
          dietaryInfo: ["Vegetarian"],
          spiceLevel: "Medium",
          nutrition: {
            calories: 300,
            protein: 15,
            carbs: 30,
            fat: 10,
            vitamins: ["A", "C"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "30 minutes",
          season: ["Summer"],
          mealType: ["Breakfast"]
        }
      ],
      spring: [],
      summer: [],
      autumn: [],
      winter: []
    },
    // ... similar structure for lunch, dinner, dessert
  },
  elementalProperties: {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  }
}; 