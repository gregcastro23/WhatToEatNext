// src/data/italian.ts
import { Cuisine } from '../types';

export const italian: Cuisine = {
  name: "Italian",
  description: "Traditional Italian cuisine emphasizing regional specialties, fresh ingredients, and classic techniques",
  dishes: {
    breakfast: {
      all: [
        {
          name: "Cornetto e Cappuccino",
          description: "Traditional Italian breakfast pastry with coffee",
          cuisine: "Italian",
          ingredients: [
            { name: "cornetto", amount: "1", unit: "piece", category: "pastry", swaps: ["gluten-free cornetto"] },
            { name: "espresso", amount: "30", unit: "ml", category: "beverage" },
            { name: "whole milk", amount: "90", unit: "ml", category: "dairy", swaps: ["oat milk", "almond milk"] },
            { name: "honey", amount: "1", unit: "tsp", category: "sweetener", swaps: ["agave"] }
          ],
          nutrition: {
            calories: 340,
            protein: 8,
            carbs: 42,
            fat: 16,
            vitamins: ["A", "D"],
            minerals: ["Calcium"]
          },
          timeToMake: "10 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        },
        {
          name: "Maritozzo con Panna",
          description: "Roman sweet bun filled with whipped cream",
          cuisine: "Italian",
          ingredients: [
            { name: "maritozzo", amount: "1", unit: "piece", category: "pastry", swaps: ["gluten-free bun"] },
            { name: "whipped cream", amount: "100", unit: "g", category: "dairy", swaps: ["coconut whipped cream"] },
            { name: "powdered sugar", amount: "1", unit: "tsp", category: "sweetener" },
            { name: "espresso", amount: "30", unit: "ml", category: "beverage" }
          ],
          nutrition: {
            calories: 380,
            protein: 6,
            carbs: 48,
            fat: 20,
            vitamins: ["A", "D"],
            minerals: ["Calcium"]
          },
          timeToMake: "5 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        },
        {
          name: "Fette Biscottate con Marmellata",
          description: "Crisp toast with jam and coffee",
          cuisine: "Italian",
          ingredients: [
            { name: "fette biscottate", amount: "3", unit: "pieces", category: "bread", swaps: ["gluten-free toast"] },
            { name: "jam", amount: "30", unit: "g", category: "spread" },
            { name: "butter", amount: "15", unit: "g", category: "dairy", swaps: ["plant butter"] },
            { name: "espresso", amount: "30", unit: "ml", category: "beverage" }
          ],
          nutrition: {
            calories: 280,
            protein: 6,
            carbs: 45,
            fat: 10,
            vitamins: ["A", "D"],
            minerals: ["Iron"]
          },
          timeToMake: "5 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        }
      ],
      summer: [
        {
          name: "Granita con Brioche",
          description: "Sicilian ice granita with soft brioche",
          cuisine: "Italian",
          ingredients: [
            { name: "almond granita", amount: "200", unit: "ml", category: "ice" },
            { name: "brioche", amount: "1", unit: "piece", category: "pastry", swaps: ["gluten-free brioche"] },
            { name: "whipped cream", amount: "30", unit: "g", category: "dairy", swaps: ["coconut whipped cream"] }
          ],
          nutrition: {
            calories: 380,
            protein: 9,
            carbs: 52,
            fat: 16,
            vitamins: ["A", "D", "E"],
            minerals: ["Calcium"]
          },
          timeToMake: "10 minutes",
          season: ["summer"],
          mealType: ["breakfast"]
        },
        {
          name: "Ricotta e Fichi",
          description: "Fresh ricotta with figs and honey",
          cuisine: "Italian",
          ingredients: [
            { name: "ricotta", amount: "200", unit: "g", category: "dairy", swaps: ["almond ricotta"] },
            { name: "fresh figs", amount: "4", unit: "whole", category: "fruit" },
            { name: "honey", amount: "2", unit: "tbsp", category: "sweetener" },
            { name: "pistachios", amount: "30", unit: "g", category: "nuts" }
          ],
          nutrition: {
            calories: 380,
            protein: 18,
            carbs: 42,
            fat: 18,
            vitamins: ["A", "B12", "K"],
            minerals: ["Calcium", "Magnesium"]
          },
          timeToMake: "5 minutes",
          season: ["summer"],
          mealType: ["breakfast"]
        }
      ],
      winter: [
        {
          name: "Cioccolata Calda con Biscotti",
          description: "Thick Italian hot chocolate with cookies",
          cuisine: "Italian",
          ingredients: [
            { name: "dark chocolate", amount: "100", unit: "g", category: "chocolate" },
            { name: "whole milk", amount: "250", unit: "ml", category: "dairy", swaps: ["oat milk"] },
            { name: "cornstarch", amount: "10", unit: "g", category: "thickener" },
            { name: "biscotti", amount: "2", unit: "pieces", category: "pastry", swaps: ["gluten-free biscotti"] }
          ],
          nutrition: {
            calories: 450,
            protein: 12,
            carbs: 48,
            fat: 24,
            vitamins: ["D", "E"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "15 minutes",
          season: ["winter"],
          mealType: ["breakfast"]
        }
      ]
    },
    lunch: {
      summer: [
        {
          name: "Pasta alla Norma",
          description: "Sicilian pasta with eggplant and ricotta salata",
          cuisine: "Italian",
          ingredients: [
            { name: "pasta", amount: "320", unit: "g", category: "grain", swaps: ["gluten-free pasta"] },
            { name: "eggplant", amount: "2", unit: "medium", category: "vegetable" },
            { name: "tomato sauce", amount: "400", unit: "g", category: "sauce" },
            { name: "ricotta salata", amount: "100", unit: "g", category: "dairy", swaps: ["vegan cheese"] },
            { name: "basil", amount: "1", unit: "bunch", category: "herb" }
          ],
          nutrition: {
            calories: 450,
            protein: 16,
            carbs: 72,
            fat: 14,
            vitamins: ["C", "A", "K"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "35 minutes",
          season: ["summer"],
          mealType: ["lunch", "dinner"]
        },
        {
          name: "Insalata Caprese",
          description: "Classic Capri salad with mozzarella and tomatoes",
          cuisine: "Italian",
          ingredients: [
            { name: "buffalo mozzarella", amount: "200", unit: "g", category: "dairy", swaps: ["plant-based mozzarella"] },
            { name: "tomatoes", amount: "300", unit: "g", category: "vegetable" },
            { name: "fresh basil", amount: "1", unit: "bunch", category: "herb" },
            { name: "olive oil", amount: "3", unit: "tbsp", category: "oil" },
            { name: "balsamic vinegar", amount: "1", unit: "tbsp", category: "vinegar" }
          ],
          nutrition: {
            calories: 320,
            protein: 18,
            carbs: 8,
            fat: 24,
            vitamins: ["A", "C", "K"],
            minerals: ["Calcium", "Potassium"]
          },
          timeToMake: "10 minutes",
          season: ["summer"],
          mealType: ["lunch"]
        },
        {
          name: "Panzanella",
          description: "Tuscan bread and tomato salad",
          cuisine: "Italian",
          ingredients: [
            { name: "stale bread", amount: "300", unit: "g", category: "grain", swaps: ["gluten-free bread"] },
            { name: "tomatoes", amount: "400", unit: "g", category: "vegetable" },
            { name: "cucumber", amount: "1", unit: "medium", category: "vegetable" },
            { name: "red onion", amount: "1", unit: "medium", category: "vegetable" },
            { name: "olive oil", amount: "60", unit: "ml", category: "oil" }
          ],
          nutrition: {
            calories: 380,
            protein: 10,
            carbs: 58,
            fat: 16,
            vitamins: ["C", "A", "K"],
            minerals: ["Potassium", "Iron"]
          },
          timeToMake: "20 minutes",
          season: ["summer"],
          mealType: ["lunch"]
        }
      ],
      winter: [
        {
          name: "Ribollita",
          description: "Hearty Tuscan bread and vegetable soup",
          cuisine: "Italian",
          ingredients: [
            { name: "cannellini beans", amount: "400", unit: "g", category: "legume" },
            { name: "cavolo nero", amount: "300", unit: "g", category: "vegetable" },
            { name: "stale bread", amount: "300", unit: "g", category: "grain", swaps: ["gluten-free bread"] },
            { name: "vegetables", amount: "500", unit: "g", category: "vegetable" },
            { name: "olive oil", amount: "60", unit: "ml", category: "oil" }
          ],
          nutrition: {
            calories: 420,
            protein: 18,
            carbs: 65,
            fat: 14,
            vitamins: ["A", "C", "K"],
            minerals: ["Iron", "Fiber"]
          },
          timeToMake: "90 minutes",
          season: ["winter"],
          mealType: ["lunch"]
        },
        {
          name: "Pasta e Fagioli",
          description: "Classic pasta and bean soup",
          cuisine: "Italian",
          ingredients: [
            { name: "small pasta", amount: "200", unit: "g", category: "grain", swaps: ["gluten-free pasta"] },
            { name: "borlotti beans", amount: "400", unit: "g", category: "legume" },
            { name: "tomato passata", amount: "200", unit: "ml", category: "sauce" },
            { name: "rosemary", amount: "2", unit: "sprigs", category: "herb" },
            { name: "pancetta", amount: "50", unit: "g", category: "protein", swaps: ["smoked tofu"] }
          ],
          nutrition: {
            calories: 440,
            protein: 22,
            carbs: 68,
            fat: 12,
            vitamins: ["B1", "B12", "C"],
            minerals: ["Iron", "Potassium"]
          },
          timeToMake: "45 minutes",
          season: ["winter"],
          mealType: ["lunch"]
        }
      ]
    },
    dinner: {
      winter: [
        {
          name: "Osso Buco alla Milanese",
          description: "Braised veal shanks with gremolata",
          cuisine: "Italian",
          ingredients: [
            { name: "veal shanks", amount: "1.2", unit: "kg", category: "protein", swaps: ["mushroom shanks"] },
            { name: "white wine", amount: "250", unit: "ml", category: "wine" },
            { name: "vegetables", amount: "300", unit: "g", category: "vegetable" },
            { name: "broth", amount: "500", unit: "ml", category: "liquid" },
            { name: "gremolata", amount: "1", unit: "portion", category: "condiment" }
          ],
          nutrition: {
            calories: 580,
            protein: 45,
            carbs: 15,
            fat: 32,
            vitamins: ["B12", "A", "K"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "150 minutes",
          season: ["winter"],
          mealType: ["dinner"]
        },
        {
          name: "Risotto al Tartufo",
          description: "Piedmontese truffle risotto",
          cuisine: "Italian",
          ingredients: [
            { name: "arborio rice", amount: "320", unit: "g", category: "grain" },
            { name: "black truffle", amount: "20", unit: "g", category: "mushroom" },
            { name: "parmigiano", amount: "100", unit: "g", category: "dairy", swaps: ["nutritional yeast"] },
            { name: "butter", amount: "50", unit: "g", category: "dairy", swaps: ["olive oil"] },
            { name: "broth", amount: "1", unit: "L", category: "liquid" }
          ],
          nutrition: {
            calories: 480,
            protein: 14,
            carbs: 68,
            fat: 22,
            vitamins: ["B12", "D"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "40 minutes",
          season: ["winter"],
          mealType: ["dinner"]
        }
      ],
      summer: [
        {
          name: "Acqua Pazza",
          description: "Neapolitan style fish in 'crazy water'",
          cuisine: "Italian",
          ingredients: [
            { name: "fresh fish", amount: "600", unit: "g", category: "protein", swaps: ["heart of palm"] },
            { name: "cherry tomatoes", amount: "300", unit: "g", category: "vegetable" },
            { name: "white wine", amount: "150", unit: "ml", category: "wine" },
            { name: "garlic", amount: "4", unit: "cloves", category: "vegetable" },
            { name: "parsley", amount: "1", unit: "bunch", category: "herb" }
          ],
          nutrition: {
            calories: 320,
            protein: 42,
            carbs: 12,
            fat: 14,
            vitamins: ["D", "B12", "C"],
            minerals: ["Selenium", "Iodine"]
          },
          timeToMake: "30 minutes",
          season: ["summer"],
          mealType: ["dinner"]
        },
        {
          name: "Melanzane alla Parmigiana",
          description: "Eggplant Parmesan with tomato sauce",
          cuisine: "Italian",
          ingredients: [
            { name: "eggplant", amount: "800", unit: "g", category: "vegetable" },
            { name: "tomato sauce", amount: "500", unit: "ml", category: "sauce" },
            { name: "mozzarella", amount: "300", unit: "g", category: "dairy", swaps: ["vegan mozzarella"] },
            { name: "parmigiano", amount: "100", unit: "g", category: "dairy", swaps: ["nutritional yeast"] },
            { name: "basil", amount: "1", unit: "bunch", category: "herb" }
          ],
          nutrition: {
            calories: 420,
            protein: 22,
            carbs: 28,
            fat: 26,
            vitamins: ["A", "C", "K"],
            minerals: ["Calcium", "Iron"]
          },
          timeToMake: "60 minutes",
          season: ["summer"],
          mealType: ["dinner"]
        }
      ]
    },
    dessert: {
      all: [
        {
          name: "Tiramisù",
          description: "Classic coffee-flavored dessert with mascarpone",
          cuisine: "Italian",
          ingredients: [
            { name: "mascarpone", amount: "500", unit: "g", category: "dairy", swaps: ["cashew cream"] },
            { name: "savoiardi", amount: "200", unit: "g", category: "biscuit", swaps: ["gluten-free ladyfingers"] },
            { name: "espresso", amount: "300", unit: "ml", category: "coffee" },
            { name: "eggs", amount: "4", unit: "large", category: "protein" },
            { name: "cocoa powder", amount: "30", unit: "g", category: "cocoa" }
          ],
          nutrition: {
            calories: 420,
            protein: 12,
            carbs: 38,
            fat: 26,
            vitamins: ["A", "D", "B12"],
            minerals: ["Calcium", "Iron"]
          },
          timeToMake: "30 minutes",
          season: ["all"],
          mealType: ["dessert"]
        }
      ],
      summer: [
        {
          name: "Gelato Artigianale",
          description: "Traditional Italian ice cream",
          cuisine: "Italian",
          ingredients: [
            { name: "milk", amount: "500", unit: "ml", category: "dairy", swaps: ["almond milk"] },
            { name: "cream", amount: "250", unit: "ml", category: "dairy", swaps: ["coconut cream"] },
            { name: "sugar", amount: "150", unit: "g", category: "sweetener" },
            { name: "egg yolks", amount: "4", unit: "large", category: "protein" }
          ],
          nutrition: {
            calories: 220,
            protein: 6,
            carbs: 28,
            fat: 12,
            vitamins: ["A", "D"],
            minerals: ["Calcium"]
          },
          timeToMake: "60 minutes",
          season: ["summer"],
          mealType: ["dessert"]
        }
      ],
      winter: [
        {
          name: "Panettone",
          description: "Traditional Christmas sweet bread",
          cuisine: "Italian",
          ingredients: [
            { name: "flour", amount: "500", unit: "g", category: "grain", swaps: ["gluten-free flour blend"] },
            { name: "dried fruit", amount: "200", unit: "g", category: "fruit" },
            { name: "butter", amount: "200", unit: "g", category: "dairy", swaps: ["plant butter"] },
            { name: "eggs", amount: "5", unit: "large", category: "protein" },
            { name: "sugar", amount: "150", unit: "g", category: "sweetener" }
          ],
          nutrition: {
            calories: 380,
            protein: 8,
            carbs: 52,
            fat: 16,
            vitamins: ["A", "D", "E"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "24 hours",
          season: ["winter"],
          mealType: ["dessert"]
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