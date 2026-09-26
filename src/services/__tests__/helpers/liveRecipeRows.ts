/**
 * Production-shaped recipe rows for the similar-recipes ranking tests.
 *
 * Generated from real responses captured 2026-09-26, not hand-written:
 * - LIVE rows: `GET https://alchm.kitchen/api/recipes/<uuid>`, the
 *   LocalRecipeService → mapRowToRecipe shape that /recipes/[recipeId] and
 *   /api/recipes/[recipeId] hand to recommendSimilarRecipes. Of 50 live rows
 *   sampled across the sitemap, none carries `cookingMethod` or
 *   `cookingMethods` and 24 carry no `cuisine`. POLENTA_CAKES,
 *   LEMON_DILL_MAYO and WHITE_WINE_MARINADE are the three rows all 50 of
 *   those pages recommended: the head of the popularity-ordered catalog.
 * - STATIC rows: `GET https://alchm.kitchen/api/recipes?limit=50`, the
 *   getServerRecipes cuisine-catalog shape (singular `cookingMethod`), which
 *   is also what LocalRecipeService serves when the database is degraded.
 *
 * Only the fields similarity reads are kept: id, name, cuisine, ingredient
 * name/amount/unit, elementalProperties and cookingMethod. `instructions` is
 * emptied because the type requires it and nothing here reads it.
 */
import type { Recipe } from "@/types/recipe";

// ── Live catalog rows ────────────────────────────────────────────────────

export const OYAKODON: Recipe = {
  id: "e03c3505-9729-4a7e-bc0c-5ae57aff83a9",
  name: "Oyakodon (Chicken and Egg Rice Bowl)",
  cuisine: "Japanese",
  ingredients: [
    { name: "chicken thighs", amount: 300, unit: "g" },
    { name: "onion", amount: 1, unit: "medium" },
    { name: "eggs", amount: 4, unit: "large" },
    { name: "dashi stock", amount: 0.5, unit: "cup" },
    { name: "soy sauce", amount: 2.5, unit: "tbsp" },
    { name: "mirin", amount: 2, unit: "tbsp" },
    { name: "sake", amount: 0.5, unit: "tbsp" },
    { name: "sugar", amount: 1, unit: "tsp" },
    { name: "steamed japanese rice", amount: 2, unit: "cups" },
    { name: "mitsuba or scallion", amount: 1, unit: "tbsp" },
  ],
  instructions: [],
  elementalProperties: { Fire: 0.15999999999999998, Water: 0.35, Earth: 0.29, Air: 0.2 },
};

export const POLENTA_CAKES: Recipe = {
  id: "84fdf8fa-6e27-4113-bc38-e3d01279ec08",
  name: "PAN-FRIED POLENTA CAKES",
  ingredients: [
    { name: "recipe polenta", amount: 1, unit: "piece" },
    { name: "cornmeal for dredging", amount: 1, unit: "piece" },
    { name: "no taste oil for frying", amount: 1, unit: "piece" },
  ],
  instructions: [],
  elementalProperties: { Fire: 0.3, Water: 0.125, Earth: 0.375, Air: 0.2 },
};

export const LEMON_DILL_MAYO: Recipe = {
  id: "b0d79c0f-bc83-4409-80d8-3166f36e3d61",
  name: "Lemon-Dill Mayonnaise (for Poached Salmon)",
  ingredients: [
    { name: "egg yolk", amount: 1, unit: "piece" },
    { name: "mustard", amount: 1, unit: "teaspoon" },
    { name: "of lemon juice", amount: 1, unit: "tablespoon" },
    { name: "warm water", amount: 0.5, unit: "tablespoon" },
    { name: "salt", amount: 0.25, unit: "teaspoon" },
    { name: "canola oil", amount: 0.75, unit: "cup" },
    { name: "-3 tablespoon fresh dill", amount: 2, unit: "piece" },
    { name: "zest from 1 lemon", amount: 1, unit: "piece" },
  ],
  instructions: [],
  elementalProperties: { Fire: 0.24375000000000002, Water: 0.35000000000000003, Earth: 0.1875, Air: 0.21875000000000003 },
};

export const WHITE_WINE_MARINADE: Recipe = {
  id: "a1977641-ccab-4877-ae16-185078885892",
  name: "WHITE WINE MARINADE",
  ingredients: [
    { name: "white wine", amount: 0.75, unit: "cup" },
    { name: "olive oil", amount: 0.3333333333333333, unit: "cup" },
    { name: "fresh lemon sliced or zest of 1 orange", amount: 1, unit: "piece" },
    { name: "heaping tablespoon chopped fresh herbs or 1 teaspoon dried herbs", amount: 1, unit: "piece" },
    { name: "several parsley sprigs", amount: 1, unit: "piece" },
    { name: "fresh black pepper", amount: 1, unit: "piece" },
  ],
  instructions: [],
  elementalProperties: { Fire: 0.20600000000000002, Water: 0.314, Earth: 0.21600000000000003, Air: 0.264 },
};

export const JAPANESE_CURRY_RICE: Recipe = {
  id: "e7e116e1-88ca-4a7d-aa36-1d6e335a683d",
  name: "Authentic Japanese Curry Rice (Kare Raisu)",
  cuisine: "Japanese",
  ingredients: [
    { name: "beef or pork shoulder", amount: 500, unit: "g" },
    { name: "onions", amount: 2, unit: "large" },
    { name: "potatoes", amount: 2, unit: "medium" },
    { name: "carrot", amount: 1, unit: "large" },
    { name: "unsalted butter", amount: 3, unit: "tbsp" },
    { name: "all-purpose flour", amount: 0.25, unit: "cup" },
    { name: "s&b curry powder", amount: 2, unit: "tbsp" },
    { name: "tomato ketchup", amount: 1, unit: "tbsp" },
    { name: "apple", amount: 0.5, unit: "whole" },
  ],
  instructions: [],
  elementalProperties: { Fire: 0.24666666666666667, Water: 0.29333333333333333, Earth: 0.345, Air: 0.11499999999999999 },
};

