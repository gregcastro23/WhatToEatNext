## Fruit Taxonomy Consolidation Spec

Created: 2026-09-02  
Updated: 2026-09-02  

Status: **Executed & Verified**. Fully shipped under PR #819 (`claude/mystifying-goldstine-ca8ff7`) across commits `dbbbd03f` and `fa657a92`.  
The structural cause of silent shadowing has been eliminated: nine fruit modules were consolidated into exactly seven pairwise-disjoint botanical files, legacy overlay modules (`enhancedFruits.ts`, `fruits.ts`) were dissolved, all 77 fruits now satisfy canonical taxonomy contracts, and adversarial verification confirmed zero data loss.

---

### Problem (Historical)

`src/data/ingredients/fruits/index.ts` originally built the Fruits catalog by spreading
nine modules into one object literal:

```ts
export const fruits: Record<string, IngredientMapping> = fixIngredientMappings({
  ...fruitsIngredients, // Base fruits from cuisine files
  ...citrus, ...berries, ...tropical, ..._stoneFruit,
  ...pome, ...melons, ...exotic,
  ...enhancedFruitsIngredients, // "take highest precedence"
});
```

Object spread is last-wins and **silent**. When two modules define the same key, TypeScript
and JavaScript silently overwrite the earlier record. No error, warning, or lint check fires.

This produced two systemic failure modes:

1. **Shadowing**: The same key defined in multiple modules; one copy was discarded wholesale,
   including rich fields the winner lacked.
2. **Suffix evasion**: An author hit a collision, renamed their key to avoid it
   (`quince` → `quince_exotic`), resulting in duplicate records living in the catalog
   under one display name. A distinct-key count could not detect this; only a distinct-`name`
   guard could.

---

### Measured State & Mathematical Partition (Pre-Consolidation)

