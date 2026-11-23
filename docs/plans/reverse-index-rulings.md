# Ingredient Reverse-Index Rulings (2026-09-24)

**Status:** Steps 1 (`#883`), 2 (`#1062`), 4, and 6 (curated tables + parentheses + allowlist ratchet) and Ruling 16 (`#882`) are **DONE**; Steps 3, 5, and 7 remain **OPEN** (blocked on owner/architecture rulings).
**Provenance:** Owner rulings answered 2026-09-24 after PR `#882` (omnibar recipe-line mapping). Transcribed into the repository from operator session notes so the decisions and build sequence are versioned alongside `docs/plans/omnibar-search-plan.md`.

---

## Approved Build Order & Current Status

1. **Step 1 — Non-card slug fallback + plurals** ✅ **DONE (`#883` / `9fbdc617`, `db07fa0c`)**
   - `resolveIngredientSlug(input, accepts?)` slug filter, plural last-word matching, NFKD mark stripping, matcher moved to `src/data/ingredientContainment.ts`.
   - Unresolved lines dropped `377 -> 273`; beef `43 -> 86`.
2. **Step 2 — Derived products (`derived` flag + hyphen rule; Rulings 1, 2, 4, 11 hyphen, 12, 17)** ✅ **DONE (`#1062` / `51294845`)**
   - Added typed `DERIVED_HEADS` table (`src/lib/search/derivedHeads.ts`: 15 heads across `butter`, `flour`/`meal`/`starch`, `milk`/`cream`/`water`, `oil`/`vinegar`/`extract`/`syrup`, `stock`/`broth`, `sauce`/`paste`) plus `NON_DERIVED_HEAD_MODIFIERS` (`"ice"`, `"white bread"`, `"nuoc cham"`) and `DERIVED_GAP_BLOCKERS`.
   - Replaced `PRODUCT_HEADS = {"butter"}` exclusion with clause-preserving `containmentDetailMatcher` (`src/data/ingredientContainment.ts`), `resolveIngredientSlugMatch` (`src/data/ingredientRecipeIndex.ts`), plural-only catalog derived fallback & Ruling 11 hyphen compound splitting (`src/lib/search/ingredientKeys.ts`).
   - Added `derived: boolean` to `RecipeUse` / `keysForLine` / `rankRecipeUses` (`src/lib/search/recipeIngredientIndex.ts`), `coverage.ts`, `ContainingRecipeRow`, `OmnibarResponseSchema` (`.default(false)` for cached payloads), `DossierRecipe`, `omnibarRows.ts`, `SearchResultsView.tsx`, `DossierDetailPanels.tsx`, `lineAudit.ts`, and `scripts/probeRecipeLineKeys.ts`.
   - Measured over `1,113` static recipes / `2,675` distinct lines (`2026-11-22`): `unit-word: 0 -> 0`, `generic: 5 -> 2` (`corn`/`garbanzo`/`oat flour` resolved; `date sugar` & `ice water` left), `modifier: 44 -> 19`, `unresolved: 248 -> 243` (`peanut`/`coconut butter`, `white miso paste`), `derived: 80`; hero recipeCount deltas (`peanuts` `-> 26`, `oats` `-> 11`, `ginger` `-> 121`, `miso` `0 -> 1`, `fig` `0 -> 1`); before/after diet diff across all `1,113` recipes: `vegan 412 -> 412`, `vegetarian 676 -> 676` (`0` regressions, verified with plant-derived positive and animal-derived negative controls).
3. **Step 3 — List split + exact-name guard (Rulings 9–11 `"and"` / `"&"` / comma lists)** — **OPEN (blocked)**
   - Blocked on an unruled disambiguation rule: distinguishing a comma **list** (`"thyme, rosemary"`) from a comma **prep note** (`"garlic, minced"`).
4. **Step 4 — Curated tables (class heads, compounds, meat cuts) + parentheses (Rulings 5, 7, 8, 15, 17; Part words Ruling 6)** ✅ **DONE**
   - Added curated typed tables with explicit `basis` strings in `src/lib/search/lineRulings.ts`: `FALSE_COMPOUND_ALIASES` (5 rows: `brown turkey figs`, `mustard greens -> null`, `water spinach -> null`, `white bread flour`, `pomegranate molasses`), `CLASS_HEAD_RULES` (13 rows covering `jalapeño pepper`, `parmesan cheese`, `semolina flour`, `pistachio nuts`, `potato/tapioca starch flour`, `strong espresso coffee`, `grape tomatoes`, `napa cabbage kimchi`, `lemongrass pork`, `honey-mustard yogurt`, `whole-milk yogurt`, `barley miso`), and `MEAT_CUT_RULES` (4 rows: `ribeye`, `ox`, `cooked ham`, `salmon`).
   - Wired Ruling 15 parentheses handling in `src/lib/search/recipeIngredientIndex.ts` (`splitOutsideParens`) and `src/lib/search/ingredientKeys.ts` (whole-line `lookupExact` first including apostrophe slugs like `tvorog (farmer's cheese)`, else outside text decides, consulting parenthetical glosses only when the outside neither resolves nor is suppressed by a false-compound exclusion).
   - Pinned Ruling 6 part words (`zest`, `peel`, `rind`, `sprigs`, `stick`, `root`, `pods`, `fat`, `bones`, `blood`) and Ruling 17 stale-row + valid-card checks across all static corpus lines in `src/lib/search/__tests__/lineRulingsCorpus.test.ts`.
