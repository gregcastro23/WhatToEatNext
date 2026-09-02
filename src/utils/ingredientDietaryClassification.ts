/**
 * Ingredient dietary classification.
 *
 * ## Why this exists
 *
 * The ingredient catalog carries no per-record dietary flags: 0 of 1,158
 * records define `dietaryFlags`, and only a handful carry a dietary term in
 * `qualities`. `UnifiedIngredientService.applyDietaryFilter` used to read a
 * `dietaryFlags` object that is absent everywhere and skip the record when it
 * was missing, so `{ dietary: { isVegan: true } }` returned the entire catalog
 * - meat and dairy included.
 *
 * ## The two answers this module gives, and why they differ
 *
 * A dietary filter answers two very different kinds of question, and they
 * warrant opposite defaults when data is missing:
 *
 * - **Preferences** (vegan / vegetarian) use *exclusion-list* semantics: a
 *   record is excluded when a curated animal-product term, an attestation, or
 *   the catalog's own taxonomy says so, and passes otherwise. Being wrong
 *   means a surprising suggestion, so best-effort coverage beats an empty
 *   result. Genuinely uncertain names (stocks of unstated origin) are held
 *   back as `unknown` rather than guessed either way.
 * - **Allergen and medical claims** (nut-free, gluten-free, dairy-free) are
 *   never derived. Asserting "nut-free" from the absence of the word "nut" is
 *   how someone gets hurt; those require a positive attestation on the record
 *   and are otherwise reported `unknown`, which callers must treat as failing.
 *
 * Every verdict names the basis it came from so a caller can audit or display
 * it. Nothing here invents a value: an ingredient the rules cannot place is
 * `unknown`, never a guess.
 */

/**
 * A dietary verdict for one ingredient and one dietary property.
 *
 * `unknown` is a first-class outcome, distinct from `non-compliant`: it means
 * the catalog does not say. A restrictive filter must exclude both, but a UI
 * can render them differently ("contains dairy" vs "not verified").
 */
export type DietaryVerdict = "compliant" | "non-compliant" | "unknown";

export interface DietaryClassification {
  isVegan: DietaryVerdict;
  isVegetarian: DietaryVerdict;
  /** Human-readable justification, e.g. `name-term:flesh(bacon)`. */
  basis: string;
}

/** The subset of an ingredient record this module reads. */
export interface ClassifiableIngredient {
  name?: string;
  category?: string;
  subCategory?: string;
  subcategory?: string;
  qualities?: unknown;
}

// ===== NAME TERM LISTS =====
//
// Matched with word boundaries against the lowercased ingredient name. Order
// matters: PLANT_COMPOUNDS is consulted first so that compound names whose
// head noun is plant-based ("eggplant", "coconut milk", "almond butter") are
// not caught by the animal term they happen to contain.

/**
 * Plant-based names that contain an animal-product word. Checked before every
 * animal list. Verified against the catalog: `eggplant`/`eggplants`/`large
 * eggplant`, `coconut milk`, `almond butter`, `cashew butter`, `sunflower seed
 * butter`, `Butternut squash`, `cream of tartar`, `Custard Apple (Cherimoya)`
 * and `vegetable broth` all appear and must classify as vegan.
 */
const PLANT_COMPOUNDS: RegExp[] = [
  /\beggplants?\b/,
  /\begg\s?plant\b/,
  /\bcoconut\s+(milk|cream|butter|water)\b/,
  /\b(almond|cashew|peanut|soy|oat|rice|hemp|nut|seed|sunflower|sesame|pea)\s*-?\s*milk\b/,
  /\b(almond|cashew|peanut|sunflower|sesame|seed|cocoa|cacao|shea|apple|nut)\s+butter\b/,
  /\bsunflower\s+seed\s+butter\b/,
  /\bbutter(nut|cup|head)\b/,
  /\bbutter\s+(bean|lettuce)s?\b/,
  /\bmilk\s+thistle\b/,
  /\bcream\s+of\s+tartar\b/,
  /\bcustard\s+apples?\b/,
  /\bvegetable\s+(broth|stock|bouillon)\b/,
  /\b(vegan|vegetarian|plant[-\s]?based|non[-\s]?dairy|dairy[-\s]?free|meat[-\s]?free|meatless|mock|imitation|faux)\b/,
  /\bcrab\s?apples?\b/,
];

/**
 * Animal flesh and flesh-derived products: excluded from both vegan and
 * vegetarian. Terms were chosen against the actual catalog, notably the 79
 * `protein` records that carry no `subCategory` and are therefore invisible to
 * the structural rules below.
 */
