# Omnibar: the top search bar as a food search engine — plan v2

**Status:** reviewed draft, not started · **Date:** 2026-09-23 · **Supersedes:** "Main Navigation Search Bar Improvement Plan: The Ultimate Culinary Omnibar" (v1)

## Goal

Typing any food word into the header search (⌘K) should give a useful answer, never "No results". For an ingredient that means its card plus the recipes that use it. For a dish it means the recipe. For a typo it means the corrected result. For "spinach eggs feta" it means the dishes you can make with those. The bar should be good enough that people use it instead of Google for cooking searches, and it should plug into the browser's own search bar (OpenSearch) so they actually can.

Today `CommandPalette` does a substring filter over about 30 nav routes and 5 quick actions (`src/components/nav/CommandPalette.tsx:138`). Any food query returns nothing.

---

## 1. What the review found: v1 claims checked against the code and prod

Every row was measured on 2026-09-23. Scripts were run against `src/data/*`. Prod was read with public GETs on `alchm.kitchen`.

| # | v1 said | Measured | Consequence |
|---|---|---|---|
| 1 | "2,900+ ingredients" | **921** in `allIngredients`. The recipe index has 1,015 keys, 107 of them not in the catalog (`onions`, `eggs`, `tomatoes`, …) | Size the index for about 3k entities total. A linear scan is fine; no special index structure needed |
| 2 | "580+ recipes" | **1,063** live in prod (Postgres, UUID ids). The static catalog has 1,069 distinct recipes and the sitemap lists 1,084 | — |
| 3 | "164,000+ reverse links" | **20,385** links. **2,669 of them (13%) are duplicate rows**. Spinach has 23 rows but only **19** distinct recipes | Dedupe by recipe. The 4.7 MB figure is the JSON file size |
| 4 | "184 global cuisines" | **15** in `CUISINES_METADATA`, plus 27 cooking methods and per-cuisine sauces in `src/data/sauces.ts` | "Oaxacan" is not a cuisine we have, so it needs an honest fallback (see §3) |
| 5 | Build `/ingredients/spinach` | **Already exists**: `src/app/(alchm)/ingredients/[ingredientId]/page.tsx`, fed by `GET /api/ingredients/[name]`, which already returns the ingredient plus its related recipes | Reuse the service logic. Don't rebuild the dossier |
| 6 | Recipe results link to `/recipes/[recipeId]` from the index | ⚠️ **The index's recipe ids are dead links in prod.** `/recipes/chinese-authentic-sichuan-dan-dan-noodles` renders Next's 404 fallback. That id form is neither a DB UUID nor a static catalog id. Users already hit it through `IngredientDrawer` "Used in N recipes" links | **Phase 0.** *Corrected 2026-09-23:* sitemap URLs (static catalog ids) **do** redirect, but only client-side. Root `loading.tsx` streams them as HTTP 200 with a "Recipe not found" title and `noindex` in the head, with the 308 buried in the payload. Crawlers see a noindexed not-found page |
| 7 | "pinach" needs Damerau-Levenshtein | "pinach" is a **substring** of "spinach", and the existing `fuzzyScore` already finds it. The real gaps: `spinich` 0 hits, `spinahc` 0, `aubergine` 0, `bearnaise` 0, and `tomatoe` ranks *cherry tomatoes* above tomato | Edit distance and synonyms are still needed, for different queries than v1 cited |
| 8 | `fuzzyScore` is a sound base | `normalizeForMatch` **deletes** accented letters instead of folding them: "Béarnaise"→"barnaise", "jalapeño"→"jalapeo". Prefix matching on the compact form produces false hits: `tomatos` matches "tomato sauce" at score 0 | Fix at the shared root (§4.1). Every search bar in the app uses it |
| 9 | "vegan pasta", "gluten-free breakfast" by recipe fields | In the live catalog `isVegetarian` is false on **1000/1000**, `isVegan` is true on **4/1000**, `mealType` is `["main"]` on **1000/1000**, and `cuisine` is missing on **498/1000** | Recipe flags can't be used. Diet comes from ingredients via `src/utils/ingredientDietaryClassification.ts`, the canonical classifier (don't write a fourth). Meal type is recoverable from the static slug (`*-breakfast-*`) through the Phase 0 bridge |
| 10 | Hero card shows flavor notes | `flavorProfile` is present on **18/921**. `qualities` is on 921/921, `season` on 855 and `seasonality` on 103, `rulingPlanets` on 917, images on 921 | Use `qualities` for the notes. Read both season fields, normalized through `VALID_SEASONS` (six members: `fall` = `autumn`, `all` = year-round) |
| 11 | "+ Add to Cart" through `useGroceryCart` | The context only has `addRecipe(recipe, servings)`. There is no single-item add | Add `addItem` to `GroceryCartContext` (Phase 4) |
| 12 | "Cook in Builder" pre-populates | `/recipe-builder` reads no URL params | Add a `?ingredients=` prefill (Phase 4) |
| 13 | Redesign `CommandPalette.tsx` in place | It is already **452 lines**. The audit ratchet allows **300 lines per file and 50 per function**, with every `as` counted and no headroom | Split it into modules from the start (§5) |
| 14 | (not considered) | `AppChrome` mounts the palette on **every route**, so its code counts toward `/` First Load: **197 kB against a 220 kB ceiling** (Phase 38) | The omnibar body **must be lazy-loaded**. Only the keybind shell stays in the chrome |
| 15 | "Apple Silicon M5 / 16GB constraint" | No such constraint exists in the repo | Dropped. Search runs server-side because of the bundle budget (row 14) and the data size |
| 16 | "Trending ingredients" in the empty state | No data source exists | Cut until Phase 7 produces one. Never fabricate a "trending" list |
| 17 | `Tab`/`Shift+Tab` switches filter tabs | Taking over Tab breaks keyboard and screen-reader focus order | Filter chips become normal buttons in the tab order |

