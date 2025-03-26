// src/data/mexican.ts
import { Cuisine } from '../types';

export const mexican: Cuisine = {
  name: "Mexican",
  description: "Traditional Mexican cuisine featuring regional specialties, corn-based dishes, and diverse moles and salsas",
  dishes: {
    breakfast: {
      all: [
        {
          name: "Huevos Rancheros",
          description: "Fried eggs on tortillas with spicy tomato sauce and black beans",
          cuisine: "Mexican",
          ingredients: [
            { name: "eggs", amount: "2", unit: "large", category: "protein", swaps: ["tofu scramble"] },
            { name: "corn tortillas", amount: "2", unit: "pieces", category: "grain", swaps: ["gluten-free tortillas"] },
            { name: "ranchero sauce", amount: "200", unit: "ml", category: "sauce" },
            { name: "black beans", amount: "1", unit: "cup", category: "protein" },
            { name: "avocado", amount: "1/2", unit: "whole", category: "fruit" },
            { name: "queso fresco", amount: "1/4", unit: "cup", category: "dairy", swaps: ["vegan cheese"] }
          ],
          nutrition: {
            calories: 520,
            protein: 24,
            carbs: 48,
            fat: 28,
            vitamins: ["A", "C", "D"],
            minerals: ["Iron", "Potassium"]
          },
          timeToMake: "20 minutes",
          season: ["all"],
          mealType: ["breakfast", "brunch"]
        },
        {
          name: "Chilaquiles Verdes",
          description: "Tortilla chips in salsa verde with eggs and cream",
          cuisine: "Mexican",
          ingredients: [
            { name: "corn tortillas", amount: "6", unit: "pieces", category: "grain", swaps: ["gluten-free tortillas"] },
            { name: "salsa verde", amount: "2", unit: "cups", category: "sauce" },
            { name: "eggs", amount: "2", unit: "large", category: "protein", swaps: ["tofu"] },
            { name: "crema", amount: "1/4", unit: "cup", category: "dairy", swaps: ["cashew cream"] },
            { name: "queso fresco", amount: "1/2", unit: "cup", category: "dairy", swaps: ["vegan cheese"] },
            { name: "onion", amount: "1/2", unit: "medium", category: "vegetable" },
            { name: "epazote", amount: "2", unit: "sprigs", category: "herb" }
          ],
          nutrition: {
            calories: 480,
            protein: 22,
            carbs: 52,
            fat: 24,
            vitamins: ["A", "C", "K"],
            minerals: ["Calcium", "Iron"]
          },
          timeToMake: "25 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        },
        {
          name: "Molletes",
          description: "Open-faced refried bean and cheese sandwiches",
          cuisine: "Mexican",
          ingredients: [
            { name: "bolillo rolls", amount: "2", unit: "pieces", category: "grain", swaps: ["gluten-free bread"] },
            { name: "refried beans", amount: "1", unit: "cup", category: "legume" },
            { name: "cheese", amount: "1", unit: "cup", category: "dairy", swaps: ["vegan cheese"] },
            { name: "pico de gallo", amount: "1", unit: "cup", category: "salsa" }
          ],
          nutrition: {
            calories: 420,
            protein: 18,
            carbs: 58,
            fat: 16,
            vitamins: ["C", "B12"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "15 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        },
        {
          name: "Enfrijoladas",
          description: "Tortillas dipped in black bean sauce and filled with cheese",
          cuisine: "Mexican",
          ingredients: [
            { name: "corn tortillas", amount: "8", unit: "pieces", category: "grain", swaps: ["gluten-free tortillas"] },
            { name: "black beans", amount: "2", unit: "cups", category: "legume" },
            { name: "queso fresco", amount: "1", unit: "cup", category: "dairy", swaps: ["vegan cheese"] },
            { name: "crema", amount: "1/2", unit: "cup", category: "dairy", swaps: ["cashew cream"] },
            { name: "onion", amount: "1", unit: "medium", category: "vegetable" },
            { name: "chipotle peppers", amount: "2", unit: "pieces", category: "spice" }
          ],
          nutrition: {
            calories: 440,
            protein: 20,
            carbs: 62,
            fat: 18,
            vitamins: ["B12", "C"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "30 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        },
        {
          name: "Huevos Motuleños",
          description: "Eggs on tortillas with black beans, plantains, and salsa",
          cuisine: "Mexican (Yucatan)",
          ingredients: [
            { name: "eggs", amount: "4", unit: "large", category: "protein", swaps: ["tofu scramble"] },
            { name: "corn tortillas", amount: "4", unit: "pieces", category: "grain", swaps: ["gluten-free tortillas"] },
            { name: "black beans", amount: "1", unit: "cup", category: "legume" },
            { name: "plantains", amount: "2", unit: "medium", category: "fruit" },
            { name: "tomato sauce", amount: "1", unit: "cup", category: "sauce" },
            { name: "peas", amount: "1/2", unit: "cup", category: "vegetable" },
            { name: "ham", amount: "100", unit: "g", category: "protein", swaps: ["tempeh"] }
          ],
          nutrition: {
            calories: 580,
            protein: 28,
            carbs: 75,
            fat: 24,
            vitamins: ["A", "C", "B12"],
            minerals: ["Iron", "Potassium"]
          },
          timeToMake: "35 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        }
      ],
      summer: [
        {
          name: "Licuado de Frutas",
          description: "Fresh fruit smoothie with milk and honey",
          cuisine: "Mexican",
          ingredients: [
            { name: "mixed fruits", amount: "2", unit: "cups", category: "fruit" },
            { name: "milk", amount: "1", unit: "cup", category: "dairy", swaps: ["almond milk", "oat milk"] },
            { name: "honey", amount: "2", unit: "tbsp", category: "sweetener", swaps: ["agave"] },
            { name: "vanilla", amount: "1", unit: "tsp", category: "flavoring" }
          ],
          nutrition: {
            calories: 240,
            protein: 8,
            carbs: 45,
            fat: 6,
            vitamins: ["C", "D"],
            minerals: ["Calcium", "Potassium"]
          },
          timeToMake: "10 minutes",
          season: ["summer"],
          mealType: ["breakfast"]
        }
      ]
    },
    lunch: {
      all: [
        {
          name: "Tacos al Pastor",
          description: "Marinated pork tacos with pineapple and onions",
          cuisine: "Mexican (Mexico City)",
          ingredients: [
            { name: "pork shoulder", amount: "1", unit: "kg", category: "protein", swaps: ["jackfruit", "seitan"] },
            { name: "achiote paste", amount: "100", unit: "g", category: "seasoning" },
            { name: "corn tortillas", amount: "16", unit: "pieces", category: "grain", swaps: ["gluten-free tortillas"] },
            { name: "pineapple", amount: "1", unit: "whole", category: "fruit" },
            { name: "onion", amount: "2", unit: "medium", category: "vegetable" },
            { name: "cilantro", amount: "1", unit: "bunch", category: "herb" }
          ],
          nutrition: {
            calories: 480,
            protein: 32,
            carbs: 45,
            fat: 22,
            vitamins: ["C", "B12"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "3 hours",
          season: ["all"],
          mealType: ["lunch", "dinner"]
        },
        {
          name: "Enchiladas Verdes",
          description: "Tortillas filled with chicken in green salsa",
          cuisine: "Mexican",
          ingredients: [
            { name: "corn tortillas", amount: "12", unit: "pieces", category: "grain", swaps: ["gluten-free tortillas"] },
            { name: "chicken", amount: "500", unit: "g", category: "protein", swaps: ["jackfruit", "tofu"] },
            { name: "tomatillos", amount: "500", unit: "g", category: "vegetable" },
            { name: "serrano peppers", amount: "3", unit: "pieces", category: "spice" },
            { name: "crema", amount: "1", unit: "cup", category: "dairy", swaps: ["cashew cream"] },
            { name: "queso fresco", amount: "200", unit: "g", category: "dairy", swaps: ["vegan cheese"] }
          ],
          nutrition: {
            calories: 520,
            protein: 35,
            carbs: 48,
            fat: 26,
            vitamins: ["A", "C"],
            minerals: ["Calcium", "Iron"]
          },
          timeToMake: "45 minutes",
          season: ["all"],
          mealType: ["lunch"]
        },
        {
          name: "Sopes",
          description: "Thick corn tortillas with pinched sides and toppings",
          cuisine: "Mexican",
          ingredients: [
            { name: "masa harina", amount: "2", unit: "cups", category: "grain" },
            { name: "refried beans", amount: "2", unit: "cups", category: "legume" },
            { name: "lettuce", amount: "2", unit: "cups", category: "vegetable" },
            { name: "Mexican crema", amount: "1", unit: "cup", category: "dairy", swaps: ["cashew cream"] },
            { name: "queso fresco", amount: "200", unit: "g", category: "dairy", swaps: ["vegan cheese"] },
            { name: "salsa", amount: "1", unit: "cup", category: "sauce" }
          ],
          nutrition: {
            calories: 420,
            protein: 18,
            carbs: 52,
            fat: 20,
            vitamins: ["A", "C"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "40 minutes",
          season: ["all"],
          mealType: ["lunch"]
        }
      ],
      summer: [
        {
          name: "Aguachile",
          description: "Shrimp cured in lime juice with chiles and cucumber",
          cuisine: "Mexican (Sinaloa)",
          ingredients: [
            { name: "shrimp", amount: "500", unit: "g", category: "seafood", swaps: ["hearts of palm"] },
            { name: "lime juice", amount: "1", unit: "cup", category: "citrus" },
            { name: "cucumber", amount: "2", unit: "medium", category: "vegetable" },
            { name: "serrano peppers", amount: "4", unit: "pieces", category: "spice" },
            { name: "red onion", amount: "1", unit: "medium", category: "vegetable" }
          ],
          nutrition: {
            calories: 280,
            protein: 42,
            carbs: 12,
            fat: 8,
            vitamins: ["C", "B12"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "20 minutes",
          season: ["summer"],
          mealType: ["lunch"]
        }
      ],
      winter: [
        {
          name: "Pozole Rojo",
          description: "Hearty hominy soup with pork and red chilies",
          cuisine: "Mexican",
          ingredients: [
            { name: "pork shoulder", amount: "1", unit: "kg", category: "protein", swaps: ["jackfruit", "mushrooms"] },
            { name: "hominy", amount: "1", unit: "kg", category: "grain" },
            { name: "dried guajillo chilies", amount: "6", unit: "pieces", category: "spice" },
            { name: "dried ancho chilies", amount: "3", unit: "pieces", category: "spice" },
            { name: "garlic", amount: "8", unit: "cloves", category: "vegetable" },
            { name: "oregano", amount: "2", unit: "tbsp", category: "herb" }
          ],
          nutrition: {
            calories: 580,
            protein: 42,
            carbs: 48,
            fat: 28,
            vitamins: ["A", "C", "B6"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "3 hours",
          season: ["winter"],
          mealType: ["lunch", "dinner"]
        }
      ]
    },
    dinner: {
      all: [
        {
          name: "Mole Poblano",
          description: "Complex sauce with chocolate and chilies served over turkey or chicken",
          cuisine: "Mexican (Puebla)",
          ingredients: [
            { name: "chicken", amount: "1.5", unit: "kg", category: "protein", swaps: ["mushrooms", "seitan"] },
            { name: "mole paste", amount: "500", unit: "g", category: "sauce" },
            { name: "chicken broth", amount: "1", unit: "L", category: "broth", swaps: ["vegetable broth"] },
            { name: "sesame seeds", amount: "50", unit: "g", category: "garnish" },
            { name: "rice", amount: "2", unit: "cups", category: "grain" }
          ],
          nutrition: {
            calories: 650,
            protein: 45,
            carbs: 42,
            fat: 38,
            vitamins: ["B12", "A"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "2 hours",
          season: ["all"],
          mealType: ["dinner"]
        },
        {
          name: "Chiles en Nogada",
          description: "Stuffed poblano peppers with walnut sauce",
          cuisine: "Mexican",
          ingredients: [
            { name: "poblano peppers", amount: "8", unit: "large", category: "vegetable" },
            { name: "ground pork", amount: "500", unit: "g", category: "protein", swaps: ["mushroom mix"] },
            { name: "fruit mixture", amount: "300", unit: "g", category: "fruit" },
            { name: "walnut sauce", amount: "2", unit: "cups", category: "sauce" },
            { name: "pomegranate seeds", amount: "1", unit: "cup", category: "fruit" }
          ],
          nutrition: {
            calories: 520,
            protein: 32,
            carbs: 38,
            fat: 30,
            vitamins: ["A", "C", "E"],
            minerals: ["Iron", "Magnesium"]
          },
          timeToMake: "90 minutes",
          season: ["autumn"],
          mealType: ["dinner"]
        }
      ],
      winter: [
        {
          name: "Cochinita Pibil",
          description: "Yucatan-style marinated pork wrapped in banana leaves",
          cuisine: "Mexican (Yucatan)",
          ingredients: [
            { name: "pork shoulder", amount: "2", unit: "kg", category: "protein", swaps: ["jackfruit"] },
            { name: "achiote paste", amount: "200", unit: "g", category: "seasoning" },
            { name: "sour orange juice", amount: "2", unit: "cups", category: "citrus" },
            { name: "banana leaves", amount: "4", unit: "large", category: "wrapper" },
            { name: "pickled red onions", amount: "2", unit: "cups", category: "condiment" }
          ],
          nutrition: {
            calories: 480,
            protein: 45,
            carbs: 15,
            fat: 28,
            vitamins: ["B12", "C"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "12 hours",
          season: ["winter"],
          mealType: ["dinner"]
        }
      ]
    },
    dessert: {
      all: [
        {
          name: "Flan",
          description: "Classic Mexican caramel custard",
          cuisine: "Mexican",
          ingredients: [
            { name: "eggs", amount: "6", unit: "large", category: "protein" },
            { name: "milk", amount: "2", unit: "cups", category: "dairy", swaps: ["coconut milk"] },
            { name: "sugar", amount: "1", unit: "cup", category: "sweetener" },
            { name: "vanilla", amount: "1", unit: "tbsp", category: "flavoring" }
          ],
          nutrition: {
            calories: 280,
            protein: 8,
            carbs: 42,
            fat: 10,
            vitamins: ["A", "D"],
            minerals: ["Calcium"]
          },
          timeToMake: "60 minutes",
          season: ["all"],
          mealType: ["dessert"]
        },
        {
          name: "Churros",
          description: "Fried dough pastry with cinnamon sugar",
          cuisine: "Mexican",
          ingredients: [
            { name: "flour", amount: "2", unit: "cups", category: "grain", swaps: ["gluten-free flour blend"] },
            { name: "water", amount: "2", unit: "cups", category: "liquid" },
            { name: "cinnamon sugar", amount: "1", unit: "cup", category: "sweetener" },
            { name: "chocolate sauce", amount: "1", unit: "cup", category: "sauce" }
          ],
          nutrition: {
            calories: 320,
            protein: 4,
            carbs: 52,
            fat: 12,
            vitamins: ["B1", "B2"],
            minerals: ["Iron"]
          },
          timeToMake: "45 minutes",
          season: ["all"],
          mealType: ["dessert"]
        }
      ],
      summer: [
        {
          name: "Paletas",
          description: "Mexican ice pops with fresh fruit",
          cuisine: "Mexican",
          ingredients: [
            { name: "fresh fruit", amount: "4", unit: "cups", category: "fruit" },
            { name: "sugar", amount: "1/2", unit: "cup", category: "sweetener" },
            { name: "lime juice", amount: "2", unit: "tbsp", category: "citrus" },
            { name: "chili powder", amount: "1", unit: "tsp", category: "spice" }
          ],
          nutrition: {
            calories: 120,
            protein: 1,
            carbs: 28,
            fat: 0,
            vitamins: ["C", "A"],
            minerals: ["Potassium"]
          },
          timeToMake: "240 minutes",
          season: ["summer"],
          mealType: ["dessert"]
        }
      ]
    }
  },
  elementalBalance: {
    Fire: 0.4,    // Represents chiles and cooking methods
    Earth: 0.3,   // Represents corn and grains
    Water: 0.2,   // Represents sauces and stews
    Air: 0.1      // Represents light garnishes and herbs
  }
};