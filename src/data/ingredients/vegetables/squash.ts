import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawSquash = {
  "butternut squash": {
      image_url: "ingredients/butternut squash.png",
    description: "A tan-skinned winter squash (*Cucurbita moschata*) with dense, deep-orange flesh that turns sweet and nutty when roasted. The solid neck is all flesh; the bulbous base holds the seeds.",
    name: "Butternut squash",
    origin: ["North America", "Mesoamerica"],
    elementalProperties: {
      Earth: 0.4,
      Water: 0.3,
      Fire: 0.2,
      Air: 0.1,
    },
    alchemicalProperties: {
      Spirit: 0.12,
      Essence: 0.50,
      Matter: 0.72,
      Substance: 0.60,
    },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Saturn"],
      favorableZodiac: ["taurus", "capricorn"],
      elementalAffinity: {
        base: "Earth",
        decanModifiers: {
          first: {
            element: "Earth",
            planet: "Venus",
          },
          second: {
            element: "Water",
            planet: "Saturn",
          },
          third: {
            element: "Fire",
            planet: "Sun",
          },
        },
      },
    },
    qualities: ["warming", "nourishing", "grounding"],
    season: ["fall", "winter"],
    category: "vegetable",
    subCategory: "squash",
    affinities: ["sage", "brown butter", "maple", "cinnamon", "pecans"],
    cookingMethods: ["roasted", "soup", "steamed", "puréed"],
    nutritionalProfile: {
        serving_size: "100 g raw",
        calories: 45,
      protein_g: 1,
      carbs_g: 12,
      fat_g: 0.1,
      fiber_g: 2.8,
      sugar_g: 2.2,
      vitamins: ["a", "c", "e", "b6"],
      minerals: ["magnesium", "potassium", "manganese"],
      antioxidants: ["beta-carotene"],
      glycemic_index: 51,
      notes: "High in beta-carotene and vitamin A",
        macros: { protein: 1, carbs: 11.7, fat: 0.1, fiber: 2 }
    },
    preparation: {
      peeling: "required",
      cutting: "halve, remove seeds",
      notes: "Can be pre-cut and roasted",
    },
    storage: {
      temperature: "cool, dry place",
      duration: "2-3 months",
      notes: "Once cut, refrigerate",
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["sweet", "nutty"],
          secondary: ["earthy", "buttery"],
          notes: "Dense and sweet; caramelizes deeply when roasted.",
        },
        cookingMethods: ["roast", "puree", "steam", "braise"],
        cuisineAffinity: ["American", "Italian", "Middle-Eastern"],
        preparationTips: [
          "Peel with a sturdy vegetable peeler, then halve and scoop out the seeds.",
          "Cut into even cubes so they brown at the same rate.",
          "Microwave the whole squash 2-3 minutes to soften the skin before peeling.",
        ],
      }
},
  zucchini: {
      image_url: "ingredients/zucchini.png",
    description: "A fast-growing summer squash (*Cucurbita pepo*) with a thin, edible dark green skin and high water content. Its mild, slightly sweet flavor makes it highly versatile, suitable for raw ribbons in salads, quick sautéing, or baking into moist breads.",
    name: "zucchini",
    origin: ["Mesoamerica", "Italy (modern variety)"],
    elementalProperties: {
      Fire: 0.4204917086683852,
      Water: 0.5121388172829056,
      Earth: 0.032703628178985034,
      Air: 0.034665845869724134,
    },
    alchemicalProperties: {
      Spirit: 0.15,
      Essence: 0.65,
      Matter: 0.30,
      Substance: 0.25,
    },
    astrologicalProfile: {},
    category: "vegetable",
    subCategory: "squash",
    nutritionalProfile: {
        serving_size: "100 g raw",
        carbs_g: 3.11,
      calories: 17,
      fiber_g: 1,
      protein_g: 1.21,
      vitamins: ["a", "c", "k", "b6", "folate"],
      minerals: ["potassium", "manganese", "magnesium"],
        macros: { protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1 }
    },
    season: ["summer"],
    cookingMethods: ["saute", "roast", "grill", "raw", "steam", "bake"],
    qualities: ["versatile", "mild", "tender", "hydrating"],
    culinaryApplications: {
      sauteed: {
        method: "Slice or dice, sauté with olive oil until tender-crisp",
        timing: "3-5 minutes",
        pairings: ["garlic", "basil", "tomatoes", "parmesan"],
      },
      grilled: {
        method: "Slice lengthwise, brush with oil, grill until charred",
        timing: "2-3 minutes per side",
        pairings: ["lemon", "herbs", "feta", "balsamic"],
      },
      baked: {
        method: "Hollow out and stuff with fillings, bake until tender",
        timing: "20-25 minutes at 375°F",
        pairings: ["ground meat", "rice", "tomato sauce", "cheese"],
      },
      spiralized: {
        method: "Use spiralizer to create noodle-like strands",
        timing: "Cook 1-3 minutes or serve raw",
        pairings: ["pasta sauce", "pesto", "olive oil", "lemon"],
      },
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." },
      culinaryProfile: {
        flavorProfile: {
          primary: ["mild", "fresh"],
          secondary: ["grassy", "delicate"],
          notes: "Delicate and watery; high heat keeps it from turning soggy.",
        },
        cookingMethods: ["saute", "grill", "roast", "raw", "spiralize"],
        cuisineAffinity: ["Italian", "Mediterranean", "French"],
        preparationTips: [
          "Trim both ends; there is no need to peel it.",
          "Cut into even coins, half-moons, or planks, then salt and blot to shed water.",
          "Cook quickly over high heat to avoid a mushy texture.",
        ],
      }
},
  pumpkin: {
      image_url: "ingredients/pumpkin.png",
    description: "A large, thick-skinned winter squash (*Cucurbita pepo*) prized for its sweet, earthy flesh and edible seeds. While large field pumpkins are bred for carving, smaller \"sugar\" or \"pie\" pumpkins have dense, less watery flesh ideal for roasting, pureeing, and baking.",
    name: "Pumpkin",
    origin: ["North America"],
    elementalProperties: {
      Earth: 0.5,
      Water: 0.2,
      Fire: 0.2,
      Air: 0.1,
    },
    alchemicalProperties: {
      Spirit: 0.10,
      Essence: 0.45,
      Matter: 0.75,
      Substance: 0.65,
    },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["taurus", "cancer"],
      elementalAffinity: {
        base: "Earth",
        decanModifiers: {
          first: {
            element: "Earth",
            planet: "Venus",
          },
          second: {
            element: "Water",
            planet: "Moon",
          },
          third: {
            element: "Fire",
            planet: "Sun",
          },
        },
      },
    },
    qualities: ["warming", "grounding", "nourishing"],
    season: ["fall"],
    category: "vegetable",
    subCategory: "squash",
    affinities: ["cinnamon", "nutmeg", "ginger", "cream", "sage"],
    cookingMethods: ["roasted", "steamed", "puréed", "soup"],
    nutritionalProfile: {
        serving_size: "100 g raw",
        fiber: "high",
      vitamins: ["a", "c", "e", "k"],
      minerals: ["potassium", "copper", "manganese"],
      calories: 26,
      carbs_g: 6.5,
      fiber_g: 0.5,
      protein_g: 1,
      fat_g: 0.1,
      antioxidants: ["beta-carotene", "lutein", "zeaxanthin"],
      glycemic_index: 75,
      notes: "Excellent source of vitamin A and beta-carotene",
        macros: { protein: 1, carbs: 6.5, fat: 0.1, fiber: 0.5 }
    },
    preparation: {
      cutting: "quarter, remove seeds",
      peeling: "after cooking easier",
      notes: "Save seeds for roasting",
    },
    storage: {
      temperature: "cool, dry place",
      duration: "2-3 months whole",
      notes: "Cooked purée freezes well",
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["sweet", "earthy"],
          secondary: ["nutty", "mellow"],
          notes: "Sugar (pie) pumpkins are sweet and dense; large field pumpkins are watery and bland.",
        },
        cookingMethods: ["roast", "puree", "braise", "steam"],
        cuisineAffinity: ["American", "Mediterranean", "Asian"],
        preparationTips: [
          "Cook with a sweet 'sugar' or 'pie' pumpkin, not a stringy carving pumpkin.",
          "Halve, scoop the seeds, and roast cut-side down, then scoop out the soft flesh.",
          "Cut peeled flesh into even chunks if roasting it in pieces.",
        ],
      }
},
  "acorn squash": {
      image_url: "ingredients/acorn squash.png",
    description: "A small, ribbed winter squash (*Cucurbita pepo*) named for its acorn shape. Its mildly sweet, slightly fibrous yellow-orange flesh is ideal for roasting in halves, and the ridged skin softens enough to eat once cooked.",
    name: "Acorn squash",
    origin: ["North America"],
    elementalProperties: {
      Earth: 0.4,
      Water: 0.3,
      Fire: 0.2,
      Air: 0.1,
    },
    alchemicalProperties: {
      Spirit: 0.12,
      Essence: 0.48,
      Matter: 0.70,
      Substance: 0.58,
    },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Venus"],
      favorableZodiac: ["capricorn", "taurus"],
      elementalAffinity: {
        base: "Earth",
        decanModifiers: {
          first: {
            element: "Earth",
            planet: "Saturn",
          },
          second: {
            element: "Water",
            planet: "Venus",
          },
          third: {
            element: "Fire",
            planet: "Mars",
          },
        },
      },
    },
    qualities: ["warming", "grounding"],
    season: ["fall", "winter"],
    category: "vegetable",
    subCategory: "squash",
    affinities: ["butter", "maple", "thyme", "apple", "pecans"],
    cookingMethods: ["roasted", "stuffed", "steamed"],
    nutritionalProfile: {
        serving_size: "100 g raw",
        fiber: "high",
      vitamins: ["c", "b6", "a", "thiamin"],
      minerals: ["magnesium", "potassium", "manganese"],
      calories: 56,
      carbs_g: 15,
      fiber_g: 2.1,
      protein_g: 1.1,
      fat_g: 0.1,
      sugar_g: 0,
      glycemic_index: 40,
      notes: "Good source of vitamin C and potassium",
        macros: { protein: 1.1, carbs: 15, fat: 0.1, fiber: 2.1 }
    },
    preparation: {
      washing: true,
      cutting: "halve, remove seeds",
      notes: "No need to peel",
    },
    storage: {
      temperature: "cool, dry place",
      duration: "1-2 months",
      notes: "Store away from apples / (pears || 1)",
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["sweet", "nutty"],
          secondary: ["earthy", "peppery"],
          notes: "Mildly sweet with fibrous flesh; the ridged skin becomes edible once roasted.",
        },
        cookingMethods: ["roast", "bake", "steam"],
        cuisineAffinity: ["American", "French"],
        preparationTips: [
          "Halve through the stem and scoop out the seeds.",
          "Cut into rings or wedges following the ridges for even pieces.",
          "Roast cut-side down first to steam the flesh tender, then flip to caramelize.",
        ],
      }
},
};

// Fix the ingredient mappings to ensure they have all required properties
// ✅ Pattern MM-1: Type assertion for ZodiacSignType[] compatibility
export const squash: Record<string, IngredientMapping> = fixIngredientMappings(
  rawSquash,
);
