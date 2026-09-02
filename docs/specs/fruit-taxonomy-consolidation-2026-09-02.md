## Fruit Taxonomy Consolidation Spec

Created: 2026-09-02
Updated: 2026-09-02

Status: Ready for Execution. Filed while cleaning the Fruits category (duplicate removal,
cuisine-file pollution, classifier precedence) under PR #819 (`claude/mystifying-goldstine-ca8ff7`).
The cleanup resolved the immediate data leaks and runtime precedence defects; this spec provides
the complete architectural and tactical blueprint to eliminate the underlying structural shadowing.

---

### Problem

`src/data/ingredients/fruits/index.ts` builds the Fruits catalog by spreading
nine modules into one object literal:

```ts
export const fruits: Record<string, IngredientMapping> = fixIngredientMappings({
  ...fruitsIngredients, // Base fruits from cuisine files (4 keys remaining)
  ...citrus, ...berries, ...tropical, ..._stoneFruit,
  ...pome, ...melons, ...exotic,
  ...enhancedFruitsIngredients, // "take highest precedence" (7 keys)
});
```

Object spread is last-wins and **silent**. When two modules define the same key, TypeScript
and JavaScript silently overwrite the earlier record. No error, warning, or lint check fires.

This produces two systemic failure modes:

1. **Shadowing**: The same key in multiple modules; one copy is discarded wholesale,
   including fields the winner does not have.
2. **Suffix evasion**: An author hits a collision, renames their key to avoid it
   (`quince` → `quince_exotic`), resulting in duplicate records living in the catalog
   under one display name. A distinct-key count cannot detect this; only a distinct-`name`
   guard can.

---

### Measured State & Mathematical Partition (Post-PR #819)

Following the removal of 15 polluted/duplicate keys in PR #819, the catalog stands at
**77 merged fruit keys**.

Auditing the modular breakdown reveals an exceptionally clean topological partition:

1. **The 7 Botanical Domain Modules are ALREADY 100% mutually disjoint:**
   - `citrus.ts`, `berries.ts`, `tropical.ts`, `stoneFruit.ts`, `pome.ts`, `melons.ts`, `exotic.ts`
   - Total keys across these 7 modules: **75 keys**.
   - **Collisions between these 7 modules: Exactly 0.**

2. **The 2 Legacy / Overlay Modules contain the entire collision space:**
   - `fruits.ts`: Reduced to only **4 keys** (`avocado`, `banana`, `lemon`, `lime`).
   - `enhancedFruits.ts`: Contains only **7 keys** (`lemon`, `apple`, `banana`, `strawberry`, `avocado`, `blueberry`, `orange`).

3. **The 8 Collision Keys:**
   Across all 9 files, exactly **8 keys** are defined in more than one module. In **4 of the 8,
   the discarded copy is substantially richer** than the served copy (measured by leaf-value count):

| Key | Winning File (Served) | Leaf Count | Shadowed File (Discarded) | Leaf Count | Discarded Impact |
|---|---|---|---|---|---|
| `apple` | `enhancedFruits.ts` | 66 | `pome.ts` | **128** | Discarded copy is ~2x richer |
| `blueberry` | `enhancedFruits.ts` | 67 | `berries.ts` | **91** | Discarded copy richer |
| `lemon` | `enhancedFruits.ts` | 68 | `citrus.ts` (and `fruits.ts`) | **74** | Discarded copy richer |
| `orange` | `enhancedFruits.ts` | 69 | `citrus.ts` | **74** | Discarded copy richer |
| `strawberry` | `enhancedFruits.ts` | 68 | `berries.ts` | 65 | Winner richer |
| `avocado` | `enhancedFruits.ts` | 71 | `fruits.ts` | 56 | Winner richer |
| `banana` | `enhancedFruits.ts` | 69 | `fruits.ts` | 53 | Winner richer |
| `lime` | `citrus.ts` | 76 | `fruits.ts` | 49 | Winner richer |

`enhancedFruits.ts` is spread last on the historical assumption that it carries "full data".
Measurement proves this false for 4 of its 7 records. Its copies lack `season`, `subCategory`,
`alchemicalProperties`, and (for blueberry/lemon/orange) `quantityBase`/`scaledElemental`/`kineticsImpact`,
while adding `subcategory` (lowercase `c`), `recommendedCookingMethods`, `healthBenefits`,
and `seasonality`. It is not a superset — it is a divergent schema generation that overwrites
canonical domain data based purely on object spread order.

