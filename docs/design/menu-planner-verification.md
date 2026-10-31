# Menu planner redesign verification

Verified locally on October 29, 2026. Scope: the implemented desktop/mobile planner redesign and the gaps identified against `menu_planner_ux_plan.md` supplied with the request.

The shared checkout advanced during this work. Earlier fixes were included in the intervening commits; the final focused checks ran against `5e227f20` plus the mobile empty-slot count correction described below. This report does not claim verification of every unrelated feature added concurrently.

## Corrections

- Recipe detail “Add to meal” now enters placement mode. Week, Day, and mobile slots accept the selected recipe; a failed placement retains the selection for retry.
- One responsive recipe rail replaces two simultaneously mounted copies. On narrow screens, selecting a recipe dismisses the rail so a meal slot can be chosen.
- Meal details derive their slot from current planner state, keeping servings, lock state, and sauce pairing current.
- Undo survives the detail drawer unmounting and refuses to restore a removed meal into a different week or overwrite a newly filled slot. Error notifications are no longer dismissed by the previous toast.
- Plan actions preserve generated recommendations instead of overwriting them from a stale catalog fallback. Optimization respects dietary and ingredient preferences. Main planning actions and empty-slot counts honor snack visibility.
- Settings reuse the complete preference form, retaining custom calorie targets, flavor choices, and required ingredients.
- Sheets restore opener focus, menus escape clipping containers, and the grid supports arrow-key navigation. Save/share dialogs use the shared sheet.
- Browser verification exposed `.lab { position: relative }` overriding a sheet’s fixed position. Sheets now use the token-only `alchm-root` class and render above the mobile navigation.
- The sauce picker now uses the shared Radix sheet, with a title, focus trap, Escape dismissal, dark styling, and wrapping filters. Its recommendation input uses genuine `mappedAlchemy` quantities when available; heat and entropy are no longer relabeled as ESMS.
- Day views only label the actual current date “Today.” Partial nutrition totals retain their coverage labels.

## Browser checks

Local guest sessions at `http://127.0.0.1:3000/menu-planner`, with live planner synchronization disabled for QA.

| View | Verified behavior |
| --- | --- |
| Desktop, 1200 CSS pixels wide | Calendar visible without scrolling past dashboards; rail selection and placement; live serving changes; sauce selection returning to meal details; full week generation reaches **21/21 meals planned** with snacks hidden. |
| Tablet, 834 × 900 | Horizontally scrollable weekly grid; Recipes opens a drawer instead of a second persistent rail. |
| Phone, 364 × 747 | Card layout; recipe detail → Add to meal → slot placement; one rail; snack-hidden empty-slot count is 21. |

Screenshots:

- [Completed desktop week](planner-verification/desktop-week-planned.png)
- [Desktop recipe placement](planner-verification/desktop-placement.png)
- [Repaired meal detail drawer](planner-verification/desktop-meal-details.png)
- [Tablet grid](planner-verification/tablet-week.png)
- [Tablet recipes drawer](planner-verification/tablet-recipes-drawer.png)
- [Mobile recipe placement](planner-verification/mobile-placement.png)

## Automated validation

| Check | Result |
| --- | --- |
| `bun run jest src/components/menu-planner/ --runInBand --silent` | **10 suites, 65 tests passed.** Includes the 15 new interaction regressions and the page-level detail-to-placement tests. |
| `bun run typecheck` | Passed. |
| ESLint for planner shell, board, SauceSelector, and MealSlot | Passed with no errors or warnings. |
| Full Jest suite | Initial run: 586 suites passed, 10 failed, 6 skipped; 6,130 tests passed. Four process-determinism failures were due to sandbox IPC restrictions. The eight foreign-runner suites and runner-import guard failed in concurrent restaurant work. |
| Failed-suite rechecks | Determinism suite passed with local IPC permission (5 tests). After the concurrent restaurant fixes, all nine remaining failed suites passed (53 tests). A second full-suite run was not performed. |
| `bun run verify:static` | Passed source, validation, assertion, snapshot, 290 gate tests, script types, app types, and lint checks; initially stopped at the repository-wide lint-debt gate. After the concurrent checkout updates, a separate `bun run lint:debt` recheck passed all debt, cast, assertion, and optionality gates. `bun run audit:dead-modules` also passed. The complete static command was not rerun as one process. |

Authenticated sharing, live synchronization, and checkout were not exercised. No deployment or publication was performed. Guest-only quest requests returned 401 without blocking generation. Recipe recommendation quality and nutrition completeness depend on the existing catalog; this pass verifies planner behavior rather than auditing that catalog.

## Standards

Focused review found no remaining actionable standards findings after corrections. Shared preference controls avoid duplication; menus are portaled; sheets restore focus without stealing it from a handoff dialog. Sauce recommendations preserve the ESMS/thermodynamic distinction documented in `CONTEXT.md`.

## Spec

The reviewed placement, preference, undo, current-slot, generation, and responsive-rail gaps are corrected. The review’s remaining sauce-dialog accessibility finding was subsequently fixed by adopting the shared Radix sheet and verified with real sauce-picker interaction tests and browser use.

Focused review: **0 unresolved Standards findings; 0 unresolved Spec findings from the reported review set.** Repository-wide validation limits remain recorded above.
