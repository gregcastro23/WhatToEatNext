# Phase 40 Plan (revised) — ASOL Delivery Contract, Signature Rollout, and Ratchets

Revised: 2026-09-23 · Base: `origin/master` `5c79ef14` (CI green: Build, Verify, Test) · Branch: `codex/phase-40-asol-hardening`
Supersedes the Antigravity draft (`implementation_plan.md`, same date). §1 lists what changed and why.

Evidence labels:
- `[measured]` — observed by this review: file contents at `5c79ef14`, scanner output, or ASOL source at `368c05da` (HEAD 2026-09-23 19:53Z).
- `[agent-reported]` — from the draft's session and not re-run here (the full gate table in §2).

---

## 1. What changed from the draft, and why

| # | Draft said | Finding `[measured]` | Revised plan |
|---|---|---|---|
| 1 | "Promote `ASOL_WEBHOOK_SIGNATURES` from permissive to enforced" | `verifyStandardWebhook` and `evaluateSignatureGate` have **zero callers**. No route verifies anything today. | A2 wires the verifier first, in `shadow` only. |
| 2 | "Upstream ASOL is shipping v1 signing headers" | ASOL's default-branch HEAD `368c05da` sends **no** `webhook-signature` anywhere (other branches not checked). The only mention is a design doc (`docs/integrations/RECIPE_JOBS_DESIGN.md:37`). | Setting it to `required` now would reject 100% of ASOL deliveries. Promotion becomes an operator step with a measured entry criterion (A2.5). |
| 3 | Add `enforced`/`permissive` as aliases | The code's modes are `off \| shadow \| required`. `getWebhookSignatureMode()` maps **any unknown value to `off`**. An operator following the prompt's wording (`=enforced`) would get no enforcement, with no error. | Keep one vocabulary. An unknown value becomes `shadow` and logs `_logger.error`, and the admin page shows "misconfigured" (A2.1). |
| 4 | Change the in-flight duplicate response from 409 to 429 | The real defect is the response **body**. ASOL's retry classifier (`lib/wten/delivery.ts:229-247`) retries a 409 only when the body has `status: "in_flight"`. WTEN's `/api/hooks/vercel` sends that marker. The three ASOL routes built in #869 do not: they send `{error: "conflict"}`. So ASOL files an in-flight `sync-event` as **`already_applied`** (`conflictMeansApplied: true`), and files `feed` and `agent-recipes` as `rejected`. Neither is retried, so if WTEN's first attempt then fails, the event is silently lost. | Keep 409, as `CLAUDE.md` and ASOL's `WTEN_CONTRACT.md:58` both document. Add the marker through one shared helper. This ships first, in its own PR (A1). |
| 5 | Shadow mode "logs failures" | Shadow logs through `_logger.warn`, which is gated off in production (`src/lib/logger.ts:56-58`). Shadow would produce **no evidence** in the one environment that matters. | Write each verification outcome into the `webhook_events` summary and show it on `/admin/asol`. This record is what justifies promotion (A2.3). |
| 6 | Alert when in-flight > 5 or p95 > 1000 ms | `asolHealthService` queries have **no time window** (all-time p95). "In flight" includes dead locks older than `STALE_LOCK_SECONDS` (300 s) that no redelivery ever reclaimed. The 1000 ms threshold has no stated basis. | Use a 24 h window. Split live locks from stale ones. Every threshold names its basis (A3). |
| 7 | Split drift errors (400) from bad signatures (401) | ASOL treats every 4xx other than 409 and 429 as final `rejected`. Nothing distinguishes the two. | Dropped. Keep the existing 401. |
| 8 | Probe POSTs a mock event to `/api/feed` in prod | `/api/feed` **auto-provisions** an `@agentic.alchm.kitchen` user on the first event and publishes a visible feed post. `agent-recipes` inserts a recipe row. `sync-event` increments quest progress. A write probe fabricates prod data, which `CLAUDE.md` forbids. | E1 is a read-only prod probe with negative controls. The idempotency loop moves to CI route tests (E2). |
| 9 | Probe checks "dispatch bearer validation" | That call is outbound, WTEN → ASOL. ASOL already probes WTEN's `agent-recipes` bearer from its side (`lib/admin/wten-link.ts:232-246`). | Dropped from E. |
| 10 | B: tighten 15 + 12 sites; "no breaking changes" | `exactOptionalPropertyTypes` is on, so `?: T \| undefined` → `?: T` changes what callers may pass. `/api/recommendations/generate` assigns zod output straight into `DayRecommendationOptions` (`route.ts:228`), and that line stops compiling. 4 of the 12 WeeklyCalendar sites carry real `undefined` (`weeklyNutrition?.days[day]` and a `string \| null \| undefined` hour). | Add an allowlist adapter at the route. Take only the 8 WeeklyCalendar callbacks and booleans (B). |
| 11 | C: 11 casts in client UI pages | The counts are right, but those pages read our own APIs. There are 34 server-side sites, including the cross-site **auth** bridge (`src/lib/auth/agentsBridge.ts:76` trusts ASOL's session shape) and `feed/route.ts:85`, which A2 rewrites anyway. | Start with the ASOL, auth, and economy boundary (9 sites → 130). The UI pages are a stretch goal (C). |
| 12 | D: `.reduce<T>()` in fruits, "25+" sites | There are 24 sites (3,021 → 2,997, a margin of 3). They sit in a block the file itself calls dead code that runs at module load (`fruits/index.ts:28-31`, `:1630`). | Do the sweep plus ≥5 more accumulators for margin, with an emitted-JS diff as the witness. File the dead block's deletion as a follow-up (D). |
| 13 | F: route budgets as a workstream | `bun run build` already runs the 7 route checks. | Folded into verification. The `/recipes/[recipeId]` split (331 kB of 350 kB) is **deferred**. |
| 14 | One PR | A1 fixes live data loss and is about 40 lines. Bundling it with ratchet churn delays it. | Four PRs, in the order given in §3. |

Errors in `NEXT_SESSION_PROMPT.md` that the draft quietly worked around:
- `src/data/seasonings/` does not exist.
- `restaurantDiscoveryService.ts` and `types/yelp.ts` are on `wireAllowlist`, so they don't count toward the domain metric.
- `planetary-positions`, `reliableAstronomy`, Instacart and AmazonFresh have 0 bare-JSON sites.
- It uses the `permissive/enforced` vocabulary.

Fix the prompt when this phase closes.

---

## 2. Starting state

| Gate | Value at `5c79ef14` | Phase 40 target | Source |
|---|---:|---:|---|
| Loose optionality, domain | 216 (89 wire) | ≤ 200 (plan lands ~193) | `[measured]` scanner |
| Bare JSON casts, prod / total | 139 / 148 | ≤ 130 / ≤ 139 | `[measured]` scanner |
| Single assertion sites | 3,021 | < 3,000 (plan lands ≤ 2,992) | `[agent-reported]` |
| Casts / total assertions / tracked / declined | 165 / 3,185 / 1,320 / 4,891 | no growth | `[agent-reported]` |
| route-validation, read-json, diff-assertions, dead-modules, snapshot-witness | 0 / 0 / 0 / 0 / parity | unchanged | `[agent-reported]` |
| check:scripts | 66 errors / 32 files | ≤ 66 | `[agent-reported]` |
| Tests | 430 suites, 4,325 passed, natural exit | natural exit 0 | `[agent-reported]` |
| Build | 7/7 route budgets | 7/7 | `[agent-reported]`; CI Build ✅ `[measured]` |

---

## 3. Ship order

1. **PR 1: A1, the in-flight contract fix.** Small, and it fixes live loss. Merge and deploy first.
2. **PR 2: A2 + A3, signature verification in shadow plus `/admin/asol` health.** Deploying it starts the evidence clock for promotion.
3. **PR 3: B + C + D, the ratchets.** Mechanical, and independent of 1 and 2.
4. **PR 4: E, the contract probe.** Needs PR 1, because its CI tests pin A1's marker.

Before each merge, check that `baseRefName` is `master`. Stage explicit paths only, and check file mtimes just before `git add`: other sessions share this checkout.

---

## 4. Workstreams

### A1. In-flight duplicate contract (PR 1)

**Problem.** The in-flight duplicate branches in these three routes return 409 with a body that has no `status: "in_flight"`:
- `src/app/api/feed/route.ts:245-255`
- `src/app/api/economy/sync-event/route.ts:128-132`
- `src/app/api/internal/agent-recipes/route.ts:91-96`

ASOL's `classifyResponse` needs that marker to retry. See row 4 in §1 for what happens to each route without it.

**Change.**
1. Add `inFlightConflict(legacy: Record<string, unknown>)` to `src/lib/hooks/`. It returns 409 with `Retry-After: 1` and the body `{ ...legacy, status: "in_flight" }`. Keep each route's existing `ok`/`success`/`error` fields.
2. Use it in all three routes.
3. Update the comment at `dispatcher.ts:69-71`, because ASOL's contract doc cites that line.
4. In `CLAUDE.md` § Webhooks, change "gets 409" to "gets 409 with `{status: "in_flight"}`. ASOL retries only on that marker."

**Tests.**
- For each route, mock `claimInboundEvent` to return an in-flight duplicate. Assert 409, `body.status === "in_flight"`, and the `Retry-After` header.
- Control: the finished duplicate still returns 200 with `deduplicated: true` and the replayed result.
- Do **not** vendor ASOL's classifier. Copies across repos go stale. Cite `alchm-agents-solana/lib/wten/delivery.ts:isInFlightBody` in a comment instead.

**Not changed:** the status code stays 409.

### A2. Standard Webhooks verification, shadow-only (PR 2)

1. **Mode parsing** (`standardWebhooks.ts`). `getWebhookSignatureMode()` returns `{ mode, raw, valid }`.
   - `off`, `shadow` and `required` are valid. Trim the value and compare case-insensitively.
   - Unset means `off`.
   - Any other value means `shadow` with `valid: false`, plus one `_logger.error` per cold start.
   - Show "misconfigured: `<raw>`" on `/admin/asol`.
   - No aliases.
2. **Raw body.** Each of the three routes reads `await request.text()` once, verifies over those exact bytes, then parses with `JSON.parse`.
   - `feed` currently parses the body twice: `extractWebhookPreview` with `request.clone().json()` and then `request.json()`. Parse once and hand the parsed value to both steps. This also removes the bare cast at `feed/route.ts:85`, counted under C.
3. **Record the outcome.** Add `signature: "valid" | "unsigned" | <failure reason>` to the `summary` given to `claimInboundEvent`.
   - "unsigned" means all three `webhook-*` headers are absent. "missing_headers" means some are present.
   - The summary goes into the immutable `payload` column at insert, so it is written once per event.
   - Events with no idempotency key write no row. ASOL's shared client always sends a key.
4. **Gate order in `required` mode.** Check the bearer or sync secret as today, then check the signature. Both must pass. Removing the bearer is a later phase.
5. **Secret and promotion.**
   - Read the secret from one env var. **Decision needed: see §6.**
   - Add the variable to `launchReadinessService` as presence-only.
   - Changing `ASOL_WEBHOOK_SIGNATURES` to `required` is an operator action in Vercel, not part of this PR. Entry criterion: on `/admin/asol`, every delivery on all three sources is `valid` for ≥ 7 consecutive days, so every ASOL sender, including any weekly job, has delivered while signing.
   - ASOL has **three separate feed senders**: the shared client, `backend/src/services/alchm-kitchen-webhook.ts` (a direct `fetch`), and `backend/feed_emitter.py` (single attempt, no retry). Per-source outcomes are how an unsigned sender shows up.
6. **Idempotency key.** Leave `extractIdempotencyKey` unchanged. When a request carries both `webhook-id` and `Idempotency-Key` and they differ, record `keyMismatch: true` in the summary instead of switching key sources in the middle of a rollout.

**Expected reading after deploy.** Every event shows `unsigned`, because ASOL doesn't sign yet. Anything else before ASOL ships signing means the recorder is wrong. That makes this reading a control.

### A3. `/admin/asol` health that means something (PR 2)

1. **Windowing.** Add `received_at > now() - interval '24 hours'` to the overall and per-source queries, matching `/admin/jobs`' 24 h convention. Keep the all-time totals as a separate labelled figure if they are still wanted.
2. **Split `processing` rows:**
   - `live`: `locked_at` within the last 300 s.
   - `stale`: older than 300 s. A handler died mid-flight, typically Vercel killing it at `maxDuration`.
   - Add `failed` rows in the 24 h window that were never reclaimed.
3. **Signature panel.** Per source over 24 h: counts of valid, unsigned and each failure reason. This is A2's promotion evidence.
4. **Alerts.** Show a banner. Also send the operator alert email only if it goes through the existing per-component alert path; don't invent a new channel. Each threshold names its basis:

| Signal | Threshold | Basis |
|---|---|---|
| Stale locks, 24 h | > 0 | Any stale lock means a handler died. It becomes redeliverable only after 300 s (`STALE_LOCK_SECONDS`). |
| Unreclaimed failures, 24 h | > 0 | ASOL retries a failure only if its retry deadline has not passed, so a failed row may never be redelivered. |
| p95 latency, 24 h, per source | > 50% of ASOL's per-attempt timeout (feed and sync-event 10 s → 5 s; agent-recipes 8 s → 4 s) | ASOL's `WTEN_ENDPOINT_POLICY`. Near the timeout, ASOL times out and retries into in-flight collisions (A1). |
| Signature mode | `valid: false` | A2.1. |

5. **Failure inspection.**
   - Add a server-side `?status=failed` filter. Today's `LIMIT 25` newest rows hide older failures; client-side filtering already exists.
   - `last_error` is `err.message` capped at 1,000 characters. Postgres constraint messages can include key values such as emails. Keep it admin-gated and rendered as text; never use `dangerouslySetInnerHTML`.
   - Raw bodies are not stored (`boundedSummary` only), so there is no "payload" to inspect. Don't add one.
6. **House pattern.** Move `/admin/asol` from its hand-rolled `isAsolHealthOverview` guard and `setInterval` loop to `useAdminResource` with a zod schema in `src/lib/admin/schemas/asol.ts`, plus the compile-time drift guard. The new alert fields are then covered by `tsc`.
7. **Size limit.** `asolHealthService.ts` is 219 lines and the audited limit is 300 per file. Split the SQL and the assembler before adding to it.

### B. Loose optionality, domain 216 → ~193 (PR 3)

1. **`recommendationBridge.ts`: 15 sites.** Narrow the `DayRecommendationOptions` and `UserPersonalizationContext` fields.
   - `/api/recommendations/generate/route.ts:228` then fails to compile. Replace the spread-then-`delete userContext` with `toDayRecommendationOptions(parsed.options)`, which **allowlists** fields and drops `undefined` keys.
   - With an allowlist, a field later added to the zod schema can't slip through. Today's blocklist `delete` lets it.
   - Test: `userContext` from the client never reaches `generateDayRecommendations`.
2. **`WeeklyCalendar.tsx`: 8 of 12 sites.** Narrow the callbacks (`onMealClick`, `onCopyMealClick` ×2, `onFocusDay` ×2, `onToggleExpand`) and the booleans (`isExpanded`, `isSelectedForHero`). Every call site already supplies these.
   - Leave `dailyNutrition` ×2 and `currentPlanetaryHour` ×2 loose. Their values really are optional. Narrowing them would force `{...(x ? {x} : {})}` at every hop, a readability regression bought for a counter.
3. **Key-presence check** before each narrowing. Grep the consumers for `in`, `Object.keys`, `hasOwnProperty`, and spreads over defaults. Destructuring defaults (`mealTypes = [...]`) treat a missing key and `undefined` the same way, so those are safe.
4. **Ratchet** with `bun run lint:debt:ratchet`.

### C. Bare JSON casts, prod 139 → ≤ 130 (PR 3)

Order by trust boundary, not by count per file.

| Site | Why first |
|---|---|
| `src/lib/auth/agentsBridge.ts:76` | Cross-site **identity**: trusts ASOL's `/api/auth/session` shape. |
| `src/app/api/internal/agent-sync/status/route.ts:68` | ASOL contract. |
| `src/app/api/agents/unified/route.ts:475` | ASOL contract. |
| `src/app/api/feed/route.ts:85` | Removed by A2.2 (one body parse). |
| `src/lib/economy/practiceClient.ts:55` | Economy. |
| `src/lib/integrations/deliverect.ts:188, :266` | Restaurant orders and payments. |
| `src/app/api/user/profile/route.ts:128, :258` | User data. |

That is 9 sites, giving 130. Stretch: the draft's 11 UI sites (philosophers-stone, celestial-lab/alchm, InvitePanel, ApiKeysPanel) take it to ~119.

Rules:
- **Derive each schema from the sender's real response.** For `agentsBridge`, read ASOL's session route in `alchm-agents-solana`; don't infer the shape from how WTEN reads it.
- **Invalid means the same as `!res.ok`.** On a `safeParse` failure, return what the path already returns for `!res.ok` (for `agentsBridge`, `null`), so a well-formed response behaves exactly as before.
- **Zod 4 trap:** a `z.unknown()` key is **required**. Mark every optional key `.optional()`.
- **Ratchet** with `bun run check:bare-json:ratchet`.

### D. Single assertions 3,021 → ≤ 2,992 (PR 3)

1. **Fruits sweep: 24 sites.** In `src/data/ingredients/fruits/index.ts`, change `{} as Record<string, number>` and `{} as Record<string, string[]>` to `.reduce<Record<…>>(fn, {})`.
2. **Margin: ≥ 5 more.** Take them from the other `{} as Record<…>` accumulators; about 46 exist across 28 other files, e.g. `herbCuisineMatrix.ts` and `RecommendationAdapter.ts`. Without these, the margin is 3.
3. **Witness.** `tsc` passing does not prove a cast removal is safe. For each file, transpile before and after with `bun build <file> --no-bundle` and diff; the output must be byte-identical. Generic arguments and `as` both erase, so any diff is a real change.
4. **Follow-up, not this phase.** Lines ~185–1631 of `fruits/index.ts` hold `FRUIT_*_INTELLIGENCE` and `FRUIT_DEMONSTRATION_PLATFORM`.
   - `[measured]`: none has an external reference by name. The only dynamic import (`ingredientRecommendation.ts:50`) takes just `fruits`. No `export *` re-exports the module.
   - `_PHASE_34_FRUIT_INTELLIGENCE_SUMMARY` runs `demonstrateAllFruitSystems()` **at module load** on every import.
   - Deleting it removes about 60 assertions and that load-time work, but first prove `demonstrateAllFruitSystems` doesn't mutate `fruits`. Past claims that code was unreachable failed this check 3 out of 3 times.

### E. WTEN ↔ ASOL contract probe (PR 4)

**E1: prod synthetic probe `asol-contract`, read-only.**
- **Positive checks.** Each must return 200 and pass its zod schema:
  - `GET /api/internal/agent-roster` with the bearer
  - `GET /api/economy/sync-status` with `X-Sync-Secret`
  - `GET /api/economy/vessel?email=<probe account>` with `X-Sync-Secret`
  - `POST /api/internal/users/check-shared` with the synthetic probe account's own email (read-only, never a real user's)
