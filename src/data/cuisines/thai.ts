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
          name: "Tom Yum Goong",
          description: "Thailand's most iconic hot and sour soup, a violent aromatic infusion of galangal, lemongrass, and makrut lime leaf with plump shrimp, mushrooms, and a bracing lime finish. The Nam Sai (clear) version relies entirely on the intensity of the herbal broth rather than any dairy emulsion.",
          details: {"cuisine":"Thai","prepTimeMinutes":15,"cookTimeMinutes":15,"baseServingSize":4,"spiceLevel":"Hot","season":["all"]},
          ingredients: [
            {"amount":4,"unit":"cups","name":"shrimp or chicken stock","notes":"Ideally made from the shells of the shrimp for maximum depth."},
            {"amount":500,"unit":"g","name":"large shrimp","notes":"Peeled and deveined, shells reserved for stock."},
            {"amount":3,"unit":"stalks","name":"lemongrass","notes":"Outer leaves removed, stalks bruised with the back of a knife and cut into 2-inch sections."},
            {"amount":6,"unit":"slices","name":"fresh galangal","notes":"Do not substitute dried galangal or ginger. Fresh galangal has an entirely different aromatic profile."},
            {"amount":6,"unit":"leaves","name":"makrut lime leaves","notes":"Torn in half to release the essential oils from the central rib. Also called kaffir lime leaves."},
            {"amount":200,"unit":"g","name":"straw or oyster mushrooms","notes":"Halved or torn into bite-sized pieces."},
            {"amount":3,"unit":"whole","name":"bird eye chilies","notes":"Lightly crushed to release heat without fully disintegrating."},
            {"amount":4,"unit":"tbsp","name":"fresh lime juice","notes":"Added strictly off the heat. Approximately 2-3 limes."},
            {"amount":2,"unit":"tbsp","name":"fish sauce","notes":"Added off the heat. Adjust to taste."},
            {"amount":1,"unit":"tbsp","name":"Nam Prik Pao","notes":"Thai roasted chili jam. Adds a deep, smoky sweetness. Essential."},
            {"amount":0.5,"unit":"cup","name":"fresh cilantro","notes":"Leaves and tender stems."}
          ],
          instructions: [
            "Step 1: The Shell Stock. If time permits, simmer shrimp shells in 4 cups of water for 10 minutes. Strain. This creates a deep, oceanic broth base superior to plain water.",
            "Step 2: The Aromatic Infusion. Bring the stock to a rolling boil. Add the bruised lemongrass sections, galangal slices, torn makrut lime leaves, and crushed chilies. Boil aggressively for 4-5 minutes. The kitchen will fill with an intensely citrus-herbal aroma.",
            "Step 3: The Mushrooms. Add the mushrooms to the boiling aromatic broth. Cook for 2-3 minutes until tender.",
            "Step 4: The Chili Jam. Stir in the Nam Prik Pao. It will dissolve into the broth, turning it a deeper, amber-tinged color with a faint smokiness.",
            "Step 5: The Shrimp Poach. Add the shrimp to the simmering broth. Cook for exactly 60-90 seconds until they just turn fully pink and curl. Remove from heat immediately. Overcooking shrimp is the cardinal sin of this dish.",
            "Step 6: The Acid Finish. Off the heat, stir in the fresh lime juice and fish sauce. These must never be boiled as heat destroys their delicate, bright notes. Taste and adjust the balance: it must be sharply sour, intensely savory, aromatic, and hot.",
            "Step 7: Serve. Ladle into bowls and garnish generously with fresh cilantro. Note: the lemongrass, galangal, and lime leaves are aromatic, not edible. Eat around them."
          ],
          classifications: {"mealType":["soup","dinner","lunch"],"cookingMethods":["simmering","infusing","poaching"]},
          elementalProperties: {"Fire":0.45,"Water":0.35,"Earth":0.1,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Neptune"],"signs":["aries","pisces"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":185,"proteinG":24,"carbsG":9,"fatG":5,"fiberG":2,"sodiumMg":1100,"sugarG":4,"vitamins":["Vitamin C","Vitamin B12"],"minerals":["Selenium","Iodine"]},
          substitutions: [
            {"originalIngredient":"shrimp","substituteOptions":["chicken pieces (simmer longer)","squid rings","mixed seafood"]},
            {"originalIngredient":"straw mushrooms","substituteOptions":["oyster mushrooms","shiitake mushrooms"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce plus nori flakes (vegetarian)"]}
          ]
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
          description: "A supremely elegant and therapeutic Thai coconut milk chicken soup. Creamy and aromatic, it achieves a profound balance between the rich sweetness of coconut milk, the medicinal bite of galangal, the citrus brightness of lemongrass and makrut lime leaf, and a gentle warmth from chilies. It is the gentler, more comforting counterpart to Tom Yum.",
          details: {"cuisine":"Thai","prepTimeMinutes":15,"cookTimeMinutes":20,"baseServingSize":4,"spiceLevel":"Mild","season":["all","winter"]},
          ingredients: [
            {"amount":400,"unit":"g","name":"boneless chicken thighs","notes":"Sliced into thin strips. Thighs are superior to breast here due to their fat content, which enriches the coconut broth."},
            {"amount":400,"unit":"ml","name":"full-fat coconut milk","notes":"Use the highest quality, fattiest coconut milk available. Shake the can well before opening."},
            {"amount":2,"unit":"cups","name":"chicken stock","notes":"For the base of the broth."},
            {"amount":5,"unit":"slices","name":"fresh galangal","notes":"The defining ingredient. Peeled and sliced. Do not substitute with ginger."},
            {"amount":3,"unit":"stalks","name":"lemongrass","notes":"Outer leaves removed, stalks bruised and cut into 2-inch pieces."},
            {"amount":6,"unit":"leaves","name":"makrut lime leaves","notes":"Torn to release aromatic oils."},
            {"amount":200,"unit":"g","name":"oyster mushrooms","notes":"Torn into strips."},
            {"amount":3,"unit":"whole","name":"bird eye chilies","notes":"Lightly crushed. Adjust for desired heat level."},
            {"amount":3,"unit":"tbsp","name":"fresh lime juice","notes":"Added off the heat."},
            {"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For salinity."},
            {"amount":1,"unit":"tsp","name":"palm sugar","notes":"To round the flavors."},
            {"amount":0.5,"unit":"cup","name":"fresh cilantro","notes":"For garnish."}
          ],
          instructions: [
            "Step 1: The Broth Base. In a medium pot, combine the chicken stock, coconut milk, galangal slices, lemongrass pieces, torn makrut lime leaves, and crushed chilies. Bring to a gentle simmer over medium heat. Do not boil vigorously as it can break the coconut milk.",
            "Step 2: The Aromatic Infusion. Simmer the aromatic broth gently for 5-7 minutes, allowing the galangal, lemongrass, and lime leaves to fully release their essential oils into the liquid.",
            "Step 3: The Mushrooms. Add the torn oyster mushrooms and simmer for 3 minutes.",
            "Step 4: The Chicken. Add the sliced chicken thighs to the gently simmering broth. Cook for 5-7 minutes until the chicken is just cooked through and tender. The gentle heat prevents toughening.",
            "Step 5: The Palm Sugar Balance. Stir in the palm sugar to dissolve, rounding the sharp edges of the broth.",
            "Step 6: The Acid Finish. Remove from heat. Stir in the fresh lime juice and fish sauce. These must be added off the heat to preserve their brightness. Taste and adjust: the soup should be creamy, citrus-forward, mildly spicy, and gently savory.",
            "Step 7: Serve. Ladle into bowls and garnish with fresh cilantro. Remind guests that the galangal, lemongrass, and lime leaves are for flavoring only and should not be eaten."
          ],
          classifications: {"mealType":["soup","dinner","lunch"],"cookingMethods":["simmering","infusing"]},
          elementalProperties: {"Fire":0.2,"Water":0.45,"Earth":0.25,"Air":0.1},
          astrologicalAffinities: {"planets":["Moon","Venus"],"signs":["cancer","taurus"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":380,"proteinG":26,"carbsG":10,"fatG":28,"fiberG":2,"sodiumMg":820,"sugarG":5,"vitamins":["Vitamin C","Niacin"],"minerals":["Potassium","Phosphorus"]},
          substitutions: [
            {"originalIngredient":"chicken thighs","substituteOptions":["tofu (firm, pressed - vegan)","shrimp","mushrooms only (vegetarian)"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce (vegetarian)"]},
            {"originalIngredient":"full-fat coconut milk","substituteOptions":["light coconut milk (less rich result)"]}
          ]
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
          name: "Pad Thai",
          description: "The definitive Thai stir-fried rice noodle dish, a masterwork of wok hei and rapid assembly. Flat sen lek noodles are soaked until pliable, then subjected to violent, high-heat stir-frying with shrimp, firm tofu, and egg, bound in a deeply savory and slightly sweet tamarind-based sauce, finished with crisp bean sprouts and crushed peanuts.",
          details: {"cuisine":"Thai","prepTimeMinutes":30,"cookTimeMinutes":10,"baseServingSize":2,"spiceLevel":"Mild","season":["all"]},
          ingredients: [
            {"amount":200,"unit":"g","name":"sen lek rice noodles","notes":"Flat, medium-width rice noodles, soaked in room-temperature water for 30 minutes until pliable but not soft. Do not use boiling water."},
            {"amount":200,"unit":"g","name":"medium shrimp","notes":"Peeled and deveined."},
            {"amount":100,"unit":"g","name":"firm tofu","notes":"Pressed dry and cut into small cubes."},
            {"amount":2,"unit":"large","name":"eggs","notes":"Cracked directly into the wok."},
            {"amount":3,"unit":"tbsp","name":"tamarind paste","notes":"Thick, dark paste dissolved from a block in warm water and strained. Not tamarind concentrate."},
            {"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For salinity and depth."},
            {"amount":1,"unit":"tbsp","name":"palm sugar","notes":"Or light brown sugar. Dissolved."},
            {"amount":1,"unit":"tbsp","name":"oyster sauce","notes":"Adds additional umami complexity."},
            {"amount":2,"unit":"stalks","name":"green onions","notes":"Cut into 1-inch pieces."},
            {"amount":1,"unit":"cup","name":"bean sprouts","notes":"Added raw at the very end for crunch."},
            {"amount":3,"unit":"tbsp","name":"roasted peanuts","notes":"Coarsely crushed."},
            {"amount":2,"unit":"tbsp","name":"preserved radish (chai poh)","notes":"Rinsed and roughly chopped. Adds essential saltiness and texture."},
            {"amount":2,"unit":"tbsp","name":"vegetable oil","notes":"High smoke-point oil for wok frying."},
            {"amount":1,"unit":"lime","name":"lime","notes":"Cut into wedges for serving."}
          ],
          instructions: [
            "Step 1: The Sauce. Whisk together the tamarind paste, fish sauce, palm sugar, and oyster sauce in a small bowl until the sugar is completely dissolved. Taste it: it should be intensely sour, salty, and slightly sweet. Set aside.",
            "Step 2: The Noodle Preparation. Drain the soaked noodles thoroughly. They should be pliable and translucent but still firm enough to hold their shape when lifted.",
            "Step 3: The Tofu. Heat 1 tablespoon of oil in a wok over maximum heat. Fry the tofu cubes until golden and crisp on all sides, about 3-4 minutes. Remove and set aside.",
            "Step 4: The Shrimp. In the same blazing hot wok, add a touch more oil and stir-fry the shrimp for 60-90 seconds until just pink. Push to the side of the wok.",
            "Step 5: The Egg Scramble. Crack the eggs into the cleared center of the wok. Scramble them briefly until they are just set but still custardy, then fold them into the shrimp.",
            "Step 6: The Noodle Stir-Fry. Add the drained noodles and the preserved radish to the wok. Pour the sauce mixture over the noodles immediately. Toss and fold everything together continuously over high heat for 2-3 minutes, allowing the noodles to absorb the sauce and char slightly in spots.",
            "Step 7: The Finish. Add the green onion pieces and half the bean sprouts. Toss once more for 30 seconds. Remove from heat immediately.",
            "Step 8: Serve. Plate the Pad Thai and top with the fried tofu, crushed peanuts, and remaining fresh bean sprouts. Serve with lime wedges, dried chili flakes, sugar, and fish sauce on the side for individual adjustment."
          ],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["stir-frying","wok cooking"]},
          elementalProperties: {"Fire":0.4,"Water":0.15,"Earth":0.3,"Air":0.15},
          astrologicalAffinities: {"planets":["Mercury","Mars"],"signs":["gemini","aries"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":560,"proteinG":28,"carbsG":72,"fatG":18,"fiberG":4,"sodiumMg":1350,"sugarG":10,"vitamins":["Vitamin B12","Niacin"],"minerals":["Selenium","Zinc"]},
          substitutions: [
            {"originalIngredient":"shrimp","substituteOptions":["chicken breast (sliced thin)","extra tofu (vegan)","pork tenderloin"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce plus a pinch of salt (vegetarian)"]},
            {"originalIngredient":"tamarind paste","substituteOptions":["lime juice mixed with a small amount of rice vinegar (less depth)"]}
          ]
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
        {
          name: "Gaeng Keow Wan Gai",
          description: "Thai Green Curry, perhaps the most vibrant and aromatic of the Thai curry canon. A fiercely green paste of fresh green chilies, lemongrass, galangal, kaffir lime zest, and shrimp paste is fried in cracked coconut cream, then simmered with chicken, Thai eggplant, and an ocean of fresh basil. It is simultaneously the most herbaceous and spicy of the major Thai curries.",
          details: {"cuisine":"Thai","prepTimeMinutes":20,"cookTimeMinutes":25,"baseServingSize":4,"spiceLevel":"Hot","season":["all"]},
          ingredients: [
            {"amount":500,"unit":"g","name":"boneless chicken thighs","notes":"Sliced into bite-sized strips. Thighs hold up better than breast in the curry."},
            {"amount":400,"unit":"ml","name":"full-fat coconut milk","notes":"Separated into thick cream (top) and thin milk (bottom) by refrigerating overnight and not shaking."},
            {"amount":4,"unit":"tbsp","name":"green curry paste","notes":"Good-quality store-bought or homemade. The foundation of all flavor."},
            {"amount":200,"unit":"g","name":"Thai eggplant","notes":"Golf ball-sized, quartered. Or substitute pea eggplants. Do not substitute Italian eggplant."},
            {"amount":1,"unit":"cup","name":"fresh Thai basil leaves","notes":"Horapah variety. Added at the very end. Do not substitute Italian basil."},
            {"amount":4,"unit":"leaves","name":"makrut lime leaves","notes":"Torn, central rib removed. For aromatic infusion."},
            {"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For seasoning."},
            {"amount":1,"unit":"tbsp","name":"palm sugar","notes":"To balance the heat."},
            {"amount":2,"unit":"whole","name":"long red chilies","notes":"Sliced diagonally for garnish."},
            {"amount":1,"unit":"cup","name":"chicken stock","notes":"To adjust consistency."}
          ],
          instructions: [
            "Step 1: The Oil Separation (Keeo Gati). In a wok or wide pot, add the thick coconut cream from the top of the can. Heat over medium-high until the cream simmers and the coconut oil visibly separates and pools on the surface - this is called 'cracking the coconut cream' and is essential for frying the paste.",
            "Step 2: The Paste Fry. Add the green curry paste to the cracked coconut oil. Fry aggressively, stirring constantly, for 2-3 minutes until the paste darkens slightly and becomes incredibly fragrant. The raw edge of the galangal and chili will mellow and deepen.",
            "Step 3: The Chicken. Add the sliced chicken thighs to the fried paste. Toss to coat every piece. Stir-fry for 2 minutes until the chicken is sealed on the outside.",
            "Step 4: The Thin Milk and Stock. Pour in the remaining thin coconut milk and the chicken stock. Add the torn makrut lime leaves. Bring to a gentle simmer.",
            "Step 5: The Eggplant. Add the quartered Thai eggplants. Simmer gently for 8-10 minutes until the eggplant is completely tender and the chicken is cooked through.",
            "Step 6: The Seasoning. Season with fish sauce and palm sugar. The curry must be predominantly spicy and herbaceous with a background of sweetness and salinity.",
            "Step 7: The Basil Finish. Turn off the heat. Immediately add the fresh Thai basil leaves and sliced red chilies. Fold once; the basil will wilt from the residual heat. Serve immediately over jasmine rice."
          ],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","stir-frying","paste frying"]},
          elementalProperties: {"Fire":0.4,"Water":0.3,"Earth":0.2,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Mercury"],"signs":["aries","gemini"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":420,"proteinG":28,"carbsG":12,"fatG":30,"fiberG":4,"sodiumMg":880,"sugarG":7,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Potassium","Iron"]},
          substitutions: [
            {"originalIngredient":"chicken thighs","substituteOptions":["shrimp (reduce cook time)","firm tofu (vegan)","beef sirloin strips"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce (vegetarian)"]},
            {"originalIngredient":"Thai eggplant","substituteOptions":["zucchini","bamboo shoots","baby corn"]}
          ]
        },
        {
          name: "Gaeng Daeng Moo",
          description: "Thai Red Curry with pork - a deeply savory, aromatic, and moderately spiced curry built on a brick-red paste of dried red chilies, lemongrass, galangal, and shrimp paste. Less herbaceous than the green version, Red Curry is defined by its rich, complex savory depth and thick, clinging coconut sauce. Bamboo shoots provide structural contrast.",
          details: {"cuisine":"Thai","prepTimeMinutes":15,"cookTimeMinutes":25,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [
            {"amount":500,"unit":"g","name":"pork tenderloin or shoulder","notes":"Sliced thin against the grain. Shoulder gives more flavor but tenderloin is more tender."},
            {"amount":400,"unit":"ml","name":"full-fat coconut milk","notes":"Do not shake the can. Skim the thick cream from the top for frying the paste."},
            {"amount":3,"unit":"tbsp","name":"red curry paste","notes":"A quality paste of dried red chilies, galangal, lemongrass, and shrimp paste."},
            {"amount":200,"unit":"g","name":"canned bamboo shoots","notes":"Drained and rinsed. Sliced into strips."},
            {"amount":1,"unit":"cup","name":"fresh Thai basil","notes":"For finishing."},
            {"amount":4,"unit":"leaves","name":"makrut lime leaves","notes":"Torn in half."},
            {"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For seasoning."},
            {"amount":2,"unit":"tsp","name":"palm sugar","notes":"Red curry benefits from a touch more sweetness than green."},
            {"amount":1,"unit":"cup","name":"chicken stock","notes":"To adjust body and consistency."},
            {"amount":2,"unit":"whole","name":"long red chilies","notes":"Diagonally sliced, for garnish color."}
          ],
          instructions: [
            "Step 1: Crack the Coconut Cream. Place the thick coconut cream skimmed from the can into a wok over medium heat. Simmer until the oil separates visibly from the white solids.",
            "Step 2: Fry the Paste. Add the red curry paste to the cracked oil. Fry for 2 minutes, stirring continuously, until it turns a deep rust-red and is intensely aromatic. The smell will shift from raw and sharp to deep and roasted.",
            "Step 3: Seal the Pork. Add the sliced pork to the paste. Toss vigorously to coat each piece and stir-fry for 2 minutes until the pork is sealed.",
            "Step 4: Build the Sauce. Pour in the remaining thin coconut milk and the chicken stock. Add the makrut lime leaves. Bring to a simmer.",
            "Step 5: Add the Bamboo. Stir in the bamboo shoot strips. Simmer for 10 minutes, allowing the curry to reduce and thicken slightly and the pork to become fully tender.",
            "Step 6: Season. Add the fish sauce and palm sugar. Taste: the curry should be savory, mildly spicy, rich, and slightly sweet with a coconut backbone.",
            "Step 7: Finish. Remove from heat, stir in the fresh Thai basil leaves and sliced red chilies. Serve immediately over steamed jasmine rice."
          ],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","paste frying","stir-frying"]},
          elementalProperties: {"Fire":0.35,"Water":0.3,"Earth":0.25,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Saturn"],"signs":["aries","capricorn"],"lunarPhases":["Waxing Crescent"]},
          nutritionPerServing: {"calories":440,"proteinG":30,"carbsG":10,"fatG":32,"fiberG":3,"sodiumMg":920,"sugarG":6,"vitamins":["Vitamin B12","Niacin"],"minerals":["Zinc","Potassium"]},
          substitutions: [
            {"originalIngredient":"pork tenderloin","substituteOptions":["chicken breast","duck breast","firm tofu (vegan)"]},
            {"originalIngredient":"bamboo shoots","substituteOptions":["hearts of palm","Thai eggplant","zucchini"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce (vegetarian)"]}
          ]
        },
        {
          name: "Larb Gai",
          description: "Larb is the national dish of Laos and a Thai Isaan masterpiece - a warm minced meat salad that operates by a completely different logic than Western salads. Ground chicken is cooked rapidly and immediately tossed in a ferociously tart lime dressing with toasted rice powder, dried chilies, shallots, mint, and fresh herbs. The toasted rice powder is non-negotiable: it provides a unique nutty crunch and helps bind the dressing.",
          details: {"cuisine":"Thai","prepTimeMinutes":15,"cookTimeMinutes":10,"baseServingSize":2,"spiceLevel":"Hot","season":["all"]},
          ingredients: [
            {"amount":400,"unit":"g","name":"ground chicken","notes":"Coarsely ground or finely chopped. Not too lean; some fat is essential for juiciness."},
            {"amount":3,"unit":"tbsp","name":"fresh lime juice","notes":"Freshly squeezed. The acid backbone of the entire dish."},
            {"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For salinity and depth."},
            {"amount":2,"unit":"tbsp","name":"toasted rice powder","notes":"Khao Khua. Made by dry-toasting raw glutinous rice in a dry pan until golden, then grinding. Essential. Cannot be omitted."},
            {"amount":1,"unit":"tsp","name":"dried chili flakes","notes":"Roasted dried chilies ground coarsely. Adjust for heat."},
            {"amount":4,"unit":"whole","name":"shallots","notes":"Thinly sliced."},
            {"amount":1,"unit":"cup","name":"fresh mint leaves","notes":"Roughly torn. The defining herb."},
            {"amount":0.5,"unit":"cup","name":"fresh cilantro","notes":"Roughly chopped."},
            {"amount":2,"unit":"stalks","name":"green onions","notes":"Thinly sliced."},
            {"amount":2,"unit":"tbsp","name":"water or chicken stock","notes":"To help cook the meat without oil."}
          ],
          instructions: [
            "Step 1: Make the Toasted Rice Powder. In a dry wok or frying pan, toast 3 tablespoons of raw sticky rice over medium heat, stirring constantly, for 5-8 minutes until the grains are deeply golden and smell nutty. Transfer to a mortar and pestle and grind to a coarse powder. Set aside.",
            "Step 2: Cook the Chicken. Place a wok over high heat. Add a splash of water or stock (no oil). Add the ground chicken and break it apart, cooking rapidly until just cooked through with no pink remaining. The water will steam the meat while keeping it tender. Do not overcook.",
            "Step 3: The Dressing. Remove the wok from heat. Immediately add the fresh lime juice, fish sauce, dried chili flakes, and sliced shallots to the hot chicken. Toss everything together; the residual heat will slightly pickle the shallots.",
            "Step 4: The Rice Powder. Add the toasted rice powder and toss to distribute. It will absorb some of the dressing and bind the mixture.",
            "Step 5: The Herbs. Add the mint leaves, cilantro, and green onions. Toss gently just once or twice to preserve the freshness of the herbs. Taste and adjust with more lime juice or fish sauce.",
            "Step 6: Serve immediately at room temperature alongside fresh vegetables (cucumber, long beans, cabbage wedges) and sticky rice for scooping."
          ],
          classifications: {"mealType":["dinner","lunch","salad"],"cookingMethods":["stir-frying","toasting","mixing"]},
          elementalProperties: {"Fire":0.4,"Water":0.2,"Earth":0.25,"Air":0.15},
          astrologicalAffinities: {"planets":["Mars","Mercury"],"signs":["aries","virgo"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":310,"proteinG":36,"carbsG":14,"fatG":12,"fiberG":2,"sodiumMg":980,"sugarG":4,"vitamins":["Vitamin C","Vitamin B6"],"minerals":["Iron","Zinc"]},
          substitutions: [
            {"originalIngredient":"ground chicken","substituteOptions":["ground pork","ground turkey","minced mushrooms (vegan)"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce (vegetarian)"]},
            {"originalIngredient":"toasted rice powder","substituteOptions":["panko breadcrumbs, toasted (different texture but similar function)"]}
          ]
        },
        {
          name: "Chicken Satay with Peanut Sauce",
          description: "Thai satay - marinated chicken thighs threaded onto skewers and grilled over charcoal until deeply caramelized and charred at the edges. The marinade relies on turmeric, lemongrass, and coconut milk to deeply penetrate the meat. The accompanying peanut dipping sauce is a separate dish unto itself: a complex emulsion of coconut milk, red curry paste, roasted peanuts, and tamarind.",
          details: {"cuisine":"Thai","prepTimeMinutes":30,"cookTimeMinutes":15,"baseServingSize":4,"spiceLevel":"Mild","season":["all"]},
          ingredients: [
            {"amount":600,"unit":"g","name":"boneless chicken thighs","notes":"Sliced into thin strips, roughly 1 inch wide and 3 inches long. Thighs are mandatory for their fat content and flexibility on the skewer."},
            {"amount":2,"unit":"stalks","name":"lemongrass","notes":"Bottom 4 inches only, finely minced."},
            {"amount":1,"unit":"tsp","name":"ground turmeric","notes":"For color and subtle earthiness."},
            {"amount":1,"unit":"tsp","name":"ground cumin","notes":"For the marinade."},
            {"amount":1,"unit":"tsp","name":"ground coriander","notes":"For the marinade."},
            {"amount":4,"unit":"tbsp","name":"coconut milk","notes":"For the marinade base."},
            {"amount":1,"unit":"tbsp","name":"fish sauce","notes":"For the marinade."},
            {"amount":1,"unit":"tbsp","name":"palm sugar","notes":"For the marinade."},
            {"amount":1,"unit":"cup","name":"roasted peanuts","notes":"Roughly crushed, for the sauce."},
            {"amount":200,"unit":"ml","name":"coconut milk","notes":"For the peanut sauce."},
            {"amount":2,"unit":"tbsp","name":"red curry paste","notes":"The base of the peanut sauce."},
            {"amount":2,"unit":"tbsp","name":"tamarind paste","notes":"For sourness in the sauce."},
            {"amount":2,"unit":"tbsp","name":"palm sugar","notes":"For the peanut sauce."},
            {"amount":20,"unit":"pieces","name":"bamboo skewers","notes":"Soaked in water for 30 minutes to prevent burning."}
          ],
          instructions: [
            "Step 1: The Marinade. In a bowl, combine the minced lemongrass, ground turmeric, cumin, coriander, 4 tablespoons of coconut milk, fish sauce, and 1 tablespoon palm sugar. Mix well. Add the sliced chicken thighs and toss to coat thoroughly. Marinate for at least 1 hour, ideally 4 hours in the refrigerator.",
            "Step 2: The Peanut Sauce. In a small saucepan, heat the 200ml of coconut milk over medium heat until it begins to simmer. Add the red curry paste and fry in the coconut milk for 1 minute. Add the crushed peanuts, tamarind paste, and 2 tablespoons of palm sugar. Stir vigorously. The sauce should be thick, rich, and clings to a spoon. Adjust consistency with water if needed. Season with fish sauce if required.",
            "Step 3: Skewer the Chicken. Thread the marinated chicken strips onto soaked bamboo skewers in an S-pattern, stretching the meat along the full length of the skewer.",
            "Step 4: Grill. Cook the skewers on a very hot grill or grill pan for 2-3 minutes per side. The high heat is essential to achieve caramelization and the characteristic slight char on the edges.",
            "Step 5: Serve. Arrange the hot skewers on a plate. Serve the peanut sauce alongside in a small bowl, along with a simple ajaat (cucumber relish) of cucumber, shallot, and red chili in diluted white vinegar and sugar."
          ],
          classifications: {"mealType":["dinner","lunch","appetizer"],"cookingMethods":["grilling","marinating","simmering"]},
          elementalProperties: {"Fire":0.35,"Water":0.2,"Earth":0.35,"Air":0.1},
          astrologicalAffinities: {"planets":["Sun","Jupiter"],"signs":["leo","sagittarius"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":480,"proteinG":34,"carbsG":22,"fatG":30,"fiberG":4,"sodiumMg":760,"sugarG":10,"vitamins":["Niacin","Vitamin B6"],"minerals":["Zinc","Magnesium"]},
          substitutions: [
            {"originalIngredient":"chicken thighs","substituteOptions":["pork loin strips","beef sirloin","king oyster mushroom strips (vegan)"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce (vegetarian)"]},
            {"originalIngredient":"roasted peanuts","substituteOptions":["cashews (nut allergy note)","sunflower seed butter (nut-free)"]}
          ]
        },
        {
          name: "Pad See Ew",
          description: "The wok-fried counterpart to Pad Thai, and in many ways the more technically demanding dish. Wide, flat sen yai rice noodles are stir-fried at extreme heat with Chinese broccoli, egg, and sliced pork or beef in a dark, sweet-salty soy sauce. The defining characteristic is the wok hei - the smoky, slightly charred flavor achieved only from a correctly seasoned wok at maximum temperature.",
          details: {"cuisine":"Thai","prepTimeMinutes":20,"cookTimeMinutes":8,"baseServingSize":2,"spiceLevel":"Mild","season":["all"]},
          ingredients: [
            {"amount":300,"unit":"g","name":"fresh wide rice noodles (sen yai)","notes":"If not fresh, soak dried wide rice noodles in warm water until just pliable but still firm."},
            {"amount":200,"unit":"g","name":"pork tenderloin or flank steak","notes":"Sliced very thin against the grain."},
            {"amount":2,"unit":"large","name":"eggs","notes":"Cracked into the wok at a key moment."},
            {"amount":150,"unit":"g","name":"Chinese broccoli (gai lan)","notes":"Stems sliced diagonally, leaves separated. The defining vegetable."},
            {"amount":2,"unit":"tbsp","name":"dark soy sauce","notes":"For deep color, sweetness, and body. The key flavoring."},
            {"amount":1,"unit":"tbsp","name":"light soy sauce","notes":"For salinity."},
            {"amount":1,"unit":"tbsp","name":"oyster sauce","notes":"For umami gloss."},
            {"amount":1,"unit":"tsp","name":"sugar","notes":"To balance the soy sauces."},
            {"amount":3,"unit":"cloves","name":"garlic","notes":"Smashed and roughly chopped."},
            {"amount":2,"unit":"tbsp","name":"vegetable oil","notes":"High smoke-point oil. Wok must be smoking hot."}
          ],
          instructions: [
            "Step 1: The Sauce. Combine the dark soy sauce, light soy sauce, oyster sauce, and sugar in a small bowl. Stir until the sugar dissolves. Set aside.",
            "Step 2: Separate the Noodles. If using fresh noodles, gently separate them into individual strands with your hands to prevent clumping in the wok. This step is critical.",
            "Step 3: The Protein. Heat a wok over maximum heat until it is absolutely smoking. Add 1 tablespoon of oil and the sliced pork. Spread in a single layer and sear without moving for 30 seconds. Then toss once, allowing the meat to caramelize. Remove and set aside.",
            "Step 4: The Egg. Add the remaining oil and the garlic to the still-blazing wok. Fry for 10 seconds. Push to the side. Crack the eggs directly into the center. Scramble vigorously until just set but still custardy.",
            "Step 5: The Noodle Fry. Immediately add the separated noodles to the wok. Pour the sauce mixture over the noodles. Toss and fold everything together rapidly, allowing the noodles to char slightly on the wok surface - this char is the essence of the dish.",
            "Step 6: The Gai Lan. Add the Chinese broccoli stems first, then the leaves. Return the cooked pork to the wok. Toss everything together for 1-2 minutes until the broccoli is bright green and just tender.",
            "Step 7: Serve immediately. Pad See Ew does not hold; it must be eaten the moment it leaves the wok. Serve with a small dish of ground white pepper, dried chili flakes, and fish sauce for individual seasoning."
          ],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["stir-frying","wok cooking","searing"]},
          elementalProperties: {"Fire":0.45,"Water":0.15,"Earth":0.3,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Sun"],"signs":["aries","leo"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":590,"proteinG":32,"carbsG":65,"fatG":20,"fiberG":3,"sodiumMg":1450,"sugarG":8,"vitamins":["Vitamin C","Iron","Vitamin B12"],"minerals":["Zinc","Selenium"]},
          substitutions: [
            {"originalIngredient":"pork tenderloin","substituteOptions":["chicken breast sliced thin","shrimp","extra-firm tofu (vegan)"]},
            {"originalIngredient":"Chinese broccoli","substituteOptions":["broccolini","bok choy","regular broccoli florets"]},
            {"originalIngredient":"fresh wide rice noodles","substituteOptions":["dried wide rice noodles, soaked"]}
          ]
        },
        {
          name: "Khao Pad Kra Pao Moo",
          description: "Basil Fried Rice is the logical extension of the beloved Pad Krapow into a complete one-dish meal. Cooked jasmine rice is stir-fried at violent heat with minced pork, a potent paste of bird eye chilies and garlic, and a holy basil finish. Topped with a rugged, oil-blistered fried egg with a still-runny yolk. This is the definitive Thai working lunch.",
          details: {"cuisine":"Thai","prepTimeMinutes":10,"cookTimeMinutes":8,"baseServingSize":2,"spiceLevel":"Very High","season":["all"]},
          ingredients: [
            {"amount":2,"unit":"cups","name":"cooked jasmine rice","notes":"Day-old cold rice is strongly preferred. Freshly cooked rice contains too much moisture and will result in steamed clumps rather than properly fried grains."},
            {"amount":250,"unit":"g","name":"ground pork","notes":"Coarsely ground is preferable to fine mince for better texture."},
            {"amount":1,"unit":"cup","name":"holy basil leaves","notes":"Krapow variety. The defining ingredient. Do not substitute with Thai sweet basil."},
            {"amount":5,"unit":"cloves","name":"garlic","notes":"Roughly chopped."},
            {"amount":4,"unit":"whole","name":"bird eye chilies","notes":"Adjust quantity for heat preference. Pounded with the garlic."},
            {"amount":1,"unit":"tbsp","name":"oyster sauce","notes":"For gloss and umami."},
            {"amount":1,"unit":"tbsp","name":"fish sauce","notes":"For salinity."},
            {"amount":1,"unit":"tsp","name":"dark soy sauce","notes":"For color."},
            {"amount":1,"unit":"tsp","name":"sugar","notes":"To balance."},
            {"amount":2,"unit":"large","name":"eggs","notes":"Fried separately in abundant hot oil until the white is blistered and crispy but the yolk is still fully runny."},
            {"amount":3,"unit":"tbsp","name":"vegetable oil","notes":"Divided: 1 tbsp for the rice, 2 tbsp for the fried egg."}
          ],
          instructions: [
            "Step 1: The Aromatic Foundation. Pound the garlic and bird eye chilies in a mortar and pestle into a coarse paste. This releases more aromatics than simply chopping.",
            "Step 2: The Pork Sear. Heat a wok until smoking. Add 1 tablespoon of oil and the garlic-chili paste. Fry for exactly 10 seconds until blindingly fragrant. Immediately add the ground pork. Break it apart aggressively and stir-fry over maximum heat until cooked through and just beginning to caramelize.",
            "Step 3: The Sauce. Add the oyster sauce, fish sauce, dark soy sauce, and sugar. Toss to coat the meat in a sticky, dark glaze.",
            "Step 4: The Rice. Add the cold, day-old rice to the wok. Break up any clumps with a spatula. Stir-fry aggressively for 2-3 minutes, pressing the rice against the hot wok surface to achieve slight crisping on individual grains.",
            "Step 5: The Basil. Turn off the heat. Add the holy basil leaves all at once. Toss once quickly; the residual heat will wilt them while preserving their volatile aroma.",
            "Step 6: The Egg. In a separate small pan or wok, heat 2 tablespoons of oil until shimmering and near-smoking. Crack an egg in. It will immediately blister and spit. The white should become lacy and crispy at the edges while the yolk remains soft. This requires high heat and courage.",
            "Step 7: Plate. Mound the basil fried rice in a wide bowl. Place the fried egg directly on top. Serve with cucumber slices and fish sauce with fresh chilies on the side."
          ],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["stir-frying","wok cooking","frying"]},
          elementalProperties: {"Fire":0.5,"Water":0.1,"Earth":0.3,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Sun"],"signs":["scorpio","aries"],"lunarPhases":["Waxing Crescent"]},
          nutritionPerServing: {"calories":545,"proteinG":30,"carbsG":52,"fatG":24,"fiberG":2,"sodiumMg":1200,"sugarG":4,"vitamins":["Vitamin B6","Niacin"],"minerals":["Iron","Zinc"]},
          substitutions: [
            {"originalIngredient":"ground pork","substituteOptions":["ground chicken","minced beef","crumbled extra-firm tofu (vegan)"]},
            {"originalIngredient":"holy basil","substituteOptions":["Thai sweet basil (less peppery result)"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce (vegetarian)"]}
          ]
        },
        {
          name: "Suea Rong Hai",
          description: "Crying Tiger is a dramatic Thai grilled beef dish. The name supposedly derives from the idea that the beef is so delicious it would make a tiger weep with longing. Thick-cut beef sirloin is simply marinated in fish sauce, oyster sauce, and white pepper, then grilled hot over charcoal to a medium-rare, rested, and sliced against the grain. The magic is entirely in the accompanying Nam Jim Jaew - an extraordinary Isaan dipping sauce of toasted rice powder, dried chilies, fish sauce, lime, and tamarind.",
          details: {"cuisine":"Thai","prepTimeMinutes":20,"cookTimeMinutes":15,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [
            {"amount":500,"unit":"g","name":"beef sirloin or ribeye","notes":"Cut 1 to 1.5 inches thick. The thickness protects the interior during the high-heat grilling."},
            {"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For the beef marinade."},
            {"amount":1,"unit":"tbsp","name":"oyster sauce","notes":"For the marinade gloss."},
            {"amount":1,"unit":"tsp","name":"ground white pepper","notes":"For the marinade."},
            {"amount":1,"unit":"tsp","name":"sugar","notes":"For the marinade."},
            {"amount":3,"unit":"tbsp","name":"fresh lime juice","notes":"For the Nam Jim Jaew dipping sauce."},
            {"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For the Nam Jim Jaew."},
            {"amount":1,"unit":"tbsp","name":"tamarind paste","notes":"For the Nam Jim Jaew. Provides deep, fruity sourness."},
            {"amount":1,"unit":"tbsp","name":"toasted rice powder","notes":"Khao Khua - toasted and ground glutinous rice. Essential for the dipping sauce texture."},
            {"amount":1,"unit":"tsp","name":"dried chili flakes","notes":"Roasted and ground, for the Nam Jim Jaew."},
            {"amount":1,"unit":"tsp","name":"palm sugar","notes":"For the Nam Jim Jaew."},
            {"amount":2,"unit":"stalks","name":"green onions","notes":"Finely sliced, for the Nam Jim Jaew."}
          ],
          instructions: [
            "Step 1: Marinate the Beef. In a shallow dish, combine the fish sauce, oyster sauce, white pepper, and sugar. Add the thick-cut steaks and turn to coat. Marinate for at least 30 minutes at room temperature or up to 2 hours refrigerated.",
            "Step 2: Make the Nam Jim Jaew. Combine the lime juice, fish sauce, tamarind paste, toasted rice powder, dried chili flakes, and palm sugar in a bowl. Stir until the sugar and rice powder are well distributed. Add the sliced green onions. The sauce should be sour, spicy, savory, and complex with a slightly thick texture from the rice powder. Adjust to taste.",
            "Step 3: Preheat the Grill. Heat a charcoal grill or cast-iron grill pan to its maximum temperature. The heat must be intense for proper searing.",
            "Step 4: Grill the Beef. Remove the beef from the marinade (do not wipe off). Place on the blazing hot grill. Grill for 3-4 minutes per side for medium-rare, depending on thickness. The exterior should be deeply charred in places while the interior remains pink.",
            "Step 5: The Rest. Remove the beef from the grill and rest on a cutting board for at least 5 minutes. This is non-negotiable; cutting immediately will lose all the precious juices.",
            "Step 6: Slice and Serve. Slice the rested beef thinly against the grain. Arrange on a plate and serve alongside the Nam Jim Jaew dipping sauce and a plate of fresh vegetables (cucumber, tomato, cabbage)."
          ],
          classifications: {"mealType":["dinner"],"cookingMethods":["grilling","marinating"]},
          elementalProperties: {"Fire":0.45,"Water":0.15,"Earth":0.3,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Saturn"],"signs":["aries","capricorn"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":420,"proteinG":45,"carbsG":8,"fatG":22,"fiberG":1,"sodiumMg":1050,"sugarG":5,"vitamins":["Vitamin B12","Niacin","Iron"],"minerals":["Zinc","Phosphorus"]},
          substitutions: [
            {"originalIngredient":"beef sirloin","substituteOptions":["pork shoulder steak","lamb leg steak","portobello mushrooms (vegetarian)"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce (vegetarian)"]},
            {"originalIngredient":"tamarind paste","substituteOptions":["lime juice plus a touch of brown sugar"]}
          ]
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
          description: "Thailand's most beloved dessert and a masterpiece of textural and flavor contrast. Glutinous sticky rice is steamed until tender, then soaked in a warm, salted coconut cream sauce that penetrates each grain. It is served alongside perfectly ripe, fragrant Ataulfo or Nam Dok Mai mangoes, with an additional drizzle of rich coconut cream and a garnish of toasted mung beans.",
          details: {"cuisine":"Thai","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":4,"spiceLevel":"None","season":["summer","spring"]},
          ingredients: [
            {"amount":2,"unit":"cups","name":"glutinous sticky rice","notes":"Soaked in cold water for at least 4 hours or overnight. Do not substitute with regular jasmine rice."},
            {"amount":400,"unit":"ml","name":"full-fat coconut milk","notes":"Divided: 300ml for the soaking sauce, 100ml for the topping cream."},
            {"amount":4,"unit":"tbsp","name":"granulated sugar","notes":"Divided: 3 tbsp for the soaking sauce, 1 tbsp for the topping cream."},
            {"amount":1,"unit":"tsp","name":"fine sea salt","notes":"Divided: 0.5 tsp for each component. The salt is essential and not optional."},
            {"amount":2,"unit":"whole","name":"ripe mangoes","notes":"Nam Dok Mai or Ataulfo variety. Sliced lengthwise off the pit and peeled."},
            {"amount":2,"unit":"tbsp","name":"toasted mung beans","notes":"Or toasted sesame seeds. For the final garnish texture."},
            {"amount":2,"unit":"large","name":"pandan leaves","notes":"Knotted and placed in the steamer for subtle fragrance. Optional but traditional."}
          ],
          instructions: [
            "Step 1: Soak and Steam the Rice. Drain the soaked glutinous rice. Line a steamer basket with cheesecloth or a clean cloth. Spread the rice in an even layer. If using pandan leaves, tuck them amongst the rice. Steam over vigorously boiling water for 20-25 minutes until the grains are completely tender, chewy, and translucent.",
            "Step 2: The Coconut Soaking Sauce. While the rice steams, combine 300ml of the coconut milk, 3 tablespoons of sugar, and 0.5 teaspoon of salt in a small saucepan. Heat over medium-low heat, stirring constantly, until the sugar and salt are fully dissolved. Do not boil. Remove from heat immediately.",
            "Step 3: The Absorption. Transfer the hot, freshly steamed sticky rice to a wide mixing bowl. Immediately pour the warm coconut soaking sauce over the rice. Fold gently to combine. Cover the bowl tightly with plastic wrap and allow to rest for at least 15 minutes. The rice will absorb the majority of the sauce and become glossy and rich.",
            "Step 4: The Coconut Topping Cream. In the same small saucepan, combine the remaining 100ml of coconut milk, 1 tablespoon of sugar, and 0.5 teaspoon of salt. Heat gently, whisking until dissolved. This should be pourable and slightly thicker than the soaking sauce.",
            "Step 5: Plate and Serve. Mound a generous portion of the warm, glossy sticky rice on each plate. Fan the sliced mango alongside or over the rice. Drizzle the coconut topping cream generously over both the rice and the mango. Finish with a scattering of toasted mung beans for textural contrast."
          ],
          classifications: {"mealType":["dessert"],"cookingMethods":["steaming","simmering"]},
          elementalProperties: {"Fire":0.05,"Water":0.45,"Earth":0.4,"Air":0.1},
          astrologicalAffinities: {"planets":["Moon","Venus"],"signs":["cancer","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":420,"proteinG":5,"carbsG":72,"fatG":14,"fiberG":3,"sodiumMg":280,"sugarG":28,"vitamins":["Vitamin C","Vitamin B6"],"minerals":["Potassium","Magnesium"]},
          substitutions: [
            {"originalIngredient":"ripe mangoes","substituteOptions":["ripe peaches (summer)","ripe jackfruit","durian (for a richer result)"]},
            {"originalIngredient":"toasted mung beans","substituteOptions":["toasted sesame seeds","crispy fried shallots"]}
          ]
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
