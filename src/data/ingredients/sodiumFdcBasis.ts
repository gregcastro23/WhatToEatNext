// src/data/ingredients/sodiumFdcBasis.ts
//
// The USDA FoodData Central record behind each ingredient profile whose `macros.sodium`
// was corrected on 2026-09-29. A profile stated a sodium between 0 and 1 that was not mg:
// 39 copied the ingredient's Daily Value fraction (`minerals.sodium`), 17 stated grams.
// [MEASURED] Against SR Legacy (2018-04) each match agrees with the card's calories and, where
// the card had one, with its own Daily Value fraction. `sodiumFdcBasis.test.ts` re-derives every
// `macros.sodium` below from `mgPer100g` and the card's serving grams, so a card and its basis
// cannot drift apart.

export interface SodiumFdcBasis {
  /** Key in the unified ingredient catalog. */
  key: string;
  fdcId: number;
  fdcDescription: string;
  /** SR Legacy nutrient 307, mg per 100 g. */
  mgPer100g: number;
  /** Grams in the card's `serving_size`. */
  servingGrams: number;
  /** Why the record is not the ingredient itself, when it is not. */
  note?: string;
}

export const SODIUM_FDC_BASIS: readonly SodiumFdcBasis[] = [
  { key: "arugula", fdcId: 169387, fdcDescription: "Arugula, raw", mgPer100g: 27, servingGrams: 40 },
  { key: "radicchio", fdcId: 168564, fdcDescription: "Radicchio, raw", mgPer100g: 22, servingGrams: 40 },
  { key: "chicory", fdcId: 169992, fdcDescription: "Chicory greens, raw", mgPer100g: 45, servingGrams: 50 },
  { key: "chives", fdcId: 169994, fdcDescription: "Chives, raw", mgPer100g: 3, servingGrams: 3 },
  { key: "kasha", fdcId: 170685, fdcDescription: "Buckwheat groats, roasted, dry", mgPer100g: 11, servingGrams: 43 },
  { key: "salt", fdcId: 173468, fdcDescription: "Salt, table", mgPer100g: 38758, servingGrams: 1.5 },
  { key: "sea_salt", fdcId: 173468, fdcDescription: "Salt, table", mgPer100g: 38758, servingGrams: 1.5, note: "proxy: SR Legacy has no sea-salt record; sea salt is sodium chloride, as Salt, table" },
  { key: "anchovies", fdcId: 174183, fdcDescription: "Fish, anchovy, european, canned in oil, drained solids", mgPer100g: 3668, servingGrams: 20 },
  { key: "maple_crystals", fdcId: 169658, fdcDescription: "Sugars, maple", mgPer100g: 11, servingGrams: 4 },
  { key: "agar_flakes", fdcId: 170090, fdcDescription: "Seaweed, agar, dried", mgPer100g: 102, servingGrams: 4 },
  { key: "agar_powder", fdcId: 170090, fdcDescription: "Seaweed, agar, dried", mgPer100g: 102, servingGrams: 2 },
  { key: "arrowroot_powder", fdcId: 170684, fdcDescription: "Arrowroot flour", mgPer100g: 2, servingGrams: 8 },
  { key: "baking_powder", fdcId: 172804, fdcDescription: "Leavening agents, baking powder, double-acting, straight phosphate", mgPer100g: 7893, servingGrams: 5, note: "straight-phosphate; the sodium aluminum sulfate record is 10600" },
  { key: "ketchup", fdcId: 168556, fdcDescription: "Catsup", mgPer100g: 907, servingGrams: 17 },
  { key: "mustard", fdcId: 172234, fdcDescription: "Mustard, prepared, yellow", mgPer100g: 1104, servingGrams: 5 },
  { key: "bacon", fdcId: 168322, fdcDescription: "Pork, cured, bacon, pre-sliced, cooked, pan-fried", mgPer100g: 1684, servingGrams: 34 },
  { key: "sliced_turkey", fdcId: 172941, fdcDescription: "Turkey breast, sliced, prepackaged", mgPer100g: 898, servingGrams: 56 },
  { key: "stuffing", fdcId: 174931, fdcDescription: "Bread, stuffing, dry mix, prepared", mgPer100g: 479, servingGrams: 100 },
  { key: "bbq_sauce", fdcId: 174523, fdcDescription: "Sauce, barbecue", mgPer100g: 1027, servingGrams: 36 },
  { key: "graham_crackers", fdcId: 174957, fdcDescription: "Cookies, graham crackers, plain or honey (includes cinnamon)", mgPer100g: 516, servingGrams: 28 },
  { key: "marshmallows", fdcId: 167995, fdcDescription: "Candies, marshmallows", mgPer100g: 80, servingGrams: 29 },
  { key: "pie_crust", fdcId: 167930, fdcDescription: "Pie crust, refrigerated, regular, baked", mgPer100g: 472, servingGrams: 23 },
  { key: "shortcrust_pastry", fdcId: 167930, fdcDescription: "Pie crust, refrigerated, regular, baked", mgPer100g: 472, servingGrams: 28, note: "pie crust is shortcrust" },
  { key: "choux_pastry", fdcId: 174986, fdcDescription: "Cream puff shell, prepared from recipe", mgPer100g: 483, servingGrams: 22, note: "cream puff shell is choux" },
  { key: "phyllo_dough", fdcId: 172791, fdcDescription: "Phyllo dough", mgPer100g: 483, servingGrams: 32 },
  { key: "white_ham", fdcId: 173863, fdcDescription: "Ham, sliced, pre-packaged, deli meat (96%fat free, water added)", mgPer100g: 945, servingGrams: 56 },
  { key: "bechamel_sauce", fdcId: 174542, fdcDescription: "Sauce, white, thin, prepared-from-recipe, with butter", mgPer100g: 184, servingGrams: 63, note: "thin; SR Legacy has no medium white sauce" },
  { key: "lardons", fdcId: 168322, fdcDescription: "Pork, cured, bacon, pre-sliced, cooked, pan-fried", mgPer100g: 1684, servingGrams: 28, note: "cooked bacon pieces" },
  { key: "bacon_or_pancetta", fdcId: 168322, fdcDescription: "Pork, cured, bacon, pre-sliced, cooked, pan-fried", mgPer100g: 1684, servingGrams: 28 },
  { key: "gyoza_wrappers", fdcId: 172802, fdcDescription: "Wonton wrappers (includes egg roll wrappers)", mgPer100g: 572, servingGrams: 32, note: "proxy: wonton wrappers" },
  { key: "soy_sauce", fdcId: 174277, fdcDescription: "Soy sauce made from soy and wheat (shoyu)", mgPer100g: 5493, servingGrams: 18 },
  { key: "kimchi", fdcId: 170392, fdcDescription: "Cabbage, kimchi", mgPer100g: 498, servingGrams: 75 },
  { key: "aged_kimchi", fdcId: 170392, fdcDescription: "Cabbage, kimchi", mgPer100g: 498, servingGrams: 75, note: "same record as kimchi; the two cards are identical" },
  { key: "pickles", fdcId: 168558, fdcDescription: "Pickles, cucumber, dill or kosher dill", mgPer100g: 809, servingGrams: 35 },
];

/**
 * Profiles that still state a sodium between 0 and 1, with no SR Legacy 2018-04
 * record that is the same food. Matching one to a near record was rejected
 * where the calories or the card's own Daily Value fraction disagreed:
 * puff pastry (+42% kcal), vinaigrette and spring rolls (about 2x the
 * fraction), brown stock (SR's is salted), chickpea miso (SR's is soy miso).
 * The rest have no record (arame, hijiki, dulse, kombu dried, jameed,
 * saeujeot, gochujang, ssamjang, kataifi, umeboshi, dashi, char siu bao,
 * black salt). `SODIUM_MG_FLOOR` keeps them out of recipe totals.
 */
export const SODIUM_UNRESOLVED: readonly string[] = [
  "kombu",
  "arame",
  "hijiki",
  "dulse",
  "kuzu",
  "agave_nectar",
  "chickpea_miso",
  "puff_pastry",
  "pastry_dough",
  "char_siu_bao",
  "spring_rolls",
  "vinaigrette",
  "black_salt",
  "umeboshi",
  "dashi",
  "ssamjang",
  "gochujang",
  "saeujeot",
  "jameed",
  "kataifi_dough",
  "pickled_vegetables",
  "brown_stock",
];
