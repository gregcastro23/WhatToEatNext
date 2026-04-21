import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawWholeGrains = {
  brown_rice: {
      description: "A whole-grain cereal (*Oryza sativa*) that retains its nutrient-dense bran and germ layers. It has a chewier texture and nuttier flavor than white rice, and requires a significantly longer cooking time (around 45 minutes) to soften its tough outer cellulose layer.",
    name: "Brown Rice",

    // Base elemental properties (unscaled)
    elementalProperties: { Earth: 0.5, Water: 0.3, Air: 0.1, Fire: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 195, unit: "g" }, // Standard serving: 1 cup cooked
    scaledElemental: { Earth: 0.5, Water: 0.3, Air: 0.1, Fire: 0.1 }, // Scaled for harmony (already balanced)
    alchemicalProperties: {
      Spirit: 0.1,
      Essence: 0.2,
      Matter: 0.4,
      Substance: 0.3,
    }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.05, forceMagnitude: 0.9 }, // Mild warming, gentle force
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Venus"],
      favorableZodiac: ["cancer", "capricorn", "taurus"] as any[],
      elementalAffinity: {
        base: "Earth",
        secondary: "Water",
        decanModifiers: {
          first: { element: "Earth", planet: "Saturn" },
          second: { element: "Water", planet: "Moon" },
          third: { element: "Air", planet: "Mercury" },
        },
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Earth: 0.1, Water: 0.05 },
          preparationTips: [
            "Begin sprouting process",
            "Mindful cooking with minimal seasonings",
          ],
        },
        fullMoon: {
          elementalBoost: { Water: 0.15, Earth: 0.05 },
          preparationTips: [
            "Perfect for hearty dishes",
            "Enhanced digestibility",
          ],
        },
        waxingCrescent: {
          elementalBoost: { Earth: 0.05, Water: 0.1 },
          preparationTips: [
            "Good for starting fermentations",
            "Basic cooking methods",
          ],
        },
        firstQuarter: {
          elementalBoost: { Earth: 0.1, Air: 0.05 },
          preparationTips: [
            "Balanced seasonings",
            "Good for everyday preparations",
          ],
        },
      },
      aspectEnhancers: ["Moon trine Venus", "Saturn sextile Jupiter"],
    },
    qualities: [
      "nutty",
      "chewy",
      "wholesome",
      "earthy",
      "grounding",
      "nourishing",
    ],
    origin: ["Asia", "Global cultivation"],
    season: ["all"],
    category: "grains",
    subCategory: "rice",
    nutritionalProfile: {
      serving_size: "1/2 cup cooked",
      calories: 108,
      macros: {
        protein: 2.5,
        carbs: 22.4,
        fat: 0.9,
        fiber: 1.8,
        saturatedFat: 0.2,
        sugar: 0.4,
        potassium: 84,
        sodium: 1,
      },
      vitamins: {
        B1: 0.11,
        B3: 0.13,
        B6: 0.14,
        E: 0.08,
        folate: 0.04,
      },
      minerals: {
        manganese: 0.86,
        magnesium: 0.36,
        phosphorus: 0.33,
        selenium: 0.42,
        zinc: 0.18,
        copper: 0.11,
        iron: 0.1,
      },
      glycemic_index: 68,
      source: "USDA FoodData Central",
    },
    healthBenefits: {
      digestiveHealth: {
        benefit: "Digestive Support",
        mechanism:
          "Fiber content promotes healthy gut bacteria and regular bowel movements",
        evidence:
          "Studies show whole grains increase beneficial gut microbiota diversity",
      },
      heartHealth: {
        benefit: "Cardiovascular Support",
        mechanism:
          "Fiber, antioxidants, and minerals help manage cholesterol and blood pressure",
        evidence:
          "Regular whole grain consumption associated with reduced heart disease risk",
      },
      bloodSugarControl: {
        benefit: "Blood Sugar Regulation",
        mechanism: "Fiber and complex carbohydrates slow glucose absorption",
        evidence: "Lower glycemic impact compared to refined white rice",
      },
      weightManagement: {
        benefit: "Weight Management",
        mechanism:
          "Higher fiber content increases satiety and reduces overall calorie intake",
        evidence: "Associated with lower BMI in observational studies",
      },
      antioxidantEffects: {
        benefit: "Antioxidant Activity",
        mechanism: "Contains phenolic compounds that combat oxidative stress",
        compounds: ["ferulic acid", "caffeic acid", "sinapic acid"],
        notes: "Most concentrated in the bran layer",
      },
    },
    varieties: {
      short_grain: {
        name: "Short Grain Brown Rice",
        characteristics: "sticky, plump, tender",
        appearance: "stubby, nearly round grains",
        flavor: "nutty, slightly sweet",
        cooking_ratio: "1:2 rice to water",
        cooking_time: "45-50 minutes",
        best_for: "sushi, risotto, puddings, sticky preparations",
      },
      long_grain: {
        name: "Long Grain Brown Rice",
        characteristics: "fluffy, separate grains, drier texture",
        appearance: "slender, elongated grains",
        flavor: "mild nutty taste",
        cooking_ratio: "1:2.25 rice to water",
        cooking_time: "45-50 minutes",
        best_for: "pilafs, salads, stuffings, everyday use",
      },
      basmati: {
        name: "Brown Basmati Rice",
        characteristics: "aromatic, slender, distinctive fragrance",
        appearance: "long, slender grains that elongate when cooked",
        flavor: "nutty with distinctive aroma",
        cooking_ratio: "1:2 rice to water",
        cooking_time: "40-45 minutes",
        best_for: "Indian dishes, pilafs, biryanis",
      },
      jasmine: {
        name: "Brown Jasmine Rice",
        characteristics: "aromatic, slightly clinging, soft",
        appearance: "medium to long grain",
        flavor: "floral aroma, subtle sweetness",
        cooking_ratio: "1:1.75 rice to water",
        cooking_time: "40-45 minutes",
        best_for: "Southeast Asian cuisine, coconut-based dishes",
      },
      himalayan_red: {
        name: "Himalayan Red Rice",
        characteristics: "distinctive color, hearty texture",
        appearance: "russet-colored, medium grain",
        flavor: "robust, earthy, nutty",
        cooking_ratio: "1:2.5 rice to water",
        cooking_time: "45-50 minutes",
        best_for: "substantial side dishes, grain bowls, salads",
      },
    },
    affinities: [
      "onions",
      "garlic",
      "ginger",
      "lentils",
      "beans",
      "soy sauce",
      "miso",
      "coconut milk",
      "vegetable broth",
      "mushrooms",
      "carrots",
      "peas",
      "leafy greens",
      "nuts",
      "seeds",
      "herbs",
      "curry spices",
      "citrus zest",
    ],
    cookingMethods: [
      "boil",
      "steam",
      "pilaf",
      "risotto",
      "pressure cook",
      "bake",
      "stuff",
      "soup",
      "porridge",
      "sprouted",
    ],
    preparation: {
      soaking: {
        duration: "8-12 hours",
        benefits: [
          "reduces cooking time by 10-15 minutes",
          "improves digestibility",
          "activates enzymes",
        ],
        method:
          "room temperature water with optional splash of lemon juice or vinegar",
        notes: "Discard soaking water and rinse before cooking",
      },
      rinsing: {
        method: "rinse in cool water until water runs clear",
        purpose: "removes dust and excess starch",
        technique: "swirl in bowl of water or use strainer",
        notes: "Some prefer to skip for maximum nutrition retention",
      },
      toasting: {
        method: "dry toast in pan before cooking",
        benefits: "enhances nutty flavor",
        timing: "3-5 minutes until fragrant",
        notes: "Stir constantly to prevent burning",
      },
    },
    culinaryApplications: {
      basic_method: {
        name: "Basic Method",
        steps: [
          "rinse thoroughly",
          "soak (optional) 30 minutes to overnight",
          "combine with water (2 parts water to 1 part rice)",
          "bring to boil",
          "reduce heat to low simmer",
          "cover with tight-fitting lid",
          "cook 45-50 minutes",
          "rest 10 minutes off heat",
          "fluff with fork",
        ],
        tips: [
          "avoid lifting lid while cooking",
          "ensure tight-fitting lid",
          "fluff with fork after resting",
          "check for doneness - should be tender but slightly chewy",
        ],
        variations: {
          stovetop: "traditional method as described above",
          rice_cooker: "same ratio, select brown rice setting",
          pressure_cooker:
            "1:1.25 rice to water, high pressure 20-22 minutes, natural release",
        },
      },
      pilaf_method: {
        name: "Pilaf Method",
        steps: [
          "sauté onions and aromatics in oil",
          "toast rice in oil until fragrant",
          "add hot liquid (stock preferred)",
          "bring to boil, then reduce heat",
          "simmer covered 45-50 minutes",
          "rest off heat 10 minutes",
        ],
        aromatics: ["onion", "garlic", "carrots", "celery", "spices", "herbs"],
        variations: {
          mushroom: "incorporate dried or fresh mushrooms, thyme",
          herb: "use abundant fresh herbs, lemon zest",
          vegetable: "add diced vegetables that hold up to long cooking",
        },
        notes: "Excellent way to add depth of flavor",
      },
      grain_bowl: {
        name: "Grain Bowl",
        components: {
          base: "cooked brown rice",
          protein: ["tofu", "tempeh", "beans", "lentils", "eggs", "fish"],
          vegetables: ["roasted", "pickled", "raw", "fermented"],
          sauce: ["tahini-based", "peanut", "miso", "vinaigrette"],
          toppings: ["seeds", "nuts", "herbs", "sprouts", "avocado"],
        },
        preparation: "Arrange components in individual bowls",
        variations: {
          asian_inspired:
            "edamame, pickled vegetables, sesame, tamari-based sauce",
          mediterranean:
            "chickpeas, cucumber, tomato, feta, herb-lemon dressing",
          mexican: "black beans, corn, avocado, lime-cilantro dressing",
        },
        notes:
          "Infinitely customizable to dietary preferences and what's on hand",
      },
      fried_rice: {
        name: "Brown Fried Rice",
        preparation: "best with day-old refrigerated rice",
        key_technique:
          "high heat, continuous stirring, cook ingredients separately",
        essential_ingredients: [
          "oil with high smoke point",
          "aromatics",
          "eggs",
          "vegetables",
        ],
        variations: {
          classic: "with peas, carrots, scrambled egg, green onion",
          kimchi: "incorporate kimchi, sesame oil, gochujang",
          pineapple: "with pineapple chunks, cashews, curry powder",
        },
        notes:
          "Pre-cook and cool rice for best texture - never use freshly cooked rice",
      },
      rice_pudding: {
        name: "Brown Rice Pudding",
        cooking_method: "slow simmer with frequent stirring",
        key_ingredients: [
          "milk or plant milk",
          "sweetener",
          "spices",
          "dried fruit",
        ],
        variations: {
          classic: "cinnamon, raisins, vanilla",
          coconut: "coconut milk, cardamom, pistachios",
          chocolate: "cocoa powder, almond milk, cherries",
        },
        notes: "Takes longer than white rice pudding but has nuttier flavor",
      },
    },
    storage: {
      uncooked: {
        airtight_container: {
          room_temperature: "up to 6 months in cool, dark place",
          refrigerator: "up to 1 year",
          freezer: "up to 2 years",
          notes: "Natural oils can go rancid so store properly",
        },
      },

      sprouted: {
        refrigerator: {
          duration: "3-5 days",
          container: "breathable container with paper towel",
          notes: "Rinse daily if storing longer than 2 days",
        },
      },
    },
    seasonalAdjustments: {},
    cuisineAffinity: {
      modern_health: {
        preparations: "grain bowls, alternative sushi, veggie burgers",
        emphasis: "nutrient density, whole foods philosophy",
        notes: "Often featured in contemporary health-focused cuisines",
      },
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] }
},

  quinoa: {
      description: "A pseudocereal seed (*Chenopodium quinoa*) from the amaranth family, revered for containing all nine essential amino acids (a complete protein). It cooks quickly, yielding a fluffy, slightly crunchy texture and a distinctively earthy, nutty flavor that works perfectly in salads and grain bowls.",
    name: "Quinoa",
    elementalProperties: { Earth: 0.4, Air: 0.4, Water: 0.2, Fire: 0 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["cancer", "gemini"] as any[],
      elementalAffinity: {
        base: "Air",
        decanModifiers: {
          first: { element: "Air", planet: "Mercury" },
          second: { element: "Earth", planet: "Moon" },
          third: { element: "Water", planet: "Neptune" },
        },
      },
    },
    qualities: ["light", "protein-rich", "versatile"],
    category: "grains",
    varieties: {},
    preparation: {
      rinsing: {
        duration: "1-2 minutes",
        purpose: "remove saponins",
      },
    },
      sensoryProfile: { taste: { spicy: 0, sweet: 0.1, sour: 0, bitter: 0.2, salty: 0, umami: 0.2 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},

  kamut: {
      description: "A trademarked name for Khorasan wheat (*Triticum turgidum turanicum*), an ancient grain characterized by kernels twice the size of modern wheat. It has a rich, buttery, and slightly sweet flavor, providing exceptional chew when boiled for salads or milled into a golden-hued pasta dough.",
    name: "Kamut",
    elementalProperties: { Earth: 0.5, Fire: 0.2, Air: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Earth"],
      favorableZodiac: ["Virgo", "Taurus", "Capricorn"],
      seasonalAffinity: ["autumn"],
    },
    qualities: ["buttery", "rich", "chewy"],
    category: "grains",
    culinaryApplications: {
      basic_cooking: {
        ratio: "1:3 kamut to water",
        cooking_time: "60-90 minutes",
        method: "simmer until tender",
      },
      soaked_method: {
        soaking: "12-24 hours",
        cooking_time: "45-60 minutes",
        benefits: "improved digestibility",
      },
    },
    preparations: {
      grain_bowl: {
        method: "cook until chewy",
        additions: ["roasted vegetables", "herbs", "dressing"],
        service: "warm or room temperature",
      },
      breakfast_porridge: {
        method: "cook longer for softer texture",
        additions: ["dried fruit", "nuts", "honey"],
        service: "hot",
      },
    },
    nutritionalProfile: {
      protein: "high protein content",
      minerals: ["selenium", "zinc", "magnesium"],
      vitamins: ["e", "b-complex"],
      calories_per_100g: 337,
      protein_g: 14.7,
      fiber_g: 11.1,
        calories: 100,
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},

  spelt_berries: {
      description: "The whole, unprocessed grains of an ancient wheat subspecies (*Triticum spelta*). They possess a tough outer hull that must be mechanically removed before cooking, yielding a grain with a satisfying, popping chew and a distinctly sweet, intensely nutty flavor profile that is more complex than standard wheat berries.",
    name: "Spelt Berries",
    elementalProperties: { Earth: 0.5, Fire: 0.2, Air: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Earth"],
      favorableZodiac: ["Virgo", "Taurus", "Capricorn"],
      seasonalAffinity: ["autumn"],
    },
    qualities: ["nutty", "complex", "hearty"],
    category: "grains",
    culinaryApplications: {
      basic_cooking: {
        ratio: "1:3 spelt to water",
        cooking_time: "45-60 minutes",
        method: "simmer until tender",
      },
      pressure_cooker: {
        ratio: "1:2.5 spelt to water",
        cooking_time: "25-30 minutes",
        notes: "natural release recommended",
      },
    },
    preparations: {
      salads: {
        method: "cook until al dente",
        additions: ["fresh vegetables", "vinaigrette", "herbs"],
        service: "room temperature",
      },
      soups: {
        method: "add to broth",
        cooking_time: "30-40 minutes in soup",
        notes: "adds hearty texture",
      },
    },
    nutritionalProfile: {
      protein: "high quality",
      minerals: ["manganese", "phosphorus", "iron"],
      vitamins: ["b3", "b6", "thiamin"],
      calories_per_100g: 338,
      protein_g: 14.6,
      fiber_g: 10.7,
        calories: 100,
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},

  einkorn: {
      description: "An ancient species of wheat (*Triticum monococcum*), considered the first domesticated wheat in human history. It has a significantly simpler gluten structure than modern wheat (making it easier for some to digest) and offers a profoundly rich, nutty, and slightly sweet flavor when baked into dense, rustic breads.",
    name: "Einkorn",
    elementalProperties: { Earth: 0.5, Fire: 0.2, Air: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Venus"],
      favorableZodiac: ["Virgo", "Taurus", "Capricorn"],
      seasonalAffinity: ["autumn"],
    },
    qualities: ["nutty", "ancient", "nutritious"],
    category: "grains",
    culinaryApplications: {
      basic_cooking: {
        ratio: "1:2 einkorn to water",
        cooking_time: "30-35 minutes",
        method: "simmer gently",
      },
      risotto_style: {
        method: "gradual broth addition",
        cooking_time: "25-30 minutes",
        notes: "stir frequently",
      },
    },
    preparations: {
      pilaf: {
        method: "toast then simmer",
        additions: ["mushrooms", "onions", "herbs"],
        service: "hot",
      },
      breakfast: {
        method: "cook until creamy",
        additions: ["milk", "honey", "fruit"],
        service: "hot",
      },
    },
    nutritionalProfile: {
      protein: "high protein",
      minerals: ["zinc", "iron", "manganese"],
      vitamins: ["a", "b-complex"],
      calories_per_100g: 340,
      protein_g: 15.3,
      fiber_g: 8.7,
        calories: 100,
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},

  rye_berries: {
      description: "The whole, unprocessed grain of rye (*Secale cereale*), containing the bran, germ, and endosperm. They require long soaking and simmering to soften but offer a profoundly chewy, dense texture and a distinctively sour, earthy, and complex flavor that makes an incredibly hearty grain salad.",
    name: "Rye Berries",
    elementalProperties: { Earth: 0.5, Water: 0.2, Air: 0.1, Fire: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Venus"],
      favorableZodiac: ["Virgo", "Taurus", "Capricorn"],
      seasonalAffinity: ["autumn"],
    },
    qualities: ["earthy", "robust", "hearty"],
    category: "grains",
    culinaryApplications: {
      basic_cooking: {
        ratio: "1:3 rye to water",
        cooking_time: "60-75 minutes",
        method: "simmer until tender",
      },
      soaked_method: {
        soaking: "8-12 hours",
        cooking_time: "45-60 minutes",
        benefits: "improved texture and digestibility",
      },
    },
    preparations: {
      bread_making: {
        method: "grind fresh",
        fermentation: "longer rise time needed",
        notes: "pairs well with sourdough",
      },
      hearty_salads: {
        method: "cook until chewy",
        additions: ["root vegetables", "hardy greens", "vinaigrette"],
        service: "room temperature",
      },
    },
    nutritionalProfile: {
      protein: "moderate protein",
      minerals: ["manganese", "phosphorus", "magnesium"],
      vitamins: ["b1", "b3", "b6"],
      calories_per_100g: 338,
      protein_g: 10.3,
      fiber_g: 15.1,
        calories: 100,
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},

  wild_rice: {
      description: "Not a true rice, but rather the long, dark seed of a marsh grass (*Zizania*) native to North America. It offers a distinctly intense, woodsy, and toasted tea-like flavor, and features a tough outer sheath that pops open to reveal a tender interior when boiled.",
    name: "Wild Rice",
    elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Venus"],
      favorableZodiac: ["Virgo", "Taurus", "Capricorn"],
      seasonalAffinity: ["autumn"],
    },
    qualities: ["nutty", "complex", "aromatic"],
    category: "grains",
    culinaryApplications: {
      basic_cooking: {
        ratio: "1:3 rice to water",
        cooking_time: "45-55 minutes",
        method: "simmer until grains split",
      },
      pilaf_method: {
        steps: [
          "toast in oil",
          "add aromatics",
          "simmer in broth",
          "steam finish",
        ],
        notes: "enhances nutty flavor",
      },
    },
    preparations: {
      grain_blends: {
        method: "mix with other rices",
        ratio: "1:2 wild to other rice",
        notes: "adds texture and nutrition",
      },
    },
    nutritionalProfile: {
      protein: "high protein",
      minerals: ["zinc", "phosphorus", "potassium"],
      vitamins: ["b6", "folate", "niacin"],
      calories_per_100g: 357,
      protein_g: 14.7,
      fiber_g: 6.2,
        calories: 100,
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},

  triticale: {
      description: "A hybrid grain created by crossing wheat (*Triticum*) and rye (*Secale*), aiming to combine the yield potential and grain quality of wheat with the disease and environmental tolerance of rye. It offers a dense, chewy texture and a flavor that is sweeter than rye but more complex and earthy than standard wheat.",
    name: "Triticale",
    elementalProperties: { Earth: 0.5, Fire: 0.2, Air: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Venus"],
      favorableZodiac: ["Virgo", "Taurus", "Capricorn"],
      seasonalAffinity: ["autumn"],
    },
    qualities: ["nutty", "hybrid vigor", "nutritious"],
    category: "grains",
    culinaryApplications: {
      basic_cooking: {
        ratio: "1:3 triticale to water",
        cooking_time: "45-60 minutes",
        method: "simmer until tender",
      },
      overnight_method: {
        soaking: "8-12 hours",
        cooking_time: "30-40 minutes",
        benefits: "quicker cooking, better absorption",
      },
    },
    preparations: {
      breakfast_cereal: {
        method: "cook until soft",
        additions: ["dried fruits", "seeds", "milk"],
        service: "hot",
      },
      grain_salad: {
        method: "cook until chewy",
        additions: ["roasted vegetables", "fresh herbs", "citrus"],
        service: "room temperature",
      },
    },
    nutritionalProfile: {
      protein: "high protein",
      minerals: ["manganese", "iron", "copper"],
      vitamins: ["b1", "b2", "folate"],
      calories_per_100g: 336,
      protein_g: 13.1,
      fiber_g: 9.8,
        calories: 100,
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},

  oats: {
      description: "A resilient cereal grain (*Avena sativa*) valued for its high soluble fiber (beta-glucan), which creates a creamy, viscous texture when boiled in liquids. Rolled oats are steamed and flattened for quicker cooking, while steel-cut oats retain more texture and require longer simmering.\n\n**Selection & Storage:** Look for oats that smell slightly sweet and toasty. Because they contain natural fats that can go rancid, store them in a cool, dark pantry in an airtight container, or refrigerate for long-term storage.",
    name: "Oats",
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Venus"],
      favorableZodiac: ["cancer", "taurus"] as any[],
      elementalAffinity: {
        base: "Earth",
        decanModifiers: {
          first: { element: "Earth", planet: "Moon" },
          second: { element: "Water", planet: "Venus" },
          third: { element: "Air", planet: "Mercury" },
        },
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Earth: 0.1, Water: 0.1 },
          preparationTips: ["Best for overnight oats"],
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ["Ideal for creamy porridge"],
        },
      },
    },
    qualities: ["nutty", "chewy", "wholesome"],
    category: "grains",
    varieties: {
      short_grain: {
        characteristics: "sticky, plump",
        cooking_ratio: "1:2 rice to water",
        cooking_time: "45-50 minutes",
      },
      long_grain: {
        characteristics: "fluffy, separate grains",
        cooking_ratio: "1:2.25 rice to water",
        cooking_time: "45-50 minutes",
      },
    },
    preparation: {
      soaking: {
        duration: "8-12 hours",
        benefits: ["reduces cooking time", "improves digestibility"],
      },
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},

  barley: {
      description: "A hardy cereal grain (*Hordeum vulgare*) with a tough hull. It contains high levels of soluble beta-glucan fiber, which causes it to release a thick, gelatinous starch when simmered, naturally thickening hearty beef stews and winter soups.",
    name: "Barley",
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["cancer", "taurus"] as any[],
    },
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    qualities: ["nutty", "chewy", "wholesome"],
    category: "grains",
    culinaryApplications: {
      basic_cooking: {
        ratio: "1:3 barley to water",
        cooking_time: "60-75 minutes",
        method: "simmer until tender",
      },
      soaked_method: {
        soaking: "8-12 hours",
        cooking_time: "45-60 minutes",
        benefits: "improved texture and digestibility",
      },
    },
    preparations: {
      bread_making: {
        method: "grind fresh",
        fermentation: "longer rise time needed",
        notes: "pairs well with sourdough",
      },
      hearty_salads: {
        method: "cook until chewy",
        additions: ["root vegetables", "hardy greens", "vinaigrette"],
        service: "room temperature",
      },
    },
    nutritionalProfile: {
      protein: "moderate protein",
      minerals: ["manganese", "phosphorus", "magnesium"],
      vitamins: ["b1", "b3", "b6"],
      calories_per_100g: 338,
      protein_g: 10.3,
      fiber_g: 15.1,
        calories: 100,
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  flour: {
      description: "A powder made by grinding raw grains, roots, beans, nuts, or seeds, though most commonly refers to wheat. Its specific culinary use is dictated by its protein content: high-protein bread flour forms strong gluten networks for chewy breads, while low-protein cake flour yields tender, delicate crumb structures.",
    name: "flour",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  rice: {
      description: "The edible starchy seed of *Oryza sativa* (Asian rice) or *O. glaberrima* (African rice), domesticated over 10,000 years ago and now feeding more than half the global population. Its culinary behavior depends on amylose-to-amylopectin starch ratio: long-grain varieties stay separate and fluffy; medium and short-grain grow creamy or sticky; glutinous rice turns fully chewy. Technique matters — rinse until water runs clear, then use the appropriate water ratio and resting period for the target texture.",
    name: "rice",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { spicy: 0, sweet: 0.2, sour: 0, bitter: 0, salty: 0, umami: 0.1 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  all_purpose_flour: {
      description: "A mid-protein (10–12%) wheat flour blended from hard and soft varieties to perform acceptably across most baked goods — the Swiss Army knife of American baking. Less chewy than bread flour and less tender than cake flour, it sits in the middle of the gluten spectrum. Bleached versions cook more predictably in cakes; unbleached has slightly more protein and a mellower cream color. Store airtight in cool, dry conditions; refrigerate for long-term use to deter pantry pests.",
    name: "all-purpose flour",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  whole_grain_bread: {
      description: "A staple food prepared from a dough of flour and water, usually baked. The inclusion of leavening agents (like yeast or sourdough starter) traps carbon dioxide gases within a gluten network, transforming a dense paste into a light, aerated, and highly absorbent sponge.\n\n**Selection & Storage:** Fresh artisanal bread should have a hard, shatteringly crisp crust and a soft interior. Store fresh bread in a paper bag at room temperature for a day or two, or slice and freeze it; never refrigerate bread, as the cold accelerates the staling (retrogradation) process.",
    name: "whole grain bread",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  steel_cut_oats: {
      description: "A resilient cereal grain (*Avena sativa*) valued for its high soluble fiber (beta-glucan), which creates a creamy, viscous texture when boiled in liquids. Rolled oats are steamed and flattened for quicker cooking, while steel-cut oats retain more texture and require longer simmering.\n\n**Selection & Storage:** Look for oats that smell slightly sweet and toasty. Because they contain natural fats that can go rancid, store them in a cool, dark pantry in an airtight container, or refrigerate for long-term storage.",
    name: "steel-cut oats",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  breadcrumbs: {
      description: "A cereal or pseudo-cereal product, breadcrumbs contributes complex carbohydrates, fiber, and a neutral-to-nutty flavor that anchors savory and sweet dishes across global cuisines.",
    name: "breadcrumbs",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  arborio_rice: {
      description: "An Italian short-grain rice (*Oryza sativa*) named after the town of Arborio in the Po Valley. Its exterior is rich in amylopectin starch, which dissolves slowly during constant stirring to create the signature, creamy, suspension characteristic of classic risotto, while the interior maintains a firm 'al dente' bite.",
    name: "arborio rice",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  bread_stuffing: {
      description: "A staple food prepared from a dough of flour and water, usually baked. The inclusion of leavening agents (like yeast or sourdough starter) traps carbon dioxide gases within a gluten network, transforming a dense paste into a light, aerated, and highly absorbent sponge.\n\n**Selection & Storage:** Fresh artisanal bread should have a hard, shatteringly crisp crust and a soft interior. Store fresh bread in a paper bag at room temperature for a day or two, or slice and freeze it; never refrigerate bread, as the cold accelerates the staling (retrogradation) process.",
    name: "bread stuffing",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  cheong_fun__rice_noodle_rolls_: {
      description: "A broad category of unleavened dough stretched, rolled, or cut into long, thin strips, prevalent in Asian cuisines. Unlike Italian pasta, which is almost exclusively wheat-based, Asian noodles are often made from rice, mung beans, sweet potatoes, or buckwheat, dramatically altering their cooking times and chewy textures.\n\n**Selection & Storage:** Dried rice or glass noodles require only a quick soak in hot water, while fresh wheat noodles require boiling. Store dried noodles in the pantry, and keep fresh noodles tightly wrapped in the refrigerator.",
    name: "cheong fun (rice noodle rolls)",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  glutinous_rice: {
      description: "The edible starchy seed of *Oryza sativa* (Asian rice) or *O. glaberrima* (African rice), domesticated over 10,000 years ago and now feeding more than half the global population. Its culinary behavior depends on amylose-to-amylopectin starch ratio: long-grain varieties stay separate and fluffy; medium and short-grain grow creamy or sticky; glutinous rice turns fully chewy. Technique matters — rinse until water runs clear, then use the appropriate water ratio and resting period for the target texture.",
    name: "glutinous rice",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  rustic_bread: {
      description: "A staple food prepared from a dough of flour and water, usually baked. The inclusion of leavening agents (like yeast or sourdough starter) traps carbon dioxide gases within a gluten network, transforming a dense paste into a light, aerated, and highly absorbent sponge.\n\n**Selection & Storage:** Fresh artisanal bread should have a hard, shatteringly crisp crust and a soft interior. Store fresh bread in a paper bag at room temperature for a day or two, or slice and freeze it; never refrigerate bread, as the cold accelerates the staling (retrogradation) process.",
    name: "rustic bread",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  white_sandwich_bread: {
      description: "A staple food prepared from a dough of flour and water, usually baked. The inclusion of leavening agents (like yeast or sourdough starter) traps carbon dioxide gases within a gluten network, transforming a dense paste into a light, aerated, and highly absorbent sponge.\n\n**Selection & Storage:** Fresh artisanal bread should have a hard, shatteringly crisp crust and a soft interior. Store fresh bread in a paper bag at room temperature for a day or two, or slice and freeze it; never refrigerate bread, as the cold accelerates the staling (retrogradation) process.",
    name: "white sandwich bread",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  idli_rice: {
      description: "The edible starchy seed of *Oryza sativa* (Asian rice) or *O. glaberrima* (African rice), domesticated over 10,000 years ago and now feeding more than half the global population. Its culinary behavior depends on amylose-to-amylopectin starch ratio: long-grain varieties stay separate and fluffy; medium and short-grain grow creamy or sticky; glutinous rice turns fully chewy. Technique matters — rinse until water runs clear, then use the appropriate water ratio and resting period for the target texture.",
    name: "idli rice",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  flattened_rice: {
      description: "The edible starchy seed of *Oryza sativa* (Asian rice) or *O. glaberrima* (African rice), domesticated over 10,000 years ago and now feeding more than half the global population. Its culinary behavior depends on amylose-to-amylopectin starch ratio: long-grain varieties stay separate and fluffy; medium and short-grain grow creamy or sticky; glutinous rice turns fully chewy. Technique matters — rinse until water runs clear, then use the appropriate water ratio and resting period for the target texture.",
    name: "flattened rice",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  basmati_rice: {
      description: "A highly aromatic, extra-long-grain rice originating from the Indian subcontinent. It undergoes an aging process before milling to reduce its moisture content, ensuring that when cooked, the grains elongate dramatically and remain completely separate, fluffy, and dry—perfect for biryanis.",
    name: "basmati rice",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  steamed_rice: {
      description: "The edible starchy seed of *Oryza sativa* (Asian rice) or *O. glaberrima* (African rice), domesticated over 10,000 years ago and now feeding more than half the global population. Its culinary behavior depends on amylose-to-amylopectin starch ratio: long-grain varieties stay separate and fluffy; medium and short-grain grow creamy or sticky; glutinous rice turns fully chewy. Technique matters — rinse until water runs clear, then use the appropriate water ratio and resting period for the target texture.",
    name: "steamed rice",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  sushi_rice: {
      description: "The edible starchy seed of *Oryza sativa* (Asian rice) or *O. glaberrima* (African rice), domesticated over 10,000 years ago and now feeding more than half the global population. Its culinary behavior depends on amylose-to-amylopectin starch ratio: long-grain varieties stay separate and fluffy; medium and short-grain grow creamy or sticky; glutinous rice turns fully chewy. Technique matters — rinse until water runs clear, then use the appropriate water ratio and resting period for the target texture.",
    name: "sushi rice",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  short_grain_rice: {
      description: "The edible starchy seed of *Oryza sativa* (Asian rice) or *O. glaberrima* (African rice), domesticated over 10,000 years ago and now feeding more than half the global population. Its culinary behavior depends on amylose-to-amylopectin starch ratio: long-grain varieties stay separate and fluffy; medium and short-grain grow creamy or sticky; glutinous rice turns fully chewy. Technique matters — rinse until water runs clear, then use the appropriate water ratio and resting period for the target texture.",
    name: "short grain rice",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  sliced_rice_cakes: {
      description: "The edible starchy seed of *Oryza sativa* (Asian rice) or *O. glaberrima* (African rice), domesticated over 10,000 years ago and now feeding more than half the global population. Its culinary behavior depends on amylose-to-amylopectin starch ratio: long-grain varieties stay separate and fluffy; medium and short-grain grow creamy or sticky; glutinous rice turns fully chewy. Technique matters — rinse until water runs clear, then use the appropriate water ratio and resting period for the target texture.",
    name: "sliced rice cakes",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  rice_cakes: {
      description: "The edible starchy seed of *Oryza sativa* (Asian rice) or *O. glaberrima* (African rice), domesticated over 10,000 years ago and now feeding more than half the global population. Its culinary behavior depends on amylose-to-amylopectin starch ratio: long-grain varieties stay separate and fluffy; medium and short-grain grow creamy or sticky; glutinous rice turns fully chewy. Technique matters — rinse until water runs clear, then use the appropriate water ratio and resting period for the target texture.",
    name: "rice cakes",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  rice_flour: {
      description: "The powder produced by milling raw grains, roots, beans, nuts, or seeds — most commonly wheat (*Triticum aestivum*). Its behavior in baking is governed by protein content: high-protein bread flour (12–14%) develops strong gluten networks for chewy yeasted breads, while low-protein cake flour (7–9%) yields tender, delicate crumb. Whole-grain flours include the bran and germ, adding fiber, fat, and perishability that demands cool storage to prevent rancidity.",
    name: "rice flour",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  flatbread: {
      description: "A cereal or pseudo-cereal product, flatbread contributes complex carbohydrates, fiber, and a neutral-to-nutty flavor that anchors savory and sweet dishes across global cuisines.",
    name: "flatbread",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  jasmine_rice: {
      description: "A fragrant, long-grain rice (*Oryza sativa*) primarily cultivated in Thailand. It contains the aromatic compound 2-acetyl-1-pyrroline, which gives it a deeply floral, pandan-like, and slightly buttery aroma that perfectly complements the rich coconut curries of Southeast Asia.",
    name: "jasmine rice",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  glass_noodles: {
      description: "A broad category of unleavened dough stretched, rolled, or cut into long, thin strips, prevalent in Asian cuisines. Unlike Italian pasta, which is almost exclusively wheat-based, Asian noodles are often made from rice, mung beans, sweet potatoes, or buckwheat, dramatically altering their cooking times and chewy textures.\n\n**Selection & Storage:** Dried rice or glass noodles require only a quick soak in hot water, while fresh wheat noodles require boiling. Store dried noodles in the pantry, and keep fresh noodles tightly wrapped in the refrigerator.",
    name: "glass noodles",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  rice_noodles: {
      description: "A broad category of unleavened dough stretched, rolled, or cut into long, thin strips, prevalent in Asian cuisines. Unlike Italian pasta, which is almost exclusively wheat-based, Asian noodles are often made from rice, mung beans, sweet potatoes, or buckwheat, dramatically altering their cooking times and chewy textures.\n\n**Selection & Storage:** Dried rice or glass noodles require only a quick soak in hot water, while fresh wheat noodles require boiling. Store dried noodles in the pantry, and keep fresh noodles tightly wrapped in the refrigerator.",
    name: "rice noodles",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  sticky_rice: {
      description: "The edible starchy seed of *Oryza sativa* (Asian rice) or *O. glaberrima* (African rice), domesticated over 10,000 years ago and now feeding more than half the global population. Its culinary behavior depends on amylose-to-amylopectin starch ratio: long-grain varieties stay separate and fluffy; medium and short-grain grow creamy or sticky; glutinous rice turns fully chewy. Technique matters — rinse until water runs clear, then use the appropriate water ratio and resting period for the target texture.",
    name: "sticky rice",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  tapioca_flour: {
      description: "The powder produced by milling raw grains, roots, beans, nuts, or seeds — most commonly wheat (*Triticum aestivum*). Its behavior in baking is governed by protein content: high-protein bread flour (12–14%) develops strong gluten networks for chewy yeasted breads, while low-protein cake flour (7–9%) yields tender, delicate crumb. Whole-grain flours include the bran and germ, adding fiber, fat, and perishability that demands cool storage to prevent rancidity.",
    name: "tapioca flour",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  glutinous_rice_flour: {
      description: "The powder produced by milling raw grains, roots, beans, nuts, or seeds — most commonly wheat (*Triticum aestivum*). Its behavior in baking is governed by protein content: high-protein bread flour (12–14%) develops strong gluten networks for chewy yeasted breads, while low-protein cake flour (7–9%) yields tender, delicate crumb. Whole-grain flours include the bran and germ, adding fiber, fat, and perishability that demands cool storage to prevent rancidity.",
    name: "glutinous rice flour",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  thick_rice_noodles: {
      description: "A broad category of unleavened dough stretched, rolled, or cut into long, thin strips, prevalent in Asian cuisines. Unlike Italian pasta, which is almost exclusively wheat-based, Asian noodles are often made from rice, mung beans, sweet potatoes, or buckwheat, dramatically altering their cooking times and chewy textures.\n\n**Selection & Storage:** Dried rice or glass noodles require only a quick soak in hot water, while fresh wheat noodles require boiling. Store dried noodles in the pantry, and keep fresh noodles tightly wrapped in the refrigerator.",
    name: "thick rice noodles",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
  broken_rice: {
      description: "The edible starchy seed of *Oryza sativa* (Asian rice) or *O. glaberrima* (African rice), domesticated over 10,000 years ago and now feeding more than half the global population. Its culinary behavior depends on amylose-to-amylopectin starch ratio: long-grain varieties stay separate and fluffy; medium and short-grain grow creamy or sticky; glutinous rice turns fully chewy. Technique matters — rinse until water runs clear, then use the appropriate water ratio and resting period for the target texture.",
    name: "broken rice",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ["carbohydrate-rich", "sustaining", "versatile"],
    category: "grains",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      nutritionalProfile: { serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] },
      pairingRecommendations: { complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] },
      storage: { pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }
},
};

// Fix the ingredient mappings to ensure they have all required properties
// ✅ Pattern MM-1: Type assertion for ZodiacSignType[] compatibility
export const wholeGrains: Record<string, IngredientMapping> =
  fixIngredientMappings(rawWholeGrains);

// Create a collection of all whole grains
export const _allWholeGrains = Object.values(wholeGrains);

export default wholeGrains;
