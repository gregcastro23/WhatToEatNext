# HSCA restoration against HSCA_Recipes.pdf

**Date:** 2026-10-03
**Source of truth:** `HSCA_Recipes.pdf`, the 507-page ICE course packet the archive was extracted from
**Files:** `recipes_database.json` (source), `src/data/cuisines/hsca.ts` (static catalog)

The brief was that about 501 HSCA entries were sub-recipes carrying placeholder methods. That is not
what the data shows, and this document records what it does show.

## What was measured

The PDF has no text layer, so all 507 pages were OCR'd twice (macOS Vision, at two render scales) and
segmented into 577 candidate recipes. Each was matched to the 533 source recipes of the time by title and content
(#921 has since removed a duplicate, leaving 532), and compared on method, ingredients and yield. Every addition below was then checked against the page
image, and every ambiguous quantity was zoomed at 4x. The OCR reads small fractions badly (a printed
"¼" comes out as "4"), so the OCR was used for structure and wording, and quantities already in the
data were kept wherever the PDF agreed.

| | Count |
|---|---:|
| Source recipes matched to a PDF recipe | 527 of 533 |
| Of those, methods already equal to the PDF (OCR-normalised) | 494 |
| Invented methods (not in the PDF) | 2 |
| Sub-recipes folded into their parent | 4 |
| PDF recipes absent from the source | 36 |
| Recipes missing footnotes or variations | 37 |

No recipe carries the generator's literal fallback ("Prepare according to clean holistic macrobiotic
guidelines."), and the live API shows the same methods the source has (498 live HSCA recipes, all
identical), so the placeholder text is not in this data. The faults are the four classes above.

## Changes

### 2 composite dishes had an invented method

