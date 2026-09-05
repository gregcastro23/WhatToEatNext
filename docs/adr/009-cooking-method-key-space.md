# ADR-009: Cooking-method key space — normalize on read, never rename

**Status:** Accepted
**Date:** 2026-08-01
**Implemented by:** #690 (and #689, which removed the fallbacks that hid the problem)

## Context

An audit on 2026-07-31 found the cooking-method key space fractured well beyond
what any single registry suggests:

- **At least 27 registries and alias maps** key cooking methods, plus two large
  free-text vocabularies (recipe method tags, cuisine dish descriptions).
- **Four distinct types named `CookingMethod`** — `types/shared.ts:237`,
  `types/constants.ts:55`, `types/culinary.ts:632`, `types/alchemy.ts:599` — with
  no relationship to each other.
- **Five different normalization rules**, from a bare `.toLowerCase()` to one
  that strips every non-alphanumeric character.

The measurable consequence: **6 of the 27 servable methods resolved no
alchemical pillar**, so they rendered with untransformed ESMS and shared an
identical kalchm. Two more had no `METHOD_PHYSICAL_REFERENCE` entry, so their
temperature and pressure block was silently omitted from the UI.

The obvious fix — one canonical `snake_case` union, rename the divergent
spellings, add a coverage test — was drafted and approved. Adversarial
verification returned **`safe: false`**.

### Why the rename was rejected

Cooking-method keys are **persisted in three Postgres surfaces read by exact
string equality**, with no backfill hook anywhere in `database/init/`:

| Surface | Consequence of a rename |
|---|---|
| `user_profiles.taste_corrections.methods` | A stored `{"stir-frying":"block"}` is a user saying *never this*, applied by exact key match at `userInteractionsService.ts:193-204`. **The block silently stops working.** |
| `user_interactions.payload` | Taste-graph history is aggregated by exact string; a rename splits one user's accumulated counts across two keys, and the top-5 shows both with neither carrying the full total. |
| `food_lab_entries.cooking_method` | Stores Title Case from a picker (`'Fermenting'`, `'Sautéing'`); every stored row orphans. |

The review also established the rename would fix **only 3 of the 7** unmapped
methods (`tilt_skillet`, `pressure_cooking`, `infusing` and `distilling` have no
pillar entry under *any* spelling), break a currently-passing test, 404 every
multiword alias on `/api/techniques`, and orphan 26 committed WebP assets whose
filenames follow the current spelling.

## Decision

**Readers normalize. Registries gain spellings. Nothing is renamed.**

1. **`src/constants/cookingMethodKeys.ts` owns the key space.** It exports two
   deliberately distinct lists:
   - `SERVABLE_COOKING_METHOD_KEYS` (27) — methods with a data file. Registry
     totality is asserted against these, because a method the app cannot serve
     cannot be missing a profile.
   - `REGISTRY_ONLY_COOKING_METHOD_KEYS` (`baking`, `ceviche`, `foam`,
     `sauteing`) — present in a registry with no data file. `baking` carries both
     a pillar entry and a kinetic profile yet has no method data: a real catalog
     gap, named rather than silently absent.

2. **One data-layer normalizer.** `normalizeCookingMethodKey` = lowercase → NFD
   accent-fold → collapse `[\s-]+` to `_`. Accent folding is load-bearing, not
   cosmetic: `'Sautéing'` is a persisted picker option and without folding never
   meets the registry key `sauteing`.

3. **The URL slug is derived, not parallel.**
   `normalizeSlug = stripNonAlphanumeric ∘ normalizeCookingMethodKey`. The two
   rules do genuinely different jobs — one collapses separators, one removes them
   — but composing them means they cannot disagree about what a method is called.
   The `/api/techniques` alias table had already drifted into storing slug
   spellings (`"stirfrying"`, `"sousvide"`) as its *values*; those are canonical
   keys now, slugged on the fly.

4. **Missing entries are ADDED beside the old ones**, never substituted:
   `dehydrating: 3` beside `drying: 3`, `fermentation: 11` beside
   `fermenting: 11`, `stir_frying: 5` beside `"stir-frying": 5`. Both spellings
   resolve, permanently. Plus `distilling: 4`, `infusing: 4`, `tilt_skillet: 5`,
   `pressure_cooking: 13`, each carrying its evidence in-code.

5. **Lookups that miss return absence, not a plausible value.**
   `getKineticProfile` previously returned `?? { voltage: .5, current: .5,
   resistance: .5, velocityFactor: .5, momentumRetention: .5, forceImpact: .5 }`
   — six fabricated midpoints indistinguishable downstream from authored values.
   It now returns `null`, and `calculateMethodSpecificKinetics` throws naming the
   offending method id.

## Consequences

**Enforcement is a runtime test**, not a type. Both registries are read through
`Record<string, …>` index signatures, so TypeScript cannot see a missing key —
this is precisely why the fracture survived so long. `src/__tests__/cookingMethodKeyspace.test.ts`
carries 152 cases, and the highest-value ones cover the **data/registry seam**:
every `name:` string the data files declare must normalize onto its own record
key *and* resolve a pillar. A registry can be perfectly total over its own keys
while every string the data actually declares misses all of them.

**Old spellings are asserted to keep resolving, and to resolve to the same
pillar** as their modern twin. That test is the guard against a future
"cleanup" reintroducing the revocation risk.

**The key space is now larger, not smaller.** This is the intended trade. A
smaller key space would require a data migration on user-authored preferences;
a larger one costs an extra map entry.

**Live behaviour shifts.** Six methods gain pillar effects they did not have,
which re-orders the cooking-methods list and changes displayed kalchm. That is
the bug being fixed, not a regression — but expect it rather than discover it.

**Not addressed here, deliberately:**

- `calculatePillarCompatibility` (sign-agreement scoring) and `esmsAlignment`
  (normalised L1 distance) are two real, disagreeing compatibility formulas.
  Choosing between them changes live recommendation output and belongs in its
  own decision.
- `pressure_cooking` is ruled **13 (Multiplication)** by the project owner. An
  adversarial review argued **11 (Fermentation)** on element order,
  `suitable_for` family, planetary overlap and Spirit direction. 13 and 11 differ
  in Spirit, so this is a real ESMS difference; the argument is recorded in-code
  at the mapping for any future reader.
- The remaining ~24 registries and alias maps are untouched. This ADR fixes the
  four that feed the alchemical engine; the rest were catalogued but not
  consolidated.
