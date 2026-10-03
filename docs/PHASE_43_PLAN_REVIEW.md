# Phase 43 plan review

Reviewed 2026-09-29 against `b600020a` on
`codex/phase-43-domain-loose-optionality`. The checkout was clean before
this review. Input: the attached “Revised Phase 43 Plan”.

**Recommendation: keep the scope and execution order, but amend the items
below before starting.** No implementation or baseline ratchet was performed.

## Verified baseline

The three non-ratcheting checks passed: `check:scripts`, `check:bare-json`,
and `lint:debt`.

| Metric | Measured | Proposed acceptance |
| --- | ---: | ---: |
| Domain loose optionality | 132 | ≤115; expected 106 |
| Wire loose optionality | 89 | No increase |
| Bare JSON casts, production / total | 97 / 106 | ≤85 production; no total regression |
| Script typecheck errors | 9 across 6 files | Target 0; ≤3 only with documented deferrals |
| Single assertion sites | 2,869 | ≤2,850 |
| Non-null assertions | 598 | ≤598 |
| Tracked lint debt | **1,293** | **≤1,293 after banking drift** |

The plan's 1,295 lint count is not the current measurement. Its ≤1,304
ceiling also becomes obsolete once Step 0 ratchets the baseline. Preserve all
of the gate's other counters and per-rule limits, not just the headline totals.
Bank drift in a separate baseline-only commit for attribution.

## Required amendments

### 1. Guard the quantile result, not only the input length

In `scripts/backfillMonicaPerConstruction.ts:45`, adding
`if (!xs.length) throw ...` does not make the subsequent indexed access a
`number` under `noUncheckedIndexedAccess`. I checked the proposed pattern
with the installed TypeScript compiler; its return type remains
`number | undefined`.

Read the indexed value into a local, throw when it is `undefined`, and return
the narrowed value. An explicit `number` return annotation makes the intended
contract clear. Do not add an assertion or non-null operator.

Also handle an empty `ratios` collection at its reporting call site
(`scripts/backfillMonicaPerConstruction.ts:208`). The existing guard checks
`before.length`, but the ratios additionally exclude zero computed values.
Report that no ratios are available when that filter removes everything;
do not abort an otherwise valid migration merely because an optional report
has no samples. Verify this with isolated fixtures, without executing the
database backfill.

### 2. Derive a separate balance schema for Celestial Lab

`src/lib/validation/accountResponseSchemas.ts:30` deliberately validates
only the four balances. The server-to-server branch of
`src/app/api/economy/balance/route.ts:24` returns precisely that smaller shape.
The schema is also shared by MenuOrderClient and McpTopUpPanel.

Interpret “extend” as defining a new derived schema for the authenticated
Celestial Lab response, retaining the existing exported schema's contract.
Require and validate the screen's `success`, `streak`, and `canClaimDaily`
fields there. Infer its reader type from the schema or verify compatibility
with the existing state types; the four-axis schema strips TokenBalances
metadata, so a top-level extension alone does not produce the full current
BalanceApiResponse type.

Round-trip both real response variants and verify that an unreadable refresh
preserves the previous balances and claim state.

### 3. Correct the Monica endpoint assumption

`src/app/(alchm)/philosophers-stone/page.tsx:286` calls `/api/monica-agent`,
not the plan's `/api/monica/chat`. Neither route exists in the checked-in
Next API tree, and next.config states that proxy rewrites were removed.
The two `/api/agents/unified` operations do have local implementations.

Do not invent a response contract from the old cast. Establish the intended
Monica endpoint and its actual response, or explicitly defer this one site.
Deferring it still leaves 12 planned production cast removals, reaching the
85 ceiling if the other sites succeed. Treat endpoint repair as an explicit
behavior change with its own evidence.

### 4. Correct the ingredient fallback premise

The fallback at `src/app/api/ingredients/[name]/route.ts:82` omits description,
prepTime, cookTime, and servings. So does the Hono fallback at
`src/server/hono-api.ts:225`. They do not currently populate every key.

The proposed required `T | undefined` representation is feasible, but requires
adding those four keys to each fallback. Record this as a construction change,
and compare serialized results for both populated recipes and missing-recipe
fallback fixtures. A catalog-wide comparison alone might never exercise the
fallback. Keep each implementation's existing serving calculation unchanged.

### 5. Specify parse-failure behavior and contract coverage

`safeReadJson` requires three arguments: response, fallback, and parser options.
It swallows both JSON decoding and schema errors. The plan currently names
the parser but leaves the fallback and failure behavior unspecified.

For table actions and agent creation, distinguish an explicit server rejection
from a 2xx reply that cannot be validated. In the latter case, the action may
already have completed: refresh/reconcile where possible and communicate that
the result could not be confirmed, rather than inviting a blind repeat. This
continues the mutation-response handling established in Phase 42.

For refresh reads, preserve prior good state and log validation failures.
Do not substitute fabricated zero balances or silently empty a populated list.
Use `readJson` with a throwing parser, an explicit safeParse branch, or an
intentional nullable fallback as appropriate; using safeReadJson everywhere
is not an acceptance criterion.

Add focused boundary tests for:

- Table action success, server rejection, and unreadable 2xx replies.
- Agent creation's consumed fields, chat success, and the unified route's
  degraded chat response.
- Both economy response variants and the degraded Alchm quantities payload;
  retain `degraded.reasons` when selecting fields.
- Companion lists with manual and linked entries. Validate only the consumed
  IDs and names; avoid requiring unrelated natal-chart data. The actual route
  returns `manualCompanions`, whereas the existing broad commensal list schema
  declares `commensals`, so it is not a drop-in reader contract.

Use server response types and compile-time compatibility checks where an
authoritative type exists. Do not mistake a TypeScript drift check for a
runtime response test.

## Supported parts of the plan

The planetary request parser does set all eight keys. The five optional
parameter cleanups are appropriate: optional parameters still accept
undefined without spelling out the union. The proposed guards for token
indices, AST arguments, and sign lookup are reasonable. Preserve the
Math.pow check's two-argument requirement and exercise its detection behavior.
The deterministic ESMS output comparison is an appropriate verification.

The fruit demonstration exports have no named references elsewhere under
src, scripts, or tests. Removing their import-time demonstration is a useful
cleanup. Keep the exported catalog comparison and check remaining consumers.
Using the repository's own `countAssertionSitesInSource`, the proposed demo
block contains **30 single assertion sites**, not 28. With all 13 JSON casts
removed, the expected single count is **2,826**; with Monica deferred, it is
**2,827**, before any other implementation changes.

## Execution and closeout

Retain the proposed order: bank drift, scripts, optionality, JSON readers,
fruit cleanup, final verification. Make the contract and parse-failure checks
part of the JSON-reader workstream rather than postponing them to closeout.

Run `bun run verify:full` after implementation, then the final ratchets and
the affected gates against the final tree. Explicitly inspect the scripts
diff for added assertions: check:diff-assertions scans src, not scripts.
Record actual deltas, intentional runtime changes, and any unavailable
authenticated browser validation in the closeout.

This review did not run the full test suite or build; those would not verify
the proposed implementation before it exists.