---

## 2. Design decisions

- **D1. One recipe identity.** A search result may only link to an id that the destination page resolves. `/recipes/[id]` reads `LocalRecipeService` (DB UUIDs), so the omnibar builds its "recipes containing X" index **from the live catalog**, not from the static JSON. That also picks up DB-only recipes.
- **D2. Server-side, anonymous, cacheable.** `GET /api/search?q=` depends only on `q`, so it returns `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`. The CDN then absorbs repeated keystrokes. 429 and error responses are `no-store`. Personalization (planetary re-ranking) stays out of v1 so responses remain cacheable.
- **D3. Lazy UI.** `AppChrome` keeps a small shell: the ⌘K listener, the `alchm:palette:open` event and an empty portal. The omnibar body loads through `next/dynamic` on first open and is prefetched when the header button is hovered or focused.
- **D4. Every ranking signal has a stated basis.** Tiers are explicit rules (§4.2). Ties break deterministically on name. No invented popularity numbers.
- **D5. Never a dead end.** Zero results always offer a next step: search recipe text for the query, run the Recipe Generator with the query as a prompt, or open the closest cuisine or method.
- **D6. Navigation stays instant.** Routes and actions keep matching on the client with no network round-trip. Server results merge in below them when they arrive.

---

## 3. Query classes: what answers each one

| Class | Example | Source (measured coverage) | Result |
|---|---|---|---|
| Ingredient | `spinach` | `allIngredients` (921) + index aliases | **Hero card** + recipes containing it |
| Typo | `spinich`, `tomatoe`, `brocoli` | Edit distance over the ingredient and recipe lexicon | Corrected result + "Showing results for **spinach**" |
| Synonym | `aubergine`, `courgette`, `rocket`, `prawns`, `garbanzo` | New sourced synonym table (§4.1) | The canonical ingredient |
| Dish | `carbonara`, `dan dan` | Live recipe names (1,063) | Recipe rows with thumbnails (1000/1000 have `imageUrl`) |
| **Multi-ingredient** | `spinach eggs feta` | Live reverse index | Recipes ranked by how many of the ingredients they use: "uses 3 of 3", "missing feta" |
| Cuisine | `thai`, `korean` | `CUISINES_METADATA` (15) → `/cuisines/[slug]` | Cuisine row + its top recipes |
| Unknown cuisine | `oaxacan` | — | Recipes mentioning it + nearest cuisine (Mexican), labeled as a suggestion |
| Method | `braise`, `sous vide` | `allCookingMethods` (27) → `/cooking-methods/[method]` | Method row |
| Sauce | `béarnaise`, `chimichurri` | `src/data/sauces.ts` + live recipes ("Chimichurri Sauce" is a recipe) | Sauce or recipe row. `/sauces` needs a `?focus=` deep link (Phase 4) |
| Diet | `vegan pasta` | Derived per recipe through `ingredientDietaryClassification` | Filter chip + results. Allergen-free claims only where the classifier has positive attestation |
| Time | `quick chicken`, `under 30 min` | Live `totalTime` (a string, parsed; the parse rate is measured before shipping) | Filter |
| Season | `in season`, `summer` | Ingredient `season`/`seasonality` + today's date | Filter / badge |
| Planetary | `mercury herbs` | `astrologicalProfile.rulingPlanets` (917/921) | Ingredient list |
| Quality | `warming`, `cooling` | `qualities` tags (warming 45, cooling 22) | Ingredient list. The basis is the catalog tag, not a formula |
| Navigation | `pantry`, `vault` | `getAllNavRoutes()` + quick actions (client) | Unchanged, instant |