export const BEEF_BULGOGI: Recipe = {
  id: "46abb4b8-aee5-43d9-b3f8-210950c1797b",
  name: "Authentic Beef Bulgogi",
  cuisine: "Korean",
  ingredients: [
    { name: "beef ribeye or sirloin", amount: 600, unit: "g" },
    { name: "soy sauce", amount: 0.5, unit: "cup" },
    { name: "brown sugar or honey", amount: 3, unit: "tbsp" },
    { name: "asian pear", amount: 0.5, unit: "whole" },
    { name: "onion", amount: 1, unit: "small" },
    { name: "garlic", amount: 4, unit: "cloves" },
    { name: "sesame oil", amount: 2, unit: "tbsp" },
    { name: "toasted sesame seeds", amount: 1, unit: "tbsp" },
  ],
  instructions: [],
  elementalProperties: { Fire: 0.32499999999999996, Water: 0.26666666666666666, Earth: 0.2833333333333334, Air: 0.125 },
};

export const SAUTEED_MUSHROOMS: Recipe = {
  id: "1b44aee2-9125-4454-8b87-2150e4689329",
  name: "SAUTÉED MUSHROOMS WITH HERBS",
  ingredients: [
    { name: "olive oil", amount: 3, unit: "tablespoons" },
    { name: "shallot", amount: 1, unit: "piece" },
    { name: "garlic", amount: 5, unit: "cloves" },
    { name: "shiitake mushrooms", amount: 0.5, unit: "pound" },
    { name: "cremini mushrooms", amount: 0.5, unit: "pound" },
    { name: "salt", amount: 1, unit: "teaspoon" },
    { name: "white wine", amount: 2, unit: "cups" },
    { name: "oat flour", amount: 0.25, unit: "cup" },
    { name: "vegetable stock", amount: 2, unit: "cups" },
    { name: "additional salt and pepper to taste", amount: 1, unit: "piece" },
    { name: "reggiano parmesan cheese", amount: 0.25, unit: "pound" },
  ],
  instructions: [],
  elementalProperties: { Fire: 0.195, Water: 0.28300000000000003, Earth: 0.347, Air: 0.175 },
};

export const CAPONATA: Recipe = {
  id: "99ec359e-cc6e-4c1c-a934-0b07d0798344",
  name: "Authentic Caponata",
  cuisine: "Italian",
  ingredients: [
    { name: "eggplants", amount: 2, unit: "unit" },
    { name: "onion", amount: 1, unit: "unit" },
    { name: "celery", amount: 2, unit: "stalk" },
    { name: "capers", amount: 2, unit: "tbsp" },
    { name: "olive oil", amount: 3, unit: "tbsp" },
    { name: "green olives", amount: 40, unit: "g" },
    { name: "red wine vinegar", amount: 100, unit: "ml" },
    { name: "sugar", amount: 2, unit: "tbsp" },
    { name: "tomatoes", amount: 500, unit: "g" },
    { name: "salt", amount: 1, unit: "pinch" },
  ],
  instructions: [],
  elementalProperties: { Fire: 0.18749999999999997, Water: 0.35000000000000003, Earth: 0.3125, Air: 0.15000000000000002 },
};
// ── Static catalog rows ──────────────────────────────────────────────────

export const MANDAZI: Recipe = {
  id: "african-breakfast-all-authentic-east-african-mandazi",
  name: "Authentic East African Mandazi",
  cuisine: "african",
  ingredients: [
    { name: "all-purpose flour", amount: 3, unit: "cups" },
    { name: "granulated sugar", amount: 0.5, unit: "cup" },
    { name: "active dry yeast", amount: 2.25, unit: "tsp" },
    { name: "ground cardamom", amount: 1, unit: "tsp" },
    { name: "kosher salt", amount: 0.5, unit: "tsp" },
    { name: "coconut milk", amount: 0.5, unit: "cup" },
    { name: "water", amount: 0.5, unit: "cup" },
    { name: "vegetable oil", amount: 2, unit: "tbsp" },
    { name: "egg", amount: 1, unit: "large" },
    { name: "neutral oil", amount: 4, unit: "cups" },
  ],
  instructions: [],
  elementalProperties: { Fire: 0.20499999999999993, Water: 0.29999999999999993, Earth: 0.30800000000000005, Air: 0.187 },
  cookingMethod: ["kneading", "deep-frying"],
};

export const AKARA: Recipe = {
  id: "african-breakfast-all-authentic-nigerian-akara-black-eyed-pea-fritters",
  name: "Authentic Nigerian Akara (Black-Eyed Pea Fritters)",
  cuisine: "african",
  ingredients: [
    { name: "dried black-eyed peas", amount: 2, unit: "cups" },
    { name: "onion", amount: 1, unit: "medium" },
    { name: "scotch bonnet or habanero peppers", amount: 2, unit: "whole" },
    { name: "chicken bouillon or maggi", amount: 1, unit: "cube" },
    { name: "kosher salt", amount: 1, unit: "tsp" },
    { name: "water", amount: 0.25, unit: "cup" },
    { name: "vegetable or palm oil", amount: 3, unit: "cups" },
  ],
  instructions: [],
  elementalProperties: { Fire: 0.2357142857142857, Water: 0.32857142857142857, Earth: 0.2785714285714286, Air: 0.15714285714285717 },
  cookingMethod: ["soaking", "peeling", "blending", "whipping", "deep-frying"],
};