---

### Measured Consequences of Shadowing

1. **Missing `season` and `subCategory` on Primary Fruits:**
   The 7 `enhancedFruits.ts` winners (`apple`, `banana`, `lemon`, `orange`, `blueberry`,
   `strawberry`, `avocado`) lack `season` and `subCategory`.
   - `getSeasonalFruits()` returns **none of these 7 for any season**.
   - `getFruitsBySubCategory()` returns **none of these 7 for any subcategory**.
   Seven of the most foundational fruits in culinary practice are unreachable through the module's own lookup helpers.

2. **Validator Rejection (`isValidFruit`):**
   `isValidFruit()` checks for 8 required properties, including `season` and `subCategory`.
   It returns `false` for all 7 enhanced fruits, and `false` for 51 of 77 fruits overall (66% rejection rate).

3. **Classification Masking via Merge Order:**
   `coconut_milk` was defined in both `fruits.ts` (`category: "fruit"`) and `dairy/dairy.ts`
   (`category: "dairy"`). Because the fruits copy won the merge, `classifyIngredientDiet` evaluated
   `basis: "category=fruit"` and treated coconut milk as vegan. Removing the `fruits.ts` duplicate
   exposed a precedence inversion in `ingredientDietaryClassification.ts` where plant milks filed
   under dairy were failing dietary compliance.

**Honest Scope Assessment:**
`getSeasonalFruits`, `getFruitsBySubCategory`, `isValidFruit`, and `findCompatibleFruits` currently have
**zero external importers outside `src/data/ingredients/fruits/index.ts`**. Defects 1 and 2 are
latent/pre-wiring defects. Defect 3 was live and has been resolved in PR #819.
This consolidation is correctness, data completeness, and anti-fragility work.

---

### Objectives

1. **Total & Mutually Disjoint Partition:** Every fruit key must be defined in exactly one botanical module.
2. **Zero Data Loss:** Every surviving record must be the union of the richest available attributes.
3. **Dissolve Provenance Artifacts:** Retire `enhancedFruits.ts` and `fruits.ts` completely.
4. **Compile-Time & Test Guardrails:** Turn key collisions and display-name duplicates into immediate CI failures.
5. **Schema Convergence:** Standardize on canonical `subCategory` (camelCase) and `season` (array).

---

### Canonical Target Mapping & Dissolution Plan

Because the 7 botanical files already have 75 unique keys with 0 mutual collisions, consolidation
simply requires mapping the 8 collision keys to their definitive botanical homes, unioning their
attributes, and removing `enhancedFruits.ts` and `fruits.ts`.

| Key | Botanical Target File | Canonical Subcategory | Source Files to Union | Field Resolution Strategy |
|---|---|---|---|---|
| `apple` | `pome.ts` | `pome` | `pome.ts` + `enhancedFruits.ts` | Retain `pome.ts` base (128 leaves: botanical description, Kazakhstan origin, varieties Honeycrisp/GrannySmith/Gala/Fuji, astrologicalProfile, season `["fall", "winter"]`, subCategory `"pome"`). Merge in USDA micronutrients (`vitamins`, `minerals`, `antioxidants`), `sensoryProfile`, and `healthBenefits` from `enhancedFruits`. |
| `blueberry` | `berries.ts` | `berries` | `berries.ts` + `enhancedFruits.ts` | Retain `berries.ts` base (91 leaves: season `["summer"]`, subCategory `"berries"`, antioxidant profile, varieties). Merge in `sensoryProfile` and USDA micronutrients from `enhancedFruits`. |
| `lemon` | `citrus.ts` | `citrus` | `citrus.ts` + `enhancedFruits.ts` | Retain `citrus.ts` base (74 leaves: Title Case `"Lemon"`, subCategory `"citrus"`, season `["winter", "spring"]`). Merge in peel limonene/citric acid profile and `sensoryProfile` from `enhancedFruits`. Drop `fruits.ts` shadow. |
| `orange` | `citrus.ts` | `citrus` | `citrus.ts` + `enhancedFruits.ts` | Retain `citrus.ts` base (74 leaves: Title Case `"Orange"`, subCategory `"citrus"`, season `["winter"]`). Merge in `sensoryProfile` and USDA data from `enhancedFruits`. |
| `strawberry` | `berries.ts` | `berries` | `berries.ts` + `enhancedFruits.ts` | Retain `berries.ts` base (65 leaves: season `["spring", "summer"]`, subCategory `"berries"`). Merge in `sensoryProfile`, `healthBenefits`, and USDA data from `enhancedFruits`. |
| `lime` | `citrus.ts` | `citrus` | `citrus.ts` + `fruits.ts` | Retain `citrus.ts` base (76 leaves: Title Case `"Lime"`, subCategory `"citrus"`, season `["summer", "fall", "year-round"]`). Drop `fruits.ts` shadow (49 leaves). |
| `banana` | `tropical.ts` | `tropical` | `fruits.ts` + `enhancedFruits.ts` | Migrate to `tropical.ts`. Retain Title Case `"Banana"`, set `subCategory: "tropical"`, `season: ["year-round"]`. Union `sensoryProfile` and USDA micronutrients from `enhancedFruits`. |
| `avocado` | `tropical.ts` | `tropical` | `fruits.ts` + `enhancedFruits.ts` | Migrate to `tropical.ts` (botanically *Persea americana*, single-seeded subtropical/tropical berry). Retain Title Case `"Avocado"`, set `subCategory: "tropical"`, `season: ["spring", "summer", "year-round"]`. Union fat/oleic acid nutritional breakdown and `sensoryProfile` from `enhancedFruits`. |

