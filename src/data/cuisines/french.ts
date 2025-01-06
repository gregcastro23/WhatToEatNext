// src/data/cuisines/french.ts
import type { Cuisine } from '@/types/recipe';

export const french: Cuisine = {
  name: 'French',
  description: 'Classical French cuisine emphasizing technique, tradition, and refined flavors. From rustic provincial dishes to haute cuisine, French cooking is the foundation of culinary arts.',
  dishes: {
    breakfast: {
      all: [
        {
          name: "Petit Déjeuner Parisien",
          description: "Traditional Parisian breakfast with croissant, café au lait, and confiture",
          cuisine: "French",
          ingredients: [
            { name: "croissant au beurre", amount: "1", unit: "piece", category: "viennoiserie", swaps: ["pain au levain"] },
            { name: "French butter", amount: "30", unit: "g", category: "dairy", swaps: ["plant-based butter"] },
            { name: "confiture de fraises", amount: "30", unit: "g", category: "confiture" },
            { name: "café", amount: "120", unit: "ml", category: "beverage" },
            { name: "lait entier", amount: "120", unit: "ml", category: "dairy", swaps: ["lait d'amande"] }
          ],
          nutrition: {
            calories: 420,
            protein: 8,
            carbs: 48,
            fat: 24,
            vitamins: ["A", "D"],
            minerals: ["Calcium"]
          },
          timeToMake: "15 minutes",
          season: ["all"],
          mealType: ["breakfast"],
          elementalProperties: {
            Air: 0.4,
            Fire: 0.3,
            Earth: 0.2,
            Water: 0.1
          }
        },
        {
          name: "Oeufs en Cocotte à la Crème",
          description: "Baked eggs in ramekins with cream and fine herbs",
          cuisine: "French",
          ingredients: [
            { name: "oeufs frais", amount: "2", unit: "large", category: "protein", swaps: ["oeufs végétaliens"] },
            { name: "crème fraîche", amount: "60", unit: "ml", category: "dairy", swaps: ["crème de soja"] },
            { name: "fines herbes", amount: "1", unit: "tbsp", category: "herb" },
            { name: "beurre doux", amount: "15", unit: "g", category: "dairy", swaps: ["huile d'olive"] },
            { name: "sel de Guérande", amount: "1/4", unit: "tsp", category: "seasoning" },
            { name: "poivre blanc", amount: "1/8", unit: "tsp", category: "seasoning" },
            { name: "pain de campagne", amount: "2", unit: "slices", category: "bread", swaps: ["pain sans gluten"] }
          ],
          nutrition: {
            calories: 380,
            protein: 18,
            carbs: 22,
            fat: 26,
            vitamins: ["A", "D", "B12"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "15 minutes",
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
          name: "Pain Perdu à l'Ancienne",
          description: "Classical French toast with brioche and vanilla bean",
          cuisine: "French",
          ingredients: [
            { name: "brioche", amount: "6", unit: "slices", category: "bread", swaps: ["pain au lait sans gluten"] },
            { name: "oeufs entiers", amount: "3", unit: "large", category: "protein" },
            { name: "lait entier", amount: "240", unit: "ml", category: "dairy", swaps: ["lait d'amande"] },
            { name: "gousse de vanille", amount: "1", unit: "piece", category: "spice" },
            { name: "sucre en poudre", amount: "30", unit: "g", category: "sweetener" },
            { name: "beurre clarifié", amount: "45", unit: "g", category: "dairy", swaps: ["huile de coco"] },
            { name: "cannelle", amount: "1/4", unit: "tsp", category: "spice" }
          ],
          nutrition: {
            calories: 460,
            protein: 16,
            carbs: 52,
            fat: 24,
            vitamins: ["A", "D", "E"],
            minerals: ["Calcium", "Iron"]
          },
          timeToMake: "25 minutes",
          season: ["all"],
          mealType: ["breakfast"],
          elementalProperties: {
            Fire: 0.3,
            Earth: 0.3,
            Air: 0.2,
            Water: 0.2
          }
        }
      ],
      lunch: {
        all: [
          {
            name: "Croque Monsieur",
            description: "Classic French grilled ham and cheese sandwich with béchamel",
            cuisine: "French",
            ingredients: [
              { name: "pain de mie", amount: "4", unit: "slices", category: "bread", swaps: ["pain sans gluten"] },
              { name: "jambon blanc", amount: "200", unit: "g", category: "charcuterie", swaps: ["jambon végétal"] },
              { name: "fromage gruyère", amount: "200", unit: "g", category: "cheese", swaps: ["fromage végétal"] },
              { name: "sauce béchamel", amount: "200", unit: "ml", category: "sauce", swaps: ["béchamel d'amande"] },
              { name: "beurre doux", amount: "30", unit: "g", category: "dairy", swaps: ["beurre végétal"] },
              { name: "muscade râpée", amount: "1", unit: "pinch", category: "spice" }
            ],
            nutrition: {
              calories: 580,
              protein: 32,
              carbs: 38,
              fat: 34,
              vitamins: ["A", "D", "B12"],
              minerals: ["Calcium", "Iron"]
            },
            timeToMake: "25 minutes",
            season: ["all"],
            mealType: ["lunch"],
            elementalProperties: {
              Earth: 0.4,
              Fire: 0.3,
              Air: 0.2,
              Water: 0.1
            }
          },
          {
            name: "Quiche Lorraine Traditionnelle",
            description: "Traditional quiche with lardons and Gruyère in a butter crust",
            cuisine: "French",
            ingredients: [
              { name: "pâte brisée", amount: "1", unit: "piece", category: "pastry", swaps: ["pâte sans gluten"] },
              { name: "lardons fumés", amount: "200", unit: "g", category: "charcuterie", swaps: ["champignons fumés"] },
              { name: "oeufs entiers", amount: "4", unit: "large", category: "protein" },
              { name: "crème fraîche", amount: "250", unit: "ml", category: "dairy", swaps: ["crème de soja"] },
              { name: "gruyère râpé", amount: "150", unit: "g", category: "cheese", swaps: ["fromage végétal râpé"] },
              { name: "muscade", amount: "1", unit: "pinch", category: "spice" },
              { name: "poivre blanc", amount: "1/4", unit: "tsp", category: "seasoning" }
            ],
            nutrition: {
              calories: 620,
              protein: 28,
              carbs: 42,
              fat: 40,
              vitamins: ["A", "D", "B12"],
              minerals: ["Calcium", "Iron"]
            },
            timeToMake: "75 minutes",
            season: ["all"],
            mealType: ["lunch", "dinner"],
            elementalProperties: {
              Earth: 0.4,
              Fire: 0.2,
              Water: 0.2,
              Air: 0.2
            }
          }
        ],
        summer: [
          {
            name: "Salade Niçoise Authentique",
            description: "Traditional Niçoise salad with fresh Mediterranean ingredients",
            cuisine: "French",
            ingredients: [
              { name: "thon frais", amount: "300", unit: "g", category: "protein", swaps: ["pois chiches"] },
              { name: "haricots verts extra-fins", amount: "200", unit: "g", category: "vegetable" },
              { name: "pommes de terre nouvelles", amount: "300", unit: "g", category: "vegetable" },
              { name: "tomates cerises", amount: "200", unit: "g", category: "vegetable" },
              { name: "oeufs", amount: "4", unit: "large", category: "protein" },
              { name: "olives de Nice", amount: "100", unit: "g", category: "vegetable" },
              { name: "anchois", amount: "50", unit: "g", category: "protein", swaps: ["câpres"] },
              { name: "vinaigrette à l'huile d'olive", amount: "120", unit: "ml", category: "dressing" },
              { name: "basilic frais", amount: "1", unit: "bunch", category: "herb" }
            ],
            nutrition: {
              calories: 480,
              protein: 35,
              carbs: 32,
              fat: 28,
              vitamins: ["C", "D", "K"],
              minerals: ["Iron", "Potassium"]
            },
            timeToMake: "45 minutes",
            season: ["summer"],
            mealType: ["lunch"],
            elementalProperties: {
              Water: 0.3,
              Earth: 0.3,
              Air: 0.2,
              Fire: 0.2
            }
          }
        ],
        winter: [
          {
            name: "Soupe à l'Oignon Gratinée",
            description: "Classic French onion soup with Gruyère and crusty bread",
            cuisine: "French",
            ingredients: [
              { name: "oignons jaunes", amount: "1", unit: "kg", category: "vegetable" },
              { name: "bouillon de boeuf", amount: "1.5", unit: "L", category: "broth", swaps: ["bouillon de légumes"] },
              { name: "baguette", amount: "1/2", unit: "piece", category: "bread", swaps: ["pain sans gluten"] },
              { name: "gruyère AOC", amount: "200", unit: "g", category: "cheese", swaps: ["fromage végétal"] },
              { name: "beurre", amount: "50", unit: "g", category: "dairy", swaps: ["huile d'olive"] },
              { name: "vin blanc sec", amount: "200", unit: "ml", category: "wine" },
              { name: "thym frais", amount: "4", unit: "sprigs", category: "herb" },
              { name: "feuille de laurier", amount: "1", unit: "piece", category: "herb" }
            ],
            nutrition: {
              calories: 420,
              protein: 18,
              carbs: 45,
              fat: 22,
              vitamins: ["C", "B1"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "90 minutes",
            season: ["winter"],
            mealType: ["lunch", "dinner"],
            elementalProperties: {
              Fire: 0.4,
              Earth: 0.3,
              Water: 0.2,
              Air: 0.1
            }
          },
          {
            name: "Cassoulet de Toulouse",
            description: "Traditional cassoulet with duck confit and Tarbais beans",
            cuisine: "French",
            ingredients: [
              { name: "haricots Tarbais", amount: "500", unit: "g", category: "legume" },
              { name: "confit de canard", amount: "4", unit: "pieces", category: "protein", swaps: ["champignons confits"] },
              { name: "saucisse de Toulouse", amount: "400", unit: "g", category: "protein", swaps: ["saucisse végétale"] },
              { name: "lard fumé", amount: "200", unit: "g", category: "protein", swaps: ["tempeh fumé"] },
              { name: "oignon", amount: "2", unit: "large", category: "vegetable" },
              { name: "carotte", amount: "2", unit: "medium", category: "vegetable" },
              { name: "céleri", amount: "2", unit: "branches", category: "vegetable" },
              { name: "bouquet garni", amount: "1", unit: "piece", category: "herb" },
              { name: "chapelure", amount: "100", unit: "g", category: "breadcrumbs" }
            ],
            nutrition: {
              calories: 850,
              protein: 48,
              carbs: 65,
              fat: 45,
              vitamins: ["B1", "B12", "K"],
              minerals: ["Iron", "Potassium"]
            },
            timeToMake: "180 minutes",
            season: ["winter"],
            mealType: ["lunch", "dinner"],
            elementalProperties: {
              Earth: 0.5,
              Fire: 0.3,
              Water: 0.1,
              Air: 0.1
            }
          }
        ]
      },
      dinner: {
        all: [
          {
            name: "Sole Meunière",
            description: "Classic pan-fried sole with brown butter and lemon",
            cuisine: "French",
            ingredients: [
              { name: "sole", amount: "800", unit: "g", category: "protein", swaps: ["aubergine meunière"] },
              { name: "farine", amount: "100", unit: "g", category: "flour", swaps: ["farine sans gluten"] },
              { name: "beurre", amount: "150", unit: "g", category: "dairy", swaps: ["beurre noisette végétal"] },
              { name: "citron", amount: "2", unit: "whole", category: "fruit" },
              { name: "persil plat", amount: "30", unit: "g", category: "herb" },
              { name: "sel de mer", amount: "to taste", unit: "", category: "seasoning" },
              { name: "poivre blanc", amount: "to taste", unit: "", category: "seasoning" }
            ],
            nutrition: {
              calories: 480,
              protein: 45,
              carbs: 12,
              fat: 32,
              vitamins: ["D", "B12", "A"],
              minerals: ["Selenium", "Iodine"]
            },
            timeToMake: "25 minutes",
            season: ["all"],
            mealType: ["dinner"],
            elementalProperties: {
              Water: 0.4,
              Fire: 0.3,
              Air: 0.2,
              Earth: 0.1
            }
          },
          {
            name: "Boeuf Bourguignon",
            description: "Classic Burgundian beef stew with red wine and pearl onions",
            cuisine: "French",
            ingredients: [
              { name: "boeuf pour bourguignon", amount: "1.5", unit: "kg", category: "protein", swaps: ["champignons portobello"] },
              { name: "lardons", amount: "200", unit: "g", category: "protein", swaps: ["champignons fumés"] },
              { name: "oignons grelots", amount: "500", unit: "g", category: "vegetable" },
              { name: "champignons de Paris", amount: "400", unit: "g", category: "vegetable" },
              { name: "vin rouge de Bourgogne", amount: "750", unit: "ml", category: "wine" },
              { name: "bouquet garni", amount: "1", unit: "piece", category: "herb" },
              { name: "carottes", amount: "300", unit: "g", category: "vegetable" },
              { name: "beurre", amount: "60", unit: "g", category: "dairy", swaps: ["huile d'olive"] }
            ],
            nutrition: {
              calories: 680,
              protein: 52,
              carbs: 18,
              fat: 42,
              vitamins: ["B12", "A", "K"],
              minerals: ["Iron", "Zinc"]
            },
            timeToMake: "180 minutes",
            season: ["winter"],
            mealType: ["dinner"],
            elementalProperties: {
              Earth: 0.4,
              Fire: 0.3,
              Water: 0.2,
              Air: 0.1
            }
          }
        ],
        summer: [
          {
            name: "Ratatouille Niçoise",
            description: "Traditional Provençal stewed vegetables",
            cuisine: "French",
            ingredients: [
              { name: "aubergines", amount: "500", unit: "g", category: "vegetable" },
              { name: "courgettes", amount: "500", unit: "g", category: "vegetable" },
              { name: "poivrons", amount: "500", unit: "g", category: "vegetable" },
              { name: "oignons", amount: "300", unit: "g", category: "vegetable" },
              { name: "tomates", amount: "800", unit: "g", category: "vegetable" },
              { name: "ail", amount: "6", unit: "cloves", category: "vegetable" },
              { name: "herbes de Provence", amount: "2", unit: "tbsp", category: "herb" },
              { name: "huile d'olive", amount: "120", unit: "ml", category: "oil" }
            ],
            nutrition: {
              calories: 220,
              protein: 6,
              carbs: 42,
              fat: 8,
              vitamins: ["C", "A", "K"],
              minerals: ["Potassium", "Manganese"]
            },
            timeToMake: "60 minutes",
            season: ["summer"],
            mealType: ["dinner"],
            elementalProperties: {
              Earth: 0.4,
              Water: 0.3,
              Fire: 0.2,
              Air: 0.1
            }
          }
        ]
      },
      dessert: {
        all: [
          {
            name: "Crème Brûlée Classique",
            description: "Traditional vanilla custard with caramelized sugar crust",
            cuisine: "French",
            ingredients: [
              { name: "crème entière", amount: "500", unit: "ml", category: "dairy", swaps: ["crème de coco"] },
              { name: "jaunes d'oeufs", amount: "6", unit: "large", category: "protein" },
              { name: "sucre", amount: "100", unit: "g", category: "sweetener" },
              { name: "gousse de vanille", amount: "1", unit: "piece", category: "spice" },
              { name: "sucre pour caraméliser", amount: "60", unit: "g", category: "sweetener" }
            ],
            nutrition: {
              calories: 380,
              protein: 6,
              carbs: 28,
              fat: 29,
              vitamins: ["A", "D", "E"],
              minerals: ["Calcium"]
            },
            timeToMake: "45 minutes",
            season: ["all"],
            mealType: ["dessert"],
            elementalProperties: {
              Fire: 0.4,
              Earth: 0.3,
              Water: 0.2,
              Air: 0.1
            }
          },
          {
            name: "Tarte Tatin",
            description: "Upside-down caramelized apple tart",
            cuisine: "French",
            ingredients: [
              { name: "pommes", amount: "8", unit: "large", category: "fruit" },
              { name: "pâte feuilletée", amount: "1", unit: "piece", category: "pastry", swaps: ["pâte sans gluten"] },
              { name: "beurre", amount: "150", unit: "g", category: "dairy", swaps: ["beurre végétal"] },
              { name: "sucre", amount: "150", unit: "g", category: "sweetener" },
              { name: "vanille", amount: "1", unit: "gousse", category: "spice" }
            ],
            nutrition: {
              calories: 420,
              protein: 4,
              carbs: 58,
              fat: 22,
              vitamins: ["C", "A"],
              minerals: ["Potassium", "Iron"]
            },
            timeToMake: "90 minutes",
            season: ["all"],
            mealType: ["dessert"],
            elementalProperties: {
              Earth: 0.4,
              Fire: 0.3,
              Air: 0.2,
              Water: 0.1
            }
          },
          {
            name: "Profiteroles au Chocolat",
            description: "Choux pastry puffs filled with vanilla cream and chocolate sauce",
            cuisine: "French",
            ingredients: [
              { name: "pâte à choux", amount: "1", unit: "batch", category: "pastry" },
              { name: "crème pâtissière", amount: "500", unit: "ml", category: "filling" },
              { name: "chocolat noir", amount: "200", unit: "g", category: "chocolate" },
              { name: "crème liquide", amount: "200", unit: "ml", category: "dairy" },
              { name: "sucre", amount: "50", unit: "g", category: "sweetener" }
            ],
            nutrition: {
              calories: 450,
              protein: 8,
              carbs: 48,
              fat: 26,
              vitamins: ["A", "D"],
              minerals: ["Calcium", "Iron"]
            },
            timeToMake: "120 minutes",
            season: ["all"],
            mealType: ["dessert"],
            elementalProperties: {
              Air: 0.4,
              Earth: 0.3,
              Water: 0.2,
              Fire: 0.1
            }
          }
        ],
        summer: [
          {
            name: "Tarte aux Fruits Rouges",
            description: "Fresh berry tart with crème pâtissière",
            cuisine: "French",
            ingredients: [
              { name: "pâte sucrée", amount: "1", unit: "piece", category: "pastry" },
              { name: "fruits rouges assortis", amount: "500", unit: "g", category: "fruit" },
              { name: "crème pâtissière", amount: "500", unit: "ml", category: "filling" },
              { name: "gelée de fruits", amount: "100", unit: "g", category: "glaze" }
            ],
            nutrition: {
              calories: 320,
              protein: 6,
              carbs: 52,
              fat: 12,
              vitamins: ["C", "A"],
              minerals: ["Potassium"]
            },
            timeToMake: "90 minutes",
            season: ["summer"],
            mealType: ["dessert"],
            elementalProperties: {
              Water: 0.4,
              Earth: 0.3,
              Air: 0.2,
              Fire: 0.1
            }
          }
        ]
      }
    },
    elementalBalance: {
      Fire: 0.2,
      Water: 0.2,
      Air: 0.1,
      Earth: 0.3
    }
  }
};