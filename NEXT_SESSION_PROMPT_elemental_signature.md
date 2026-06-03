# Next Session — Elemental Signature: a shared multi-element model (no more single "dominant")

_Created 2026-06-03 · author: prior session (Opus 4.8). Verify against `git log`/open PRs before acting — root `NEXT_SESSION_PROMPT_*.md` files have historically gone stale._

## TL;DR

Today we shipped the `/discover` hub ([PR #504](https://github.com/gregcastro23/WhatToEatNext/pull/504), squashed to `master` as `8ddee05c`). Its hero shows a **live elemental brief** — _"the sky leans water."_ But the sky was Water **29%** / Earth **29%** (a tie), and the brief silently picked one. That exposed two real problems:

1. **We collapse the four-element vector to a single "dominant" element for display**, throwing away the runner-ups even when they're tied or nearly tied.
2. **Three different tie-break implementations disagree** about who wins a tie, so the same sky can read differently on different screens.

**Goal of this session:** replace the scattered "dominant element" notion with **one shared `ElementalSignature` model** — ranked elements + adaptive co-dominant framing + a deterministic tie rule — and route **every** display surface (and the one recommendation path that reduces) through it.

## Decisions already made (don't re-litigate — these are locked)

| Question | Decision |
| --- | --- |
| **Scope** | **Full shared model** — one canonical model consumed by both the display layer and recommendation surfaces. |
| **Depth** | **Adaptive** — always know all four (ranked), but only *name* secondary/tertiary when they're within a closeness threshold of the leader. A clear dominant still reads as a single element. |
| **Ties / near-ties** | **Co-dominant** — _"the sky leans water & earth"_ when the top elements are tied/close; _"the sky is balanced"_ when all four are close. |
| **Reach** | **Unify all surfaces** — build one helper + component, roll it across all ~13 single-element surfaces, and delete the 3-way tie-break inconsistency in the same pass. |

**Hard constraint — elemental principles** (documented in `CONTRIBUTING.md`, `docs/guides/elemental-principles-guide.md`, `docs/QUICK_START.md`): elements are **individually valuable, do NOT oppose each other, self-reinforce, and all combinations have ≥0.7 compatibility.** "Secondary element" therefore means **richer description / additive blending — never conflict or opposition.** Do not introduce any "opposing element" logic.

---

## What the research already established (so you don't redo it)

### A. Recommendations are NOT single-dominant — leave the ranking math alone

The live ranking paths already use the full four-element (or full ESMS) vector. **Do not "fix" these to add a secondary — they already use everything:**

- **Ingredients** — dot product over all four elements: `dotElemental(skyWeights, ingredient.elementalProperties)` — [`src/app/api/recommendations/ingredients/route.ts:46`](src/app/api/recommendations/ingredients/route.ts).
- **Personalized** — ESMS **cosine similarity** (full 4-vector) + four-element **overlap** metric — [`src/app/api/personalized-recommendations/route.ts:138`](src/app/api/personalized-recommendations/route.ts) and `:150`.
- **Recipes** — Manhattan distance over heat/entropy/reactivity, derived from the full ESMS vector in `RealAlchemizeService.alchemize()` — [`src/app/api/recommendations/recipes/route.ts:64`](src/app/api/recommendations/recipes/route.ts), [`src/services/RealAlchemizeService.ts:383`](src/services/RealAlchemizeService.ts).
- Live ESMS entry point: `calculateEnhancedAlchemicalFromPlanets()` — [`src/utils/planetaryAlchemyMapping.ts:380`](src/utils/planetaryAlchemyMapping.ts).

### B. The ONE recommendation path that reduces to a few elements — cuisines

Cuisine recs already use a **primary + secondary** split (a precedent worth matching): dominant gets 3 cuisine slots, secondary gets 2 — [`src/app/api/cuisines/recommend/route.ts:108`](src/app/api/cuisines/recommend/route.ts) (`const dominant = sorted[0][0]`, then `secondary`, then `slice(0,3)` + `slice(0,2)`). This is where the shared model should plug into recommendations: let the **adaptive signature** decide how many elements to pull (clear dominant → just primary; co-dominant → primary+secondary; balanced → broader spread).

### C. The single-dominant collapse is a DISPLAY problem — ~13 surfaces

Single-element display surfaces to migrate onto the shared component:

| Surface | Where |
| --- | --- |
| Discover elemental brief (shipped today) | [`src/app/discover/page.tsx`](src/app/discover/page.tsx) — `ElementalBrief` |
| Ingredients explorer badge | `src/app/ingredients/IngredientsExplorer.tsx:171` |
| Ingredient card ("{el} Dominant") | `src/components/IngredientCard.tsx:36,122` |
| Ingredient display icon/border | `src/components/IngredientDisplay.tsx:20` |
| Recipe generator "Dominant Element" box | `src/app/(alchm)/recipe-generator/page.tsx:165` (all-four bars at `:453`) |
| Generated-recipe ingredient icons | `src/app/(alchm)/generated-recipe/[id]/page.tsx:76` (all-four bars at `:109`) |
| Commensal composite ("Dominant element: …") | `src/components/commensal/CompositeEnergyVisualizer.tsx:88` (all-four at `:112`) |
| Cooking-method element tag | `src/components/CookingMethods.tsx:1699` |
| Agent profile ("{el} · {modality}") | `src/app/(alchm)/profile/[userId]/AgentProfile.tsx:252` |
| Admin users element badge | `src/app/admin/users/page.tsx:434` |
| Elemental visualizer | `src/components/ElementalVisualizer.tsx` |

(Several already show all four bars; those just need their *headline/label* unified — keep the bars.)

### D. The three conflicting tie-break implementations (THE bug)

For a **Water 29% / Earth 29%** tie:

1. `getDominantElement()` — sequential `if (max === Fire) … Water … Earth …` → **Fire-first** order; in a Water/Earth tie, **Water wins** — [`src/utils/ingredientUtils.ts:314`](src/utils/ingredientUtils.ts).
2. `useElementalState()` reduce — `a > b ? a : b` (last-wins on equal), iteration Fire→Water→Earth→Air → **Air-first**; Water/Earth tie → **Earth wins** — [`src/hooks/useElementalState.ts:68`](src/hooks/useElementalState.ts).
3. Discover brief reduce — `b[1] > a[1] ? b : a` (first-wins on equal) → Water/Earth tie → **Water wins** (this is what you saw) — `src/app/discover/page.tsx`.

There are also **20+ other `getDominantElement` / `calculateDominantElement` definitions** across `src/utils/**` (e.g. `elemental/elementalUtils.ts:164`, `elemental/core.ts:188`, `constants/elementalCore.ts:414`). Most are calc-internals, some are dead code. **In-scope:** the three display-facing ones above + a single canonical source. **Stretch (see below):** consolidating the rest.

### E. Reusable infrastructure (build on these, don't reinvent)

- `ElementalProfile` type **already has `dominant` + optional `secondary` + balance** — [`src/types/alchemy.ts`](src/types/alchemy.ts) (~`:314`). Extend rather than create a parallel type.
- A variance-based **`balance` metric (0–1 evenness) already exists** — [`src/hooks/useElementalState.ts:75`](src/hooks/useElementalState.ts).
- Blend-ratio precedents: pillars **70/30** (`src/constants/alchemicalPillars.ts:474`), lunar **0.1/0.05** (`src/utils/lunarPhaseUtils.ts`), flavor-profile threshold semantics (`src/utils/flavorProfiles.ts`).

---

## Proposed design

### 1. Canonical model + helper — `src/utils/elemental/signature.ts` (new)

Exported through the elemental barrel. One pure function, fully unit-tested, that everything calls:

```ts
export type ElementalTier = "single" | "co-dominant" | "balanced";

export interface ElementalSignature {
  values: ElementalProperties;                 // normalized, sum = 1, original F/W/E/A order
  ranked: Array<{ element: Element; value: number }>; // high → low
  dominant: Element;                            // deterministic (see tie rule)
  coDominant: Element[];                        // elements within CO_DOMINANT_DELTA of the top (len 1 = clear)
  tier: ElementalTier;
  balance: number;                              // reuse the existing variance metric
  label: string;                                // "leans water" | "leans water & earth" | "balanced"
}

export function elementalSignature(props: ElementalProperties): ElementalSignature;
```

- **Deterministic tie rule:** when values are exactly equal, fall back to a single fixed canonical element order (propose `Fire, Water, Earth, Air`) so `dominant` is stable everywhere. But note — with the co-dominant tier, an exact tie should usually surface as co-dominant, so the canonical order is just the last-resort stabilizer.
- **Adaptive thresholds** (centralize as named constants in `src/constants/elementalSignature.ts`; values below are *starting proposals — tune against real sky data*):
  - `CO_DOMINANT_DELTA = 0.03` → an element joins `coDominant` if within 3 points of the leader.
  - `BALANCED_SPREAD = 0.08` → if `max − min < 0.08` (or `balance > ~0.9`), tier = `balanced`.
  - Tertiary/quaternary get *named* only if within delta of the leader (so "water, earth & air" only when genuinely three-way).
- **Labels** must respect the principles (no "vs", no opposition): `"leans {x}"`, `"leans {x} & {y}"`, `"a {x}-{y}-{z} sky"`, `"balanced"`.
- **Hydration-safe:** the live values come from planetary positions; on SSR/first paint they're the `0.25` fallback (→ `balanced`). Keep the function pure and the component's first render deterministic (the discover brief already animates bar widths from the fallback — preserve that).

### 2. Shared display component — `src/components/ui/alchm/ElementalSignature.tsx` (new)

- A headline/label + dominant orb that consumes a signature (replaces the bespoke "leans X" + orb in the discover brief and the single-element badges elsewhere).
- Keep the existing **all-four bars** treatment (`ElementalMeter`) for surfaces that already show the full breakdown; this component supplies the *headline*, the bars stay.
- Variants for compact (badge/chip) vs. full (brief hero).

### 3. Wire recommendations to the model

- **Cuisines** ([`cuisines/recommend/route.ts:108`](src/app/api/cuisines/recommend/route.ts)): replace the ad-hoc `dominant`/`secondary` extraction with `elementalSignature(...)`; pull from primary when `tier === "single"`, primary+secondary when `co-dominant`, broader when `balanced`.
- **Display rationale only** for the full-vector paths (ingredients/recipes/personalized): you may *annotate* results with the signature `label` for UI ("tuned to a water-earth sky") but **do not change their scoring math**.

### 4. Replace the three tie-break call sites

Point `useElementalState`'s dominant, the discover brief's reduce, and `getDominantElement` (display callers) at `elementalSignature`. Keep `getDominantElement`'s signature working (re-export `signature.dominant`) so non-display callers don't break.

---

## Task checklist

- [ ] `src/utils/elemental/signature.ts` — `elementalSignature()` + types; export via the elemental barrel. **Unit tests** for: clear single, exact 2-way tie (the Water/Earth case → co-dominant), near-tie within delta, 3-way, all-balanced, and the deterministic fallback order.
- [ ] `src/constants/elementalSignature.ts` — `CO_DOMINANT_DELTA`, `BALANCED_SPREAD`, canonical order; documented as tunable.
- [ ] `src/components/ui/alchm/ElementalSignature.tsx` — shared headline/orb/label component (compact + full variants).
- [ ] Migrate the Discover brief (`src/app/discover/page.tsx`) to the helper + component first (it's the smallest, and the surface that surfaced the bug — verify "leans water & earth" on the tied sky).
- [ ] Migrate the other ~12 surfaces (table in §C). For all-four-bar surfaces, swap only the headline/label; keep bars.
- [ ] Wire cuisines rec to the adaptive signature; optionally add a signature `label` to the other rec responses for UI rationale (no scoring change).
- [ ] Collapse the three display tie-break implementations into the canonical helper; make `getDominantElement` delegate.
- [ ] Sweep for hardcoded single-element copy ("Dominant element:", "{el} Dominant") and route through the component.

### Stretch (only if time/energy; flag explicitly if skipped)

- [ ] Consolidate the remaining 20+ `getDominantElement`/`calculateDominantElement` definitions in `src/utils/**` onto the canonical helper. **Caution:** some feed ranking/thermo internals — changing their tie behavior could shift scores. Treat as a behavior-preserving refactor with tests, or leave with a documented TODO. Some are dead code (safe to delete).

## Acceptance criteria

- The exact sky that read "leans water" (Water 29% / Earth 29%) now reads **co-dominant** ("leans water & earth") **identically on every surface**.
- A genuinely lopsided sky still reads as a single element; an even sky reads "balanced."
- One source of truth for elemental dominance; the three (ideally all) tie-break implementations are gone or delegate to it.
- Ranking math for ingredients/recipes/personalized is **unchanged** (diff the scores or assert via tests).
- Elemental principles honored — no opposition language anywhere.
- `bun run verify` (typecheck + lint) clean **and** `bun run build` passes (husky only runs typecheck+lint — build separately). 0 errors / 0 warnings.
- Verify in the browser via the preview workflow (the `/discover` brief + 2–3 migrated surfaces); confirm no hydration warnings.

## Process / gotchas (from this repo)

- **Toolchain is `bun`** (never npm/yarn). `bun run dev|build|verify|test`.
- **Branch off `master`; PR targets `master`.** `master` is production (Vercel auto-deploys on merge). `main` is stale.
- **Shared working dir / concurrent sessions:** this checkout has ~35 active git worktrees and other sessions may hold `master` locked — `git fetch` + check `git branch`/`git worktree list` before committing; stage files explicitly (no `git add -A`); `gh pr merge`'s local cleanup may error on the worktree lock (the merge still lands — clean the branch via the API).
- **Commit trailer:** `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **CSS/SSR:** alchm design tokens (`--fg`, `--accent`, `--el-fire|water|earth|air`, `t-tag`, `.alchm-panel-glow`, `.lab`) are global via `body.alchm-root`; `.lab` adds the obsidian backdrop. Keep client components' first render deterministic to avoid hydration tears (see `PlanetaryChip`'s `now`-null pattern and the discover brief's fallback bars).
- Reference the shipped brief in `src/app/discover/page.tsx` as the visual template for the new component.
