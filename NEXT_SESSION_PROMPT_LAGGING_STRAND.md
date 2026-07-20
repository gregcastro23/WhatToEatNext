# Lagging strand — everything the FBD program left unligated

Paste everything below into a fresh session.

---

**Framing.** The leading strand of this program ran continuously and landed:
PRs #613, #614, #615, #616, #620, #622, #623 and the v2 physics spec **#624**,
all merged. This document is the *lagging strand* — the discontinuous fragments
that were synthesized during the work but never got ligated in. Several are
one-command finishes. **One is at real risk of being lost entirely.**

⚠️ **Verify before acting.** Root `NEXT_SESSION_PROMPT_*.md` files in this repo
have a track record of lagging reality — a past session nearly redid merged
work by trusting one. Every claim here was verified by tool call on 2026-07-20;
re-check with `gh pr list` / `git log` before building on any of it.

⚠️ **The user asked for this prompt "to run on PR 621." #621 is an ISSUE, not a
PR** — the dense-card label-overlap debt. It's the anchor for §4 below, but it
is not the biggest item here.

---

## 1. 🔴 URGENT — the AlchmAgentsETH port exists ONLY on local disk

**This is the highest-value and highest-risk fragment.** The entire agents port
— vendored physics engine, 76 passing tests, the card UI, browser-verified —
sits on branch `feat/planetary-fbd` in `~/Desktop/EthGlobalHackathon/AlchmAgentsETH-main`
with **no upstream and no PR**. Verified:

```
branch: feat/planetary-fbd
commits ahead of main: 2
pushed? NO UPSTREAM — never pushed
  c89aea6a feat(transits): planetary free-body diagram cards
  94b0b3b1 feat(alchm-fbd): vendor the planetary free-body-diagram engine
```

If that working copy is reset, cleaned, or the machine is lost, **all of it is
gone.** This repo has already had a concurrent process run `git reset --hard`
and destroy uncommitted work once.

**Do first, before anything else in this file:**

```bash
cd ~/Desktop/EthGlobalHackathon/AlchmAgentsETH-main
git push -u origin feat/planetary-fbd
gh pr create --base main   # remote is SSH: CookingWithCastro/AlchmAgentsETH
```

What's in it, for the PR body:

- `lib/alchm-fbd/` — the physics engine vendored from WTEN, with a README
  explaining *why vendored rather than bridged*: this repo's
  `astrological-dignities-engine.ts:305` computes `spirit * dignity_multiplier
  * signQuality.fire`, deriving ESMS **from** elements, which collapses the two
  compasses the FBD depends on. Bridging would have made the resultant a
  silent re-plot of the element vector.
- `test/alchm-fbd/` — **76 tests green.** 55 ported engine tests including the
  reconciliation identity in both sects, plus 21 new shared-ancestry drift
  tests locking this repo's `lib/planets/*.ts` to the engine tables.
- `components/planet-fbd-card.tsx` + `lib/alchm-fbd/fbd-tokens.css` — the card
  and its 12 design tokens, **scoped to `.alchm-fbd-root`** because this repo
  already defines its own `--accent` with a different meaning.
- `lib/alchm-fbd/adapter.ts` — the only file that knows both shapes.
- Wired into `app/(app)/transits/page.tsx`, verified in-browser: 10 cards,
  correct signs/degrees, dignity chips, resultants, and the off-card residual
  disclosed ("4.19 ESMS sits off-card").

**Known-correct limitation to state plainly in the PR:** every card renders
`STATIC CHART · MOTION N/A`, because `fetchCurrentPlanetaryPositions` returns
`{sign, degree}` with no speed. The adapter maps a speed of exactly `0` to
`undefined` on purpose — `0` is the "not computed" sentinel, not a standstill —
so the card degrades honestly instead of drawing a zero-length momentum arrow.
**Wiring a signed-speed source is the single highest-value follow-up there**: it
lights up momentum *and* applying/separating, roughly half the diagram.

## 2. Two open WTEN PRs, both green, both trivially landable

- **#617** `fix/jest-ignore-worktrees` — jest collects sibling `.worktrees/*`
  tests from the primary checkout; they fail on module resolution and belong to
  no branch. With three worktrees open the primary checkout reported 5 failures
  while `master` was fully green. Verified fix: 4 failing suites → 148 passed,
  real test count unchanged.
- **#619** `fix/sign-vector-legibility` — the natal wheel's element-pull arrows
  encoded dignity across **1.7 pixels** (5.8px at Detriment, 7.5px at Domicile),
  so the encoding was decorative. Anchors at a base and scales the deviation:
  now 4.2px → 19.5px, a 4.6× spread. Exact multiplier stays in the tooltip.