5. **Step 5 — Drawer index rebuild (Ruling 18)** — **OPEN (blocked on architecture)**
   - Blocked on architecture choices: regenerate the 4.7 MB static drawer JSON (`public/data/...`) vs retire it, which recipe set is authoritative, and which of the 3 recipe ID forms is emitted.
   - Do **not** blindly run `scripts/buildIngredientRecipeIndex.ts` as a "refresh" before Step 3 lands (a 2026-10-03 measurement showed regenerating on `c27e4136` removed `1,697` committed matches, added `220`, dropped slugs `1,014 -> 945`, and missed `36` HSCA-restored recipes added surgically in `#900` / `#921`). Rebuild only after Step 3 using the shared line resolver.
6. **Step 6 — Ratchet allowlist (Ruling 20)** ✅ **DONE**
   - Added `AUDIT_FLAG_ALLOWLIST` (17 rows: 4 intentional `generic`, 13 intentional `modifier`, each with exact `flags`, `keys`, and `basis`) and `auditAllowlistGaps` in `src/lib/search/lineAuditAllowlist.ts` without weakening the independent `lineAudit.ts` witness.
   - Measured over `1,113` static recipes / `2,675` distinct lines (`2026-11-22`): `unit-word: 0`, `generic: 2 -> 4` (white bread flour moved from wrong `white_bread` modifier to `flour`), `modifier: 19 -> 13`, `unruled: 0`, `stale: 0`, `unresolved: 243 -> 236`, `derived: 80 -> 78` (`semolina flour` corrected to non-derived); before/after diet diff `vegan 412 -> 412`, `vegetarian 676 -> 676` (`0` regressions). Updated `scripts/probeRecipeLineKeys.ts`, `corpus.test.ts`, and `lineRulingsCorpus.test.ts`.
7. **Step 7 — New ingredient cards (Ruling 3)** — **OPEN (blocked on owner data threshold)**
   - Blocked on owner ruling for the usage threshold and sourced values per the defensible-values standard.

*(Process note: non-phase PRs require `bun run verify` and owner review before merge.)*

---

## The 20 Rulings (2026-09-24)

### Derived products (1–4)
1. **Derived attribution:** A product made from `X` with no dedicated card (`"peanut butter"`, `"almond flour"`) is filed under `X` with a new `derived` flag (parallel to `alternative`). *Supersedes `#882`'s `"peanut butter" -> none`.*
2. **Derived heads:** `butter`; `flour`/`meal`/`starch`; `milk`/`cream`/`water`; `oil`/`vinegar`/`extract`/`syrup` (all four groups).
3. **New cards:** Create new ingredient cards only for high-use products, each backed by sourced values (no fabricated nutrition/alchemical defaults).
4. **Stocks, broths, and sauces:** Stocks, broths, and sauces of `X` resolve as a `derived` use of `X`.

### Heads, parts, and cuts (5–8)
5. **Class heads:** Entries such as `parmesan cheese`, `jalapeño pepper`, `semolina flour`, `grape tomatoes` use a curated `(modifier, head)` table. The specific name wins, and a variety word that happens to be another card yields to the head.
6. **Part words:** Resolve to the named ingredient as a plain (required) use: `zest`/`peel`/`rind`; `leaves`/`sprigs`/`stems`/`stalks`; `seeds`/`pods`/`root`/`stick`; **and** `fat`/`bones`/`blood` (e.g., `duck fat` -> `duck`).
7. **Meat cuts without cards:** Resolve to the animal (`ground beef`, `beef chuck` -> `beef`); when a cut card exists, the cut card wins.
8. **False-compound aliases:** Compounds that name a different food (`mustard greens`, `water spinach`, `brown turkey figs`) live in a curated compound-alias table mapping to the real card or `none`. The corpus probe's `modifier` list is the worklist.

### Lists (9–12)
9. **Multi-item lists:** `"X and Y"`, `"&"`, and comma lists attribute every ingredient as a required use.
10. **Exact-name guard:** If the whole line or either side is an exact card name or alias, do **not** split (e.g., `"mixed firm and flaky fish"`).
11. **Separators:** Slash (`/`) denotes **alternatives**; hyphen (`-`) denotes **one compound** (e.g., `"ginger-garlic paste"` -> `derived` use of both `ginger` AND `garlic`).
12. **Counting & ranking:** `recipeCount` counts `required + alternative + derived` uses. Alternative and derived uses are explicitly labeled and ranked **after** required uses.

### Mechanics (13–16)
13. **Plural ordering:** Plural matching ships only **after** Ruling 14 lands (measured impact: `+~40` lines resolve, vs `-7` without Ruling 14). *(Shipped in `#883`.)*
14. **Non-card index slugs:** An index slug that is not a catalog card (`ground_beef`, `chicken_thigh`, `vanilla_bean`) resolves among catalog names in the line instead of dropping the line. *(Shipped in `#883`.)*
15. **Parentheses:** Text outside parentheses decides; the parenthetical gloss is consulted only when the outside names no card.
16. **Equal-length tie-break:** On an equal-length tie, the rightmost (head) name wins (preserves `#882`'s rule). *(Shipped in `#882`.)*

### Governance (17–20)
17. **Typed curated tables with stale-row detection:** Rulings live in curated typed tables under `src/lib/search/`, with one `basis` field per row (like `synonyms.ts`). The corpus test asserts every row points at a real card and is still hit by a real recipe line.
18. **Single resolver for drawer and omnibar:** `scripts/buildIngredientRecipeIndex.ts` must rebuild the drawer's index through the **same** line resolver so the drawer and omnibar agree, preserving raw text, amount, and unit.
19. **Generic cards:** Generic cards (`juice`, `oil`, …) stay heroes over bare lines only; no category roll-up.
20. **Zero-unruled-flag ratchet:** Every flagged line in the corpus audit must either be fixed or carried in a ruled allowlist with an explicit `basis`; any unruled flag fails CI (`= 0`).
