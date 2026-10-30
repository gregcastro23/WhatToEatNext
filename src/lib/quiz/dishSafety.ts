import { classifyIngredientDiet } from "@/utils/ingredientDietaryClassification";
import { normalizeText } from "./dishLexicon";
import type { AllergenKey, DietKey } from "./catalogContract";

/**
 * Dietary and allergen tags for quiz dishes.
 *
 * Diets reuse the repo's ingredient classifier: a dish is vegan/vegetarian only
 * when NO ingredient is `non-compliant` or `unknown` for that diet.
 *
 * Allergens are the opposite kind of claim (see ingredientDietaryClassification
 * on why "allergen-free" is never derived). These tags only say that an
 * ingredient NAME mentions the allergen, and they lean toward flagging. The quiz
 * uses them to EXCLUDE dishes, never to certify one as safe, and its copy
 * tells the diner to check labels.
 */

// prettier-ignore
const ALLERGEN_TERMS: Readonly<Record<AllergenKey, RegExp>> = {
  gluten: /\b(wheat|flour|breads?|breadcrumbs|panko|pasta|spaghetti|linguine|fettuccine|penne|macaroni|lasagna|noodles?|couscous|bulgur|barley|rye|semolina|farro|spelt|seitan|soy sauce|shoyu|teriyaki|hoisin|tortillas?|pitas?|naan|buns?|croutons|crackers|beer|malt|udon|ramen|orzo|gnocchi|wrappers?|wontons?|phyllo|filo|puff pastry|pastry|crust|biscuits?|graham|brioche|baguette|sourdough|toast|cake|cookies?|batter|dumplings?)\b/,
  dairy: /\b(milk|butter|cream|cheese|parmesan|parmigiano|mozzarella|cheddar|feta|ricotta|gruyere|pecorino|halloumi|paneer|mascarpone|gouda|brie|queso|cotija|yogh?urt|ghee|whey|casein|labneh|kefir|buttermilk|creme fraiche|ice cream|custard|curd)\b/,
  eggs: /\b(eggs?|egg yolks?|yolks?|egg whites?|mayonnaise|mayo|aioli|meringue|custard)\b/,
  soy: /\b(soy|soya|soybeans?|tofu|tempeh|edamame|miso|tamari|shoyu|natto|doenjang|teriyaki|hoisin)\b/,
  peanuts: /\b(peanuts?|groundnuts?|satay)\b/,
  "tree-nuts": /\b(almonds?|cashews?|walnuts?|pecans?|pistachios?|hazelnuts?|macadamias?|brazil nuts?|pine nuts|praline|marzipan|nuts|nut butter|frangipane|amaretto)\b/,
  sesame: /\b(sesame|tahini|benne|halva|halwa|za'?atar)\b/,
  fish: /\b(fish|salmon|tuna|cod|halibut|mackerel|sardines?|anchov\w*|trout|tilapia|snapper|sea bass|haddock|catfish|herring|bonito|dashi|worcestershire|caesar)\b/,
  shellfish: /\b(shrimp|prawns?|crab|lobster|clams?|mussels?|oysters?|scallops?|squid|calamari|octopus|crawfish|shellfish|krill)\b/,
};

/** Names that contain an allergen word but are the plant/free-from form. */
// prettier-ignore
const NOT_THE_ALLERGEN: Readonly<Partial<Record<AllergenKey, RegExp>>> = {
  gluten: /\b(gluten[- ]free|rice (flour|noodles?|paper|wrappers?)|glass noodles|cellophane noodles|sweet potato noodles|kelp noodles|almond flour|coconut flour|chickpea flour|gram flour|besan|tapioca|cassava|corn (flour|tortillas?)|masa|buckwheat|teff|sorghum|potato starch|arrowroot|tamari)\b/g,
  dairy: /\b(coconut (milk|cream|yogh?urt)|(almond|oat|soy|rice|cashew|hemp|nut|seed|pea) milk|(peanut|almond|cashew|nut|apple|cocoa|cacao|shea|seed|sunflower) butter|butternut|buttercup|cream of tartar|vegan (cheese|butter)|dairy[- ]free)\b/g,
  eggs: /\beggplants?\b|\begg[- ]free\b|\bvegan mayo/g,
  "tree-nuts": /\b(nutmeg|butternut|coconut|water chestnuts?|tiger nuts?|nutritional yeast|doughnuts?|donuts?)\b/g,
  fish: /\bfish[- ]free\b/g,
};

export function allergensNamedBy(ingredientNames: readonly string[]): AllergenKey[] {
  const names = ingredientNames.map(normalizeText);
  const found: AllergenKey[] = [];
  for (const [key, pattern] of Object.entries(ALLERGEN_TERMS)) {
    if (!isAllergenKey(key)) continue;
    const exempt = NOT_THE_ALLERGEN[key];
    const hit = names.some((name) => pattern.test(exempt ? name.replaceAll(exempt, " ") : name));
    if (hit) found.push(key);
  }
  return found;
}

function isAllergenKey(value: string): value is AllergenKey {
  return value in ALLERGEN_TERMS;
}

const SEAFOOD =
  /\b(fish|salmon|tuna|cod|halibut|mackerel|sardines?|anchov\w*|trout|tilapia|snapper|sea bass|haddock|catfish|herring|bonito|dashi|shrimp|prawns?|crab|lobster|clams?|mussels?|oysters?|scallops?|squid|calamari|octopus|crawfish)\b/;

export function dietsOf(ingredientNames: readonly string[]): DietKey[] {
  const verdicts = ingredientNames.map((name) => ({
    name: normalizeText(name),
    ...classifyIngredientDiet({ name }),
  }));
  const diets: DietKey[] = [];
  const vegetarian = verdicts.every((v) => v.isVegetarian === "compliant");
  if (verdicts.every((v) => v.isVegan === "compliant")) diets.push("vegan");
  if (vegetarian) diets.push("vegetarian");
  const pescatarian = verdicts.every(
    (v) => v.isVegetarian === "compliant" || SEAFOOD.test(v.name),
  );
  if (pescatarian) diets.push("pescatarian");
  return diets;
}
