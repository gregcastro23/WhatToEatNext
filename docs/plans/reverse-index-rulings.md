# Ingredient Reverse-Index Rulings (2026-09-24)

**Status:** Step 1 (`#883`) and Ruling 16 (`#882`) are **DONE**; Steps 2–7 remain **OPEN** (verified read-only against `master` `e5af9229`, 2026-11-21).
**Provenance:** Owner rulings answered 2026-09-24 after PR `#882` (omnibar recipe-line mapping). Transcribed into the repository from operator session notes so the decisions and build sequence are versioned alongside `docs/plans/omnibar-search-plan.md`.

---

## Approved Build Order & Current Status

1. **Step 1 — Non-card slug fallback + plurals** ✅ **DONE (`#883` / `9fbdc617`, `db07fa0c`)**
   - `resolveIngredientSlug(input, accepts?)` slug filter, plural last-word matching, NFKD mark stripping, matcher moved to `src/data/ingredientContainment.ts`.
   - Unresolved lines dropped `377 -> 273`; beef `43 -> 86`.
2. **Step 2 — Derived products (`derived` flag + hyphen rule; Rulings 1, 2, 4, 12)** — **OPEN (unblocked)**
   - Needs a typed derived-head table plus a `derived` flag on `RecipeUse` / `keysForLine` / Zod schema / coverage / dossier / UI.
   - `PRODUCT_HEADS` in `src/data/ingredientContainment.ts:37` currently still holds only `{ "butter" }`.
   - Note: `src/lib/search/recipeDiet.ts:40` reads `keysForLine`, so filing a derived line (e.g., `chicken stock` -> `chicken`) changes a diet verdict input. Ship with a measured before/after diet diff containing both a positive and a negative control.
3. **Step 3 — List split + exact-name guard (Rulings 9–11)** — **OPEN (blocked)**
   - Blocked on an unruled disambiguation rule: distinguishing a comma **list** (`"thyme, rosemary"`) from a comma **prep note** (`"garlic, minced"`).
4. **Step 4 — Curated tables (class heads, compounds, meat cuts) + parentheses (Rulings 5, 7, 8, 15, 17; Part words Ruling 6)** — **OPEN**
   - Typed tables in `src/lib/search/` with a stale-row detector; the corpus probe's `modifier` list is the worklist.
   - Part words (Ruling 6) are partially done with no resolver change evidently needed; pin coverage with golden lines.
5. **Step 5 — Drawer index rebuild (Ruling 18)** — **OPEN (blocked on architecture)**
   - Blocked on architecture choices: regenerate the 4.7 MB static drawer JSON (`public/data/...`) vs retire it, which recipe set is authoritative, and which of the 3 recipe ID forms is emitted.
   - Do **not** blindly run `scripts/buildIngredientRecipeIndex.ts` as a "refresh" before Steps 2–4 land (a 2026-10-03 measurement showed regenerating on `c27e4136` removed `1,697` committed matches, added `220`, dropped slugs `1,014 -> 945`, and missed `36` HSCA-restored recipes added surgically in `#900` / `#921`). Rebuild only after Steps 2–4 using the shared line resolver.
6. **Step 6 — Ratchet allowlist (Ruling 20)** — **OPEN**
   - Committed ceilings in `src/lib/search/__tests__/corpus.test.ts:157-160`: `unit-word === 0`, `generic <= 5`, `modifier <= 44`, `unresolved <= 248`.
   - Many `modifier` flags are correct by design and become ruled allowlist rows with an explicit `basis`.
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