- **Negative controls.** Each route called **without** credentials must return 401. This proves the gate actually gates. The verdict logic counts the expected 401 as a pass (see "4xx is not an outage").
- **Wiring.** The probe needs:
  - a `vercel.json` cron (15 exist today)
  - a `cronRegistry` mapping `synthetic-asol-contract` → `asol-contract`
  - an unused minute if it runs hourly or more often (`cronRegistry.test.ts` enforces this)
  - a timeout at or above the slowest endpoint's floor
  - results recorded in `synthetic_probe_results`
- **Where.** Put it in a new module. `syntheticProbeService.ts` is already 910 lines.

**E2: CI contract tests.** Route-level tests cover the idempotency loop against mocked claim outcomes:
- fresh → processed
- duplicate after finishing → 200 replay
- duplicate while in flight → 409 `{status: "in_flight"}`
- failed → reclaimable

These prove the routes handle claim outcomes correctly. They do **not** prove the SQL; there is no real Postgres in CI. The claim SQL was verified with PGlite in #868.

---

## 5. Verification

Before each commit:

```sh
bunx eslint --config eslint.config.audit.mjs <new and changed paths>
```

This must report zero audited violations, because the declined pool has no headroom:
- 300 lines per file and 50 per function
- every `as` counts, including `as const` and those in tests
- cast syntax inside string literals counts