Elemental queries ("earth grains") are **deferred to Phase 5 behind a data check**: 189 of 921 ingredients share one identical vector `{0.2,0.2,0.4,0.2}`, so ranking by element would mostly surface a category template rather than the ingredient.

---

## 4. Search core (`src/lib/search/`)

### 4.1 Normalization and lexicon
- **Accent folding** (NFD, then strip combining marks) added to `normalizeForMatch` itself, because every search bar shares that bug. Guarded by a corpus test showing which surfaces' results change.
- **Compact matching** (`oatmilk` ↔ `oat milk`) allowed for exact matches only, not prefix. This removes the `tomatos` → "tomato sauce" false hit.
- **Singularization** reuses `singularize` from `src/utils/ingredientNormalization.ts`.
- **Synonym table** (`synonyms.ts`): each entry is `{ term, canonical, basis }`, where basis is the regional name, the source, or "index orphan". Seed entries: aubergine→eggplant, courgette→zucchini, rocket→arugula, prawn→shrimp, garbanzo→chickpea, capsicum→bell pepper, spring onion/scallion→green onions, coriander leaf→cilantro, palak→spinach. Also the 107 index keys missing from the catalog (`eggs`→`chicken_egg`, `onions`→`onion`, …), mapped mechanically and listed in the PR.
- **Performance:** `resolveIngredientSlug` sorts its alias list on every call. Measured at 0.26 ms per miss. Move the sort to module scope before building the live index over roughly 9k recipe-ingredient rows.

### 4.2 Match tiers (lower is better; each is a named rule)
| Tier | Rule | Example |
|---|---|---|
| 0 | Exact match on normalized name, key or synonym | `spinach`, `aubergine` |
| 1 | Whole (stemmed) words contained *(Phase 1: moved above prefixes)* | `egg` → "Scrambled Eggs"; `dan dan` → "Authentic Sichuan Dan Dan Noodles" |
| 2 | Word-boundary prefix, or every query word starts a candidate word | `spin` → spinach; `sichuan noodles` |
| 3 | Mid-word contains | `pinach` → spinach *(did-you-mean shown)* |
| 4 | Damerau-Levenshtein ≤ 1 (query length ≥ 4) | `spinich`, `tomatoe` |
| 5 | Damerau-Levenshtein ≤ 2 (query length ≥ 7) | `spinnahc` |

Did-you-mean appears when the best hit is tier 3 or worse, or came through a synonym. It uses the form "Showing results for **spinach** · search instead for *spinich*". Subsequence matching is dropped from the ranking because it is what produced v1's weak matches.

### 4.3 Recipes containing an ingredient: ranking
Within the live recipes that use the ingredient, order by:
1. Ingredient named in the recipe title ("Spinach Pasta")
2. Required use before alternatives. A raw line matching `/\bor\b/`, like "bok choy or spinach", counts as an alternative
3. Name, A→Z

The count shown is **distinct recipes**. The same dedupe applies to the dossier's `relatedRecipes`, which currently returns 23 rows for 19 recipes.

