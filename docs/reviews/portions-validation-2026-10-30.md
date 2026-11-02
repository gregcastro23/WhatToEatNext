# Portion correction validation — 2026-10-30

## PR #905: fluid cream and frying fat

Compared the production recipe loader on master `976401031ff5680158821da299d3a39409412c70` with #905 integrated onto that revision. Both load 1,113 recipes. Computed/authored/missing nutrition changes from **229/833/51** to **232/831/50**. There are **19 changed published nutrition blocks**, with no added or removed recipes.

### Standards review

No blocking violations of the repository’s documented standards. The offline generator preserves USDA record provenance and its output is checked byte for byte. A duplicated input schema shared conceptually with the count generator is a nonblocking future cleanup.

### Spec review

The recorded USDA FDC 170859 portions support a fluid cup of heavy cream at 238 g, rather than the 120 g whipped cup. The generator preserves the 15 g tablespoon. Frying fat uses the already accepted #907 method-specific uptake rule and retains complete-only nutrient handling. The Mandazi and missing-nutrition planner fixture updates preserve their assertions.

Fixed a confirmed edge case: a fat line explicitly saying “for deep frying” must select deep frying when the instructions only say “fry.” The new regression test failed before the fix and passes afterward. This fix changes none of the current catalog’s published nutrition values.

Compared with the older PR measurements, the additional changed recipe is Tempeh Sausage: its separately listed frying oil is capped by the accepted pan-frying rule.

### Measured calorie changes

These are computed outputs, not independent measurements of prepared food. Authored nutrition can be replaced or withheld under the existing completeness rules.

| Recipe | kcal/serving before | kcal/serving after |
| --- | ---: | ---: |
| `african-breakfast-all-authentic-east-african-mandazi` | 420 | 715.82 |
| `african-dinner-all-authentic-tunisian-brik` | 740.28 | 413.74 |
| `african-dessert-all-authentic-south-african-malva-pudding` | 513.24 | 580.77 |
| `african-dessert-all-authentic-nigerian-coconut-chin-chin` | 1381.69 | 517.02 |
| `american-breakfast-spring-authentic-spring-vegetable-frittata` | 390.59 | 415.91 |
| `american-dinner-all-authentic-chicken-fried-steak` | 1551.26 | 868.61 |
| `american-dinner-all-classic-new-england-clam-chowder` | 855.49 | 1058.06 |
| `american-dessert-spring-authentic-strawberry-shortcake` | 504.47 | 628.86 |
| `french-dessert-all-authentic-chocolate-profiteroles` | 731.94 | 765.7 |
| `greek-dinner-all-authentic-keftedes-greek-meatballs` | 1002.53 | 772.1 |
| `indian-dinner-winter-palak-paneer` | 463.79 | 514.44 |
| `italian-dessert-summer-authentic-gelato-artigianale-fior-di-latte` | 334.56 | 385.2 |
| `middleeastern-lunch-all-authentic-falafel` | 330 | 631.16 |
| `middleeastern-dinner-all-falafel` | none | 691.35 |
| `hsca-dinner-all-tempeh-sausage` | 1173.59 | 1166.2 |
| `hsca-dessert-all-whipped-cream` | 107.13 | 208.41 |
| `hsca-dessert-all-kabocha-squash-pie` | 246.52 | 276.53 |
| `hsca-dessert-all-caramelized-onion-tart` | 86.23 | 108.74 |
| `hsca-dessert-all-french-vanilla-ice-cream` | 1455.37 | 1860.51 |

### Validation

The initial focused run passed 8 suites / 61 tests. The explicit deep-frying regression, frying-fat integration tests and offline generator tests passed 3 suites / 15 tests. Full verification passed on `57db1f2a`: all static gates, 293 gate tests, and 597 Jest suites / 6,193 tests passed (6 suites and 53 tests skipped).

## PR #909: volume labels and named cuts

Compared the production recipe loader against validated #905 (`57db1f2a`). Both load 1,113 recipes. Computed/authored/missing nutrition changes from **232/831/50** to **231/832/50**. There are **21 changed published nutrition blocks**, with no added or removed recipes.