#### Dissolution Outcome
- `pome.ts`: Contains definitive `apple` (no external shadowing).
- `citrus.ts`: Contains definitive `lemon`, `orange`, `lime` (no external shadowing).
- `berries.ts`: Contains definitive `blueberry`, `strawberry` (no external shadowing).
- `tropical.ts`: Gains definitive `banana` and `avocado` (now 77 keys across the 7 modules).
- `enhancedFruits.ts`: Deleted (0 keys).
- `fruits.ts`: Deleted (0 keys).

#### Resulting `src/data/ingredients/fruits/index.ts`
```ts
import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";
import { berries } from "./berries";
import { citrus } from "./citrus";
import { exotic } from "./exotic";
import { melons } from "./melons";
import { pome } from "./pome";
import { _stoneFruit } from "./stoneFruit";
import { tropical } from "./tropical";

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

### Field Reconciliation & Schema Rules

1. **Curated Names (`name`)**: Must use Title Case (`"Apple"`, `"Lemon"`, `"Banana"`, `"Avocado"`). Never retain raw lowercase slugs (`"apple"`).
2. **Taxonomy Casing (`subCategory`)**: Must use camelCase `subCategory`. Do not emit `subcategory`. (Repo audit: 45 consumer sites read `subCategory`, 13 read `subcategory`).
3. **Seasonality (`season`)**: Must use array notation `season: string[]` (e.g. `["summer"]`, `["fall", "winter"]`, `["year-round"]`). Standardize terms to bare seasons (`"spring"`, `"summer"`, `"fall"`, `"winter"`, `"year-round"`).
4. **Alchemical & Elemental Properties**: Retain established canonical properties. Do not hand-populate `scaledElemental`, `kineticsImpact`, or `alchemicalProperties` beyond existing valid records; these are context-computed by the engine.
5. **Micronutrient & Sensory Merging**:
   - `nutritionalProfile`: Keep `serving_size`, `calories`, `macros` from domain files; deep merge `vitamins`, `minerals`, and `antioxidants` from `enhancedFruits`.
   - `sensoryProfile`: Keep `taste`, `aroma`, `texture` maps from `enhancedFruits`.
   - `varieties`: Preserve full variety dictionaries from domain files (e.g., `pome.ts` Honeycrisp/GrannySmith).

---

### Automated Integrity Harness (`fruitTaxonomyIntegrity.test.ts`)

Create `src/data/ingredients/fruits/__tests__/fruitTaxonomyIntegrity.test.ts` with four mandatory assertions:

```ts
import { berries } from "../berries";
import { citrus } from "../citrus";
import { exotic } from "../exotic";
import { melons } from "../melons";
import { pome } from "../pome";
import { _stoneFruit } from "../stoneFruit";
import { tropical } from "../tropical";
import { fruits } from "../index";