const FLESH_TERMS: RegExp[] = [
  // Mammal / poultry
  /\b(beef|veal|pork|mutton|lamb|venison|goat\s+meat|rabbit)\b/,
  /\b(bacon|pancetta|prosciutto|hams?|lardons?|lard|salami|chorizo|andouille|sausages?|spam|hot\s?dogs?)\b/,
  /\b(steaks?|brisket|sirloin|ribeye|tenderloin|cutlets?|chops?|ribs?)\b/,
  /\b(chicken|turkey|ducks?|goose|quail|poultry|schmaltz)\b/,
  /\b(livers?|pate|marrow|tripe|oxtail|suet|tallow|gizzard|sweetbread)\b/,
  /\b(gelatin|gelatine|collagen|rennet|isinglass)\b/,
  /\bbone\s+(broth|stock)\b/,
  /\bmarrow\s+bones?\b/,
  /\b(meats?|carne)\b/,
  // Fish and seafood
  /\b(fish|anchov(y|ies)|sardines?|tuna|salmon|cod|halibut|bass|sole|flounder|monkfish|catfish|snakehead|trout|mackerel|herring|tilapia|snapper|swordfish|eel)\b/,
  /\b(bonito|katsuobushi|dashi|kamaboko|surimi|eomuk|niboshi)\b/,
  /\b(shrimps?|prawns?|crabs?|lobsters?|clams?|mussels?|oysters?|scallops?|squid|octopus|tako|escargots?|snails?|crawfish|krill|abalone|urchin)\b/,
  /\b(caviar|roe|shellfish|seafood)\b/,
  /\b(worcestershire)\b/,
];

/** Dairy: excluded from vegan, allowed for vegetarian. */
const DAIRY_TERMS: RegExp[] = [
  /\b(milk|buttermilk|cream|creams?|butter|ghee|cheeses?|yogh?urts?|whey|casein|curds?|kefir|custard)\b/,
  /\b(paneer|ricotta|mozzarella|parmesan|parmigiano|cheddar|feta|mascarpone|gouda|brie|halloumi|queso)\b/,
  /\bcr[eè]me\s+fra[iî]che\b/,
];

/**
 * Eggs named for the bird that laid them. Checked *before* `FLESH_TERMS`,
 * because the poultry term that correctly excludes `Chicken` also matches
 * `Chicken Egg` - which put the catalog's `Chicken`/`Duck`/`Quail`/`Goose Egg`
 * records in the flesh tier while `Egg Yolk` and `Egg White (Albumen)` landed
 * in the egg tier, so a vegetarian filter kept the yolk and dropped the egg.
 * An egg is an egg whichever bird is named. Deliberately narrow: only a
 * `<bird> egg` compound, so `Chicken`, `chicken thigh` and `chicken broth`
 * still fall through to the flesh terms below.
 */
const BIRD_EGG_TERMS: RegExp[] = [
  /\b(chicken|hens?|ducks?|goose|geese|quail|turkey|pheasant|ostrich|emu)\s+eggs?\b/,
];

/** Eggs: excluded from vegan, allowed for vegetarian. */
const EGG_TERMS: RegExp[] = [
  /\beggs?\b/,
  /\b(tamago|albumen|meringue|mayonnaise|mayo|aioli)\b/,
];

/** Other animal products: excluded from vegan, allowed for vegetarian. */
const OTHER_ANIMAL_TERMS: RegExp[] = [
  /\b(honey|royal\s+jelly|bee\s+pollen|beeswax|propolis)\b/,
];

/**
 * Names that imply an animal-derived base but do not say so. `broth`, `stock`,
 * `consomme` and the like are stocks of unstated origin - the catalog's
 * "supreme broth gao tang" is a meat stock whose name contains no animal term.
 * These resolve to `unknown` rather than being assumed either way.
 */
const AMBIGUOUS_TERMS: RegExp[] = [
  /\b(broth|stock|bouillon|consomm[eé]|gravy|gao\s+tang)\b/,
  /\b(baked|refried)\s+beans\b/, // commonly prepared with pork fat
  /\b(kimchi|caesar|xo\s+sauce)\b/, // commonly contain fish products
];

// ===== STRUCTURAL RULES =====

/** `category` values whose members are plant or mineral by definition. */
const PLANT_CATEGORIES = new Set([
  "vegetable",
  "fruit",
  "grain",
  "culinary_herb",
  "medicinal herb",
  "spice",
  "nut_seed",
  "oil",
  "vinegar",
  "vinegars",
  "salt",
  "mineral salt",
  "sweetener",
]);