### 4.4 Response shape (Zod, `OmnibarResponseSchema`)
`{ query, corrected?: { from, to, basis }, hero?: IngredientHero, recipes: RecipeHit[], ingredients: IngredientHit[], cuisines, methods, sauces, total: Record<Kind, number> }`. `IngredientHero` carries: name, slug, category, seasons, inSeasonNow, qualities (top 3), rulingPlanets, elemental, imageUrl, recipeCount, and `href` (the dossier). Each `RecipeHit` carries a **UUID `href`** that is guaranteed to resolve (D1).

---

## 5. Module layout (audit ratchet from day one)

```
src/lib/search/
  types.ts           — Kind, hit types (no `as`, explicit return types)
  normalize.ts       — fold, compact, tokenize (wraps utils/searchNormalize)
  editDistance.ts    — Damerau-Levenshtein with early exit
  synonyms.ts        — sourced table + index-orphan map
  lexicon.ts         — builds entity lexicon from catalog/cuisines/methods/sauces
  liveRecipeIndex.ts — ingredient → live recipe UUIDs (memoized per instance)
  intent.ts          — multi-ingredient split, diet/time/season chips
  rank.ts            — tiers + ordering (§4.2–4.3)
  omnibar.ts         — assembler: query → OmnibarResponse
src/app/api/search/route.ts           — GET, Zod-validated params, rateLimit, withObservability, cache headers
src/app/api/search/suggest/route.ts   — OpenSearch suggestions (Phase 6)
src/hooks/useOmniSearch.ts            — debounce 120 ms, AbortController, LRU(50), merge local nav
src/components/nav/CommandPalette.tsx — shell only: keybind, events, lazy import
src/components/nav/omnibar/           — OmnibarDialog, SearchInput, FilterChips, DidYouMean,
                                        IngredientHeroCard, RecipeHitRow, EntityHitRow, NavHitRow,
                                        EmptyState, useOmnibarKeyboard
```

Run `bunx eslint --config eslint.config.audit.mjs <new paths>` per file down to zero before committing. The new route must pass `check:route-validation`. Client fetches go through `readJson(res, OmnibarResponseSchema.parse)` so they pass `check:read-json` and `check:bare-json`. Other routes proxy to `HONO_API_URL`; this one doesn't, because Hono has no equivalent.

---

## 6. UI

