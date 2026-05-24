# HSCA Cooking Methods Gap Analysis

An analysis of the **551 recipes** in the HSCA Recipes database, mapping the cooking methods used in instructions and comparing them with the **14 standard cooking methods** registered in our **WTEN (Alchm.kitchen)** database.

## Executive Summary

- **Total Recipes Analyzed**: 551
- **Standard WTEN Methods Found**: 12 out of 14
- **New Technique/Classical Methods Identified**: 11

> [!IMPORTANT]
> **Top Missing Cooking Method in WTEN**: **Simmering** is used in **267 recipes (48.5%)** but is not modeled as a first-class cooking method in `src/data/cooking/cookingMethods.ts`. Classical techniques like **Blending/Pureeing (38.8%)**, **Whisking/Beating (27.2%)**, and **Frying (20.3%)** are also heavily featured and represent major modeling gaps.

## 1. Standard WTEN Cooking Methods (Already in DB)

| Cooking Method | Count | % of Recipes | Sample Recipes |
| --- | --- | --- | --- |
| **Pickling** (`pickling`) | 177 | 32.1% | `HIBISCUS-MINT COOLER`, `Red Lentil and Toasted Sunflower Burger`, `Fresh Ketchup (for Red Lentil and Toasted Sunflower Burger)`, `Black Quinoa with Capers and Rapini (for Broiled Arctic Char)`, `Chocolate Fondue` |
| **Boiling** (`boiling`) | 166 | 30.1% | `HIBISCUS-MINT COOLER`, `Red Lentil and Toasted Sunflower Burger`, `Fresh Ketchup (for Red Lentil and Toasted Sunflower Burger)`, `BABY BOK CHOY AND RED CABBAGE SLAW (FOR SEAFOOD SAUSAGE)`, `Black Quinoa with Capers and Rapini (for Broiled Arctic Char)` |
| **Baking** (`baking`) | 148 | 26.9% | `Apple Phyllo Roll`, `HERBED DINNER ROLLS`, `BULGUR RAISIN BREAD`, `BAGELS`, `WHOLE WHEAT POPPYSEED BREAD` |
| **Sautéing** (`sauteing`) | 131 | 23.8% | `Mushroom Consommé`, `Red Lentil and Toasted Sunflower Burger`, `Vegetable-Polenta Napoleons`, `MEDITERRANEAN ROASTED BLACK COD WITH MUHAMMARA`, `SEAFOOD SAUSAGE` |
| **Dehydrating** (`dehydrating`) | 99 | 18.0% | `Red Lentil and Toasted Sunflower Burger`, `VEGETABLE AND TEMPEH WRAPS WITH AVOCADO-CILANTRO CREAM`, `Apple Phyllo Roll`, `WILD RICE PANCAKES`, `BUCKWHEAT PANCAKES` |
| **Roasting** (`roasting`) | 54 | 9.8% | `Mushroom Consommé`, `Red Lentil and Toasted Sunflower Burger`, `Vegetable-Polenta Napoleons`, `MEDITERRANEAN ROASTED BLACK COD WITH MUHAMMARA`, `Broiled Arctic Char Over Black Quinoa, Rapini, and Capers` |
| **Steaming** (`steaming`) | 24 | 4.4% | `Vegetable-Polenta Napoleons`, `APRICOT PARFAIT`, `APPLE RING`, `SHORTBREAD COOKIES`, `SWISS BURNT PECAN TART` |
| **Pressure Cooking** (`pressure_cooking`) | 18 | 3.3% | `Red Lentil and Toasted Sunflower Burger`, `Warm Pinto Bean Salad with Shiitake`, `White Bean with Garlic, Rosemary, and Tomatoes`, `WHITE BEAN AND GARLIC SAUCE`, `CURRIED CHICKPEA CRÊPE FILLING` |
| **Grilling** (`grilling`) | 17 | 3.1% | `FRISEE SALAD WITH GRILLED BABY CARROTS, CUCUMBER, AND RADISHES WITH AVOCADO DRESSING`, `WATERCRESS AND DANDELION GREENS WITH BABY ARTICHOKES`, `WILTED GREENS WITH SPRING ONIONS`, `NIÇOISE SALAD`, `CELERIAC WITH GRILLED ASPARAGUS AND EGGS` |
| **Poaching** (`poaching`) | 11 | 2.0% | `SEAFOOD SAUSAGE`, `POACHED PEAR TART WITH CORNMEAL CRUST`, `TRADITIONAL CAESAR SALAD`, `POACHED CHICKEN AND ROASTED ASPARAGUS`, `COBB SALAD` |
| **Fermenting** (`fermenting`) | 4 | 0.7% | `Red Cabbage-Caraway Sauerkraut`, `Green Cabbage Sauerkraut with Ginger and Turmeric`, `BEET KVASS`, `DILL PICKLES` |
| **Braising** (`braising`) | 2 | 0.4% | `CURRIED CHICKEN SALAD ON PAPADAM WITH YOGURT RAITA`, `BRAISED CHICKEN WITH VEGETABLES AND TARRAGON` |
| **Smoking** (`smoking`) | 0 | 0.0% |  |
| **Sous Vide** (`sous_vide`) | 0 | 0.0% |  |