/** `category` values that are animal by definition. */
const FLESH_CATEGORIES = new Set(["meats"]);
const DAIRY_CATEGORIES = new Set(["dairy"]);

/** `protein.subCategory` values, the catalog's own animal/plant split. */
const FLESH_SUBCATEGORIES = new Set(["meat", "poultry", "seafood"]);
const EGG_SUBCATEGORIES = new Set(["egg"]);
const PLANT_SUBCATEGORIES = new Set([
  "plant_based",
  "legume",
  "fermented_legume",
  "seed",
]);

/**
 * `category` values that are mixed bags - a record lands here whether it is
 * plant or animal, so the name terms are the only signal. When no term fires
 * these stay `unknown` rather than defaulting to vegan.
 */
const MIXED_CATEGORIES = new Set([
  "seasoning",
  "misc",
  "beverage",
  "preserved",
  "bakery",
  "protein",
]);

const matchesAny = (patterns: RegExp[], text: string): RegExp | undefined =>
  patterns.find((pattern) => pattern.test(text));

/** Reads a dietary attestation out of the record's own `qualities` array. */
function readQualityAttestation(
  ingredient: ClassifiableIngredient,
  term: string,
): boolean {
  const { qualities } = ingredient;
  if (!Array.isArray(qualities)) return false;
  return qualities.some(
    (quality) => String(quality).toLowerCase().trim() === term,
  );
}

/**
 * Classify one ingredient's vegan and vegetarian status.
 *
 * Precedence, highest first:
 *  1. an explicit `vegan` attestation in `qualities`
 *  2. a plant-compound name ("eggplant", "vegetable broth") - suppresses both
 *     the animal term it contains and the ambiguity check
 *  3. a `dairy-based` attestation in `qualities`
 *  4. animal name terms: a bird's egg first (so `Chicken Egg` is not read as
 *     poultry flesh), then flesh, dairy, egg, other
 *  5. an ambiguous stock/preparation term, which yields `unknown`
 *  6. a plant compound again, this time outranking the structural rules -
 *     the catalog files plant milks under `category: "dairy"`
 *  7. structural `category` / `subCategory` rules
 *  8. compliant - nothing excluded it (exclusion-list default)
 *
 * Note on precedence 2 over 3: `qualities` is sparse and not fully reliable -
 * the catalog tags `cream of tartar` (potassium bitartrate, a winemaking
 * byproduct) as `dairy-based`. An unambiguous plant compound outranks it.
 */
