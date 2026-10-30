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

The initial focused run passed 8 suites / 61 tests. The explicit deep-frying regression, frying-fat integration tests and offline generator tests passed 3 suites / 15 tests. Full verification is enforced by the pre-push hook; its final result is recorded in the PR validation update.