Both are self-contained. Review and merge, or say why not.

## 3. Fragments that exist ONLY in chat history — recover or rewrite

These were produced during the work and never written to a file. They will be
lost when the transcript ages out.

- **A unified Stitch prompt for Screens 1 + 3** (the `/planetary-chart` grid and
  the natal wheel / card-row page). It updates the original Screen 1/3 text in
  `docs/design/planet-fbd-stitch-prompt.md` to reference the *settled* card
  anatomy from #620, and explicitly instructs Stitch not to invent a "cleaner"
  vector display around the known label-overlap limitation. **Never saved,
  never run.** Reconstruct from that doc's original Screen 1/3 sections plus
  #620's three anatomy changes.
- **The decision to build the mobile FBD card in code, not via Stitch.** Stitch's
  mobile output was a weak match — it dropped most vector types (2 of ~7) and
  invented telemetry fields (Declination/House/Phase) that exist nowhere in the
  data model. That decision stands; the card was never built.

## 4. Issue #621 — the anchor (dense-card label overlap)

`FBD cards: aspect-vector labels overlap on dense planets (Sun/Mercury/Mars/Neptune)`
— open, unlabelled, deliberately filed as tracked debt rather than fixed inline.

Read the issue before attempting it. Context worth having:

- The overlap is *worse* after #620's restyle, which is acknowledged in the issue.
- It is the single biggest remaining visual defect and the most likely thing a
  first-time viewer notices.
- Per-card normalization already has a `MIN_VISUAL_NORM = 0.12` floor, so short
  vectors cluster at a similar radius by design — collision is structural, not
  incidental. A real fix probably needs label placement (leader lines, radial
  declutter, or hover-only labels beyond N vectors), not just a font tweak.
- **Do not "fix" it by dropping vectors.** The card's honesty depends on showing
  every force the engine computed.

## 5. Cross-repo work that is scoped but unstarted

- **Pentacles** — deliberately deferred and needs a decision before code. Two
  independent blockers: no React render tree (React appears in exactly one
  no-JSX file; zero `.ts` under `src/`), and no sect concept at all. Also
  **deck minting hashes `p.dignity`**, so unifying dignity scales re-mints every
  player's deck — a gameplay change wearing a UI change's clothes. #624's
  versioning decision is what makes this survivable (decks stay on v1).
  Pre-work regardless of route: delete the four empty filesystem-conflict dirs
  `src/net 2`, `src/ui 2`, `src/web3 2`, `src/alchm-chart/__tests__ 2` — they
  poison grep-based navigation.
- **PlanetaryAgents** — blocked on tracing the call graph across ≥5 live
  ESMS/dignity sources. Until that map exists, migrating risks two contradictory
  ESMS readouts on one page. ⚠️ memory flags a leaked GitLab PAT in its origin
  URL — check `git remote -v` before pushing.

## 6. Unrelated, older, and still the most at-risk thing in this repo

The **menu-planner redesign** has been sitting uncommitted on
`feat/recommender-bias` in the primary checkout across many sessions while
everything else merged around it: ~11 files, mobile redesign, `FastStartCard`,
real `WeeklyInsights`, a new `api/menu-planner/public-week` endpoint. Reported
fully built, typecheck clean, visually verified.

**Commit or stash it early.** It survives only as uncommitted working-tree state,
in a repo where a concurrent process has already destroyed uncommitted edits once.

---

## What #624 already covers — do NOT redo

The v2 physics spec (`docs/physics/UNIFIED_PHYSICS_MODEL.md`) is merged and
holds all twenty model decisions: gravitation with two roles (`M/r²` = inertia,
`M/r³` tidal = pull), live geocentric `r`, inverse-inertia × dignity attribution,
sign+decan granularity, the binding reconciliation invariant, model versioning,
bun packaging, and the conformance-suite/golden-fixture drift guard.

It also documents **seven open problems that block implementation** — three
load-bearing formulas are named but unspecified (the attribution function, the
pair-interaction rule, the positional vessel function), and "inertia" currently
means three different things in one engine. **Those are pure design work and
block no repo.** If you want the highest-leverage thing in this entire file
that isn't §1, it is closing those four.

## Suggested order

1. **§1** — push the AlchmAgentsETH branch. Minutes of work, prevents total loss.
2. **§6** — commit or stash the menu-planner work. Same reasoning.
3. **§2** — land #617 and #619.
4. **§3** — write the Screen 1+3 Stitch prompt to a file before it's lost.
5. Then either **§4** (#621, visible quality) or #624's open problems 1–4
   (unblocks all future physics work), depending on whether you want the surface
   or the foundation next.
