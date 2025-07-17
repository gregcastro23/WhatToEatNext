# 🔄 WhatToEatNext — Fork B (Claude) • Phase 11 "Core Calculations Hardening"
_Date: 2025-07-07 23:20 UTC · Branch: `cancer`_

────────────────────────────────────────
A ▪ CURRENT STATUS (after Fork A Phase 10 close-out)
────────────────────────────────────────
• Build                              : **✅ passes** (`yarn build`)
• TypeScript errors (`skipLibCheck`) : **2 115**  
  – 1 435 TS2339 · 18 TS2345 · 11 TS2322 · remainder misc  
• ESLint (`any`) warnings            : **1 190**

Phase 10 highlights (already merged):
1. Alias sweep finished (`_season`, `_isDaytime`, etc.) → **TS2304 = 0**.
2. ErrorHandler API widened (`unknown`) cleaning 200+ call-sites.
3. Cooking-Method pages fully typed; residual overloads resolved.
4. Safe PlanetSpecific access pattern in `alchemicalCalculations.ts`.
5. Progress doc updated (see `docs/typescript-fix-progress.md`).

────────────────────────────────────────
B ▪ CLAUDE GUARD-RAILS (unchanged)
────────────────────────────────────────
1. Yarn only ‒ never npm.
2. Elemental logic principles (no opposing elements, same-element boosts, etc.).
3. Follow casing conventions per `.cursor/rules/casing.mdc`.
4. Touch ≤ 5 files per batch; build after each batch.
5. Skip files Fork A may edit this hour ‒ _none reserved at the moment_.

────────────────────────────────────────
C ▪ IMMEDIATE TARGETS FOR FORK B (Phase 11)
────────────────────────────────────────
| Error Code | Count | Hot Files (examples)                           | Strategy |
|-----------:|------:|-----------------------------------------------|----------|
| TS2339     | 1 435 | `alchemicalEngine.ts`, `core/alchemical*.ts`  | Safe property access patterns, judicious `as any` when deep-nest |
| TS2345     |   18  | `alchemicalEngine.ts` chakra section          | Align param types or cast via satisfies-pattern |
| TS2322     |   11  | `alchemicalEngine.ts`, `core/elementalCalcs`  | Add helper interfaces / cast results |

Priority order:
1. **`src/calculations/alchemicalEngine.ts`** (~15 blocking errors). Start at lines 320-380 (seasonalVariations) then work through label/sign blocks. Use minimal casts; keep calculations intact.
2. **`src/calculations/core/elementalCalculations.ts`** index signature mismatch at ~260-290.
3. **`src/calculations/combinationEffects.ts`** – confirm recent `_season`→`season` rename & finalize type of `antagonistic` array.

Batch plan suggestion:
• Batch #1 (≤5 files): patch `alchemicalEngine.ts` season+label+exactLongitude cluster.
• Batch #2: fix core/elementalCalculations index-signature + Element cast.
• Batch #3: finish combinationEffects comparator & ELEMENT_COMBINATIONS typing.

────────────────────────────────────────
D ▪ WORKFLOW REMINDER
────────────────────────────────────────
```bash
# baseline error list (optional)
yarn -s tsc --noEmit --skipLibCheck | tee ts-errors.log

# pick top error
rg "error TS" ts-errors.log | head -1

# patch ≤5 files → build & tsc check
# commit logical chunks
```

Happy hunting — aim to drive total TS errors below **1 900** this session while keeping the build green. Good luck!  🚀 