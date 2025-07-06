# Next o3 Cursor Session Prompt – Phase 8d Continuation (Generated 2025-07-07)

## 📌 Context Snapshot
1. Branch: `cancer`, workspace `/Users/GregCastro/Desktop/WhatToEatNext`
2. Build: **passes** (`yarn build`) – we compile with `skipLibCheck` for now.
3. TypeScript errors: **4 ,310** (TS2339 ≈ 1 ,850 | TS2304 ≈ 940 | others in table below)
4. ESLint: `any` 1 ,260 | unused-vars 1 ,720 | console 230
5. Active campaign: **Phase 8 – Systematic Error Reduction**
6. Latest achievements today:
   • Created global ambient aliases → TS2304 −417 (892→475).  
   • Refactored `types/alchemy.ts` for canonical imports + underscore aliases.  
   • Patched `RecipeGrid.tsx`, `KalchmRecommender.tsx` imports.  
   • Updated all trackers (`TYPESCRIPT_PHASES_TRACKER_UPDATED.md`, `CLAUDE.md`).

### Top Remaining TS2304 Names (to fix next)
| Missing Name | Count | Likely Fix |
|--------------|------:|------------|
| `_season` | 50 | add Season alias or correct import |
| `createElementalProperties` | 47 | import from `utils/elementalUtils` or declare globally |
| `alchemicalProperties` | 46 | proper import / alias |
| `CelestialPosition` | 45 | already globally aliased – update imports where still missing |
| `LunarPhase` / `lunarPhase` | 35 + 30 | add alias similar to Season |

## 🎯 Primary Objectives for Next Session
1. **Eliminate remaining TS2304 errors** (goal ≤ 100).  
   a. Provide global alias for `Season`, `LunarPhase`.  
   b. Export / import `createElementalProperties`, `alchemicalProperties`.  
   c. Sweep for lingering `_Planet`, `_Element` misuse.
2. **Re-run `yarn tsc`**; ensure total errors drop < 3 ,900.  
3. Update trackers + docs again.

## 🔧 Recommended Approach
```bash
# Quick error counts
make errors-by-type         # alias for grouped tsc

# Focus on TS2304
yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS2304" | head -20
```
• Use small, surgical edits: add missing imports, or extend `global-types.d.ts` for shared aliases.  
• Validate with `yarn tsc` → `yarn build` after each 3-5 file batch.

## ✅ Success Criteria
- TS2304 ≤ 100 | Total TS ≤ 3 ,900  
- Build still passes  
- Docs updated (tracker + CLAUDE.md)  

---
*Paste this prompt into your new o3-Cursor chat to resume seamlessly.*
