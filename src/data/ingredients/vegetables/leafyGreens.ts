import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

// Helper function for generating consistent numeric values
const generateVegetableAttributes = (vegData: {
  water: number; // water content percentage (0-100)
  fiber: number; // fiber content (0-10 scale)
  bitterness: number; // bitterness level (0-10 scale)
  cooking_time: number; // typical cooking time in minutes
}) => ({
  water_content: vegData.water,
  fiber_density: vegData.fiber,
  bitterness: vegData.bitterness,
  cooking_time_minutes: vegData.cooking_time,
  volume_reduction: Math.round((vegData.water || 0) * 0.2) / 10, // How much it shrinks when cooked (1-10 scale)
  cell_wall_strength: Math.round(10 - vegData.water / 10 + vegData.fiber / 2), // Structural integrity when cooked
  nutrient_density: Math.round(
    (vegData.fiber || 0) * 0.2 +
      (100 - vegData.water) * 0.05 +
      Math.min(7, vegData.bitterness) * 0.3,
  ),
});

const rawLeafyGreens: Record<string, Partial<IngredientMapping>> = {

  arugula: {
    image_url: "ingredients/arugula.png",
    name: "arugula",
    category: "vegetable",
    subCategory: "leafy_green",
    description: "A peppery, nutty, deeply lobed salad green (*Eruca vesicaria*) also known as rocket. Its high glucosinolate content gives it a distinctive spicy kick that balances rich cheeses, sweet fruits, and acidic dressings. Dominant in Fire and Air elements.",
    elementalProperties: { Fire: 0.40, Air: 0.30, Earth: 0.20, Water: 0.10 },
    astrologicalProfile: {
      rulingPlanets: ["Mars"],
      favorableZodiac: ["aries", "scorpio"],
      seasonalAffinity: ["spring", "fall"],
    },
    nutritionalProfile: {
      serving_size: "2 cups (40g)",
      calories: 10,
      macros: { protein: 1.0, carbs: 1.5, fat: 0.3, fiber: 0.6, sugar: 0.8, sodium: 0.01 },
      vitamins: { K: 0.45, A: 0.10, C: 0.08 },
      minerals: { calcium: 0.06, potassium: 0.03, magnesium: 0.02 },
      source: "USDA FoodData Central",
    },
    flavorProfile: {
      sweet: 0.1,
      salt: 0.05,
      salty: 0.05,
      sour: 0.1,
      bitter: 0.4,
      umami: 0.1,
      spicy: 0.55,
      aromatic: 0.45
    },
    sensoryProfile: { 
      taste: { sweet: 0.1, salty: 0.05, sour: 0.1, bitter: 0.4, umami: 0.1, spicy: 0.55 }, 
      aroma: { peppery: 0.7, nutty: 0.6 }, 
      texture: { tender: 0.8, crisp: 0.5 } 
    },
    culinaryProfile: { 
      flavorProfile: { primary: ["peppery", "bitter"], secondary: ["nutty", "spicy"], notes: "Sharp peppery bite that stimulates digestion and clears phlegm." }, 
      cookingMethods: ["raw", "toss", "wilt", "blend"], 
      cuisineAffinity: ["Italian", "Mediterranean"], 
      preparationTips: ["Toss with lemon juice and olive oil to mellow the bitter, peppery compounds.", "Scatter over hot pizzas just before serving for an elegant contrast."] 
    },
    pairingRecommendations: { complementary: ["lemon", "parmesan", "olive oil", "tomatoes", "pine nuts", "pears"], contrasting: ["honey", "balsamic vinegar"], toAvoid: [] },
    storage: { pantry: "Refrigerate in a ventilated bag with dry paper towel.", notes: "Perishes quickly if exposed to excess moisture." }
  },
  radicchio: {
    image_url: "ingredients/radicchio.png",
    name: "radicchio",
    category: "vegetable",
    subCategory: "leafy_green",
    description: "A stunning, compact Italian chicory (*Cichorium intybus*) with deep magenta leaves and white ribs. Features a sharp, sophisticated bitterness that transforms into a mellow, nutty sweetness when grilled, roasted, or sautéed. Earth-Air structured energy.",
    elementalProperties: { Earth: 0.45, Air: 0.30, Water: 0.15, Fire: 0.10 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn"],
      favorableZodiac: ["capricorn"],
      seasonalAffinity: ["fall", "winter"],
    },
    nutritionalProfile: {
      serving_size: "1 cup chopped (40g)",
      calories: 9,
      macros: { protein: 0.6, carbs: 1.8, fat: 0.1, fiber: 0.4, sugar: 0.2, sodium: 0.01 },
      vitamins: { K: 0.35, C: 0.04 },
      minerals: { potassium: 0.03, copper: 0.02 },
      source: "USDA FoodData Central",
    },
    flavorProfile: {
      sweet: 0.1,
      salt: 0.05,
      salty: 0.05,
      sour: 0.05,
      bitter: 0.75,
      umami: 0.05,
      spicy: 0.05,
      aromatic: 0.3
    },
    sensoryProfile: { 
      taste: { sweet: 0.1, salty: 0.05, sour: 0.05, bitter: 0.75, umami: 0.05, spicy: 0.05 }, 
      aroma: { earthy: 0.4, clean: 0.5 }, 
      texture: { crunchy: 0.8, firm: 0.7 } 
    },
    culinaryProfile: { 
      flavorProfile: { primary: ["bitter"], secondary: ["crisp", "earthy"], notes: "Deeply bitter leaves that clear internal damp-heat and fortify the liver." }, 
      cookingMethods: ["raw", "grill", "roast", "sauté", "braise"], 
      cuisineAffinity: ["Italian", "Venetian"], 
      preparationTips: ["Soak cut leaves in cold water for 15-30 minutes to wash away excess bitterness for raw salads.", "Brush wedges with olive oil and grill until charred and tender."] 
    },
    pairingRecommendations: { complementary: ["balsamic vinegar", "olive oil", "walnuts", "blue cheese", "anchovies", "pancetta"], contrasting: ["honey", "figs", "oranges"], toAvoid: [] },
    storage: { pantry: "Keep in the crisper drawer of refrigerator.", notes: "Highly resilient, will stay fresh for up to two weeks." }
  },
  chicory: {
    image_url: "ingredients/chicory.png",
    name: "chicory",
    category: "vegetable",
    subCategory: "leafy_green",
    description: "A wild and cultivated family of bitter greens characterized by their cooling, digestive properties. Deeply traditional in peasant cooking, chicory provides a bitter, mineral-rich tonic that cuts through sweet or oily ingredients. Classic Earth-Air dominant.",
    elementalProperties: { Earth: 0.50, Air: 0.25, Water: 0.15, Fire: 0.10 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn"],
      favorableZodiac: ["capricorn", "aquarius"],
      seasonalAffinity: ["spring", "winter"],
    },
    nutritionalProfile: {
      serving_size: "1 cup (50g)",
      calories: 11,
      macros: { protein: 0.8, carbs: 2.0, fat: 0.1, fiber: 1.8, sugar: 0.3, sodium: 0.02 },
      vitamins: { A: 0.28, C: 0.10, folate: 0.08 },
      minerals: { calcium: 0.05, iron: 0.03, potassium: 0.04 },
      source: "USDA FoodData Central",
    },
    flavorProfile: {
      sweet: 0.05,
      salt: 0.05,
      salty: 0.05,
      sour: 0.05,
      bitter: 0.8,
      umami: 0.05,
      spicy: 0.0,
      aromatic: 0.2
    },
    sensoryProfile: { 
      taste: { sweet: 0.05, salty: 0.05, sour: 0.05, bitter: 0.8, umami: 0.05, spicy: 0.0 }, 
      aroma: { earthy: 0.5, cooling: 0.6 }, 
      texture: { firm: 0.7, fibrous: 0.6 } 
    },
    culinaryProfile: { 
      flavorProfile: { primary: ["bitter"], secondary: ["earthy", "cooling"], notes: "Highly therapeutic bitter tonic that encourages bile flow and aids fat digestion." }, 
      cookingMethods: ["sauté", "braise", "raw", "wilt"], 
      cuisineAffinity: ["Mediterranean", "French", "macrobiotic"], 
      preparationTips: ["Braise with garlic, lemon, and olive oil to beautifully soften both flavor and texture.", "Roots can be roasted and ground as a caffeine-free coffee substitute."] 
    },
    pairingRecommendations: { complementary: ["garlic", "lemon juice", "olive oil", "red pepper flakes", "cannellini beans"], contrasting: ["dates", "raisins"], toAvoid: [] },
    storage: { pantry: "Wrap in plastic, refrigerate.", notes: "Dampness causes rot, keep dry." }
  },
  kale: {
      image_url: "ingredients/kale.png",
    description: "A robust, hardy member of the cabbage family (*Brassica oleracea var. sabellica*) known for its dense texture and earthy, slightly bitter flavor. Its tough cellulose structure requires massaging with oil or acid when eaten raw, but allows it to hold up beautifully to long braising or roasting.",
    name: "Kale",
    category: "vegetable",
    subCategory: "leafy_green",

    // Base elemental properties (unscaled)
    elementalProperties: { Air: 0.38, Earth: 0.34, Water: 0.22, Fire: 0.06 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 67, unit: "g" }, // Standard serving: 1 cup chopped
    scaledElemental: { Air: 0.38, Earth: 0.34, Water: 0.22, Fire: 0.06 }, // Scaled for harmony (already balanced)
    alchemicalProperties: {
      Spirit: 0.25,
      Essence: 0.70,
      Matter: 0.30,
      Substance: 0.35,
    }, // Independent dimensions (0.0-1.0 each)
    kineticsImpact: { thermalDirection: 0.1, forceMagnitude: 0.95 }, // Mild warming, gentle force
    qualities: [
      "cleansing",
      "strengthening",
      "cooling",
      "grounding",
      "resilient",
      "bitter",
      "hardy",
    ],
    origin: ["Mediterranean", "Northern Europe"],
    season: ["fall", "winter", "early spring"],
    affinities: [
      "garlic",
      "olive oil",
      "lemon",
      "pine nuts",
      "chili",
      "tahini",
      "mushrooms",
      "apple",
    ],
    cookingMethods: [
      "raw",
      "steamed",
      "sautéed",
      "baked",
      "braised",
      "fermented",
      "juiced",
      "soup",
    ],
    ...generateVegetableAttributes({
      water: 84,
      fiber: 9,
      bitterness: 7,
      cooking_time: 8,
    }),
    nutritionalProfile: {
      serving_size: "1 cup, raw (67g)",
      calories: 33,
      macros: {
        protein: 3,
        carbs: 6.7,
        fat: 0.5,
        fiber: 2.5,
      },
      vitamins: {
        A: 0.206, // Values as percentage of RDA
        C: 0.134,
        K: 0.684,
        B6: 0.14,
        E: 0.1,
        folate: 0.07,
        B2: 0.09,
      },
      minerals: {
        calcium: 0.15,
        potassium: 0.08,
        magnesium: 0.09,
        manganese: 0.32,
        copper: 0.11,
        iron: 0.06,
      },
    },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Saturn"],
      favorableZodiac: ["virgo", "capricorn"],
      elementalAffinity: {
        base: "Air",
      },
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." },
      culinaryProfile: {
        flavorProfile: {
          primary: ["earthy", "mineral"],
          secondary: ["bitter", "cabbage-like"],
          notes: "Sturdy and bitter raw; softens and sweetens with heat or a massage.",
        },
        cookingMethods: ["saute", "braise", "raw", "roast", "steam"],
        cuisineAffinity: ["American", "Italian", "Mediterranean"],
        preparationTips: [
          "Strip the leaves from the tough central rib and discard the stems.",
          "For raw salads, massage the torn leaves with oil and salt to tenderize them.",
          "Tear or chop into bite-size pieces so they wilt evenly.",
        ],
      }
},
  spinach: {
      image_url: "ingredients/spinach.png",
    name: "spinach",
    category: "vegetable",
    subcategory: "leafy_green",

    // Mineral-rich, slightly bitter, nourishing
    elementalProperties: { Water: 0.45, Earth: 0.3, Air: 0.15, Fire: 0.1 },

    nutritionalProfile: {
      serving_size: "1 cup raw (30g)",
      calories: 7,
      macros: {
        protein: 0.9,
        carbs: 1.1,
        fat: 0.1,
        fiber: 0.7,
        saturatedFat: 0,
        sugar: 0.4,
        potassium: 170,
        sodium: 3,
      },
      vitamins: {
        K: 1.81, // 181% RDA - extremely high!
        A: 0.56, // 56% RDA
        C: 0.14,
        folate: 0.15,
        B6: 0.03,
      },
      minerals: {
        iron: 0.15, // Note: non-heme, less absorbable
        calcium: 0.03,
        magnesium: 0.2,
        potassium: 0.05,
        manganese: 0.45,
      },
      antioxidants: {
        lutein_zeaxanthin:
          "very high - eye health, macular degeneration prevention",
        kaempferol: "high - anti-inflammatory and anti-cancer",
        quercetin: "moderate - antioxidant",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: { spicy: 0, sweet: 0.1, sour: 0.1, bitter: 0.5, salty: 0.1, umami: 0.3 },
      aroma: {
        floral: 0.0,
        fruity: 0.0,
        herbal: 0.7,
        spicy: 0.0,
        earthy: 0.6,
        woody: 0.0,
      },
      texture: {
        crisp: 0.4, // Baby spinach
        tender: 0.9,
        creamy: 0.2, // When creamed
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.7, // Wilted
      },
    },

    storage: {
      temperature: "refrigerate 35-40°F",
      duration: "5-7 days",
      container: "original container or plastic bag with paper towel",
      tips: [
        "Store unwashed until ready to use",
        "Place paper towel in bag to absorb excess moisture",
        "Remove any slimy or yellowed leaves immediately",
        "Baby spinach more delicate than mature leaves",
      ],
    },

    preparation: {
      methods: [
        "Wash thoroughly in cold water (sandy!)",
        "Remove thick stems from mature leaves",
        "Tear or chop for salads",
        "Wilt in pan with garlic",
      ],
      tips: [
        "Wash just before use, not before storing",
        "Baby spinach tender enough for stems",
        "Spinach wilts dramatically - 1 lb fresh = 1 cup cooked",
        "Add lemon or vitamin C to improve iron absorption",
      ],
      yields: "1 lb fresh = 1 cup cooked",
    },

    recommendedCookingMethods: [
      "sautéing",
      "steaming",
      "wilting",
      "raw in salads",
      "blending in smoothies",
    ],

    pairingRecommendations: {
      complementary: [
        "garlic",
        "lemon",
        "butter",
        "nutmeg",
        "feta cheese",
        "eggs",
        "cream",
        "pine nuts",
      ],
      contrasting: ["bacon", "parmesan", "vinegar"],
      toAvoid: ["overly sweet dressings"],
    },

    description:
      "Spinach is a nutrient-dense leafy green packed with vitamins, minerals, and antioxidants. Baby spinach is tender and mild, perfect for salads, while mature spinach has heartier leaves ideal for cooking. Extremely high in vitamin K and a good source of plant-based iron (though less bioavailable than animal sources). Wilts dramatically when cooked, reducing in volume by 90%.",

    origin: ["Persia (Iran)", "Cultivated globally"],

    qualities: [
      "nutrient-dense",
      "iron-rich",
      "versatile",
      "mild",
      "healthful",
      "tender",
    ],

    healthBenefits: [
      "Extremely high in vitamin K - bone health",
      "Rich in antioxidants - eye health (lutein)",
      "Plant-based iron (enhanced absorption with vitamin C)",
      "May reduce blood pressure",
      "Anti-inflammatory properties",
      "Supports digestive health",
    ],

    season: ["spring", "fall"],

    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["cancer", "virgo", "pisces"],
      seasonalAffinity: ["spring"],
    },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] }
},
  "swiss chard": {
      image_url: "ingredients/swiss chard.png",
    description: "A leafy green (*Beta vulgaris*) related to the beet, with broad glossy leaves and crisp, often brightly colored stems. The mild, slightly sweet leaves cook quickly while the crunchy ribs need a head start.",
    name: "Swiss chard",
    origin: ["Mediterranean", "Sicily"],
    elementalProperties: { Water: 0.39, Earth: 0.33, Air: 0.21, Fire: 0.07 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Saturn"],
      favorableZodiac: ["taurus", "capricorn", "libra"],
      elementalAffinity: {
        base: "Water",
      },
    },
    qualities: ["cooling", "cleansing"],
    season: ["summer", "fall"],
    category: "vegetable",
    subCategory: "leafy green",
    affinities: ["garlic", "beans", "lemon", "pine nuts"],
    cookingMethods: ["steamed", "sautéed", "braised"],
    ...generateVegetableAttributes({
      water: 87,
      fiber: 7,
      bitterness: 5,
      cooking_time: 5,
    }),
    nutritionalProfile: {
      fiber: "high",
      vitamins: { K: 1.0, A: 1.0, C: 0.5 },
      minerals: { magnesium: 0.1, potassium: 0.1, iron: 0.1 },
      calories: 19,
      macros: { protein: 1.8, fiber: 1.9 },
    },
    preparation: {
      methods: ["washing", "stemming"],
      tips: ["Cook stems longer than leaves"],
    },
    storage: {
      temperature: "refrigerated",
      duration: "3-5 days",
      notes: "Wrap in damp paper towel",
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["earthy", "mineral"],
          secondary: ["sweet", "beet-like"],
          notes: "Mild and slightly sweet; the crunchy stems need a head start over the leaves.",
        },
        cookingMethods: ["saute", "braise", "steam", "raw"],
        cuisineAffinity: ["Mediterranean", "Italian", "French"],
        preparationTips: [
          "Separate the leaves from the stems — the stems take longer to cook.",
          "Slice the stems crosswise and start them first, then add the chopped leaves.",
          "Cut the leaves into wide ribbons so they wilt quickly and evenly.",
        ],
      }
},
  lettuce: {
      image_url: "ingredients/lettuce.png",
    description: "A leafy herbaceous plant (*Lactuca sativa*), primarily cultivated for its crisp, hydrating leaves. Iceberg and romaine varieties provide high water content and structural crunch that resists wilting under heavy dressings, while butterhead and loose-leaf types offer delicate, tender textures. Although typically consumed raw in salads or as a cooling counterpoint in sandwiches, hearty varieties like romaine can be lightly grilled or braised to develop surprising smoky depth.",
    name: "lettuce",
    origin: ["Cultivated worldwide"],
    season: ["varies by variety"],
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetable",
    subcategory: "leafy_green",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["cancer", "taurus", "capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},
  romaine_lettuce: {
      image_url: "ingredients/romaine_lettuce.png",
    description: "A leafy herbaceous plant (*Lactuca sativa*), primarily cultivated for its crisp, hydrating leaves. Iceberg and romaine varieties provide high water content and structural crunch that resists wilting under heavy dressings, while butterhead and loose-leaf types offer delicate, tender textures. Although typically consumed raw in salads or as a cooling counterpoint in sandwiches, hearty varieties like romaine can be lightly grilled or braised to develop surprising smoky depth.",
    name: "romaine lettuce",
    origin: ["Mediterranean"],
    season: ["spring", "fall"],
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetable",
    subcategory: "leafy_green",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["cancer", "taurus", "capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},
  lettuce_leaves: {
      image_url: "ingredients/lettuce_leaves.png",
    description: "A leafy herbaceous plant (*Lactuca sativa*), primarily cultivated for its crisp, hydrating leaves. Iceberg and romaine varieties provide high water content and structural crunch that resists wilting under heavy dressings, while butterhead and loose-leaf types offer delicate, tender textures. Although typically consumed raw in salads or as a cooling counterpoint in sandwiches, hearty varieties like romaine can be lightly grilled or braised to develop surprising smoky depth.",
    name: "lettuce leaves",
    origin: ["Cultivated worldwide"],
    season: ["varies by variety"],
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetable",
    subcategory: "leafy_green",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["cancer", "taurus", "capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},
};

// Fix the ingredient mappings to ensure they have all required properties
export const leafyGreens: Record<string, IngredientMapping> =
  fixIngredientMappings(rawLeafyGreens);

export default leafyGreens;