- **Layout:** input → filter chips `All · Ingredients · Recipes · Cuisines & methods · Pages` → did-you-mean line → hero card (when a query resolves to one ingredient) → section lists → footer with keyboard hints. "See all N results →" opens `/search?q=` (Phase 6).
- **Hero card:** thumbnail, name, category, season badges plus an "in season now" badge, 3 qualities, ruling planet, a 4-bar elemental meter (the same component and data as the dossier), and the distinct recipe count. Actions: **Open** (↵, dossier), **Add to cart**, **Cook with this** (builder prefill), **All recipes**.
- **Keyboard:** ↑/↓ moves across every row including the hero, ↵ opens, ⌘/Ctrl+↵ opens in a new tab, Esc closes. With the hero selected, → moves along its action buttons.
- **Accessibility:** ARIA combobox pattern (`role="combobox"`, `aria-controls`, `aria-activedescendant`, `role="listbox"`/`option`), a polite live region announcing the result count, and a focus trap with focus returned to the trigger on close.
- **Mobile:** full-screen sheet, 44 px touch targets, and chips that scroll horizontally.
- **Empty state (no query):** recent picks (existing localStorage), "In season now" (ingredient seasons plus today's date, so it has a real basis), and quick actions. "Tonight's planetary suggestions" waits until it can reuse the live recommender without inflating the lazy chunk.
- **Header copy:** "Search ingredients, recipes, cuisines…" with ⌘K.

---

## 7. Phases (each one a PR)

| Phase | Scope | Exit criteria (measured) |
|---|---|---|
| **0 — Recipe identity** *(prerequisite; fixes a live SEO bug and a live dead link)* | One tested resolver for all three id forms (UUID, static catalog id, index id) → the live twin by normalized name, with cuisine as the tie-break. `generateMetadata` emits the twin's title plus `canonical` → UUID, with no noindex. The page redirects to the UUID. A static id with no twin renders the static recipe with a self-canonical. The sitemap emits canonical ids. (A true HTTP 308 needs the decision moved out of root `loading.tsx`'s Suspense tree; that's a separate follow-up. Carrying static `mealType`/season onto live recipes waits for Phase 5) | Join report (twins / ambiguous / static-only / index-id coverage). Crawl every sitemap and index URL: each must show the recipe's own title with no noindex, and none may contain `NEXT_HTTP_ERROR_FALLBACK;404` |
| **1 — Search core** ✅ #873 | `src/lib/search/*` + accent fold in `normalizeForMatch` + synonyms + live reverse index. No UI | Met: 921/921 self-retrieval, one-edit typos 2,598/2,601 in the top 3 (ratcheted), golden set, red-proofs; 54/54 live-catalog recipe links render in prod |
| **2 — API** ✅ #876 | `GET /api/search` + Zod schema (`searchSchemas.ts`, text-only recipe rows) + route tests (handler called directly; jest blocks network) | Warm p95 < 150 ms (measured p95 6.7 ms, p99 23.5 ms over 937 real queries; cold build ≈ 0.5 s). Cache headers asserted; 400/429/503 no-store. `bun run verify` green |
| **2.5a — Union catalog** ✅ #878 | **Union catalog** (`lib/ingredients/ingredientCatalog`): `allIngredients` ∪ unified, src/data winning field by field. Key-derived slugs. An exact resolver (slug, key, either catalog's name, alias; no substring fallback) behind `/api/ingredients/[name]`. Search over the union; hero hrefs are slugs. The ticker links by slug | Met: **1,002** cards (921 + 86 unified-only − 5 merged: 2 unified plural folds, 3 measured same-card pairs); zero slug or search-form collisions. `dossierHrefs.test.ts` known list 15 → **0**. `egg` → Chicken Egg hero (165 recipes). 1,002/1,002 self-retrieval. Index build 243 ms |
| **2.5b — Slug dossiers** | Move the dossier out of `(alchm)` to `src/app/ingredients/[slug]` (its `loading.tsx` and force-dynamic turn redirects into 200s). Name- and key-style URLs 308 to the slug. **SSR** metadata, body and JSON-LD. **Slugs in the sitemap**. "Used in" from the live reverse index | Met locally (prod build): canonical 200 / aliases 308 / unknown 404 by curl; on-demand ISR (● , MISS → HIT); **1,002/1,002** sitemap slugs render their own title, self-canonical and JSON-LD, with no soft-404 markers |
| **3 — Omnibar UI** | **Inline header search** with a results dropdown on desktop; **full-screen sheet on mobile** from the header search icon; ⌘K focuses the bar. **Smart Enter** (exact top result → open it, else `/search`; an exact *sauce* goes to `/search` until Phase 4's `?focus=`, since every sauce shares `/sauces`). **Minimal `/search?q=`** (SSR, noindex). Text-only recipe rows. Merge rule: an exact local nav match (`pantry`) suppresses a server correction or hero | Met locally (prod build): `/` First Load 199 kB (budget 220). Next's table counts the page entry only, so the header is measured with its layouts: 722,997 → **722,742 B** gzip (−255 B; the palette left, the omnibar body is a 7.2 kB gzip lazy chunk loaded on first focus). 36 component and model tests (typing "spinich" shows the correction, the hero and the recipes; keyboard walk; Smart Enter; merge rule; sheet focus trap). The header is no wider than production at 800–1920 px (production already overflows below ~1530 px; follow-up) |
| **4 — Actions and deep links** | Hero actions: **Cook with this** (`/recipe-builder?ingredients=` prefill), **Add to pantry** (existing local pantry; account sync is a separate follow-up), **Show pairings** (complementary list, linked where a name resolves). `/sauces?focus=`. ~~Add to cart~~ dropped | Each action verified in the preview |
| **5 — Multi-ingredient and intent** | `spinach eggs feta` coverage ranking. Chips for derived diet, parsed time and season. Planetary and quality filters. Elemental queries only if the per-category distinct-vector check passes | Per-intent golden cases. Diet results pass the classifier with the basis shown |
| **6 — Search as a destination** | `public/opensearch.xml` + `<link rel="search">`. `/api/search/suggest` in OpenSearch JSON format. `WebSite` JSON-LD with `SearchAction` (the `/search` page itself moved to Phase 3) | alchm.kitchen can be added as a browser search engine and suggestions show in the address bar. Rich Results test passes |
| **7 — Learning loop** | Log **zero-result** queries server-side (≤ 64 chars normalized, one row per distinct query with a counter, capped row count), with no user id and no raw text to third parties. Admin "Search gaps" panel. Metrics: zero-result rate, click position by kind, search → recipe/dossier visits, latency p95 | Panel reads a live table; metrics are anonymous |

Phases 0–3 are the minimum that satisfies the original request. Phase 0 can ship alone, today.

---

## 8. Golden queries (acceptance set; all return 0 results today)

| Query | Expected top | Also expected |
|---|---|---|
| `spinach` | Spinach hero | Distinct live recipes containing spinach, title mentions first ("Spinach Pasta", "Phyllo Triangles with Tofu and Spinach", "Spinach-Shiitake Salad") |
| `pinach` | Spinach hero, corrected | Same recipes |
| `spinich` | Spinach hero, corrected | — |
| `tomatoe` | Tomato (not cherry tomatoes) | — |
| `aubergine` | Eggplant (synonym) | — |
| `béarnaise` / `bearnaise` | Hollandaise (Béarnaise is one of its `variants` in the sauce data) | Same result with or without the accent; the "Bernaise" archive recipe by edit distance |
| `carbonara` | Authentic Spaghetti alla Carbonara | — |
| `dan dan` | Both Dan Dan Noodles recipes, with UUID hrefs that resolve | — |
| `thai` | Thai cuisine → `/cuisines/thai` | Thai recipes |
| `braise` | Braising → `/cooking-methods/braising` | — |
| `spinach eggs` | Recipes containing both | "uses 2 of 2" label |
| `oaxacan` | *(Phase 5: demonym → cuisine intent)* Mexican cuisine suggestion, labeled. The Phase 1 core reaches "oaxaca cheese" by edit distance | Recipes mentioning Oaxaca, if any |
| `pantry` | Pantry route (instant, client-side) | The server alone fuzzes to "puff pastry"; see the Phase 3 merge rule |
| `egg` / `eggs` | Chicken Egg hero, by synonym (2.5a brought the 86 unified-only cards, eggs among them, into the catalog) | 165 recipes that use eggs |
| `xqzv` | Zero-result fallbacks (D5) | — |

Each recipe `href` in the set gets fetched in the test harness against the page resolver. A link that renders "Recipe not found" fails the test.

---

## 9. Decisions, round 1 (owner, 2026-09-23)

1. **Phase 0: a static recipe with no DB twin** is rendered at its slug with a **self-canonical** tag. No 404s for existing links, and the sitemap stays intact. A static slug with a unique DB twin gets a 308 redirect to the UUID, so each recipe has one canonical URL.
2. **`/search?q=` is strictly `noindex`.** Internal search results create infinite thin-content crawl space. Indexable category pages get built by hand later, if the Phase 7 data shows high-volume intents.
3. **Phase 7 query logging is approved** for a Postgres migration: anonymous, normalized, zero-result queries only. The length cap has to stop spam from bloating the table, so the design is one row per distinct normalized query (UPSERT with a counter, not a row per search), queries capped at 64 characters after normalization, a hard ceiling on distinct rows with oldest and lowest-count rows evicted first, plus the existing rate limiter.
4. **Ship order:** Phase 0 ships **immediately as a standalone PR**. It isn't blocked by the rest of the search work.

## 10. Decisions, round 2 (owner, 2026-09-23; 20 questions)

Full record: issue #870. Where these differ from earlier sections, they win.

- **Product:** cooking discovery first; anonymous, CDN-cached results (no personalization); inline header search on desktop and a full-screen sheet on mobile; Smart Enter; text-only recipe rows; hero actions Cook with this / Add to pantry / Show pairings; no quality tie-breaks (ties stay lexical).
- **Data:** union catalog (src/data wins) now, then migrate the 89 unified-only entries into src/data and retire the unified catalog; slug dossiers with SSR and sitemap; the dossier's "used in" list from the live reverse index; pantry stays local for now; data blockers get fixed inline in the phase that needs them.
- **Sequence:** 2 → 2.5 → 3 → 4 → 5 → 6 → 7 (table above).
- **Process:** Claude merges each phase PR once CI is green and the preview or local-prod checks pass, then verifies production.
