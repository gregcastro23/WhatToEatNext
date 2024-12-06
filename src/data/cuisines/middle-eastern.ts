// src/data/cuisines/middle-eastern.ts
import type { Cuisine } from '@/types/recipe';

export const middleEastern: Cuisine = {
  name: 'Middle Eastern',
  description: 'Traditional Middle Eastern cuisine featuring aromatic spices, fresh herbs, and ancient cooking techniques',
  dishes: {
    breakfast: {
      all: [
        {
          name: "Shakshuka",
          description: "Eggs poached in spiced tomato sauce with peppers and onions",
          cuisine: "Middle Eastern",
          ingredients: [
            { name: "eggs", amount: "4", unit: "large", category: "protein", swaps: ["soft tofu"] },
            { name: "tomatoes", amount: "400", unit: "g", category: "vegetable" },
            { name: "bell peppers", amount: "2", unit: "medium", category: "vegetable" },
            { name: "onion", amount: "1", unit: "large", category: "vegetable" },
            { name: "garlic", amount: "3", unit: "cloves", category: "vegetable" },
            { name: "cumin", amount: "1", unit: "tsp", category: "spice" },
            { name: "paprika", amount: "1", unit: "tsp", category: "spice" },
            { name: "pita bread", amount: "2", unit: "pieces", category: "grain", swaps: ["gluten-free pita"] }
          ],
          nutrition: {
            calories: 420,
            protein: 24,
            carbs: 38,
            fat: 22,
            vitamins: ["A", "C", "D"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "25 minutes",
          season: ["all"],
          mealType: ["breakfast", "brunch"],
          elementalProperties: {
            Fire: 0.4,
            Earth: 0.3,
            Water: 0.2,
            Air: 0.1
          }
        },
        {
          name: "Ful Medames",
          description: "Traditional fava bean breakfast with olive oil, lemon, and herbs",
          cuisine: "Middle Eastern",
          ingredients: [
            { name: "fava beans", amount: "400", unit: "g", category: "legume" },
            { name: "olive oil", amount: "3", unit: "tbsp", category: "oil" },
            { name: "lemon juice", amount: "2", unit: "tbsp", category: "acid" },
            { name: "garlic", amount: "2", unit: "cloves", category: "vegetable" },
            { name: "cumin", amount: "1", unit: "tsp", category: "spice" },
            { name: "parsley", amount: "1/4", unit: "cup", category: "herb" },
            { name: "tomatoes", amount: "2", unit: "medium", category: "vegetable" }
          ],
          nutrition: {
            calories: 380,
            protein: 18,
            carbs: 45,
            fat: 16,
            vitamins: ["C", "K", "B6"],
            minerals: ["Iron", "Folate"]
          },
          timeToMake: "20 minutes",
          season: ["all"],
          mealType: ["breakfast"],
          elementalProperties: {
            Earth: 0.4,
            Water: 0.3,
            Fire: 0.2,
            Air: 0.1
          }
        },
        {
          name: "Manakish Za'atar",
          description: "Traditional flatbread topped with za'atar herb blend and olive oil",
          cuisine: "Middle Eastern",
          ingredients: [
            { name: "flatbread dough", amount: "400", unit: "g", category: "grain", swaps: ["gluten-free dough"] },
            { name: "za'atar", amount: "4", unit: "tbsp", category: "spice" },
            { name: "olive oil", amount: "4", unit: "tbsp", category: "oil" },
            { name: "labneh", amount: "200", unit: "g", category: "dairy", swaps: ["coconut yogurt"] }
          ],
          nutrition: {
            calories: 450,
            protein: 12,
            carbs: 62,
            fat: 20,
            vitamins: ["E", "K"],
            minerals: ["Calcium", "Iron"]
          },
          timeToMake: "30 minutes",
          season: ["all"],
          mealType: ["breakfast"],
          elementalProperties: {
            Air: 0.4,
            Earth: 0.3,
            Fire: 0.2,
            Water: 0.1
          }
        }
      ]
    },
    lunch: {
      all: [
        {
          name: "Mansaf",
          description: "Traditional Levantine lamb dish with fermented dried yogurt and rice",
          cuisine: "Middle Eastern",
          ingredients: [
            { name: "halal lamb shoulder", amount: "1.5", unit: "kg", category: "protein" }
          ]
        }
      ]
    },
    dinner: {
      winter: [
        {
          name: "Moussaka",
          description: "Layered eggplant and spiced meat casserole with béchamel",
          cuisine: "Middle Eastern",
          ingredients: [
            { name: "ground lamb", amount: "500", unit: "g", category: "protein", swaps: ["plant-based ground"] },
            { name: "eggplant", amount: "3", unit: "large", category: "vegetable" },
            { name: "potatoes", amount: "2", unit: "medium", category: "vegetable" },
            { name: "onion", amount: "1", unit: "large", category: "vegetable" },
            { name: "tomato sauce", amount: "400", unit: "ml", category: "sauce" },
            { name: "béchamel sauce", amount: "500", unit: "ml", category: "sauce", swaps: ["cashew sauce"] },
            { name: "cinnamon", amount: "1", unit: "tsp", category: "spice" },
            { name: "nutmeg", amount: "1/4", unit: "tsp", category: "spice" }
          ],
          nutrition: {
            calories: 580,
            protein: 32,
            carbs: 45,
            fat: 34,
            vitamins: ["B12", "A", "C"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "90 minutes",
          season: ["winter"],
          mealType: ["dinner"],
          elementalProperties: {
            Earth: 0.4,
            Fire: 0.3,
            Water: 0.2,
            Air: 0.1
          }
        },
        {
          name: "Kuzi",
          description: "Whole roasted lamb with spiced rice and nuts",
          cuisine: "Middle Eastern",
          ingredients: [
            { name: "lamb shoulder", amount: "2", unit: "kg", category: "protein", swaps: ["jackfruit", "mushrooms"] },
            { name: "aromatic rice", amount: "500", unit: "g", category: "grain" },
            { name: "almonds", amount: "100", unit: "g", category: "nuts" },
            { name: "pine nuts", amount: "50", unit: "g", category: "nuts" },
            { name: "raisins", amount: "100", unit: "g", category: "fruit" },
            { name: "mixed spices", amount: "3", unit: "tbsp", category: "spice" }
          ],
          nutrition: {
            calories: 850,
            protein: 45,
            carbs: 65,
            fat: 48,
            vitamins: ["B12", "B6", "E"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "180 minutes",
          season: ["winter"],
          mealType: ["dinner"],
          elementalProperties: {
            Fire: 0.4,
            Earth: 0.3,
            Air: 0.2,
            Water: 0.1
          }
        }
      ],
      summer: [
        {
          name: "Mixed Grill Platter",
          description: "Assortment of grilled meats and vegetables with various dips",
          cuisine: "Middle Eastern",
          ingredients: [
            { name: "lamb kofta", amount: "400", unit: "g", category: "protein", swaps: ["mushroom kofta"] },
            { name: "chicken shish", amount: "400", unit: "g", category: "protein", swaps: ["seitan skewers"] },
            { name: "mixed vegetables", amount: "500", unit: "g", category: "vegetable" },
            { name: "hummus", amount: "200", unit: "g", category: "dip" },
            { name: "baba ganoush", amount: "200", unit: "g", category: "dip" },
            { name: "flatbread", amount: "4", unit: "pieces", category: "grain", swaps: ["gluten-free flatbread"] }
          ],
          nutrition: {
            calories: 680,
            protein: 45,
            carbs: 55,
            fat: 32,
            vitamins: ["B12", "C", "A"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "45 minutes",
          season: ["summer"],
          mealType: ["dinner"],
          elementalProperties: {
            Fire: 0.5,
            Air: 0.2,
            Earth: 0.2,
            Water: 0.1
          }
        }
      ]
    }
  },
  elementalBalance: {
    Fire: 0.2,
    Water: 0.2,
    Air: 0.2
  }
};