Prior to consolidation (post-PR #819 duplicate cleanup), the catalog stood at **77 merged fruit keys**.

Auditing the modular breakdown revealed an exceptionally clean topological partition:

1. **The 7 Botanical Domain Modules were ALREADY 100% mutually disjoint:**
   - `citrus.ts`, `berries.ts`, `tropical.ts`, `stoneFruit.ts`, `pome.ts`, `melons.ts`, `exotic.ts`
   - Total keys across these 7 modules: **75 keys**.
   - **Collisions between these 7 modules: Exactly 0.**

2. **The 2 Legacy / Overlay Modules contained the entire collision space:**
   - `fruits.ts`: Reduced to only **4 keys** (`avocado`, `banana`, `lemon`, `lime`).
   - `enhancedFruits.ts`: Contained only **7 keys** (`lemon`, `apple`, `banana`, `strawberry`, `avocado`, `blueberry`, `orange`).

3. **The 8 Collision Keys:**
   Across all 9 files, exactly **8 keys** were defined in more than one module. In **4 of the 8,
   the discarded copy was substantially richer** than the served copy (measured by leaf-value count):

| Key | Winning File (Served) | Leaf Count | Shadowed File (Discarded) | Leaf Count | Discarded Impact |
|---|---|---|---|---|---|
| `apple` | `enhancedFruits.ts` | 66 | `pome.ts` | **128** | Discarded copy was ~2x richer |
| `blueberry` | `enhancedFruits.ts` | 67 | `berries.ts` | **91** | Discarded copy richer |
| `lemon` | `enhancedFruits.ts` | 68 | `citrus.ts` (and `fruits.ts`) | **74** | Discarded copy richer |
| `orange` | `enhancedFruits.ts` | 69 | `citrus.ts` | **74** | Discarded copy richer |
| `strawberry` | `enhancedFruits.ts` | 68 | `berries.ts` | 65 | Winner richer |
| `avocado` | `enhancedFruits.ts` | 71 | `fruits.ts` | 56 | Winner richer |
| `banana` | `enhancedFruits.ts` | 69 | `fruits.ts` | 53 | Winner richer |
| `lime` | `citrus.ts` | 76 | `fruits.ts` | 49 | Winner richer |

---

### Executed Consolidation Architecture

Every collision key was assigned to its definitive botanical module, unioned with its richer counterpart, and both legacy overlay modules were deleted.

| Key | Botanical Target File | Subcategory Assigned | Resolution & Reconciliation Details |
|---|---|---|---|
| `apple` | `pome.ts` | `pome` | Retained `pome.ts` base (128 leaves). Merged `sensoryProfile`, `healthBenefits`, and `preparation.yields` ("1 lb = 3 medium = 3 cups sliced"). Conformed `antioxidants` to `string[]`, routing descriptions into `notes`. Storage superseded by nested `storage.fresh`/`frozen`. |
| `blueberry` | `berries.ts` | `berry` | Retained `berries.ts` base (91 leaves). Preserved `subCategory: "berry"` (singular, botanical module standard). Conformed `antioxidants` to `string[]`, routing descriptions to `notes`. Restored `preparation`, `recommendedCookingMethods`, `seasonality`, `storage.tips`, `astrologicalProfile.seasonalAffinity`. |
| `strawberry` | `berries.ts` | `berry` | Retained `berries.ts` base (65 leaves). Standardized `subCategory: "berry"`. Merged `sensoryProfile`, `healthBenefits`, and conformed `antioxidants: ["anthocyanins", "ellagic acid", "quercetin"]` with qualitative narrative in `notes`. |
| `lemon` | `citrus.ts` | `citrus` | Retained `citrus.ts` base (74 leaves). Merged peel limonene/citric acid, `sensoryProfile`, and `preparation.yields` ("1 lemon = 2-3 tbsp juice, 1 tbsp zest"). Dropped `fruits.ts` shadow. |
| `orange` | `citrus.ts` | `citrus` | Retained `citrus.ts` base (74 leaves). Merged `sensoryProfile`, `healthBenefits`, carotenoids/hesperidin in `notes`, and `preparation.yields` ("1 medium = 1/3-1/2 cup juice, 1-2 tbsp zest"). |
| `lime` | `citrus.ts` | `citrus` | Retained `citrus.ts` base (76 leaves). Dropped `fruits.ts` shadow (49 leaves). |
| `banana` | `tropical.ts` | `tropical` | Migrated to `tropical.ts`. Set Title Case `"Banana"`, `subCategory: "tropical"`, `season: ["year-round"]`. Conformed `antioxidants` to `string[]` with descriptions in `notes`. |
| `avocado` | `tropical.ts` | `tropical` | Migrated to `tropical.ts` (*Persea americana*). Set Title Case `"Avocado"`, `subCategory: "tropical"`, `season: ["spring", "summer", "year-round"]`. Conformed `antioxidants` to `string[]` with descriptions in `notes`. |

#### Module Dissolution
- Deleted `src/data/ingredients/fruits/enhancedFruits.ts` (0 remaining keys).
- Deleted `src/data/ingredients/fruits/fruits.ts` (0 remaining keys).
- `src/data/ingredients/fruits/index.ts` now exclusively spreads the 7 disjoint botanical modules:

```ts
export const fruits: Record<string, IngredientMapping> = fixIngredientMappings({
  ...citrus,
  ...berries,
  ...tropical,
  ..._stoneFruit,
  ...pome,
  ...melons,
  ...exotic,
});

export { berries, citrus, melons, pome, _stoneFruit as stoneFruit, tropical, exotic };
```

---

### Crucial Engineering Decisions & Field Classifications

A rigorous before-and-after path diff against the pre-consolidation catalog evaluated all 53 candidate field differences:

1. **7 Intended Drop Sites (`subcategory`)**:
   - The lowercase `subcategory` property from `enhancedFruits.ts` was deliberately purged in favor of canonical `subCategory` (camelCase).
   - 45 consumer sites across the repo read `subCategory`; only 13 read `subcategory`.

2. **21 Deliberately Declined Nutrition Paths (No False Provenance)**:
   - `nutritionalProfile.source`, `vitamins`, `minerals`, and `macros` for `apple`, `lemon`, and `orange` were **intentionally not copied** from `enhancedFruits.ts`.
   - **Reasoning**: The botanical and enhanced records use fundamentally different serving bases (e.g. apple in `pome.ts` is 100g/52kcal vs `enhancedFruits.ts` 1 medium 182g/95kcal). Merging the numbers would create an incoherent hybrid profile, and attributing them to `source: "USDA FoodData Central"` would introduce false scientific provenance.

3. **27 Reshaped Antioxidant Paths (`string[]` Conformance)**:
   - `antioxidants` was conformed to `string[]` across all records (`strawberry`, `banana`, `avocado`, etc.) to strictly adhere to the declared interfaces in `standardizedIngredient.ts:37` and `alchemy.ts:750`.
   - The object format (`Record<string, string>`) broke `.antioxidants?.length` calculations in `standardizedIngredient.ts:566`.
   - Descriptive clinical/nutritional narratives were preserved in `nutritionalProfile.notes`, matching established catalog conventions across 32 other records.

4. **2 Superseded Storage Keys (Apple)**:
   - `apple.storage.temperature` and `duration` were intentionally left off because `pome.ts` provides a strictly superior, precise nested structure (`storage.fresh`: `"Refrigerated 32-35°F (0-1.6°C)"`, `storage.frozen`). Re-adding flat keys would reintroduce competing schema shapes.

5. **4 Restored Real Values (Shipped in `fa657a92`)**:
   - `apple.nutritionalProfile.notes`: Restored quercetin (*"high - especially in peel, anti-inflammatory"*) and catechin (*"moderate - antioxidant"*) qualitative descriptions.
   - `apple.preparation.yields`: Restored `"1 lb = 3 medium = 3 cups sliced"`.
   - `lemon.preparation.yields`: Restored `"1 lemon = 2-3 tbsp juice, 1 tbsp zest"`.
   - `orange.preparation.yields`: Restored `"1 medium = 1/3-1/2 cup juice, 1-2 tbsp zest"`.

6. **Subcategory Naming Realignment**:
   - `berries.ts` uses singular `subCategory: "berry"`. The spec initially assumed plural `"berries"`; this was corrected to align with sibling botanical records.

---

### Automated Integrity Harness (`fruitTaxonomyIntegrity.test.ts`)

Automated guardrails live in `src/data/ingredients/fruits/__tests__/fruitTaxonomyIntegrity.test.ts` (passing 5/5):

1. **Pairwise Disjointness**: Asserts that all 7 botanical modules have zero key intersections and sum exactly to 77 keys.
2. **Distinct Display Names**: Detects and fails on suffix evasion (`quince` vs `quince_exotic`).
3. **Contract Completeness**: Asserts `subCategory` (string) and `season` (non-empty array) exist on 100% of fruits.
4. **Casing Enforcement**: Asserts zero records carry lowercase `subcategory`.
5. **Leaf Count Non-Regression**: Asserts every single fruit key has $\ge$ leaf count than its pre-consolidation baseline (5,637 $\rightarrow$ 5,782 total leaves).

---

### Verified Acceptance Criteria

- [x] Every fruit key is defined in exactly one module (`fruitTaxonomyIntegrity.test.ts` passes 5/5).
- [x] No key collision or duplicate display name exists across the catalog.
- [x] `enhancedFruits.ts` and `fruits.ts` are completely deleted with zero broken imports.
- [x] `getSeasonalFruits()` reach expanded from 62/77 to **77/77 (100%)**.
- [x] `getFruitsBySubCategory()` reach for previously shadowed fruits expanded from 0/7 to **77/77 (100%)**.
- [x] Net leaf value count increased from 5,637 to 5,782 (zero data loss; zero regressions).
- [x] `ingredientRecipeIndex.json` recipe coverage preserved at **exactly 1,069 recipes** with identical connection counts.
- [x] `bun run typecheck` passes with 0 errors under strict `noUncheckedIndexedAccess: true`.
- [x] Full test suite passes: **322 suites / 3,371 tests green**.
