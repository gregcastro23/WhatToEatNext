/**
 * Regional and common names that point at a catalog ingredient (plan §4.1).
 *
 * Every entry names its basis. `canonical` must be a key of `allIngredients`,
 * and `term` must not itself be a catalog ingredient name. The corpus test
 * enforces both, so an entry can't dangle or shadow a real ingredient.
 */
export interface IngredientSynonym {
  term: string;
  canonical: string;
  basis: string;
}

export const INGREDIENT_SYNONYMS: readonly IngredientSynonym[] = [
  { term: "aubergine", canonical: "eggplant", basis: "British and French name for Solanum melongena" },
  { term: "brinjal", canonical: "eggplant", basis: "South Asian English name for Solanum melongena" },
  { term: "courgette", canonical: "zucchini", basis: "British and French name for summer squash (Cucurbita pepo)" },
  { term: "rocket", canonical: "arugula", basis: "British name for Eruca vesicaria" },
  { term: "prawn", canonical: "shrimp", basis: "British and Australian name for shrimp" },
  { term: "prawns", canonical: "shrimp", basis: "plural of prawn" },
  { term: "garbanzo", canonical: "chickpeas", basis: "Spanish-derived US name for Cicer arietinum" },
  { term: "garbanzo beans", canonical: "chickpeas", basis: "US name for Cicer arietinum" },
  { term: "capsicum", canonical: "bell_pepper", basis: "Australian and Indian English name for sweet pepper" },
  { term: "spring onion", canonical: "green_onions", basis: "British name for green onions" },
  { term: "spring onions", canonical: "green_onions", basis: "plural of spring onion" },
  { term: "coriander leaves", canonical: "cilantro", basis: "British name for the leaves of Coriandrum sativum" },
  { term: "coriander leaf", canonical: "cilantro", basis: "singular of coriander leaves" },
  { term: "palak", canonical: "spinach", basis: "Hindi and Urdu name for spinach, as in palak paneer" },
  { term: "maize", canonical: "corn", basis: "British and international name for Zea mays" },
  { term: "beetroot", canonical: "beet", basis: "British name for Beta vulgaris root" },
  { term: "cornflour", canonical: "cornstarch", basis: "British name for corn starch" },
  { term: "bhindi", canonical: "okra", basis: "Hindi name for okra" },
  { term: "ladies finger", canonical: "okra", basis: "Indian English name for okra" },
];
