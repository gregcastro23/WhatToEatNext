import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawBuckwheat = {

  kasha: {
    image_url: "ingredients/kasha.png",
    description: "Toasted whole buckwheat groats (*Fagopyrum esculentum*). The toasting process gelatinizes the surface starches, ensuring the groats cook into fluffy, separate kernels with a highly concentrated, rich, nutty, and smoky aroma. Deeply grounding Earth-Fire energy.",
    name: "Kasha",
    season: ["fall", "winter"],
    category: "grain",
    subCategory: "pseudo_cereal",
    elementalProperties: { Earth: 0.55, Fire: 0.25, Air: 0.10, Water: 0.10 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn"],
      favorableZodiac: ["capricorn", "taurus"],
      seasonalAffinity: ["winter"],
    },
    nutritionalProfile: {
      serving_size: "1/4 cup dry (43g)",
      calories: 140,
      macros: { protein: 5.0, carbs: 31.0, fat: 1.0, fiber: 4.0, sugar: 1.0, sodium: 0.005 },
      vitamins: { niacin: 0.12, B6: 0.08 },
      minerals: { manganese: 0.38, magnesium: 0.23, copper: 0.15, phosphorus: 0.10 },
      source: "USDA FoodData Central",
    },
    flavorProfile: {
      sweet: 0.1,
      salt: 0.05,
      salty: 0.05,
      sour: 0.0,
      bitter: 0.2,
      umami: 0.3,
      spicy: 0.0,
      aromatic: 0.6
    },
    sensoryProfile: { 
      taste: { sweet: 0.1, salty: 0.05, sour: 0.0, bitter: 0.2, umami: 0.3, spicy: 0.0 }, 
      aroma: { nutty: 0.8, toasted: 0.9, smoky: 0.7 }, 
      texture: { fluffy: 0.7, chewy: 0.6 } 
    },
    culinaryProfile: { 
      flavorProfile: { primary: ["nutty", "toasty"], secondary: ["smoky", "earthy"], notes: "Intense, robust toasted grain flavor that is highly satisfying in cold weather." }, 
      cookingMethods: ["boil", "steam", "toast", "whisk", "bake"], 
      cuisineAffinity: ["Eastern European", "Jewish", "macrobiotic"], 
      preparationTips: ["Coat dry groats with a beaten egg before cooking to prevent mushiness, then toast in dry pan until fragrant.", "Use a 1:2 grain to liquid ratio and simmer for 12-15 minutes."] 
    },
    pairingRecommendations: { complementary: ["mushrooms", "onions", "butter", "bow-tie pasta", "beef broth", "gravy"], contrasting: ["sour cream"], toAvoid: [] },
    storage: { pantry: "Keep airtight in a dry pantry.", notes: "Highly stable thanks to the roasting process." }
  },
  buckwheat: {
      image_url: "ingredients/buckwheat.png",
    description: "A nutrient-dense pseudocereal (*Fagopyrum esculentum*) that is completely unrelated to wheat and naturally gluten-free. It provides an aggressively earthy, nutty, and slightly bitter flavor, and is the essential ingredient in Japanese soba noodles and French Breton galettes (crepes).",
    name: "Buckwheat",
    season: ["all"],
    elementalProperties: { Earth: 0.4, Water: 0.1, Air: 0.2, Fire: 0.3 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mars"],
      elementalAffinity: {
        base: "Earth",
        secondary: "Fire",
      },
    },
    qualities: ["earthy", "robust", "gluten-free", "hearty", "nutty"],
    category: "grain",
    origin: ["Central Asia", "Eastern Europe", "Russia"],
    varieties: {
      flour: {
        appearance: "Gray-purple fine powder",
        texture: "Dense in baked goods",
        flavor: "Distinctive earthy flavor",
        uses: "Blinis, soba noodles, pancakes, bread",
      },
    },
    preparation: {
      fresh: {
        duration: "15-20 minutes (raw), 10-15 minutes (roasted)",
        storage: "Refrigerate in sealed container for 2-3 days",
        tips: [
          "Rinse before cooking",
          "Toast raw buckwheat for nuttier flavor",
          "Use 1: 2 buckwheat to water ratio",
        ],
      },
      methods: ["boiled", "toasted", "ground into flour", "sprouted"],
    },
    storage: {
      container: "Airtight container",
      duration: "Up to 2 months (raw), 3-4 months (roasted), 2-3 days (cooked)",
      temperature: "Cool, dark place (dry), refrigerated (cooked)",
      notes:
        "Raw buckwheat has higher oil content and can spoil faster than roasted",
    },
    pairingRecommendations: {
      complementary: [
        "mushrooms",
        "onions",
        "herbs",
        "butter",
        "eggs",
        "cabbage",
      ],
      contrasting: ["light fruits", "yogurt", "honey"],
      toAvoid: ["subtle flavors that would be overpowered"],
    },
    nutritionalProfile: {
      serving_size: "1 cup cooked (168g)",
      calories: 155,
      macros: {
        protein: 5.7,
        carbs: 34,
        fat: 1,
        fiber: 4.5,
        saturatedFat: 0.2,
        sugar: 1.5,
        potassium: 148,
        sodium: 7,
      },
      vitamins: { niacin: 0.08, B6: 0.07 },
      minerals: {
        manganese: 0.34,
        magnesium: 0.21,
        phosphorus: 0.09,
        copper: 0.13,
        iron: 0.07,
      },
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] }
},
};

export const buckwheat: Record<string, IngredientMapping> =
  fixIngredientMappings(rawBuckwheat);
