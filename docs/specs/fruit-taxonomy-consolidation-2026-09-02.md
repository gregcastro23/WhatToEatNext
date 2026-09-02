## Fruit Taxonomy Consolidation Spec

Created: 2026-09-02
Updated: 2026-09-02

Status: Not started. Filed while cleaning the Fruits category (duplicate removal,
cuisine-file pollution, classifier precedence). The cleanup closed the symptoms
listed under "What has already been done"; this spec covers the structural cause
that will let them recur.

### Problem

`src/data/ingredients/fruits/index.ts` builds the Fruits catalog by spreading
nine modules into one object literal:

```ts
export const fruits: Record<string, IngredientMapping> = fixIngredientMappings({
  ...fruitsIngredients, // Base fruits from cuisine files
  ...citrus, ...berries, ...tropical, ..._stoneFruit,
  ...pome, ...melons, ...exotic,
  ...enhancedFruitsIngredients, // "take highest precedence"
});
```

Object spread is last-wins and **silent**. There is no error, warning, or test
when two modules define the same key — the later record simply replaces the
earlier one, whole. Nothing in the repo reports that it happened.

This produces two failure modes that have both already occurred:

1. **Shadowing** — the same key in two modules; one copy is discarded wholesale,
   including fields the winner does not have.
2. **Suffix evasion** — an author hits a collision, renames their key to avoid
   it (`quince` → `quince_exotic`), and now *both* records live in the catalog
   under one display name. A distinct-key count cannot see this; only a
   distinct-`name` count can.

### Measured state (2026-09-02, after the cleanup in this PR)

77 merged keys, of which **8 are shadowed**. In **4 of the 8 the discarded copy
is richer than the one actually served**, measured by leaf-value count:

| key | served by | leaves | shadowed copy | leaves | |
|---|---|---|---|---|---|
| `apple` | enhancedFruits.ts | 66 | pome.ts | **128** | discarded copy is ~2x richer |
| `blueberry` | enhancedFruits.ts | 67 | berries.ts | **91** | discarded copy richer |
| `lemon` | enhancedFruits.ts | 68 | citrus.ts | **74** | discarded copy richer |
| `orange` | enhancedFruits.ts | 69 | citrus.ts | **74** | discarded copy richer |
| `strawberry` | enhancedFruits.ts | 68 | berries.ts | 65 | winner richer |
| `avocado` | enhancedFruits.ts | 71 | fruits.ts | 56 | winner richer |
| `banana` | enhancedFruits.ts | 69 | fruits.ts | 53 | winner richer |
| `lime` | citrus.ts | 76 | fruits.ts | 49 | winner richer |

`enhancedFruits.ts` is spread last on the stated grounds that it carries "full
data". Measurement contradicts that for 4 of its 7 records. Its copies
consistently lack `season`, `subCategory`, `alchemicalProperties` and (for
blueberry/lemon/orange) `quantityBase`/`scaledElemental`/`kineticsImpact`, while
adding `subcategory` (lowercase `c`), `recommendedCookingMethods`,
`healthBenefits` and `seasonality`. It is not a superset — it is a *different*
schema generation that wins on position alone.

### Why it matters

Three defects follow directly, all measured:

1. **7 of 77 fruits have no `season` and no `subCategory`** — exactly the seven
   enhancedFruits winners (`apple`, `banana`, `lemon`, `orange`, `blueberry`,
   `strawberry`, `avocado`). `getSeasonalFruits()` returns **none of them for any
   season**, and `getFruitsBySubCategory()` returns none of them for any
   subcategory. Seven of the most common fruits in the catalog are unreachable
   through the module's own lookups.
2. **`isValidFruit()` returns `false` for all seven** (it requires `season` and
   `subCategory` among its eight properties). It returns `false` for 51 of 77
   overall, so the validator rejects two thirds of the catalog it validates.
3. **A duplicate can silently change a classification.** `coconut_milk` was
   defined in both `fruits.ts` (`category: "fruit"`) and `dairy/dairy.ts`
   (`category: "dairy"`). The fruits copy won, so `classifyIngredientDiet` read
   `basis: "category=fruit"` and returned vegan-compliant. Removing the fruits
   duplicate flipped it to non-compliant and exposed a precedence inversion that
   had been misclassifying six other plant milks all along. The catalog's answer
   depended on which duplicate won the spread, not on the ingredient.

**Honest scope of the impact:** `getSeasonalFruits`, `getFruitsBySubCategory`,
`isValidFruit` and `findCompatibleFruits` have **zero references outside
`index.ts`**. Defects 1 and 2 are therefore latent, not user-facing — this is
correctness and pre-wiring work, not a live outage. Defect 3 *was* live, through
`UnifiedIngredientService` and `IngredientFilterService`. Do not justify this
work by claiming user impact it does not have.

### What has already been done (PR context, not this spec's scope)