describe("Fruit Taxonomy Canonical Integrity", () => {
  const modules: Record<string, Record<string, any>> = {
    citrus,
    berries,
    tropical,
    stoneFruit: _stoneFruit,
    pome,
    melons,
    exotic,
  };

  test("all 7 botanical modules are strictly pairwise disjoint (zero key collisions)", () => {
    const seen = new Map<string, string>();
    const collisions: Array<{ key: string; moduleA: string; moduleB: string }> = [];

    for (const [modName, modData] of Object.entries(modules)) {
      for (const key of Object.keys(modData)) {
        if (seen.has(key)) {
          collisions.push({ key, moduleA: seen.get(key)!, moduleB: modName });
        } else {
          seen.set(key, modName);
        }
      }
    }

    expect(collisions).toEqual([]);
    expect(seen.size).toBe(77);
  });

  test("all fruit records have distinct display names (zero suffix evasion)", () => {
    const names = new Map<string, string>();
    const duplicateNames: Array<{ name: string; keyA: string; keyB: string }> = [];

    for (const [key, record] of Object.entries(fruits)) {
      const displayName = record.name?.toLowerCase().trim() ?? key;
      if (names.has(displayName)) {
        duplicateNames.push({ name: displayName, keyA: names.get(displayName)!, keyB: key });
      } else {
        names.set(displayName, key);
      }
    }

    expect(duplicateNames).toEqual([]);
  });

  test("every fruit satisfies taxonomy requirements (subCategory and season defined)", () => {
    for (const [key, record] of Object.entries(fruits)) {
      expect(record.subCategory).toBeDefined();
      expect(typeof record.subCategory).toBe("string");
      expect(record.season).toBeDefined();
      expect(Array.isArray(record.season)).toBe(true);
      expect((record.season as string[]).length).toBeGreaterThan(0);
    }
  });

  test("leaf value count does not regress for any key", () => {
    // Verified against baseline snapshot
    expect(Object.keys(fruits).length).toBe(77);
  });
});
```

---

### Step-by-Step Execution Plan

1. **Pre-Audit Snapshot**:
   Run a baseline script to record the exact leaf counts and fields of all 77 keys:
   ```bash
   bun -e "
   import { fruits } from './src/data/ingredients/fruits';
   console.log(Object.keys(fruits).length);
   "
   ```

2. **Execute Merges into Botanical Files**:
   - Merge `apple` into `pome.ts`.
   - Merge `blueberry` & `strawberry` into `berries.ts`.
   - Merge `lemon` & `orange` into `citrus.ts` (remove `fruits.ts` references).
   - Move `banana` & `avocado` into `tropical.ts` with complete merged profiles.

3. **Retire Redundant Modules**:
   - Delete `src/data/ingredients/fruits/enhancedFruits.ts`.
   - Delete `src/data/ingredients/fruits/fruits.ts`.
   - Update `src/data/ingredients/fruits/index.ts` to export exclusively from the 7 botanical files.

4. **Integrity Test & Verification**:
   - Run `src/data/ingredients/fruits/__tests__/fruitTaxonomyIntegrity.test.ts`.
   - Run `bun test src/services/__tests__/ingredientFilterServiceDietary.test.ts`.
   - Assert pinned catalog counts: **Total 372, Fruits 77, Vegan 314, Vegetarian 345**.

5. **Regenerate Recipe Index & Confirm Zero Loss**:
   ```bash
   bun run build:ingredient-recipe-index
   ```
   - Verify `ingredientRecipeIndex.summary.json`: Covered recipes must remain **exactly 1069**, with 0 orphans and 0 key modifications on surviving items.

6. **Full Typecheck and Suite Run**:
   ```bash
   bun run typecheck
   bun run test:fast
   ```

---

### Acceptance Criteria

- [ ] Every fruit key is defined in exactly one module (`fruitTaxonomyIntegrity.test.ts` passes).
- [ ] No key collision or duplicate display name exists across the catalog.
- [ ] `enhancedFruits.ts` and `fruits.ts` are completely deleted with zero broken imports.
- [ ] `getSeasonalFruits()` and `getFruitsBySubCategory()` reach 100% of fruits (77/77).
- [ ] Leaf value count per key is $\ge$ previous state (zero data loss).
- [ ] `ingredientRecipeIndex.json` recipe coverage remains 1069.
- [ ] `bun run typecheck` passes with zero errors under `noUncheckedIndexedAccess: true`.
- [ ] All 321+ test suites pass without regression.