The PDF gives a composite dish no method of its own (it lists "1 recipe Fried Tempeh, 1 recipe Spelt
Bread, condiments..." and prints each component after it). `scripts/fix_empty_instructions.py` filled
the gap with sentences the PDF never contains. Each now carries its components' real steps, labelled:

- Tempeh Reuben Sandwich: Fried Tempeh, Spelt Bread, Ketchup
- Chickpea Crêpes with Curried Chickpeas, Vegetables & Mango Sauce: Chickpea Crêpe, Curried Chickpea Filling, Mango Sauce

### 4 parents had swallowed a sub-recipe

| Parent | Folded-in sub-recipe, now its own recipe |
|---|---|
| Mediterranean Roasted Black Cod with Muhammara | Muhammara |
| Seafood Sausage | Honey-Mustard Yogurt |
| Blackened Shrimp | Blackening Spice Mix |
| Sweet Potato Latkes with Pear-Fennel Marmalade | Cashew Cream |

The parent keeps its own ingredients and steps plus a "(recipe below)" reference line, as the PDF prints it.

### 36 recipes added

| Recipe | PDF page | Categories |
|---|---:|---|
| TOMATO VINAIGRETTE | 5 | Dressing, Vegan |
| TOMATO "CREAM" SAUCE (FOR VEGETABLE-POLENTA NAPOLEONS) | 10 | Sauce, Vegan |
| MUHAMMARA | 12 | Sauce, Dip, Mediterranean, Vegetarian |
| HONEY-MUSTARD YOGURT | 13 | Sauce, Condiment, Vegetarian |
| FISH CONGEE | 31 | Soup, Seafood |
| SWEET VEGAN CRÊPES | 50 | Brunch, Crêpes, Vegan |
| CASHEW MILK (FOR SWEET VEGAN CRÊPES) | 50 | Vegan, Dairy Substitute, Beverage |
| GLUTEN-FREE AND VEGAN WAFFLES | 60 | Breakfast, Waffles, Gluten-Free, Vegan |
| HIGH-PROTEIN GLUTEN-FREE FLOUR MIX | 60 | Gluten-Free, Flour Blend, Baking |
| GLUTEN-FREE MINI PIZZAS | 84 | Appetizer, Pizza, Gluten-Free, Baking |
| FOCACCIA | 85 | Bread, Baking, Vegetarian |
| GNOCCHI | 102 | Pasta, Main Course, Vegetarian |
| GLUTEN-FREE CHOCOLATE CAKE | 120 | Dessert, Cake, Gluten-Free |
| CHOCOLATE CHIP COOKIES | 156 | Dessert, Cookies, Vegetarian |
| CREAM CHEESE FROSTING | 180 | Frosting, Dessert, Vegetarian |
| RICE PUDDING | 206 | Dessert, Vegan, Gluten-Free |
| CHECKERBOARD COOKIES | 240 | Dessert, Cookies, Vegetarian |
| COBB SALAD | 264 | Salad, Main Course |
| CASHEW CREAM | 279 | Sauce, Condiment, Vegan |
| CREAM OF ASPARAGUS SOUP | 300 | Soup, Vegetarian |
| VEGAN BAKLAVA | 305 | Dessert, Pastry, Vegan |
| CREAMY SWEET POTATO BISQUE WITH CASHEW CRÈME FRAICHE AND CANDIED PECANS | 336 | Soup, Vegan |
| PEANUT SAUCE | 346 | Sauce, Vegan |
| CEVICHE | 383 | Appetizer, Seafood |
| BLACKENING SPICE MIX | 384 | Condiment, Spice Blend |
| COUS-COUS | 405 | Side Dish, Grains, Vegan |
| BLACK BEAN SALAD | 420 | Salad, Vegan, Gluten-Free |
| POLENTA | 421 | Side Dish, Grains, Vegan |
| RISOTTO | 428 | Main Course, Grains, Vegan |
| VEGAN "MORNAY" SAUCE | 452 | Sauce, Vegan |
| BORSCHT | 470 | Soup, Vegan |
| CASSOULET | 474 | Main Course, Stew, Vegan |
| CREAM OF CARROT SOUP WITH ARBORIO RICE | 480 | Soup, Vegan |
| FRITTATA | 483 | Brunch, Breakfast, Egg, Vegetarian |
| BABA GHANOUSH | 490 | Appetizer, Dip, Vegan |
| BERRY-GRAPE KANTEN | 507 | Dessert, Vegan, Gluten-Free |

Not added, because the data already has them: the repeated Gluten-Free Flour Blend, the second printing
of Chocolate Chip Cookies (p.164, followed by an unrelated nutrition handout), Almond Pastry Cream,
Miso Marinade, Hiziki Caviar and Tofu Sour Cream (second copies), and section headings.

### 37 recipes: footnotes and variations

The PDF prints notes under a method ("Seasonal variation: ...", "Note: ...", "Variations: ..."). They were
appended as final method lines in the PDF's wording. (A second transcription of Rich Almond
Milk (for Almond Fruit Tart) carried the same note; #921 removed that duplicate.)

- Crème Anglaise (Stirred Custard)
- Mornay Sauce
- Classic Béchamel
- QUICK SHIITAKE MUSHROOM STOCK
- FISH FUMET
- BOILED NOODLES – SHOCK METHOD
- RICH ALMOND MILK (FOR ALMOND-FRUIT TART)
- RICH ALMOND MILK
- CHOCOLATE-ALMOND GANACHE
- ALMOND “CREAM” SAUCE
- Flaky Biscuits
- ROASTED RED PEPPER CHICKPEA PURÉE
- Seitan Bordelaise
- SEITAN STEW
- VEGAN PASTA DOUGH
- CANNELLINI BEAN SALAD
- GLUTEN-FREE CRISP GINGER COOKIE
- FRENCH WALNUT TART
- Baked Custard (Crème Caramel)
- Meringue Frosting
- WILD RICE SALAD
- BASIC SEITAN RECIPE
- Red Cabbage-Caraway Sauerkraut
- Green Cabbage Sauerkraut with Ginger and Turmeric
- Tapenade
- CURRANT SCONES
- POACHED CHICKEN AND ROASTED ASPARAGUS
- Velouté
- Stuffed Squid, Sicilian Style
- HANDMADE GARLIC MAYONNAISE
- LIGHT LEMON TART
- ICHIBAN DASHI
- Kasha with Egg
- TEMPEH “BOLOGNESE”
- TEMPEH VEGETABLE KEBOBS
- TEMPEH SCALOPPINI
- SCRAMBLED EGGS

The PDF also prints source credits under some recipes (for example The Voluptuous Vegan, The Pasta Bible,
Peter Berley). By decision they are not carried into the method or the data.

## Checked and found correct

These looked wrong in a first pass and are not:

- **Teriyaki Sauce (two entries):** the PDF prints two different recipes under that title (p.324 blender,
  p.469 simmered); the data has both.
- **Almond-Fruit Tart with Almond Crust (two entries):** the pastry cream is a component printed inside
  that recipe, not a separate one.
- **Nori Rolls, Zucchini Peanut Noodle Bowl, Shaved Fennel & Orange Salad, Hazelnut-Crusted Flounder:**
  their sub-components are part of the PDF recipe.
- **Scrambled Eggs:** the PDF has no ingredient list, but step 1 names the foods, which is what the data lists.
- **Watercress Salad, Kasha with Egg:** lines the OCR dropped; the data is the more complete.

## Applying it

`hsca.ts` cannot be regenerated wholesale: `scripts/generateHscaCuisine.ts` has drifted, and a full run
moves the elements, ESMS and thermodynamics of about 300 recipes. `scripts/syncHscaCuisine.ts` updates
only what changed (instructions, rebuilt ingredient lists, new recipes) and reports the rest as unchanged:

    bun scripts/syncHscaCuisine.ts --check         # list what would change; exit 1 if anything would
    bun scripts/syncHscaCuisine.ts                 # write it
    bun scripts/syncHscaCuisine.ts --only="NAME"   # touch one dish

An ingredient list that differs from the builder's output counts as a source change. That also catches a
dish patched by hand in `hsca.ts`: #937 corrected 36 lines that way (a leading word read as a unit), and 14
of those dishes still differ from a fresh parse ("1 clove garlic" against "1 garlic clove"). `--check`
therefore exits 1 today for those 14 and none from this change. A rebuilt dish is replaced wholesale, `--only`
included, so never run it on one of those 14; review the list before writing.

Both scripts build a dish with `scripts/lib/hscaDish.ts`, which carries #937's whole-word unit fix. That
fix also changed one dish added here: Rice Pudding had read "ground cinnamon" as 1 g of "round cinnamon".
The refactor out of the generator was checked byte-for-byte: the generator writes an identical file before
and after. `src/__tests__/data/hscaRestoration.test.ts`
fails when the two files disagree, when a placeholder method appears, or when a sub-recipe is folded back in.

## What else moved, and why

Adding recipes changes numbers that other files derive from the catalog:

- **HSCA's cuisine profile** (`bun run generate:cuisine-profiles`): the mean over its dishes now counts 534
  dishes, up from 498, and shifts Fire 0.2283→0.2279, Water 0.2912→0.2903, Earth 0.3051→0.306, Air 0.1754→0.1758.
  `derivedProfiles.json`, `backend/.../cuisines.json` and `backend/.../cuisines/HSCA.json` were regenerated;
  no other cuisine moved. The recommender reads this profile, so HSCA's ranking shifts by that much.
- **Meal filing** (`hscaMealFiling.ts` and its test): 568 recipes now file as breakfast 61, dessert 141,
  lunch 206, dinner 80, plus 80 with no signal; 195 claim no meal (80 no-signal, 20 drinks, 95 sauces).
  Master's documented 532-recipe figures were reproduced exactly by the same replay before the new ones were measured.
- **Three search ratchets** in `corpus.test.ts`, each raised by the measured amount and named: typo-recovery
  misses 3→4 ("leon" is now also inside "napoleons" in the new Tomato "Cream" Sauce title), generic cards
  6→7 ("garbanzo flour") and modifier cards 41→44 ("honey-mustard yogurt", "pistachio nuts", "potato starch
  flour"). Unresolved lines go 259→270, which stays under the existing 273 (six ingredients the catalog
  has no card for, plus five range or comma splits). These are new lines, not regressions in the resolver.
- **`scripts/lib/diffAssertions.ts`**: the diff gate crashed (ENOBUFS) on this change, because `git diff`
  of `hsca.ts` exceeds Node's 1 MB default. Its buffer is raised; the gate's rules are unchanged.

Not regenerated: `src/data/generated/ingredientRecipeIndex.json`, which is built from recipe lines and
drifts when rebuilt, so the 36 new recipes are not in the ingredient reverse index until it is.

## Verification

On `master` @ `8bd7be6a` plus this change:

- Full jest: 541 of 541 suites, 5,581 tests pass.
- `typecheck`, `lint` (0 errors), `check:scripts` (0 errors), `lint:scripts` (0 errors), `lint:debt`,
  `audit:dead-modules`, `check:read-json`, `check:bare-json` and `check:diff-assertions` pass.
- `bun scripts/syncHscaCuisine.ts --check` lists only the 14 hand-patched dishes from #937; none of the
  dishes this change adds or corrects.
- The audit behind these numbers was run against the PDF's OCR and page images, not the PDF text, so it
  can be repeated with any OCR; the tooling is not committed.

## The live database

The app serves `/recipes/[recipeId]` from Postgres, so the source change reached users only once the
`recipes` table was brought in step. That was done on 2026-10-04 with `scripts/syncHscaRecipesToDb.ts`
(logic in `scripts/lib/hscaDbSync.ts`, computed fields in `scripts/lib/hscaComputed.ts`): 43 existing rows
corrected and 36 inserted in one transaction, taking `recipes` from 1,077 to 1,113 rows, HSCA from 498 to
534, and the live catalog from 1,063 to 1,099.

- A changed source record is matched to a live row by name and by BOTH stored copies of the method
  (`instructions` and `read_model.instructions`) equalling the old source method; all 43 matched exactly one
  row. The source has 532 records for 498 live names, so a duplicate-titled record has no live row.
- The tool runs as a dry run (a `READ ONLY` transaction) by default; `--rehearse` does every write and check
  and rolls back; `--commit` needs `--backup=<file>` and `--confirm-host=<host>`. It refuses to commit unless
  every written row reads back as intended, the row counts moved by exactly the number inserted, and a
  checksum of every other row is unchanged. A re-run after the commit finds every change already applied.
- Four parents had their ingredient list rewritten; for them, and for the 36 new rows, `elemental_properties`,
  `alchemical_quantities` and `nutritional_profile` were computed with copies of the repo's backfill
  functions. The copies agree with the originals on 538 ingredient lists (0 differences). They do not
  reproduce the values already stored on the other rows: those were written in batches against an ingredient
  catalog that has since changed (elemental shares agree to within 0.10 on 487 of 498 rows), so the 40 rows
  hold what the backfills compute today.
- `contexts[].lunar` is left empty on the new rows. The stored phases do not follow the dominant element and
  nothing reads them. Defaults are the placeholders every existing HSCA row shares (30/30 minutes, 4
  servings, `main`, difficulty 2, all four seasons).
- Black Cod and Sweet Potato Latkes lost their nutrition (their shortened ingredient lists cannot back a
  plausible total); Seafood Sausage was recomputed and Blackened Shrimp gained some.
- The ingredient lines the importer misread (below) were repaired in the existing rows in two runs on
  2026-10-05: 33 rows with #937's unit-prefix misread, then 295 rows with the rest (the 33 included, since
  their lines changed again), each by a script that refuses to touch a line that is not exactly the old
  parser's output.