- Removed three suffix-evasion duplicates (`passion_fruit_exotic`,
  `quince_exotic`, `loquat_exotic`) from `exotic.ts`.
- Removed 14 cuisine-file leaks and the `apples`/`apple` plural duplicate from
  `fruits.ts`, verified against `ingredientRecipeIndex` to orphan zero recipes.
- Fixed the classifier precedence inversion (plant compound now outranks the
  structural taxonomy rules, as its own doc comment already specified).
- Added a duplicate guard to `ingredientFilterServiceDietary.test.ts`:
  `expect(returned.size).toBe(compliantCount)` fails if record count ever
  diverges from distinct category+name count.

That guard catches *re-introduced duplicates*. It does not catch shadowing —
a shadowed key produces one record, not two.

### Objectives

1. Make the merge total and explicit: no key may be defined in two fruit modules.
2. Make a collision a build failure, not a silent overwrite.
3. Ensure the record that survives is the richest available, not the last spread.
4. Converge the two schema generations (`season`/`subCategory` vs
   `seasonality`/`subcategory`) on one shape.

### Approach

1. **Report before changing.** Add a script that prints every key defined in more
   than one fruit module, with the leaf-count of each copy and which one wins.
   Commit its output as the baseline. Nothing here is safe to do from memory —
   the winner is a function of spread order, which is easy to misread.
2. **Resolve each of the 8 collisions by merge, not by deletion.** For the four
   where the discarded copy is richer, the union is the correct record. Preserve
   `season` and `subCategory` (the camelCase spelling — 45 read sites vs 13 for
   `subcategory`). Do not hand-populate `alchemicalProperties`,
   `scaledElemental` or `kineticsImpact`: those are context-computed, per the
   locked decision in the ingredient-quality program.
3. **Assign each surviving key exactly one home module** by botanical
   subcategory (citrus / berries / tropical / stone fruit / pome / melons /
   exotic). Dissolve `enhancedFruits.ts` and the remainder of `fruits.ts` into
   those seven; both are provenance accidents rather than taxonomy.
4. **Replace the spread with a checked merge.** A helper that throws on a
   duplicate key, or a test that asserts the nine modules have pairwise disjoint
   key sets. Prefer the test if the helper would run at import time in
   production paths.
5. **Add a distinct-`name` assertion** alongside the distinct-key one, so suffix
   evasion is caught at its own level.

### Acceptance criteria

- Every fruit key is defined in exactly one module; a duplicate fails CI.
- `getSeasonalFruits()` over all seasons reaches every record that has a season;
  the current figure is 62 of 77.
- `isValidFruit()` is either satisfied by every record it is meant to accept, or
  removed as dead code — 51 of 77 failing is not a meaningful validator.
- No record loses a field it has today. Diff leaf-counts per key before and
  after; every key's count must be greater than or equal to its current value.
- `ingredientRecipeIndex` regenerated; distinct recipes covered stays at 1069 and
  no surviving key's recipe set changes.
- `bun run typecheck` clean; the dietary suites stay green with pins updated.

### Guardrails

- **Check `ingredientRecipeIndex.summary.json` before deleting any key.** A
  nonzero count does not by itself mean the key is load-bearing — the index is
  fuzzy-matched, and `apples` was matching "apple cider vinegar" — but a key
  whose recipe set is *not* a subset of a surviving key's must not be dropped.
  Regenerate with `bun run build:ingredient-recipe-index` and compare coverage.
- `src/services/__tests__/ingredientFilterServiceDietary.test.ts` pins the
  catalog at 372 records / 6 categories, Fruits 77, vegan 314, vegetarian 345.
  Any record change moves these; update them and keep the duplicate guard.
- Keep the `subCategory` (camelCase) spelling. `classifyIngredientDiet` reads
  `subCategory ?? subcategory`, but most other consumers read only the former.
- A green test proves nothing if it never loads the changed module. Assert on
  `basis`, not just the verdict — the `coconut_milk` test passed for four months
  with the right answer and the wrong reasoning.

### Out of scope

- The 8 fruits unreachable by `getSeasonalFruits` for a *different* reason:
  qualified season vocabulary (`"early summer"`, `"late spring"`) that never
  equals a bare season name. Independent defect, worth its own fix.
- The generic filler description template ("A sweet edible plant product, X
  delivers natural sugars…"), still on 4 records across `melons.ts` (3) and
  `pome.ts` (1).
- `origin: ["Cultivated worldwide"]`, a placeholder on 7 records in `exotic.ts`.
- The same shadowing audit for the other 11 ingredient categories
  (`src/data/ingredients/*`: beverages, dairy, grains, herbs, misc, oils,
  proteins, seasonings, spices, vegetables, vinegars). Fruits is the pilot; if
  the checked-merge approach works, it generalises. `coconut_milk` spanning
  `fruits` and `dairy` shows collisions are not confined within a category.