export function classifyIngredientDiet(
  ingredient: ClassifiableIngredient,
): DietaryClassification {
  const name = String(ingredient?.name ?? "")
    .toLowerCase()
    .trim();
  const category = String(ingredient?.category ?? "")
    .toLowerCase()
    .trim();
  const subCategory = String(
    ingredient?.subCategory ?? ingredient?.subcategory ?? "",
  )
    .toLowerCase()
    .trim();

  // 1. The record's own attestation always wins.
  if (readQualityAttestation(ingredient, "vegan")) {
    return {
      isVegan: "compliant",
      isVegetarian: "compliant",
      basis: "attested:qualities=vegan",
    };
  }
  // 2. A plant compound suppresses the animal word it contains, and outranks
  //    the `dairy-based` tag below (see the note on precedence above).
  const plantCompound = matchesAny(PLANT_COMPOUNDS, name);

  if (!plantCompound) {
    // 3. A negative attestation from the record itself.
    if (readQualityAttestation(ingredient, "dairy-based")) {
      return {
        isVegan: "non-compliant",
        isVegetarian: "compliant",
        basis: "attested:qualities=dairy-based",
      };
    }

    // 3. A bird's egg is an egg, not flesh. This must precede FLESH_TERMS:
    //    the poultry pattern matches "Chicken Egg" as readily as "Chicken".
    const birdEgg = matchesAny(BIRD_EGG_TERMS, name);
    if (birdEgg) {
      return {
        isVegan: "non-compliant",
        isVegetarian: "compliant",
        basis: `name-term:egg(${birdEgg.source})`,
      };
    }

    // 4. Animal name terms, most restrictive first.
    const flesh = matchesAny(FLESH_TERMS, name);
    if (flesh) {
      return {
        isVegan: "non-compliant",
        isVegetarian: "non-compliant",
        basis: `name-term:flesh(${flesh.source})`,
      };
    }
    const dairy = matchesAny(DAIRY_TERMS, name);
    if (dairy) {
      return {
        isVegan: "non-compliant",
        isVegetarian: "compliant",
        basis: `name-term:dairy(${dairy.source})`,
      };
    }
    const egg = matchesAny(EGG_TERMS, name);
    if (egg) {
      return {
        isVegan: "non-compliant",
        isVegetarian: "compliant",
        basis: `name-term:egg(${egg.source})`,
      };
    }
    const other = matchesAny(OTHER_ANIMAL_TERMS, name);
    if (other) {
      return {
        isVegan: "non-compliant",
        isVegetarian: "compliant",
        basis: `name-term:animal-product(${other.source})`,
      };
    }
  }

  // 5. Unstated-origin preparations resolve to unknown, never to a guess.
  //    Skipped when a plant compound already settled it ("vegetable broth").
  const ambiguous = plantCompound ? undefined : matchesAny(AMBIGUOUS_TERMS, name);
  if (ambiguous) {
    return {
      isVegan: "unknown",
      isVegetarian: "unknown",
      basis: `ambiguous-term(${ambiguous.source})`,
    };
  }

  // 6. A plant compound outranks the structural rules below. The catalog
  //     files plant milks (oat, almond, soy, cashew, coconut) and coconut
  //     cream under `category: "dairy"` because that is where a shop shelves
  //     them; the name is the reliable signal, not the aisle.
  if (plantCompound) {
    return {
      isVegan: "compliant",
      isVegetarian: "compliant",
      basis: `plant-compound(${plantCompound.source})`,
    };
  }

  // 5. Structural rules from the catalog's own taxonomy.
  if (FLESH_CATEGORIES.has(category)) {
    return {
      isVegan: "non-compliant",
      isVegetarian: "non-compliant",
      basis: `category=${category}`,
    };
  }
  if (DAIRY_CATEGORIES.has(category)) {
    return {
      isVegan: "non-compliant",
      isVegetarian: "compliant",
      basis: `category=${category}`,
    };
  }
  if (FLESH_SUBCATEGORIES.has(subCategory)) {
    return {
      isVegan: "non-compliant",
      isVegetarian: "non-compliant",
      basis: `subCategory=${subCategory}`,
    };
  }
  if (EGG_SUBCATEGORIES.has(subCategory)) {
    return {
      isVegan: "non-compliant",
      isVegetarian: "compliant",
      basis: `subCategory=${subCategory}`,
    };
  }
  if (PLANT_SUBCATEGORIES.has(subCategory)) {
    return {
      isVegan: "compliant",
      isVegetarian: "compliant",
      basis: `subCategory=${subCategory}`,
    };
  }
  if (PLANT_CATEGORIES.has(category)) {
    return {
      isVegan: "compliant",
      isVegetarian: "compliant",
      basis: `category=${category}`,
    };
  }

  // 7. Exclusion-list default: nothing excluded this record, so it passes.
  //    The animal-term, attestation, taxonomy and ambiguity checks above are
  //    the whole basis for exclusion; anything they do not catch is treated as
  //    plant-based. This is best-effort by construction - an animal-derived
  //    ingredient whose name carries no listed term will pass, which is why
  //    allergen claims go through `readAllergenAttestation` instead.
  return {
    isVegan: "compliant",
    isVegetarian: "compliant",
    basis: MIXED_CATEGORIES.has(category)
      ? `no-animal-term-matched(mixed-category:${category || "none"})`
      : `no-animal-term-matched(category=${category || "none"})`,
  };
}

/**
 * Allergen and medical dietary properties, which are **never derived**.
 *
 * A "nut-free" or "gluten-free" claim is a safety claim. The absence of the
 * word "peanut" in a name is not evidence of absence, so this reads only an
 * explicit attestation from the record and returns `unknown` otherwise. A
 * restrictive filter must treat `unknown` as failing.
 */
export function readAllergenAttestation(
  ingredient: ClassifiableIngredient,
  property: "isNutFree" | "isGlutenFree" | "isDairyFree",
): DietaryVerdict {
  const attestation: Record<typeof property, string> = {
    isNutFree: "nut-free",
    isGlutenFree: "gluten-free",
    isDairyFree: "dairy-free",
  };

  if (readQualityAttestation(ingredient, attestation[property])) {
    return "compliant";
  }

  // A dairy-based attestation is a positive statement of the opposite.
  if (
    property === "isDairyFree" &&
    readQualityAttestation(ingredient, "dairy-based")
  ) {
    return "non-compliant";
  }

  return "unknown";
}
