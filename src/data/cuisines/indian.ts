// src/data/indian.ts
import { Cuisine } from '../types';

export const indian: Cuisine = {
  name: "Indian",
  description: "Traditional Indian cuisine spanning diverse regional specialties, spice blends, and cooking techniques",
  dishes: {
    breakfast: {
      all: [
        {
          name: "Masala Dosa",
          description: "Crispy fermented rice crepe with spiced potato filling",
          cuisine: "Indian (South)",
          ingredients: [
            { name: "dosa batter", amount: "200", unit: "ml", category: "grain", swaps: ["quinoa dosa batter"] },
            { name: "potato masala", amount: "200", unit: "g", category: "vegetable" },
            { name: "sambar", amount: "200", unit: "ml", category: "soup" },
            { name: "coconut chutney", amount: "50", unit: "g", category: "condiment" },
            { name: "ghee", amount: "1", unit: "tbsp", category: "fat", swaps: ["oil"] }
          ],
          nutrition: {
            calories: 450,
            protein: 12,
            carbs: 85,
            fat: 8,
            vitamins: ["B12", "C", "D"],
            minerals: ["Iron", "Potassium"]
          },
          timeToMake: "30 minutes",
          season: ["all"],
          mealType: ["breakfast", "lunch"]
        },
        {
          name: "Aloo Paratha",
          description: "Whole wheat flatbread stuffed with spiced potatoes",
          cuisine: "Indian (North)",
          ingredients: [
            { name: "whole wheat flour", amount: "200", unit: "g", category: "grain", swaps: ["gluten-free flour blend"] },
            { name: "potatoes", amount: "300", unit: "g", category: "vegetable" },
            { name: "spices", amount: "2", unit: "tbsp", category: "spice" },
            { name: "yogurt", amount: "100", unit: "g", category: "dairy", swaps: ["plant-based yogurt"] },
            { name: "butter", amount: "30", unit: "g", category: "fat", swaps: ["oil"] }
          ],
          nutrition: {
            calories: 380,
            protein: 10,
            carbs: 65,
            fat: 12,
            vitamins: ["B1", "C"],
            minerals: ["Iron", "Potassium"]
          },
          timeToMake: "45 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        },
        {
          name: "Idli Sambar",
          description: "Steamed rice cakes with lentil soup",
          cuisine: "Indian (South)",
          ingredients: [
            { name: "idli batter", amount: "500", unit: "ml", category: "grain" },
            { name: "sambar", amount: "300", unit: "ml", category: "soup" },
            { name: "coconut chutney", amount: "100", unit: "g", category: "condiment" },
            { name: "ghee", amount: "2", unit: "tsp", category: "fat", swaps: ["oil"] }
          ],
          nutrition: {
            calories: 320,
            protein: 12,
            carbs: 58,
            fat: 6,
            vitamins: ["B12", "C"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "25 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        }
      ],
      summer: [
        {
          name: "Poha",
          description: "Flattened rice with peanuts and spices",
          cuisine: "Indian (Central)",
          ingredients: [
            { name: "flattened rice", amount: "200", unit: "g", category: "grain" },
            { name: "peanuts", amount: "50", unit: "g", category: "nuts" },
            { name: "onions", amount: "100", unit: "g", category: "vegetable" },
            { name: "curry leaves", amount: "10", unit: "pieces", category: "herb" },
            { name: "mustard seeds", amount: "1", unit: "tsp", category: "spice" }
          ],
          nutrition: {
            calories: 340,
            protein: 10,
            carbs: 52,
            fat: 12,
            vitamins: ["B1", "E"],
            minerals: ["Iron", "Magnesium"]
          },
          timeToMake: "20 minutes",
          season: ["summer"],
          mealType: ["breakfast"]
        }
      ]
    },
    lunch: {
      all: [
        {
          name: "Dal Tadka",
          description: "Yellow lentils with spice-infused oil",
          cuisine: "Indian (North)",
          ingredients: [
            { name: "yellow lentils", amount: "200", unit: "g", category: "legume" },
            { name: "ghee", amount: "2", unit: "tbsp", category: "fat", swaps: ["oil"] },
            { name: "cumin seeds", amount: "1", unit: "tsp", category: "spice" },
            { name: "garlic", amount: "6", unit: "cloves", category: "vegetable" },
            { name: "tomatoes", amount: "2", unit: "medium", category: "vegetable" }
          ],
          nutrition: {
            calories: 280,
            protein: 16,
            carbs: 42,
            fat: 8,
            vitamins: ["B1", "C"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "40 minutes",
          season: ["all"],
          mealType: ["lunch", "dinner"]
        }
      ],
      summer: [
        {
          name: "Lemon Rice",
          description: "South Indian rice with turmeric and peanuts",
          cuisine: "Indian (South)",
          ingredients: [
            { name: "basmati rice", amount: "300", unit: "g", category: "grain" },
            { name: "peanuts", amount: "50", unit: "g", category: "nuts" },
            { name: "lemon juice", amount: "4", unit: "tbsp", category: "citrus" },
            { name: "turmeric", amount: "1", unit: "tsp", category: "spice" },
            { name: "curry leaves", amount: "15", unit: "leaves", category: "herb" }
          ],
          nutrition: {
            calories: 380,
            protein: 10,
            carbs: 65,
            fat: 12,
            vitamins: ["C", "B1"],
            minerals: ["Iron", "Magnesium"]
          },
          timeToMake: "25 minutes",
          season: ["summer"],
          mealType: ["lunch"]
        },
        {
          name: "Gujarati Kadhi",
          description: "Yogurt-based curry with gram flour",
          cuisine: "Indian (Gujarat)",
          ingredients: [
            { name: "yogurt", amount: "500", unit: "ml", category: "dairy", swaps: ["coconut yogurt"] },
            { name: "gram flour", amount: "3", unit: "tbsp", category: "flour" },
            { name: "curry leaves", amount: "10", unit: "leaves", category: "herb" },
            { name: "mustard seeds", amount: "1", unit: "tsp", category: "spice" },
            { name: "ginger", amount: "1", unit: "inch", category: "spice" }
          ],
          nutrition: {
            calories: 220,
            protein: 12,
            carbs: 28,
            fat: 8,
            vitamins: ["B12", "D"],
            minerals: ["Calcium", "Phosphorus"]
          },
          timeToMake: "30 minutes",
          season: ["summer"],
          mealType: ["lunch"]
        }
      ],
      winter: [
        {
          name: "Dal Makhani",
          description: "Creamy black lentils simmered overnight",
          cuisine: "Indian (Punjab)",
          ingredients: [
            { name: "black lentils", amount: "300", unit: "g", category: "legume" },
            { name: "kidney beans", amount: "100", unit: "g", category: "legume" },
            { name: "cream", amount: "200", unit: "ml", category: "dairy", swaps: ["cashew cream"] },
            { name: "butter", amount: "100", unit: "g", category: "fat", swaps: ["plant butter"] },
            { name: "garam masala", amount: "2", unit: "tbsp", category: "spice" }
          ],
          nutrition: {
            calories: 420,
            protein: 18,
            carbs: 45,
            fat: 22,
            vitamins: ["A", "K"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "8 hours",
          season: ["winter"],
          mealType: ["lunch", "dinner"]
        }
      ]
    },
    dinner: {
      all: [
        {
          name: "Butter Chicken",
          description: "Tandoor-cooked chicken in rich tomato-cream sauce",
          cuisine: "Indian (North)",
          ingredients: [
            { name: "chicken", amount: "800", unit: "g", category: "protein", swaps: ["cauliflower", "seitan"] },
            { name: "tomato sauce", amount: "400", unit: "ml", category: "sauce" },
            { name: "cream", amount: "200", unit: "ml", category: "dairy", swaps: ["coconut cream"] },
            { name: "butter", amount: "100", unit: "g", category: "fat", swaps: ["coconut oil"] },
            { name: "spice blend", amount: "3", unit: "tbsp", category: "spice" }
          ],
          nutrition: {
            calories: 650,
            protein: 35,
            carbs: 28,
            fat: 42,
            vitamins: ["A", "D", "B12"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "45 minutes",
          season: ["all"],
          mealType: ["dinner"]
        },
        {
          name: "Biryani",
          description: "Layered rice with spiced meat and aromatics",
          cuisine: "Indian (Hyderabad)",
          ingredients: [
            { name: "basmati rice", amount: "500", unit: "g", category: "grain" },
            { name: "lamb", amount: "600", unit: "g", category: "protein", swaps: ["jackfruit", "mushrooms"] },
            { name: "onions", amount: "300", unit: "g", category: "vegetable" },
            { name: "yogurt", amount: "200", unit: "ml", category: "dairy", swaps: ["coconut yogurt"] },
            { name: "saffron", amount: "1", unit: "pinch", category: "spice" }
          ],
          nutrition: {
            calories: 720,
            protein: 42,
            carbs: 85,
            fat: 28,
            vitamins: ["B12", "B6"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "120 minutes",
          season: ["all"],
          mealType: ["dinner"]
        }
      ],
      winter: [
        {
          name: "Rogan Josh",
          description: "Kashmiri lamb curry with yogurt base",
          cuisine: "Indian (Kashmir)",
          ingredients: [
            { name: "lamb", amount: "800", unit: "g", category: "protein", swaps: ["mushrooms", "seitan"] },
            { name: "yogurt", amount: "300", unit: "ml", category: "dairy", swaps: ["coconut yogurt"] },
            { name: "kashmiri chilies", amount: "4", unit: "whole", category: "spice" },
            { name: "whole spices", amount: "2", unit: "tbsp", category: "spice" },
            { name: "ginger", amount: "2", unit: "tbsp", category: "spice" }
          ],
          nutrition: {
            calories: 580,
            protein: 45,
            carbs: 12,
            fat: 38,
            vitamins: ["B12", "D"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "90 minutes",
          season: ["winter"],
          mealType: ["dinner"]
        }
      ]
    },
    dessert: {
      all: [
        {
          name: "Gulab Jamun",
          description: "Fried milk solids in sugar syrup",
          cuisine: "Indian",
          ingredients: [
            { name: "milk powder", amount: "200", unit: "g", category: "dairy", swaps: ["almond flour blend"] },
            { name: "sugar", amount: "300", unit: "g", category: "sweetener" },
            { name: "cardamom", amount: "4", unit: "pods", category: "spice" },
            { name: "saffron", amount: "1", unit: "pinch", category: "spice" }
          ],
          nutrition: {
            calories: 320,
            protein: 6,
            carbs: 65,
            fat: 8,
            vitamins: ["D", "A"],
            minerals: ["Calcium"]
          },
          timeToMake: "60 minutes",
          season: ["all"],
          mealType: ["dessert"]
        },
        {
          name: "Rasmalai",
          description: "Cheese dumplings in saffron milk",
          cuisine: "Indian (Bengal)",
          ingredients: [
            { name: "milk", amount: "2", unit: "L", category: "dairy" },
            { name: "sugar", amount: "200", unit: "g", category: "sweetener" },
            { name: "cardamom", amount: "6", unit: "pods", category: "spice" },
            { name: "pistachios", amount: "50", unit: "g", category: "nuts" }
          ],
          nutrition: {
            calories: 280,
            protein: 12,
            carbs: 42,
            fat: 10,
            vitamins: ["D", "B12"],
            minerals: ["Calcium", "Potassium"]
          },
          timeToMake: "120 minutes",
          season: ["all"],
          mealType: ["dessert"]
        }
      ],
      summer: [
        {
          name: "Kulfi",
          description: "Dense Indian ice cream",
          cuisine: "Indian",
          ingredients: [
            { name: "milk", amount: "1", unit: "L", category: "dairy", swaps: ["coconut milk"] },
            { name: "pistachios", amount: "100", unit: "g", category: "nuts" },
            { name: "cardamom", amount: "5", unit: "pods", category: "spice" },
            { name: "saffron", amount: "1", unit: "pinch", category: "spice" }
          ],
          nutrition: {
            calories: 260,
            protein: 8,
            carbs: 32,
            fat: 12,
            vitamins: ["A", "D"],
            minerals: ["Calcium", "Phosphorus"]
          },
          timeToMake: "240 minutes",
          season: ["summer"],
          mealType: ["dessert"]
        }
      ]
    }
  },
  elementalBalance: {
    Fire: 0.4,    // Represents spices and heat
    Earth: 0.3,   // Represents grains and legumes
    Air: 0.2,     // Represents light breads and aromatics
    Water: 0.1    // Represents dairy and curries
  }
};