### Standards review

No blocking documented-standard violations. Corrected the generator and conversion contract comments so the lightest-cut fallback is not described as a preparation uniquely identified by the recipe.

### Spec review

The implementation reads labels with or without commas, preserves plain-measure precedence, and weighs a unique named cut. Missing or ambiguous cuts use the lightest measured cut plus the spread to the heaviest; that spread counts against the accepted 10% unresolved-mass limit. The kitchen-lab table displays ranges and their measured preparations.

Fixed two confirmed gaps:

- Retain preparation words in parentheses: USDA’s `shelled (50 halves)` now matches “walnut halves” at 100 g, without a fallback spread.
- Carry uncertainty in fried food mass through the absorbed-oil calculation. For 270 g of exact food plus an unspecified walnut cup (80–120 g), deep-frying adds 24.5–27.3 g of oil. The full uncertainty is 42.8 / 417.3 = 10.26%, so computed nutrition is withheld. A 10 g listed-oil cap adds no oil uncertainty and leaves exactly 10%, which is accepted.

Both new failure cases were reproduced before their fixes. A separate cap regression verifies that listed oil still bounds absorption uncertainty.

The old almond-cream-sauce fixture assumed water was absent. Master restored 2 cups of water from the archive, bringing the onion’s uncertainty below the threshold; the test now verifies both the current diluted recipe and a concentrated variant. Its published nutrition stays computed. Muhammara now falls back from computed 639.54 kcal to its authored 250 kcal.

### Measured calorie changes

| Recipe | kcal/serving before | kcal/serving after |
| --- | ---: | ---: |
| `african-dinner-all-authentic-tunisian-brik` | 413.74 | 386.02 |
| `american-breakfast-spring-authentic-spring-vegetable-frittata` | 415.91 | 413.91 |
| `american-lunch-winter-authentic-classic-french-onion-dip` | 228.11 | 227.11 |
| `french-breakfast-all-authentic-oeufs-en-cocotte-baked-eggs` | 413.28 | 411.28 |
| `greek-dinner-all-authentic-greek-gigantes-plaki` | 330.62 | 315.36 |
| `greek-dinner-all-authentic-keftedes-greek-meatballs` | 772.1 | 758.32 |
| `japanese-dinner-all-authentic-yakisoba-japanese-stir-fried-noodles` | 650.87 | 650.15 |
| `middleeastern-lunch-all-authentic-falafel` | 631.16 | 587.29 |
| `middleeastern-dinner-all-kofta-kebab` | 404.64 | 400.42 |
| `hsca-lunch-all-gluten-free-pear-cardamom-quick-bread` | 447.04 | 467.41 |
| `hsca-lunch-all-almond-cream-sauce` | 921.77 | 912.77 |
| `hsca-lunch-all-wild-rice-salad` | 285.2 | 294.06 |
| `hsca-lunch-all-raw-jerusalem-artichoke-salad` | 181.72 | 180.39 |
| `hsca-lunch-all-scallion-edamame-and-leek-dumplings` | 186.19 | 186.06 |
| `hsca-lunch-all-muhammara` | 639.54 | 250 |
| `hsca-dinner-all-roasted-root-vegetables-with-toasted-hazelnuts-cilantro-and-garlic` | 173.22 | 172.16 |
| `hsca-dinner-all-seitan-croquettes` | 219.25 | 218.75 |
| `hsca-dinner-all-adzuki-bean-stew` | 572.77 | 571.57 |
| `hsca-dessert-all-carob-cake-with-walnuts` | 388.78 | 404.06 |
| `hsca-dessert-all-carrot-cake` | 138.87 | 140.2 |
| `hsca-dessert-all-spiced-carrot-cake` | 1137.39 | 1183.23 |

### Validation

Focused generator, conversion, frying, completeness and volumetrics checks passed: **7 suites / 54 tests**. Full verification and final GitHub CI results are recorded in the PR description.