Before each PR:

```sh
bun run verify:static
bun run test --passWithNoTests
bun run build
```

Per-workstream witnesses beyond green gates:

| WS | Witness |
|---|---|
| A1 | Route tests assert the marker. After deploy: `/admin/asol` shows no `rejected` or `already_applied` in-flight losses. Cross-check against ASOL's delivery log if reachable. |
| A2 | After deploy: 100% `unsigned` per source (the control from A2). `ASOL_WEBHOOK_SIGNATURES=bogus` locally shows `misconfigured` and still passes requests. |
| A3 | A seeded stale `processing` row (locked 10 min ago) raises the stale-lock alert. The same row locked 10 s ago does not. |
| B | `tsc` passes, and a test proves `userContext` is dropped by the allowlist adapter. |
| C | Each schema is checked against a real captured response or the sender's source, never one inferred from WTEN's reader. |
| D | Byte-identical output from `bun build --no-bundle` for every touched file. |
| E | The probe runs locally against prod once and every negative control returns 401. |

---

## 6. Decisions needed

1. **Signing-secret env var name.** ASOL's design doc uses `HOOK_SECRET_ASOL`. Recommendation: use that same name on WTEN, so there is one name across both repos. This must be agreed with the ASOL session before A2.5.
2. **Promotion window** for `required`: 7 days of 100% valid is recommended (basis in A2.5). A shorter window risks never seeing a weekly sender.