## Parse errors from the first importer

The ingredient parser was a plain regex reader of a leading number and a unit, and the archive writes much
more than that. Measured over all 5,342 source ingredient lines on 2026-10-05, it mangled 518 lines in 308
recipes, and 478 lines in 295 of the 534 live rows:

| What the source says | What the first parser made of it |
| --- | --- |
| `¾ cup flour`, `1 ½ cups apple juice` (67 lines, 17 recipes) | 1 piece named "¾ cup flour" |
| `8-10 sheets rice paper`, `2 to 3 tablespoons shoyu`, `1 1/2-2 cups water` (136 lines) | 8 pieces of "-10 sheets rice paper", unit and name corrupted |
| `14-ounce can tomatoes`, `1 (14 oz.) can coconut milk`, `2-8 ounce packages tempeh` | 14 pieces of "-ounce can tomatoes", the size read as the count |
| `Salt to taste`, `Canola oil for frying` | the ingredients "salt to taste" and "canola oil for frying" |
| `1/4 cup of oil`, `2 pinches of sea salt` | the ingredient "of oil" |
| `toasted, chopped walnuts`, `skinless, boneless chicken breast` | the ingredient "toasted", with "chopped walnuts" as a note |
| `1 tablespoon + 1 1/2 teaspoons yeast`, `1 gallon + 2 quarts water` | the second quantity left in the name, the amount short by as much as 40% |
| `1/4 cup (2 ounces), Worcestershire sauce`, `Garnish: 1 scallion` | an empty name; a label as the ingredient |
| `4 Granny Smith apples`, `Canola oil`, `garlic cloves` (#937) | 4 g of "ranny smith apples", a can of "ola oil" |

`scripts/lib/hscaDish.ts` now reads all of these. Whatever it sets aside lands in `notes`, so no word of the
source line is dropped; a range keeps its lower bound as the amount (as it did by accident before) and both
bounds in the notes; "N unit + M unit" is added up when both are volumes. Lines the first parser read
correctly parse byte-for-byte as before (a parity test pins 14 of them). The first parser is kept, frozen, in
`scripts/lib/hscaLegacyParse.ts`: it is the witness for the database repair, not something to build with.

Because the parser now reads #937's three hand-patched exceptions (garlic cloves, the "Garnish:" label, "1
gallon + 2 quarts" as 1.5 gallons), `hsca.ts` is again wholly parser-derived: `bun scripts/syncHscaCuisine.ts
--check` exits 0 with nothing rebuilt. 312 dishes were rebuilt to get there; only their ingredients and the
values computed from them changed (nutrition per serving on 200 of them, elements on about 210). The search
corpus ratchets tightened: generic cards 7 to 5, unresolved lines 270 to 248.

`scripts/repairHscaParsedLinesInDb.ts` repaired the live rows. A stored line is replaced only when it equals
what the legacy parser made of its source line, and it becomes what the corrected parser makes of it; every
one of the 534 live rows was either already correct or matched that way on every line it changed (none was
skipped). It rewrote `elemental_properties` on 140 rows and `alchemical_quantities` on 62, only where today's
code computes a different result from the repaired names. It did **not** rewrite `nutritional_profile`: 45
rows would change (for example a dumpling recipe from 616 to 1,489 kcal "a serving"), but those totals divide
by the placeholder 4 servings every row carries, so a corrected line can move a total a long way without
making it truer. `--nutrition` writes them.

What the parser still does not read, on purpose:

- **"Pinch" and "dash"** (about 150 lines): `pinches?` never matched "pinch", so "Pinch of sea salt" is 1 piece
  named "pinch of sea salt". Making it a unit needs a gram weight in `unitConversion.ts` first: a caloric
  ingredient in a unit with no weight makes the recipe's computed nutrition disappear.
- **"2 cloves"** (3 lines, beside cinnamon sticks and cardamom pods) is the spice. The unit swallows the whole
  line, leaving an empty name; naming it "cloves" would weigh it as a 50 g piece.
- **"optional"** (40 lines): the notes say it, but every line is stored `optional: false`.
- **"or" alternatives** (about 115 lines) stay inside the name, and two ingredients on one line ("salt and
  pepper", 72 lines) stay one line.

## Not done

- **The 36 new live rows have no description or image.** Every older row has both; the columns are
  nullable and the app's row mapper omits them, but nothing here generates either.
- **Ingredient quantities in the existing data were not re-verified line by line.** They were compared
  by ingredient name (all agree apart from the folded-in lines above); a quantity the PDF prints as a
  small fraction could still differ.