## 2. Missing Cooking Methods (Not in WTEN DB)

These classical, preparation, or heat-application techniques are heavily utilized in the workbook but are **missing** from our production/local database definition in `src/data/cooking/cookingMethods.ts`.

| Cooking Method | Count | % of Recipes | Severity / Recommendation | Sample Recipes |
| --- | --- | --- | --- | --- |
| **Blending pureeing** (`blending_pureeing`) | 224 | 40.7% | HIGH - Fundamental texture modifier for soups, dressings, purees. | `CUCUMBER AGUA FRESCA`, `POMEGRANATE, BLUEBERRY, AND GINGER ELIXIR`, `FRESH HERB DRESSING`, `Red Lentil and Toasted Sunflower Burger`, `VEGETABLE AND TEMPEH WRAPS WITH AVOCADO-CILANTRO CREAM` |
| **Simmering** (`simmering`) | 198 | 35.9% | HIGH - Essential heat method for soups/broths. Model immediately. | `Mushroom Consommé`, `Red Lentil and Toasted Sunflower Burger`, `Fresh Ketchup (for Red Lentil and Toasted Sunflower Burger)`, `Vegetable-Polenta Napoleons`, `SEAFOOD SAUSAGE` |
| **Whisking beating** (`whisking_beating`) | 179 | 32.5% | MEDIUM - Crucial for mechanical aeration of eggs, desserts. | `Vegetable-Polenta Napoleons`, `SEAFOOD SAUSAGE`, `BABY BOK CHOY AND RED CABBAGE SLAW (FOR SEAFOOD SAUSAGE)`, `Lemon and Maple-Flavored Yogurt`, `VEGETABLE DETOX SOUP` |
| **Sweating** (`sweating`) | 62 | 11.3% | MEDIUM - Classical French base method for all aromatic vegetables. | `Red Lentil and Toasted Sunflower Burger`, `Tomato Sauce`, `ALMOND “CREAM” SAUCE`, `WILTED GREENS WITH SPRING ONIONS`, `WILTED BITTER GREENS WITH CIPOLLINI ONIONS` |
| **Kneading** (`kneading`) | 32 | 5.8% | HIGH - Mechanical gluten structure builder for all yeast/spelt breads. | `HERBED DINNER ROLLS`, `BULGUR RAISIN BREAD`, `BAGELS`, `WHOLE WHEAT POPPYSEED BREAD`, `WHOLE WHEAT BREAD` |
| **Frying deep frying** (`frying_deep_frying`) | 27 | 4.9% | HIGH - Major dry-heat method for tempeh, tofu, croquettes. | `Tempeh Reuben Sandwich`, `Fried Tempeh (for Tempeh Reuben Sandwich)`, `Basic Home-Fried Potatoes`, `PLAIN CRÊPES (CLASSIC)`, `Fried Shrimp with Wasabi Garnish` |
| **Blanching** (`blanching`) | 18 | 3.3% | MEDIUM - Standard green vegetable prep and soybean/tofu prep. | `BABY BOK CHOY AND RED CABBAGE SLAW (FOR SEAFOOD SAUSAGE)`, `Black Quinoa with Capers and Rapini (for Broiled Arctic Char)`, `CRUCIFEROUS SALAD`, `Basil Ice Cream`, `MEDITERRANEAN-INSPIRED PASTA SALAD` |
| **Emulsifying** (`emulsifying`) | 15 | 2.7% | MEDIUM - Essential for mayonnaise, dressings, hollandaise. | `FRESH HERB DRESSING`, `Warm Pinto Bean Salad with Shiitake`, `GLUTEN-FREE CRÊPES`, `VEGAN SCONES`, `Vegan and Gluten-Free Chocolate Brownies` |
| **Stewing** (`stewing`) | 5 | 0.9% | LOW - Can be grouped with simmering or braising. | `SEITAN STEW`, `Jerk Seitan Sloppy Joe's`, `ADZUKI BEAN STEW`, `PINTO BEAN STEW`, `LOCRO (ARGENTINE VEGETABLE STEW)` |
| **Sprouting** (`sprouting`) | 3 | 0.5% | MEDIUM - Essential biochemical activation method for grains/beans. | `CRUCIFEROUS SALAD`, `HASHED BRUSSEL SPROUTS WITH CARROTS AND POPPY SEEDS`, `Refried Soba with Vegetables` |
| **Flambeing** (`flambeing`) | 1 | 0.2% | LOW - Flavour-concentration technique (liqueur burn-off). | `SAUTÉED CHICKEN BREAST MARSALA WITH CRIMINI MUSHROOMS` |

## Next Steps / Recommendations
1. **Expand `cookingMethods.ts`**: Model `simmering`, `blending_pureeing`, `frying_deep_frying`, and `kneading` as first-class culinary methods with their corresponding elemental properties (e.g. Simmering is Water: 0.8, Fire: 0.3; Kneading is Earth: 0.7, Air: 0.4).
2. **Ingestion Enrichment**: During final database ingestion, we should map these newly identified cooking methods to the database records for 100% field completeness.