## 7. ASOL handoff

Carry this to an ASOL session. Per the 09-23 ruling, ASOL is not modified from a WTEN session.

1. Flip `receiverDedupes: true` for `feed` and `agent-recipes` only after ASOL retries WTEN's in-flight 409 on those endpoints: either A1's marker is live, or ASOL's own classifier treats their 409 as in-flight. **Keep `sync-event` at `false`.** `QuestService.reportEvent` (`src/services/QuestService.ts:404`) increments each matching quest in a loop with no transaction, so re-running a failed event double-counts the quests that already incremented. Making it atomic is a WTEN follow-up and is not part of Phase 40.
2. `WTEN_CONTRACT.md:58` cites WTEN's `dispatcher.ts:69-71`. Repoint it to A1's shared helper.
3. `lib/alchm-event-sync.ts:46` says "WTEN does not dedupe sync-event yet". That has been stale since #869.
4. Signing must cover every live feed sender: the shared client (`lib/agents/feed-pusher.ts`) and `backend/feed_emitter.py`, which is live because Railway has built from ASOL `main` since 09-23. `backend/src/services/alchm-kitchen-webhook.ts` has no deployment according to `WTEN_CONTRACT.md` §6. Set `webhook-id` to the existing `Idempotency-Key` value.

The full ASOL session prompt was handed to the user separately; it is not committed to either repo.
