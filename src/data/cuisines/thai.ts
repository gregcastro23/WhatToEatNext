// src/data/cuisines/thai.ts
import type { Cuisine } from "@/types/cuisine";

export const thai: Cuisine = {
  id: "thai",
  name: "Thai",
  description:
    "Traditional Thai cuisine featuring complex harmony of flavors including spicy, sweet, sour and salty elements",
  dishes: {
    breakfast: {
      all: [
        {
          "name": "Authentic Thai Jok (Congee)",
          "description": "A deeply comforting and restorative rice porridge, fundamentally rooted in Thai breakfast culture. Jok represents the harmonious alchemy of broken jasmine rice simmered into a silky suspension, enriched with deeply savory pork meatballs, warming ginger, and a suspended soft-boiled egg. It is a dish that grounds the spirit and warms the core.",
          "details": {
            "cuisine": "Thai",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 60,
            "baseServingSize": 2,
            "spiceLevel": "Mild",
            "season": [
              "all",
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "cup",
              "name": "jasmine rice",
              "notes": "Ideally broken jasmine rice. If using whole, briefly pulse in a food processor or soak overnight to encourage structural breakdown."
            },
            {
              "amount": 8,
              "unit": "cups",
              "name": "pork or chicken bone broth",
              "notes": "The foundation of the porridge's flavor; unsalted if possible to control final sodium levels."
            },
            {
              "amount": 200,
              "unit": "g",
              "name": "ground pork",
              "notes": "Not too lean; a 80/20 ratio ensures tender meatballs."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "light soy sauce",
              "notes": "For seasoning the pork meatballs."
            },
            {
              "amount": 0.5,
              "unit": "tbsp",
              "name": "oyster sauce",
              "notes": "Adds umami depth to the pork."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "granulated sugar",
              "notes": "Balances the savory notes in the pork."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "ground white pepper",
              "notes": "Essential for the authentic, slightly floral heat. Divided: half for pork, half for garnishing."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "eggs",
              "notes": "Soft-boiled to a jammy yolk, or cracked raw directly into the boiling hot porridge upon serving."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "fresh ginger",
              "notes": "Peeled and very finely julienned (matchsticks)."
            },
            {
              "amount": 4,
              "unit": "stalks",
              "name": "green onions",
              "notes": "Finely sliced for garnish."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh cilantro",
              "notes": "Roughly chopped for garnish."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "fried garlic",
              "notes": "Crispy fried garlic bits in oil."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "seasoning sauce (Maggi) or light soy sauce",
              "notes": "For individual seasoning at the table."
            }
          ],
          "instructions": [
            "Step 1: Rinse the jasmine rice under cold water just until the water runs mostly clear. If using whole jasmine rice, place it in a mortar and pestle or food processor and briefly crack the grains to release their starches more readily.",
            "Step 2: In a large, heavy-bottomed pot, combine the cracked rice and the bone broth. Bring to a rolling boil over medium-high heat. Once boiling, immediately reduce the heat to a low simmer.",
            "Step 3: Simmer the rice uncovered for 45 to 60 minutes, stirring frequently (especially towards the end) to prevent the starches from scorching on the bottom of the pot. The porridge is ready when the grains have completely broken down into a thick, silky, homogenous suspension.",
            "Step 4: While the porridge simmers, prepare the pork meatballs. In a mixing bowl, combine the ground pork, 1 tablespoon light soy sauce, oyster sauce, sugar, and half of the white pepper. Mix vigorously by hand in one direction for 2-3 minutes until the mixture becomes sticky and cohesive.",
            "Step 5: Prepare the soft-boiled eggs. Bring a small saucepan of water to a boil. Gently lower the eggs into the water and boil for exactly 6 minutes for a jammy yolk. Transfer immediately to an ice bath, then peel.",
            "Step 6: When the porridge has reached the correct silky consistency, form the seasoned pork mixture into small, bite-sized meatballs (about 1 teaspoon each) and drop them directly into the simmering porridge.",
            "Step 7: Allow the meatballs to poach gently in the porridge for 3 to 5 minutes, or until they float and are cooked through. Adjust the consistency of the porridge with hot water if it has become too thick.",
            "Step 8: To serve, ladle the steaming hot porridge and meatballs into deep bowls. Halve a soft-boiled egg and place it in the center (or crack a raw egg into the very hot porridge).",
            "Step 9: Garnish generously with the julienned ginger, sliced green onions, cilantro, and crispy fried garlic. Serve immediately, allowing each person to season their bowl with additional white pepper and Maggi seasoning or light soy sauce to taste."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "comfort food"
            ],
            "cookingMethods": [
              "simmering",
              "poaching",
              "boiling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.15,
            "Water": 0.6,
            "Earth": 0.2,
            "Air": 0.05
          },
          "astrologicalAffinities": {
            "planets": [
              "Moon",
              "Venus"
            ],
            "signs": [
              "Cancer",
              "Taurus"
            ],
            "lunarPhases": [
              "New Moon",
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 450,
            "proteinG": 28,
            "carbsG": 48,
            "fatG": 16,
            "fiberG": 2,
              "sodiumMg": 433,
              "sugarG": 14,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": [
            {
              "originalIngredient": "ground pork",
              "substituteOptions": [
                "minced shiitake mushrooms (vegan)",
                "ground chicken",
                "crumbled firm tofu"
              ]
            },
            {
              "originalIngredient": "pork or chicken bone broth",
              "substituteOptions": [
                "kombu and shiitake dashi (vegan)",
                "vegetable stock"
              ]
            },
            {
              "originalIngredient": "eggs",
              "substituteOptions": [
                "silken tofu pieces (vegan)"
              ]
            }
          ]
        },
        {
          name: "Khao Tom",
          description: "A profound alchemical execution of Khao Tom, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Khao Tom","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Khao Tom","substituteOptions":["Elemental equivalent"]}]
        },
        {
          name: "Patongo with Sangkaya",
          description: "A profound alchemical execution of Patongo with Sangkaya, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Patongo with Sangkaya","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Patongo with Sangkaya","substituteOptions":["Elemental equivalent"]}]
        },
        {
          name: "Khao Kai Jeow",
          description: "A profound alchemical execution of Khao Kai Jeow, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Khao Kai Jeow","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Khao Kai Jeow","substituteOptions":["Elemental equivalent"]}]
        },
        {
          name: "Khao Tom Moo",
          description: "A profound alchemical execution of Khao Tom Moo, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Khao Tom Moo","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Khao Tom Moo","substituteOptions":["Elemental equivalent"]}]
        },
      ],
    },
    lunch: {
      all: [
        {
          name: "Pad Kra Pao",
          description: "A profound alchemical execution of Pad Kra Pao, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Pad Kra Pao","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Pad Kra Pao","substituteOptions":["Elemental equivalent"]}]
        },
        {
          name: "Khao Soi",
          description: "A profound alchemical execution of Khao Soi, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Khao Soi","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Khao Soi","substituteOptions":["Elemental equivalent"]}]
        },
        {
          "name": "Authentic Som Tam",
          "description": "An explosive study in the Thai concept of 'Rot Chat'.",
          "details": {
            "cuisine": "Thai",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 0,
            "baseServingSize": 2,
            "spiceLevel": "Fiery",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 2.5,
              "unit": "cups",
              "name": "green papaya",
              "notes": "Shredded."
            }
          ],
          "instructions": [
            "Step 1: Pound garlic and chilies.",
            "Step 2: Bruise beans and tomatoes.",
            "Step 3: Toss papaya."
          ],
          "classifications": {
            "mealType": [
              "salad"
            ],
            "cookingMethods": [
              "pounding"
            ]
          },
          "elementalProperties": {
            "Fire": 0.35,
            "Water": 0.25,
            "Earth": 0.2,
            "Air": 0.2
          },
          "astrologicalAffinities": {
            "planets": [
              "Mars"
            ],
            "signs": [
              "Aries"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 180,
            "proteinG": 6,
            "carbsG": 28,
            "fatG": 7,
            "fiberG": 5,
              "sodiumMg": 530,
              "sugarG": 15,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
        {
          "name": "Authentic Tom Yum Goong",
          "description": "An explosive study in Thai flavor balancing.",
          "details": {
            "cuisine": "Thai",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 15,
            "baseServingSize": 4,
            "spiceLevel": "Hot",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "prawns",
              "notes": "Peeled."
            }
          ],
          "instructions": [
            "Step 1: Infuse broth.",
            "Step 2: Cook prawns.",
            "Step 3: Add lime juice off heat."
          ],
          "classifications": {
            "mealType": [
              "soup"
            ],
            "cookingMethods": [
              "boiling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.5,
            "Water": 0.35,
            "Earth": 0.05,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Mars"
            ],
            "signs": [
              "Aries"
            ],
            "lunarPhases": [
              "New Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 220,
            "proteinG": 25,
            "carbsG": 12,
            "fatG": 8,
            "fiberG": 2,
              "sodiumMg": 402,
              "sugarG": 12,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
        {
          name: "Yum Woon Sen",
          description: "A profound alchemical execution of Yum Woon Sen, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Yum Woon Sen","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Yum Woon Sen","substituteOptions":["Elemental equivalent"]}]
        },
      ],
      summer: [
        {
          name: "Som Tam Thai",
          description: "A profound alchemical execution of Som Tam Thai, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Som Tam Thai","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Som Tam Thai","substituteOptions":["Elemental equivalent"]}]
        },
      ],
      winter: [
        {
          name: "Khao Kha Moo",
          description: "A profound alchemical execution of Khao Kha Moo, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Khao Kha Moo","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Khao Kha Moo","substituteOptions":["Elemental equivalent"]}]
        },
        {
          name: "Tom Kha Gai",
          description: "A profound alchemical execution of Tom Kha Gai, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Tom Kha Gai","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Tom Kha Gai","substituteOptions":["Elemental equivalent"]}]
        },
        {
          name: "Kuay Teow Reua",
          description: "A profound alchemical execution of Kuay Teow Reua, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Kuay Teow Reua","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Kuay Teow Reua","substituteOptions":["Elemental equivalent"]}]
        },
      ],
    },
    dinner: {
      all: [
        {
          "name": "Authentic Pad Thai",
          "description": "A masterclass in high-heat wok hei and rapid assembly.",
          "details": {
            "cuisine": "Thai",
            "prepTimeMinutes": 30,
            "cookTimeMinutes": 10,
            "baseServingSize": 2,
            "spiceLevel": "Mild",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 200,
              "unit": "g",
              "name": "rice noodles",
              "notes": "Soaked, not boiled."
            }
          ],
          "instructions": [
            "Step 1: Soak noodles.",
            "Step 2: Make tamarind sauce.",
            "Step 3: Stir fry quickly in wok."
          ],
          "classifications": {
            "mealType": [
              "lunch"
            ],
            "cookingMethods": [
              "stir-frying"
            ]
          },
          "elementalProperties": {
            "Fire": 0.35,
            "Water": 0.15,
            "Earth": 0.25,
            "Air": 0.25
          },
          "astrologicalAffinities": {
            "planets": [
              "Mercury"
            ],
            "signs": [
              "Gemini"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 550,
            "proteinG": 18,
            "carbsG": 75,
            "fatG": 22,
            "fiberG": 5,
              "sodiumMg": 422,
              "sugarG": 9,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
        {
          name: "Pad Krapow Moo",
          description: "The street food engine of Thailand. A violently hot, rapid stir-fry of minced pork infused with the anise-like sting of holy basil (krapow), served over rice and crowned with a brutally fried egg (khai dao).",
          details: {"cuisine":"Thai","prepTimeMinutes":10,"cookTimeMinutes":5,"baseServingSize":2,"spiceLevel":"Very High","season":["all"]},
          ingredients: [{"amount":1,"unit":"lb","name":"Minced pork","notes":"Must be coarsely ground with fat."},{"amount":2,"unit":"cups","name":"Holy basil leaves","notes":"Krapow. Do not substitute with Thai sweet basil."},{"amount":5,"unit":"cloves","name":"Garlic","notes":"Pounded in a mortar."},{"amount":5,"unit":"whole","name":"Bird's eye chilies","notes":"Pounded with the garlic."},{"amount":1,"unit":"tbsp","name":"Oyster sauce","notes":"For gloss and deep umami."},{"amount":1,"unit":"tbsp","name":"Dark soy sauce","notes":"For color and sweetness."},{"amount":1,"unit":"tbsp","name":"Fish sauce","notes":"For salinity."},{"amount":2,"unit":"large","name":"Eggs","notes":"Fried in a lake of oil."}],
          instructions: ["Step 1: The Aromatic Paste. In a mortar and pestle, aggressively pound the garlic and chilies into a coarse, wet paste. This releases the essential oils that slicing cannot achieve.","Step 2: The Sear. Heat a wok until it is smoking. Add oil and the garlic-chili paste. Fry for exactly 10 seconds until violently fragrant (do not burn).","Step 3: The Meat. Add the minced pork. Toss aggressively, breaking it apart, until it is just cooked through and begins to caramelize in its own fat.","Step 4: The Glaze. Add the oyster sauce, dark soy sauce, fish sauce, and a pinch of sugar. Toss until the meat is entirely coated in a dark, sticky glaze.","Step 5: The Basil Flash. Turn off the heat. Immediately throw in the massive pile of holy basil leaves. Toss once; the residual heat will instantly wilt them, preserving their delicate, pepper-anise aroma. Serve over rice with a deep-fried egg with a liquid yolk."],
          classifications: {"mealType":["lunch","dinner"],"cookingMethods":["stir-frying","pounding"]},
          elementalProperties: {"Fire":0.55,"Water":0.05,"Earth":0.25,"Air":0.15},
          astrologicalAffinities: {"planets":["Mars","Sun"],"signs":["aries","gemini"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":520,"proteinG":32,"carbsG":8,"fatG":38,"fiberG":1,"sodiumMg":1100,"sugarG":4,"vitamins":["Vitamin B6","Niacin"],"minerals":["Zinc","Iron"]},
          substitutions: [{"originalIngredient":"Holy basil","substituteOptions":["Thai sweet basil (though structurally incorrect, it is common)"]}]
        },
        {
          name: "Pla Neung Manao",
          description: "A triumph of acidic and aromatic poaching. A whole fish is steamed rapidly to retain absolute moisture, then drowned in a bracing, fiercely sour, garlic-and-chili-laden lime broth.",
          details: {"cuisine":"Thai","prepTimeMinutes":15,"cookTimeMinutes":15,"baseServingSize":2,"spiceLevel":"High","season":["summer"]},
          ingredients: [{"amount":1,"unit":"whole","name":"White fish","notes":"Sea bass or snapper, scaled and gutted."},{"amount":3,"unit":"stalks","name":"Lemongrass","notes":"Bruised, stuffed inside the fish."},{"amount":0.5,"unit":"cup","name":"Lime juice","notes":"Freshly squeezed."},{"amount":3,"unit":"tbsp","name":"Fish sauce","notes":"For salinity."},{"amount":1,"unit":"tbsp","name":"Palm sugar","notes":"To round out the acid."},{"amount":10,"unit":"cloves","name":"Garlic","notes":"Finely minced."},{"amount":5,"unit":"whole","name":"Bird's eye chilies","notes":"Finely sliced."},{"amount":1,"unit":"bunch","name":"Cilantro","notes":"Chopped."}],
          instructions: ["Step 1: The Preparation. Score the thickest part of the fish deeply on both sides. Stuff the cavity with the bruised lemongrass stalks to perfume the flesh from the inside out.","Step 2: The Steam. Place the fish on a heatproof plate that will fit inside a steamer. Steam over aggressively boiling water for 10-15 minutes until the flesh turns opaque and flakes easily at the spine.","Step 3: The Broth. While the fish steams, whisk together the fresh lime juice, fish sauce, dissolved palm sugar, massive quantities of minced garlic, and sliced chilies. The dressing must be intensely sour, salty, and spicy.","Step 4: The Drowning. Carefully remove the plate with the cooked fish from the steamer (retain the juices that pooled on the plate). Immediately pour the cold, vibrant lime broth entirely over the hot fish.","Step 5: The Garnish. Top generously with chopped cilantro. Place the plate over a small burner at the table to keep the broth simmering while eating."],
          classifications: {"mealType":["dinner","celebration"],"cookingMethods":["steaming"]},
          elementalProperties: {"Fire":0.3,"Water":0.5,"Earth":0.1,"Air":0.1},
          astrologicalAffinities: {"planets":["Neptune","Mercury"],"signs":["pisces","virgo"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":280,"proteinG":45,"carbsG":12,"fatG":4,"fiberG":1,"sodiumMg":1500,"sugarG":8,"vitamins":["Vitamin C","Vitamin B12"],"minerals":["Selenium","Potassium"]},
          substitutions: [{"originalIngredient":"Whole fish","substituteOptions":["Fish fillets (reduce steaming time)"]}]
        },
      ],
      summer: [
        {
          name: "Nam Kang Sai",
          description: "The structural opposite of hot and heavy. A violently cooling Thai dessert consisting of fiercely crushed ice piled over a customizable matrix of jellies, sweet beans, and syrups, flooded with condensed milk.",
          details: {"cuisine":"Thai","prepTimeMinutes":10,"cookTimeMinutes":0,"baseServingSize":1,"spiceLevel":"None","season":["summer"]},
          ingredients: [{"amount":2,"unit":"cups","name":"Ice","notes":"Must be finely shaved or crushed into snow."},{"amount":0.5,"unit":"cup","name":"Toppings matrix","notes":"Red beans, grass jelly, sweet corn, attap seeds."},{"amount":3,"unit":"tbsp","name":"Hale's Blue Boy syrup","notes":"Iconic sweet, floral, bright red or green syrup."},{"amount":2,"unit":"tbsp","name":"Evaporated milk","notes":"For richness."},{"amount":1,"unit":"tbsp","name":"Sweetened condensed milk","notes":"For density and sweetness."}],
          instructions: ["Step 1: The Base. In the bottom of a wide bowl, arrange the chosen heavy toppings (sweet red beans, jellies, corn).","Step 2: The Mountain. Shave the ice directly over the toppings, forming a high, structured mountain. The ice must be fine enough to absorb syrup but granular enough not to instantly melt.","Step 3: The Saturation. Vigorously drench the ice mountain with the brightly colored, floral syrup. The ice will instantly absorb the color.","Step 4: The Emulsion. Pour the evaporated milk and a heavy drizzle of sweetened condensed milk over the top. The milk will streak down the sides, creating a visual marbling effect.","Step 5: The Collapse. Serve immediately with a spoon. As it is eaten, the ice collapses into the sweet milks and toppings, creating a cold, slushy soup."],
          classifications: {"mealType":["dessert","snack","beverage"],"cookingMethods":["shaving ice","assembling"]},
          elementalProperties: {"Fire":0,"Water":0.7,"Earth":0.15,"Air":0.15},
          astrologicalAffinities: {"planets":["Moon","Neptune"],"signs":["cancer","pisces"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":250,"proteinG":4,"carbsG":55,"fatG":4,"fiberG":2,"sodiumMg":80,"sugarG":45,"vitamins":["Calcium"],"minerals":["Phosphorus"]},
          substitutions: [{"originalIngredient":"Hale's Blue Boy","substituteOptions":["Any highly concentrated fruit syrup"]}]
        },
        {
          name: "Yum Woon Sen",
          description: "A highly kinetic glass noodle salad. It relies on the absolute absorption capabilities of mung bean threads to hold a fiercely sour, spicy, and savory dressing, studded with blanched seafood and sharp aromatics.",
          details: {"cuisine":"Thai","prepTimeMinutes":15,"cookTimeMinutes":5,"baseServingSize":2,"spiceLevel":"High","season":["summer","spring"]},
          ingredients: [{"amount":100,"unit":"g","name":"Glass noodles (Woon Sen)","notes":"Mung bean threads, soaked in cold water."},{"amount":0.5,"unit":"lb","name":"Shrimp and minced pork","notes":"The dual protein base."},{"amount":3,"unit":"tbsp","name":"Lime juice","notes":"Fresh."},{"amount":2,"unit":"tbsp","name":"Fish sauce","notes":"For umami."},{"amount":1,"unit":"tbsp","name":"Palm sugar","notes":"Dissolved."},{"amount":3,"unit":"whole","name":"Bird's eye chilies","notes":"Pounded."},{"amount":0.5,"unit":"cup","name":"Chinese celery and cilantro","notes":"Roughly chopped."},{"amount":0.5,"unit":"whole","name":"Red onion","notes":"Sliced thinly."},{"amount":2,"unit":"tbsp","name":"Roasted peanuts","notes":"For crunch."}],
          instructions: ["Step 1: The Dressing Matrix. In a large mixing bowl, whisk together the lime juice, fish sauce, palm sugar, and pounded chilies until the sugar is completely dissolved into a sharp, balanced elixir.","Step 2: The Protein Poach. Bring a pot of water to a boil. Briefly blanch the shrimp until just pink. In a separate pan with a tiny splash of water, cook the minced pork until it turns white. Add both hot proteins (and the small amount of pork broth) to the dressing.","Step 3: The Noodle Shock. Drop the soaked glass noodles into boiling water for exactly 2 minutes until translucent. Drain well and immediately add them to the bowl while blazing hot.","Step 4: The Absorption. Toss the hot noodles and proteins aggressively in the dressing. The heat of the noodles will instantly absorb the liquid matrix.","Step 5: The Aromatics. Fold in the red onion, Chinese celery, and cilantro. Top with roasted peanuts. Serve warm or at room temperature."],
          classifications: {"mealType":["appetizer","lunch"],"cookingMethods":["blanching","mixing"]},
          elementalProperties: {"Fire":0.35,"Water":0.4,"Earth":0.15,"Air":0.1},
          astrologicalAffinities: {"planets":["Mercury","Uranus"],"signs":["gemini","aquarius"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":320,"proteinG":22,"carbsG":45,"fatG":8,"fiberG":2,"sodiumMg":1200,"sugarG":12,"vitamins":["Vitamin C","Niacin"],"minerals":["Selenium","Zinc"]},
          substitutions: [{"originalIngredient":"Minced pork","substituteOptions":["Minced chicken","More seafood"]}]
        },
      ],
      winter: [
        {
          name: "Gaeng Massaman Neua",
          description: "The most complex of Thai curries, bearing deep Persian and Indian influence. Heavy, warm spices (cardamom, cinnamon) are pounded into a paste, then slowly braised with beef and potatoes in a violently rich, peanut-laced coconut cream.",
          details: {"cuisine":"Thai","prepTimeMinutes":30,"cookTimeMinutes":120,"baseServingSize":4,"spiceLevel":"Mild","season":["winter","autumn"]},
          ingredients: [{"amount":1.5,"unit":"lbs","name":"Beef chuck","notes":"Cut into large cubes for slow braising."},{"amount":4,"unit":"tbsp","name":"Massaman curry paste","notes":"A heavy, spice-driven paste."},{"amount":2,"unit":"cups","name":"Coconut milk","notes":"Separated into thick cream and thin milk."},{"amount":2,"unit":"whole","name":"Potatoes","notes":"Cut into large chunks."},{"amount":1,"unit":"whole","name":"Onion","notes":"Cut into wedges."},{"amount":0.25,"unit":"cup","name":"Roasted peanuts","notes":"Whole."},{"amount":3,"unit":"tbsp","name":"Tamarind paste","notes":"For deep, fruity sweetness."},{"amount":2,"unit":"tbsp","name":"Fish sauce","notes":"For salinity."},{"amount":1,"unit":"whole","name":"Cinnamon stick & Star anise","notes":"Whole spices."}],
          instructions: ["Step 1: The Meat Braise. Simmer the beef chunks in the thin portion of the coconut milk with water for 1.5 hours until tender. This creates a fortified beef-coconut stock.","Step 2: The Oil Separation (Keeo Gati). In a separate heavy pot, heat the thick coconut cream over medium heat. Simmer until the water evaporates and the pure coconut oil violently separates and 'cracks' from the white solids.","Step 3: The Paste Frying. Add the massaman curry paste to the cracked coconut oil. Fry aggressively until it darkens and emits an incredibly rich, spiced aroma.","Step 4: The Unification. Transfer the braised beef and its cooking liquid into the fried paste. Add the potatoes, onions, peanuts, and whole spices. Bring to a gentle simmer.","Step 5: The Balance. Season with tamarind paste, fish sauce, and palm sugar. The resulting sauce must be thick, oily, and fiercely balanced between sweet, savory, and aromatic. Simmer until the potatoes are soft. Serve with rice."],
          classifications: {"mealType":["dinner","comfort"],"cookingMethods":["braising","paste frying"]},
          elementalProperties: {"Fire":0.2,"Water":0.25,"Earth":0.45,"Air":0.1},
          astrologicalAffinities: {"planets":["Jupiter","Saturn"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":650,"proteinG":38,"carbsG":28,"fatG":45,"fiberG":5,"sodiumMg":950,"sugarG":14,"vitamins":["Iron","Vitamin B12"],"minerals":["Zinc","Potassium"]},
          substitutions: [{"originalIngredient":"Beef chuck","substituteOptions":["Chicken thighs (reduce braise time)"]}]
        },
        {
          name: "Tom Yum Goong Nam Khon",
          description: "The creamy version of the iconic Thai soup. It balances violent chili heat and sharp lime acidity with the intense aromatics of galangal and makrut lime leaf, bound together by a lush emulsion of evaporated milk and chili jam.",
          details: {"cuisine":"Thai","prepTimeMinutes":15,"cookTimeMinutes":15,"baseServingSize":2,"spiceLevel":"Very High","season":["all"]},
          ingredients: [{"amount":3,"unit":"cups","name":"Shrimp stock or water","notes":"Ideally made from the shrimp shells."},{"amount":0.5,"unit":"lb","name":"Large shrimp","notes":"Peeled, tails left on."},{"amount":2,"unit":"stalks","name":"Lemongrass","notes":"Bruised and cut into 2-inch pieces."},{"amount":5,"unit":"slices","name":"Galangal","notes":"Fresh, do not substitute ginger."},{"amount":5,"unit":"leaves","name":"Makrut lime leaves","notes":"Torn to release oils."},{"amount":1,"unit":"cup","name":"Oyster or straw mushrooms","notes":"Torn."},{"amount":2,"unit":"tbsp","name":"Nam Prik Pao","notes":"Thai roasted chili jam."},{"amount":0.25,"unit":"cup","name":"Evaporated milk","notes":"Creates the 'Nam Khon' (creamy) texture."},{"amount":3,"unit":"tbsp","name":"Lime juice","notes":"Added off heat."},{"amount":2,"unit":"tbsp","name":"Fish sauce","notes":"Added off heat."}],
          instructions: ["Step 1: The Aromatic Infusion. Bring the stock to a rolling boil. Add the bruised lemongrass, galangal slices, and torn makrut lime leaves. Boil aggressively for 5 minutes to extract their intense essential oils into the water. The kitchen will become fiercely fragrant.","Step 2: The Mushrooms. Add the mushrooms and boil for 2 minutes until tender.","Step 3: The Emulsion. Stir in the Nam Prik Pao (chili jam) and the evaporated milk. The broth will turn a vibrant, opaque, oily orange.","Step 4: The Poach. Add the shrimp. Cook for exactly 1-2 minutes until they just turn pink and curl. Turn off the heat immediately. Do not boil the shrimp further.","Step 5: The Acid Finish. Off the heat, stir in the fish sauce and fresh lime juice. (Boiling lime juice destroys its brightness and turns it bitter). Taste and adjust; it should be sour, salty, spicy, and creamy all at once. Top with cilantro."],
          classifications: {"mealType":["soup","dinner"],"cookingMethods":["infusing","boiling","poaching"]},
          elementalProperties: {"Fire":0.4,"Water":0.4,"Earth":0.1,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Neptune"],"signs":["aries","pisces"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":280,"proteinG":24,"carbsG":12,"fatG":14,"fiberG":2,"sodiumMg":1400,"sugarG":6,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Selenium","Iodine"]},
          substitutions: [{"originalIngredient":"Evaporated milk","substituteOptions":["Coconut milk (for a different variation)"]}]
        },
        {
          name: "Gaeng Panang Neua",
          description: "An alchemically precise execution of Gaeng Panang Neua, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Gaeng Panang Neua","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},
          substitutions: [{"originalIngredient":"Foundation of Gaeng Panang Neua","substituteOptions":["Alternate protein or vegetable"]}]
        },
        {
          name: "Khao Soi Gai",
          description: "An alchemically precise execution of Khao Soi Gai, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Khao Soi Gai","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},
          substitutions: [{"originalIngredient":"Foundation of Khao Soi Gai","substituteOptions":["Alternate protein or vegetable"]}]
        },
      ],
    },
    dessert: {
      all: [
        {
          name: "Khao Niao Mamuang",
          description: "An alchemically precise execution of Khao Niao Mamuang, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Khao Niao Mamuang","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},
          substitutions: [{"originalIngredient":"Foundation of Khao Niao Mamuang","substituteOptions":["Alternate protein or vegetable"]}]
        },
        {
          name: "Tub Tim Grob",
          description: "An alchemically precise execution of Tub Tim Grob, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Tub Tim Grob","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},
          substitutions: [{"originalIngredient":"Foundation of Tub Tim Grob","substituteOptions":["Alternate protein or vegetable"]}]
        },
        {
          name: "Bua Loi",
          description: "An alchemically precise execution of Bua Loi, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Bua Loi","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},
          substitutions: [{"originalIngredient":"Foundation of Bua Loi","substituteOptions":["Alternate protein or vegetable"]}]
        },
        {
          name: "Sangkaya Fak Thong",
          description: "An alchemically precise execution of Sangkaya Fak Thong, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Sangkaya Fak Thong","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},
          substitutions: [{"originalIngredient":"Foundation of Sangkaya Fak Thong","substituteOptions":["Alternate protein or vegetable"]}]
        },
      ],
      summer: [
        {
          name: "Nam Kang Sai",
          description: "The structural opposite of hot and heavy. A violently cooling Thai dessert consisting of fiercely crushed ice piled over a customizable matrix of jellies, sweet beans, and syrups, flooded with condensed milk.",
          details: {"cuisine":"Thai","prepTimeMinutes":10,"cookTimeMinutes":0,"baseServingSize":1,"spiceLevel":"None","season":["summer"]},
          ingredients: [{"amount":2,"unit":"cups","name":"Ice","notes":"Must be finely shaved or crushed into snow."},{"amount":0.5,"unit":"cup","name":"Toppings matrix","notes":"Red beans, grass jelly, sweet corn, attap seeds."},{"amount":3,"unit":"tbsp","name":"Hale's Blue Boy syrup","notes":"Iconic sweet, floral, bright red or green syrup."},{"amount":2,"unit":"tbsp","name":"Evaporated milk","notes":"For richness."},{"amount":1,"unit":"tbsp","name":"Sweetened condensed milk","notes":"For density and sweetness."}],
          instructions: ["Step 1: The Base. In the bottom of a wide bowl, arrange the chosen heavy toppings (sweet red beans, jellies, corn).","Step 2: The Mountain. Shave the ice directly over the toppings, forming a high, structured mountain. The ice must be fine enough to absorb syrup but granular enough not to instantly melt.","Step 3: The Saturation. Vigorously drench the ice mountain with the brightly colored, floral syrup. The ice will instantly absorb the color.","Step 4: The Emulsion. Pour the evaporated milk and a heavy drizzle of sweetened condensed milk over the top. The milk will streak down the sides, creating a visual marbling effect.","Step 5: The Collapse. Serve immediately with a spoon. As it is eaten, the ice collapses into the sweet milks and toppings, creating a cold, slushy soup."],
          classifications: {"mealType":["dessert","snack","beverage"],"cookingMethods":["shaving ice","assembling"]},
          elementalProperties: {"Fire":0,"Water":0.7,"Earth":0.15,"Air":0.15},
          astrologicalAffinities: {"planets":["Moon","Neptune"],"signs":["cancer","pisces"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":250,"proteinG":4,"carbsG":55,"fatG":4,"fiberG":2,"sodiumMg":80,"sugarG":45,"vitamins":["Calcium"],"minerals":["Phosphorus"]},
          substitutions: [{"originalIngredient":"Hale's Blue Boy","substituteOptions":["Any highly concentrated fruit syrup"]}]
        },
      ],
    },
    snacks: {
      all: [
        {
          name: "Kluay Tod",
          description: "An alchemically precise execution of Kluay Tod, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Kluay Tod","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},
          substitutions: [{"originalIngredient":"Foundation of Kluay Tod","substituteOptions":["Alternate protein or vegetable"]}]
        },
      ],
    },
  },
  traditionalSauces: {
    namPlaWaan: {
      name: "Nam Pla Wan (Sweet Fish Sauce)",
      description:
        "Sweet, spicy, and salty sauce combining fish sauce with palm sugar and chili",
      base: "fish sauce",
      keyIngredients: [
        "fish sauce",
        "palm sugar",
        "lime juice",
        "garlic",
        "chili",
      ],
      culinaryUses: [
        "dipping sauce",
        "dressing",
        "flavor base",
        "marinade",
        "condiment",
      ],
      variants: [
        "Nam Jim seafood",
        "Nam Jim Jaew",
        "Nam Jim Gai",
        "Spicy version",
        "Mild version",
      ],
      elementalProperties: {
        Water: 0.4,
        Fire: 0.3,
        Earth: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Neptune", "Mars", "Pisces"],
      seasonality: "all",
      preparationNotes:
        "Balance is key - should achieve equal sweet, sour, and salty notes with heat according to preference",
      technicalTips:
        "Palm sugar can be melted with a little water to help it dissolve more easily",
    },
    namPhrik: {
      name: "Nam Phrik (Chili Paste)",
      description:
        "Foundation of Thai cuisine, a versatile chili-based paste with regional variations",
      base: "chili peppers",
      keyIngredients: [
        "chili peppers",
        "garlic",
        "shallots",
        "fermented shrimp paste",
        "lime juice",
      ],
      culinaryUses: [
        "flavor base",
        "dipping sauce",
        "stir-fry paste",
        "marinade",
        "soup enhancer",
      ],
      variants: [
        "Nam Phrik Num",
        "Nam Phrik Ong",
        "Nam Phrik Kapi",
        "Nam Phrik Pao",
        "Nam Phrik Narok",
      ],
      elementalProperties: {
        Fire: 0.6,
        Earth: 0.2,
        Water: 0.1,
        Air: 0.1,
      },
      astrologicalInfluences: ["Mars", "Sun", "Aries"],
      seasonality: "all",
      preparationNotes:
        "Traditional preparation involves pounding in a mortar and pestle to develop complex flavors",
      technicalTips:
        "Roasting ingredients before pounding enhances aroma and reduces raw spiciness",
    },
    padThaiSauce: {
      name: "Pad Thai Sauce",
      description:
        "Sweet-sour-salty sauce that defines Thailand's most famous noodle dish",
      base: "tamarind paste",
      keyIngredients: [
        "tamarind paste",
        "fish sauce",
        "palm sugar",
        "rice vinegar",
        "preserved radish",
      ],
      culinaryUses: [
        "noodle sauce",
        "stir-fry sauce",
        "marinade",
        "dressing",
        "glaze",
      ],
      variants: [
        "Traditional",
        "Vegetarian/Vegan",
        "Spicy",
        "Royal-style",
        "Street vendor style",
      ],
      elementalProperties: {
        Earth: 0.4,
        Water: 0.3,
        Fire: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Venus", "Mercury", "Taurus"],
      seasonality: "all",
      preparationNotes:
        "Balance of sour from tamarind, sweet from palm sugar, and salty from fish sauce is crucial",
      technicalTips:
        "Prepare in advance and reduce to concentrate flavors before adding to noodles",
    },
    currySauces: {
      name: "Curry Pastes/Sauces",
      description:
        "Aromatic spice and herb pastes that form the foundation of Thai curries",
      base: "chilies and aromatics",
      keyIngredients: [
        "chilies",
        "galangal",
        "lemongrass",
        "kaffir lime",
        "shallots",
        "garlic",
        "shrimp paste",
      ],
      culinaryUses: [
        "curry base",
        "stir-fry paste",
        "marinade",
        "flavor enhancer",
        "soup base",
      ],
      variants: [
        "Green (Kaeng Khiao Wan)",
        "Red (Kaeng Phet)",
        "Yellow (Kaeng Kari)",
        "Massaman",
        "Panang",
      ],
      elementalProperties: {
        Fire: 0.4,
        Earth: 0.3,
        Water: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Mars", "Jupiter", "Leo"],
      seasonality: "all",
      preparationNotes:
        "Traditional preparation requires significant time pounding ingredients to release oils and flavor compounds",
      technicalTips:
        "Fry paste in coconut cream (the thick part that rises to the top of coconut milk) until aromatic and oil separates",
    },
    srirachaSauce: {
      name: "Sriracha Sauce",
      description:
        "Fermented chili sauce with garlic and vinegar that has gained worldwide popularity",
      base: "fermented chili peppers",
      keyIngredients: [
        "red chili peppers",
        "garlic",
        "vinegar",
        "sugar",
        "salt",
      ],
      culinaryUses: [
        "condiment",
        "marinade component",
        "stir-fry addition",
        "dipping sauce",
        "flavor enhancer",
      ],
      variants: [
        "Original Thai style",
        "Vietnamese style",
        "American style",
        "Extra garlic",
        "Aged version",
      ],
      elementalProperties: {
        Fire: 0.5,
        Water: 0.2,
        Earth: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Mars", "Mercury", "Sagittarius"],
      seasonality: "all",
      preparationNotes:
        "Traditional Thai version is tangier and thinner than the popular American version",
      technicalTips:
        "Fermentation develops depth of flavor beyond simple chili heat",
    },
  },
  sauceRecommender: {
    forProtein: {
      chicken: [
        "nam jim gai",
        "green curry",
        "prik king",
        "pad thai sauce",
        "nam jim jaew",
      ],
      pork: [
        "nam phrik ong",
        "red curry",
        "nam jim jaew",
        "sweet soy glaze",
        "tamarind sauce",
      ],
      beef: [
        "nam tok dressing",
        "massaman curry",
        "nam jim jaew",
        "oyster sauce blend",
        "panang curry",
      ],
      seafood: [
        "seafood nam jim",
        "yellow curry",
        "lime-chili-garlic sauce",
        "sweet fish sauce",
        "green curry",
      ],
      tofu: [
        "peanut sauce",
        "massaman curry",
        "sweet soy glaze",
        "tamarind sauce",
        "red curry",
      ],
    },
    forVegetable: {
      leafy: [
        "nam jim",
        "sweet fish sauce",
        "sesame-soy dressing",
        "coconut-lime",
        "peanut sauce",
      ],
      root: [
        "naam phrik phao",
        "massaman curry",
        "ginger sauce",
        "tamarind glaze",
        "sweet fish sauce",
      ],
      fruiting: [
        "nam pla wan",
        "sriracha-lime",
        "sweet chili sauce",
        "nam phrik",
        "lime dressing",
      ],
      herbs: [
        "coconut milk",
        "simple fish sauce",
        "lime dressing",
        "chili oil",
        "garlic-pepper sauce",
      ],
      mushroom: [
        "oyster sauce blend",
        "nam prik pao",
        "golden mountain sauce",
        "black pepper sauce",
        "light soy",
      ],
    },
    forCookingMethod: {
      grilling: [
        "nam jim jaew",
        "nam jim seafood",
        "tamarind glaze",
        "sriracha marinade",
        "sweet fish sauce",
      ],
      stirFrying: [
        "pad thai sauce",
        "oyster sauce blend",
        "holy basil sauce",
        "black pepper sauce",
        "golden mountain",
      ],
      steaming: [
        "lime-garlic-chili",
        "ginger sauce",
        "soy-sesame",
        "nam jim",
        "seafood dipping sauce",
      ],
      currying: [
        "curry pastes with coconut milk",
        "massaman curry",
        "panang curry",
        "jungle curry",
        "khao soi",
      ],
      salads: [
        "som tam dressing",
        "yam dressing",
        "larb dressing",
        "nam tok",
        "plaa dressing",
      ],
    },
    byAstrological: {
      Fire: [
        "nam phrik",
        "jungle curry",
        "dried chili dip",
        "sriracha",
        "prik king",
      ],
      Water: [
        "green curry",
        "nam jim seafood",
        "coconut-based sauces",
        "fish sauce blends",
        "herb infusions",
      ],
      Earth: [
        "massaman curry",
        "peanut sauce",
        "tamarind-based sauces",
        "nam phrik ong",
        "sweet soy",
      ],
      Air: [
        "lime-based dressings",
        "herb-infused oils",
        "light nam pla prik",
        "citrus vinaigrettes",
        "lemongrass dips",
      ],
    },
    byRegion: {
      northern: [
        "nam phrik num",
        "nam phrik ong",
        "jaew bong",
        "sai ua paste",
        "hang lay curry",
      ],
      northeastern: [
        "nam jim jaew",
        "som tam sauce",
        "larb dressing",
        "fermented fish sauce",
        "tamarind dipping",
      ],
      central: [
        "green curry",
        "red curry",
        "nam prik kapi",
        "pad thai sauce",
        "sweet chili sauce",
      ],
      southern: [
        "southern curry paste",
        "khua kling paste",
        "nam phrik goong siap",
        "sator sauce",
        "gaeng tai pla",
      ],
    },
    byDietary: {
      vegetarian: [
        "peanut sauce",
        "sweet soy glaze",
        "tamarind sauce",
        "mushroom sauce",
        "coconut curry",
      ],
      vegan: [
        "lime-herb dressing",
        "tamarind-based sauces",
        "vegetable curry",
        "sesame-soy dressing",
        "chili jam",
      ],
      glutenFree: [
        "nam jim",
        "green curry",
        "herb infusions",
        "fish sauce-based",
        "coconut-based sauces",
      ],
      dairyFree: [
        "all traditional Thai sauces",
        "curry pastes",
        "oil-based dressings",
        "chili dips",
        "herb infused oils",
      ],
    },
  },
  cookingTechniques: [
    {
      name: "Wok Cooking (Pad)",
      description:
        "Fast high-heat stir-frying that preserves texture and creates 'wok hei' or breath of the wok",
      elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },
      toolsRequired: [
        "wok",
        "wok spatula",
        "high BTU burner",
        "spider strainer",
        "cleaver",
      ],
      bestFor: [
        "stir-fries",
        "noodle dishes",
        "quick curries",
        "fried rice",
        "sautéed vegetables",
      ],
      difficulty: "medium",
    },
    {
      name: "Pounding (Tam/Dtam)",
      description:
        "Using mortar and pestle to crush ingredients, releasing essential oils and combining flavors",
      elementalProperties: { Earth: 0.5, Fire: 0.2, Water: 0.2, Air: 0.1 },
      toolsRequired: [
        "clay or stone mortar",
        "wooden pestle",
        "preparation bowls",
        "strainer",
      ],
      bestFor: [
        "curry pastes",
        "som tam",
        "nam prik",
        "herb pastes",
        "spice blends",
      ],
      difficulty: "medium",
    },
    {
      name: "Steaming (Neung)",
      description:
        "Gentle cooking with steam to preserve nutrients and delicate textures",
      elementalProperties: { Water: 0.5, Air: 0.3, Earth: 0.1, Fire: 0.1 },
      toolsRequired: [
        "bamboo steamer",
        "wok",
        "cheesecloth",
        "banana leaves",
        "steamer rack",
      ],
      bestFor: [
        "fish",
        "custards",
        "dumplings",
        "sticky rice",
        "certain vegetables",
      ],
      difficulty: "easy",
    },
    {
      name: "Grilling (Yang)",
      description:
        "Direct heat cooking over charcoal for smoky flavor and caramelization",
      elementalProperties: { Fire: 0.7, Air: 0.2, Earth: 0.1, Water: 0.0 },
      toolsRequired: [
        "charcoal grill",
        "bamboo skewers",
        "banana leaf wrappers",
        "basting brush",
      ],
      bestFor: [
        "marinated meats",
        "fish",
        "skewered foods",
        "vegetables",
        "sticky rice in bamboo",
      ],
      difficulty: "medium",
    },
    {
      name: "Curry Making (Gaeng)",
      description:
        "Complex process of creating curry from scratch with paste-making and slow simmering",
      elementalProperties: { Water: 0.4, Fire: 0.3, Earth: 0.2, Air: 0.1 },
      toolsRequired: [
        "mortar and pestle",
        "heavy pot",
        "coconut press",
        "strainer",
        "wooden spoons",
      ],
      bestFor: [
        "coconut-based curries",
        "clear spicy soups",
        "braised dishes",
        "complex stews",
      ],
      difficulty: "hard",
    },
  ],
  regionalCuisines: [
    {
      name: "Northern Thai (Lanna)",
      description:
        "More mild and less spicy cuisine with Burmese and Lao influences, featuring sticky rice and pork",
      signatureDishes: [
        "Khao Soi",
        "Nam Prik Ong",
        "Sai Ua",
        "Gaeng Hang Lay",
        "Khao Lam",
      ],
      keyIngredients: [
        "sticky rice",
        "pork",
        "tomatoes",
        "ginger",
        "turmeric",
        "kaffir lime",
      ],
      cookingTechniques: ["grilling", "stewing", "fermenting", "steaming"],
      elementalProperties: { Earth: 0.4, Fire: 0.3, Water: 0.2, Air: 0.1 },
      culturalInfluences: ["Lanna Kingdom", "Burmese", "Chinese Yunnan", "Lao"],
      philosophicalFoundations:
        "Connected to Lanna traditions with an emphasis on communal dining and seasonal ingredients",
    },
    {
      name: "Northeastern Thai (Isaan)",
      description:
        "Intense flavors with Lao influence, featuring fermentation, spicy chilies, and sticky rice",
      signatureDishes: [
        "Som Tam",
        "Larb",
        "Gai Yang",
        "Nam Tok",
        "Moo Nam Tok",
      ],
      keyIngredients: [
        "sticky rice",
        "chilies",
        "lime",
        "fish sauce",
        "fresh herbs",
        "fermented fish",
      ],
      cookingTechniques: [
        "grilling",
        "pounding",
        "fermenting",
        "raw preparations",
      ],
      elementalProperties: { Fire: 0.5, Earth: 0.3, Air: 0.1, Water: 0.1 },
      culturalInfluences: ["Lao", "Khmer", "Vietnamese"],
      philosophicalFoundations:
        "Emphasizes simple, straightforward preparations that highlight fresh ingredients",
    },
    {
      name: "Central Thai",
      description:
        "The royal court cuisine with balanced flavors combining sweet, sour, salty, and spicy elements",
      signatureDishes: [
        "Pad Thai",
        "Tom Yum Goong",
        "Gaeng Keow Wan",
        "Massaman Curry",
        "Hoy Tod",
      ],
      keyIngredients: [
        "jasmine rice",
        "coconut milk",
        "palm sugar",
        "fish sauce",
        "chilies",
        "galangal",
      ],
      cookingTechniques: [
        "stir-frying",
        "curry making",
        "deep-frying",
        "slow simmering",
      ],
      elementalProperties: { Water: 0.3, Fire: 0.3, Earth: 0.2, Air: 0.2 },
      culturalInfluences: [
        "Royal Thai Court",
        "Chinese",
        "Persian",
        "Portuguese",
      ],
      philosophicalFoundations:
        "Balance and refinement from royal court traditions, with elaborate preparations",
    },
    {
      name: "Southern Thai",
      description:
        "Intensely spicy and aromatic cuisine with Malaysian influences and abundant seafood",
      signatureDishes: [
        "Gaeng Tai Pla",
        "Khua Kling",
        "Gaeng Som",
        "Sataw Pad Kapi Goong",
        "Khao Yam",
      ],
      keyIngredients: [
        "seafood",
        "turmeric",
        "southern bird's eye chilies",
        "sator beans",
        "coconut",
      ],
      cookingTechniques: [
        "slow cooking",
        "dry currying",
        "stewing",
        "fermenting",
      ],
      elementalProperties: { Fire: 0.6, Water: 0.2, Earth: 0.1, Air: 0.1 },
      culturalInfluences: ["Malay", "Indonesian", "Indian"],
      philosophicalFoundations:
        "Bold approach to flavor showcasing heat, pungency, and freshness of local ingredients",
    },
    {
      name: "Royal Thai Cuisine",
      description:
        "Refined, artistic cuisine developed in the royal palace with intricate preparation techniques",
      signatureDishes: [
        "Mee Krob",
        "Pla Dook Foo",
        "Chor Muang",
        "Massaman Curry",
        "Foi Thong",
      ],
      keyIngredients: [
        "premium meats",
        "coconut cream",
        "palm sugar",
        "edible flowers",
        "aromatic spices",
      ],
      cookingTechniques: [
        "carving",
        "intricate presentation",
        "reduction",
        "slow cooking",
      ],
      elementalProperties: { Air: 0.3, Earth: 0.3, Water: 0.2, Fire: 0.2 },
      culturalInfluences: [
        "Thai Royal Court",
        "Ayutthaya Kingdom",
        "Persian",
        "European",
      ],
      philosophicalFoundations:
        "Emphasizes aesthetic beauty, balance of flavors, and sophisticated presentation",
    },
  ],
  elementalProperties: {
    Fire: 0.35, // Represents spicy elements, chili heat, and grilling techniques,
    Water: 0.25, // Represents soups, coconut-based dishes, and steaming,
    Earth: 0.25, // Represents grains, proteins, and root vegetables,
    Air: 0.15, // Represents herbs, aromatics, and light textures
  },
};

export default thai;
