# Alchm.kitchen MCP upgrade research

**Outcome:** Implemented a compatible 1.3.0 upgrade covering evidence reuse, authorization and billing, bounded execution, correlation, telemetry and packaging. The implementation, review results, validation and remaining release work follow the preserved source baseline below.

Date: October 17, 2026. This is the **pre-upgrade source baseline**, captured before the development work accompanying this investigation. WTEN baseline: `b1fc28666cabbec8ddcf84a14fdf949837c23d54`; Planetary Agents baseline: `f83f3d5c0c08204aac7cdea8a191a5b7e646e9bf`. Local source inspection and official protocol documentation establish the findings below; they do not establish the deployed npm package, production configuration, traffic, or measured production latency. Subsequent implementation can resolve findings without changing this baseline record.

## Assessment

The best immediate upgrade is to make the existing eight tools consistent, bounded, and safe to compose. The requested domain expansion is already present in source: `compute_triplicate_synastry`, `create_evidence_snapshot`, and `submit_recipe_reflection` join the five older tools, and the package identifies itself as 1.2.0. The README still documents five tools and the registry descriptor still points at 1.1.2. Adding the same tools again would miss the actual integration gaps. [Package](../../mcp-server/package.json), [tool union](../../src/lib/mcp/tools.ts), [README](../../mcp-server/README.md), [registry descriptor](../../mcp-server/server.json).

Planetary Agents Phase 4 is implemented locally: shared evidence, a four-request bridge semaphore, request-ID response routing, child-environment sanitization, and telemetry draining. Its Phase 5 durable councils are explicitly a plan. WTEN should support Phase 4's contracts now and provide a reliable publication boundary for eventual councils; it should not claim the planned orchestration already exists. [Phase 4 record](/Users/cookingwithcastro/Desktop/AlchmAgentsSolana/docs/development/mcp-phase4-2026-10-17.md), [Phase 5 plan](/Users/cookingwithcastro/Desktop/AlchmAgentsSolana/docs/development/mcp-phase5-plan.md).

## Existing capabilities and concrete gaps

| Area | Source baseline | Upgrade implication |
| --- | --- | --- |
| Official transport | WTEN uses the official TypeScript SDK and stdio transport; the lockfile resolves SDK 1.29.0 despite the manifest's `^1.0.1` range. | Keep stdio compatible while improving the tool boundary. An SDK/protocol migration is a separate compatibility decision. |
| Structured results | Success and error payloads are serialized only into text; no advertised `outputSchema`, `structuredContent`, or behavior annotations. | Publish machine-readable contracts and preserve JSON text for existing clients. |
| Evidence aggregation | Snapshot gathers sky, ingredient analysis, and recipes in parallel. | Preserve this existing aggregation; correct its shared contract, charging, and failure semantics. |
| Rate limiting | A per-process sliding window already limits API-key or anonymous buckets. | Rate limits do not bound simultaneous work. Add an admission/concurrency limit and cancellation/deadline propagation. |
| Authentication | API-key hashing, key expiry checks, environment credentials, and a synthetic-probe secret path already exist. | Explicitly distinguish trusted probe context from caller data; do not describe authentication as missing wholesale. |
| Telemetry | Invocation rows, redaction, timing, and error-cause chains already exist. | Add correlation, robust redaction, bounded pending writes, and graceful flush. |

Sources: [stdio entry](../../mcp-server/src/index.ts), [dependency lock](../../mcp-server/bun.lock), [snapshot handler](../../src/lib/mcp/tools.ts), [limiter](../../src/lib/mcp/rateLimit.ts), [auth](../../src/lib/mcp/auth.ts), [invocation log](../../src/lib/mcp/invocationLog.ts).

### 1. Snapshot fields currently disagree across the two servers

WTEN produces `snapshotId`, `timestamp`, `liveSky`, `alchemicalScan`, and `candidateRecipes`. PA's `EvidenceSnapshot.to_dict()` produces `snapshotId`, `createdAt`, `skyTransits`, `alchemicalScan`, and `recipeCandidates`; its hydration path reads those canonical names, snake-case variants, or individual context fields. It does not read WTEN's `liveSky` or `candidateRecipes` aliases. Passing the WTEN object through as `evidenceSnapshot` therefore misses sky and recipe reuse. This is a direct code-path inference, not a production performance measurement. [WTEN snapshot](../../src/lib/mcp/tools.ts), [PA snapshot model](/Users/cookingwithcastro/Desktop/AlchmAgentsSolana/backend/mcp_context.py), [PA hydration](/Users/cookingwithcastro/Desktop/AlchmAgentsSolana/backend/main.py).

Recommended shared shape: `schemaVersion`, `snapshotId`, `createdAt`, `skyTransits`, `alchemicalScan`, `recipeCandidates`, and `metadata`. Preserve the old WTEN fields as compatibility aliases during transition. Record coordinates, effective observation time, component status, catalog revision where available, and a bounded expiry. A generated ID identifies an observation; it does not prove caller-supplied evidence is authentic. Treat preloaded external evidence according to its trust boundary rather than equating a supplied ID with server attestation. This recommendation follows the mismatched implementations above.

The baseline snapshot also uses `Promise.all`, then reports `ok: true` and extracts component `.data` without failing on a returned component error. A thrown component rejects the aggregate entirely, whereas a resolved component failure can become a silent `null`. Give each component explicit success/error/skipped status and define whether a partial snapshot is usable. Reuse one observation time across components rather than separately sampling the clock. [Snapshot composition](../../src/lib/mcp/tools.ts).

### 2. Paid operation policy currently fails open

`TOOL_COSTS` sets recipes at 2.5 per ESMS axis, while the tool description and README advertise 7.5. `debitForTool` returns `anonymous-caller`, `db-unavailable`, or `service-unavailable` without applying a charge. `invokeTool` blocks only `insufficient-*`, so these other outcomes still run paid handlers. Additionally, the free snapshot calls `generateCosmicRecipe` directly, creating another route to recipe data outside the recipe tool's charging boundary. These are source-confirmed behavior gaps; they do not prove the intended product price. [Costs and debit outcomes](../../src/lib/mcp/auth.ts), [dispatch and snapshot](../../src/lib/mcp/tools.ts), [advertised price](../../mcp-server/src/index.ts).

Define one authoritative price and explicit rules for anonymous access, probe exemptions, compound snapshots, and unavailable billing. Validate inputs before charging. Charge paid components once, and make ESMS settlement atomic: the current four-axis loop explicitly accepts partial debit if a later axis fails. Add idempotency before exposing retryable charged writes. The snapshot must follow the same policy as direct recipe retrieval; a trusted council may use a specifically scoped exemption rather than an implicit bypass. [Current multi-axis debit](../../src/lib/mcp/auth.ts).

Tightening this boundary requires a paired PA credential path. PA's child whitelist passes runtime variables, `DATABASE_URL`, and `ALCHM_MCP_*`, but strips `MCP_USER_API_KEY`. It maps `ALCHM_MCP_DATABASE_URL` to the child database variable and has no equivalent API-key mapping. Use an explicitly scoped child credential or authenticated per-call delegation. Prefer a WTEN-specific database credential over automatically inheriting the PA application's broad database identity. [PA launch environment](/Users/cookingwithcastro/Desktop/AlchmAgentsSolana/backend/alchm_mcp.py).

### 3. Reflection attribution and delivery need an authorization contract

`resolveReflectionAuthor` starts with the authenticated caller but replaces its author ID with any existing agent selected by `agentSlug`. There is no authorization relationship checked between that caller and the selected agent in this path. An anonymous caller can also resolve an agent author if the database lookup succeeds. With the fail-open billing behavior above, the presence of an agent slug is not proof of permission to publish as that agent. Bind authorship to an authenticated principal, or require a narrowly scoped agent-publication capability and record the submitting principal separately. [Author resolution and reflection submission](../../src/lib/mcp/tools.ts).

The reflection record is created before the feed publication. Feed failure is caught and the tool returns `ok: true` with `published: false`. This can be a valid partial-success contract, but it is not atomic dual-write settlement. Extend the receipt with durable publication state and an idempotency key; use an outbox/retry worker for reliable feed mirroring. Otherwise a caller retry after a lost response can create another reflection or debit. This is especially relevant to PA Phase 5's planned publication/recovery workflow. [Current write sequence](../../src/lib/mcp/tools.ts), [Phase 5 WTEN federation plan](/Users/cookingwithcastro/Desktop/AlchmAgentsSolana/docs/development/mcp-phase5-plan.md).

### 4. Telemetry redaction misses a credential already accepted by auth

The logger redacts `apiKey` and `authKey` inside `_meta`, but copies `_meta.internalSecret` unchanged. The authentication module accepts that exact field for synthetic-probe identity. Consequently a probe invocation can persist its authentication secret in `mcp_invocations.arguments`. Redact sensitive keys recursively across metadata, nested arguments, result summaries, and diagnostic errors, with bounded depth and payload size. Add a regression fixture that asserts the original secret never appears in persisted JSON. [Redaction](../../src/lib/mcp/invocationLog.ts), [synthetic authentication](../../src/lib/mcp/auth.ts).

WTEN starts logging with `void recordInvocation(...)` and has no tracked-drain lifecycle in its entrypoint. PA explicitly tracks writes and drains them on shutdown. Add a bounded pending-write registry and a short shutdown drain, honoring stdin EOF as well as process signals. Propagate `requestId`, `traceId`, caller, and evidence ID through tool context, HTTP fetches, and log summaries. PA already defines the matching `X-Request-ID`, `X-Trace-ID`, `X-Invocation-Caller`, and `X-Evidence-Snapshot-ID` headers. [WTEN dispatch](../../src/lib/mcp/tools.ts), [WTEN lifecycle](../../mcp-server/src/index.ts), [PA correlation](/Users/cookingwithcastro/Desktop/AlchmAgentsSolana/backend/mcp_context.py), [PA write tracking](/Users/cookingwithcastro/Desktop/AlchmAgentsSolana/backend/mcp_invocation_log.py).

## Current protocol research

The official `latest` specification now resolves to **2026-07-28**. It has a stateless core and per-request capability negotiation. The existing server and PA bridge still use the older `initialize` lifecycle, so changing a declared protocol version string would not implement the new protocol. [Current specification](https://modelcontextprotocol.io/specification/2026-07-28), [PA bridge initialization](/Users/cookingwithcastro/Desktop/AlchmAgentsSolana/backend/alchm_mcp.py).

The official TypeScript repository identifies v2 (`@modelcontextprotocol/server` and `@modelcontextprotocol/client`) as the stable line implementing that revision. V1 remains supported for bug/security fixes for at least six months after the July 27, 2026 v2 release. A deliberate migration is warranted, with time to ship compatible correctness fixes first. [Official SDK status](https://github.com/modelcontextprotocol/typescript-sdk).

V2 constructors keep legacy protocol behavior by default; modern serving/negotiation is an explicit opt-in. Use the SDK's documented era support instead of hand-writing `server/discover` and legacy fallbacks. The migration also changes imports and handler APIs, so it needs an actual bundled artifact test. [Protocol migration guide](https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28), [SDK migration guide](https://ts.sdk.modelcontextprotocol.io/v2/migration/upgrade-to-v2).

Tool output schemas and structured results make contracts discoverable; when an output schema is supplied, returned structured results must conform. Keep serialized JSON text alongside structured content for compatibility. The specification distinguishes malformed requests/unknown tools as protocol errors from actionable tool execution failures using `isError`. Input validation, access controls, rate limiting, and output sanitization remain server responsibilities. [Tool specification](https://modelcontextprotocol.io/specification/2026-07-28/server/tools).

Stdio requires protocol-only stdout. Cancellation refers to the request ID; servers should stop work promptly. EOF is the primary portable graceful-shutdown signal. Upgrade the current smoke harness, which ignores malformed stdout and kills the child immediately, to assert framing and graceful completion. [Stdio specification](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/stdio), [existing smoke harness](../../mcp-server/src/__tests__/stdio.test.ts).

For stdio, environment credentials remain the recommended credential path. A future remote HTTP endpoint should implement MCP's HTTP authorization model rather than copying the current arguments-based API-key convention: OAuth protected-resource discovery, audience-bound tokens, and authorization on every request. [Authorization specification](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization).

Durable councils can eventually expose the opt-in Tasks extension, which provides task handles, status polling, and reconnectable results. This protocol feature does not itself persist the application's council state or implement recovery. Build the planned PA durable-run model first; avoid turning ordinary fast WTEN reads into jobs. [Tasks extension](https://modelcontextprotocol.io/extensions/tasks/overview), [PA durable-run plan](/Users/cookingwithcastro/Desktop/AlchmAgentsSolana/docs/development/mcp-phase5-plan.md).

## Prioritized development roadmap

These are recommendations derived from the cited gaps, not claims that each item is already implemented.

| Priority | Deliverable | Acceptance evidence |
| --- | --- | --- |
| P0 | Close auth, attribution, credential-log, and paid snapshot bypasses. Resolve price/documentation drift. | Anonymous/invalid/expired key tests; denied agent impersonation; billing outage fails as defined; no secret appears in log fixtures; direct and compound recipe requests follow one cost policy. |
| P1 | One tool registry owns names, schemas, behavior annotations, validation, cost metadata, and dispatch. Emit structured results plus text. | Discovery and implementation cannot drift; invalid coordinates, oversized arrays/strings, malformed natal data, and unknown tools fail before charging or calling dependencies. |
| P1 | Align the evidence contract with PA; add component status and provenance. | A real WTEN snapshot fed into PA hydration results in no extra sky, ingredient, or recipe calls; existing WTEN field aliases still work. |
| P1 | Bounded admission, deadlines/cancellation, correlated context, and telemetry drain. | Slow calls cannot exceed configured concurrency; waiting work can cancel; deadlines reach dependency fetches; EOF drains bounded telemetry then exits; response IDs remain correct under out-of-order completion. |
| P2 | Paired PA integration update. | Pin only a verified published WTEN version; expand the PA allowlist to intended new tools; explicitly pass scoped WTEN credentials; support structuredContent and legacy text; verify both local-source and package launch. |
| P2 | Atomic/idempotent billing and reflection receipt/outbox. | Parallel retry of one operation settles once; failure on any ESMS axis leaves balances unchanged; reflection/feed delivery recovers after a forced restart without duplicate publication. |
| P2 | SDK v2 and negotiated modern protocol serving, with legacy compatibility. | Legacy PA 2025 handshake still works; modern discovery and per-request metadata work; source, npm bundle, and optional native sidecar pass the same contract fixtures. |
| P3 | Resources/prompts for catalog and workflow guidance; remote Streamable HTTP; Tasks for durable council workflows if clients require them. | Explicit consumer/use case, authorized data boundaries, supported-client matrix, and the relevant protocol conformance checks. |

## Verification and release boundaries

Use deterministic fixtures for chart/network/billing dependencies in contract tests; the existing stdio smoke test points at production and inherits the full process environment. Add a production-independent stdio probe that verifies initialized notification, discovery, a harmless local tool, invalid calls, structured/text agreement, concurrent routing, clean stdout, and EOF shutdown. Keep optional live checks separate from release-gating deterministic tests. [Existing test environment and protocol sequence](../../mcp-server/src/__tests__/stdio.test.ts).

The PA bridge remains pinned to `@alchm/mcp-server@1.1.2` and explicitly rejects tool names outside its five-tool allowlist. Updating WTEN source alone therefore does not upgrade package consumers or make the three newer tools callable through PA. Coordinate its follow-up after the WTEN package is built, verified, and published; document the remaining cross-repository dependency if that release is outside the current change. [PA package and allowlist](/Users/cookingwithcastro/Desktop/AlchmAgentsSolana/backend/alchm_mcp.py).

Release records should distinguish local tests, built artifacts, published registry versions, and deployed production state. No npm publication, deployment, live database mutation, or external feed publication was performed for this research.

## Implementation follow-through: 1.3.0

This investigation produced a compatible 1.3.0 upgrade in this checkout. The baseline findings above remain historical observations of the pinned commits, rather than descriptions of the upgraded source.

- A shared, dependency-free tool catalog now supplies discovery and runtime validation. The eight-tool surface validates bounded coordinates, strings, arrays, natal shapes, zodiac signs, amounts and timestamps before authentication or debit. Results supply structured content and equivalent JSON text; unknown tool names are JSON-RPC `InvalidParams` errors at the transport boundary.
- Snapshots retain the original kitchen fields and add PA's `createdAt`, `skyTransits` and `recipeCandidates` aliases. One captured observation time, detached/frozen JSON evidence, a canonical SHA256 content hash and per-component provenance support reuse. Independent sources settle separately; a required-source failure returns an error with available evidence preserved.
- Authenticated recipe search and snapshots both charge 2.5 of each ESMS quantity. The existing culinary action service settles the whole basket and any Swapping Bridge legs inside a database transaction; refusal forces rollback. An invalid explicit key or unavailable authentication/payment service cannot silently become a paid authenticated success. Anonymous read/demo access and explicit internal synthetic exemptions remain deliberate policies.
- Reflection writes require an authenticated, non-synthetic key owner. Supplying another agent's slug cannot change the author; the name comes from the account record. The response includes separate feed and interaction outcomes. Shared natal-cache writes require the internal credential, and a cache read no longer upserts natal positions.
- Four admitted invocations bound process work; excess calls return `BUSY` without building an unbounded queue. A cooperative 20-second deadline and MCP cancellation reach chart fetches. Request/trace/evidence identifiers propagate in scoped context and PA-compatible correlation headers, with correlation IDs in responses and telemetry.
- Structured logs recursively redact credentials and reflection bodies. Pending telemetry is tracked and drained for up to one second on EOF, SDK closure and process signals. Application initialization logs go to stderr before importing handlers, preserving protocol-only stdout.
- The SDK is updated within its compatible maintenance line to 1.32.1. Package, handshake and registry descriptors all identify 1.3.0. The Node bundle and native sidecar build; the macOS build repairs and verifies the binary's ad-hoc signature and disables implicit dotenv/bunfig autoloading. The package now has explicit typecheck and deterministic stdio-test commands. [Official SDK release](https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/1.32.1).

Sources for the implementation: [catalog](../../src/lib/mcp/catalog.ts), [input schemas](../../src/lib/mcp/inputSchemas.ts), [validation](../../src/lib/mcp/validation.ts), [invocation and authorization](../../src/lib/mcp/tools.ts), [billing](../../src/lib/mcp/auth.ts), [snapshot construction](../../src/lib/mcp/evidenceSnapshot.ts), [execution context](../../src/lib/mcp/execution.ts), [telemetry](../../src/lib/mcp/invocationLog.ts), [transport](../../mcp-server/src/index.ts), [operator documentation](../../mcp-server/README.md).

### Standards review

One finding: `dominantElement` initially allowed the ESMS quantity Spirit. Resolved by restricting the contract to Fire, Water, Earth and Air, with a regression test. No remaining actionable documented-standard findings.

### Spec review

Four findings: malformed zodiac signs passed validation; unknown tool names used a tool-error envelope; reflection text contradicted the logging documentation; and shutdown did not drain pending telemetry. All four were resolved and covered by validation, wire-protocol or logging tests. No remaining actionable findings from this review.

### Remaining release and integration work

No npm or registry publication, production deployment, live database write, or external feed publication was performed. PA's package pin and five-tool allowlist still require a paired follow-up after publication. The scoped `ALCHM_MCP_USER_API_KEY` alias is now supported by kitchen, but the operator must explicitly supply that credential and the correct WTEN database configuration; PA's own database is not automatically a kitchen authentication database.

Payment basket settlement is atomic, but the charge, reflection record and feed publication are still separate steps. Retrying a paid call can charge again, and retrying a reflection can create a duplicate. Durable idempotency, a publication outbox/refund policy, distributed quotas, remote HTTP/OAuth, typed output schemas/resources/prompts, and the paired SDK v2 protocol migration remain future work. Cancellation is cooperative and does not claim rollback of already committed effects. Live PostgreSQL settlement and production chart accuracy were not exercised by the deterministic tests.

### Validation results

Final validation completed October 18, 2026.

- Final application run: **579 suites / 6,017 tests passed**, with five suites / 35 tests skipped. This includes the existing 34 skips and one explicitly excluded optional comparison in `src/lib/esms-chain/__tests__/tokenMetadata.test.ts`: three sibling ASOL manifests are iCloud `dataless` placeholders, causing synchronous reads to stall. The self-contained pinned-digest, identity, icon and routing checks remain enabled. An earlier unfiltered full run passed all 6,018 tests before that filesystem condition was encountered. The determinism tests require local IPC permission, which was available for the final run.
- Focused MCP unit coverage: **six suites / 87 tests passed**, covering auth, payment refusal/rollback, attribution, input bounds, snapshots, cache reads, correlation, execution limits, log redaction and telemetry drain.
- Real stdio protocol: **nine tests each passed against source, Node bundle and signed Bun binary** (27 in total), including structured/text equivalence, validation, unknown-tool protocol errors, partial evidence, clean stdout, EOF and signal exit.
- Application and package TypeScript checks passed. Focused MCP/source lint passed with zero warnings. Both bundle and native sidecar builds passed; the existing `astronomy-engine` default-export compatibility warning remains.

- Full `bun run verify:static` passed, including all 284 gate tests, application/script typechecks, lint, the lint-debt audit and dead-module audit. Lint debt decreased from 1,218 to 1,216; assertion sites decreased from 2,864 to 2,859; the declined-rule pool decreased from 4,668 to 4,666. No baseline was increased.

## Implementation follow-through: 1.4.0

Date: October 24, 2026. Built on the 1.3.0 commit `7be623f9` (branch tip `9f210d82a`). The 1.3.0 record above is unchanged; this section describes what 1.4.0 found and changed.

### Defects found in 1.3.0

- **Reflections were never stored.** The MCP handler wrote `contentState: "reviewed"`, but migration 94 only allows `proposed`, `verified` or `rejected`. `createReflection` caught the CHECK violation and returned an in-memory record with an invented id. Every authenticated 1.3.0 reflection was therefore charged 0.4 ESMS, reported `ok: true`, and left no row; its feed event pointed at a reflection that did not exist. [Reflection service](../../src/services/recipeReflectionsService.ts), [migration 94](../../database/init/94-agent-publications-and-recipe-reflections.sql).
- **Paid reads charged before running.** A failed recipe search or a partial snapshot still cost 10 ESMS. The rest of the app charges on delivery. [Feature charges](../../src/lib/economy/featureCharge.ts).
- **Recipe search was always empty in the standalone server** (this predates 1.3.0). `LocalRecipeService` reads its Redis cache through Next's `unstable_cache`, which throws outside a Next.js request; `RecipeService` turned that into an empty catalog. Authenticated callers were charged for zero recipes. [Recipe catalog](../../src/services/LocalRecipeService.ts).

### What changed

- **Reflection integrity.** New reflections are `proposed`, as on the feed route, and the service's TypeScript type now matches the database enum. The in-memory fallback stands in only when no database is configured; inside a transaction, or with `DATABASE_URL` set, a failed insert surfaces. The input limit matches the column's 4000-character CHECK, and text that is empty once control characters are stripped is rejected before any charge.
- **Settlement on delivery.** Paid reads run first and settle only on success; a refused settlement withholds the result. A reflection's debit, row, feed event, interaction mirror and feed link share one transaction, with a savepoint so a failed publication rolls back alone while the paid reflection commits. Its Planetary Agents webhook is skipped, as on the feed route.
- **Idempotent retries.** Optional `_meta.idempotencyKey` becomes a ledger key hashed from account, tool and key. Settlement takes a transaction-scoped advisory lock, probes the ledger by exact key, and records `<tool>#<argument fingerprint>` in `source_id`. A matching retry within 24 hours replays without charging; a mismatched or older reuse returns `CONFLICT`. A replayed reflection returns the stored row and re-attempts a failed publication unless the reflection has been moderated. The economy service's own replay probe now matches exact per-axis keys, so it uses the idempotency index instead of scanning the ledger.
- **Typed results.** Every tool publishes a `title` and an `outputSchema` accepting its success payload or the shared error envelope (the TypeScript SDK client validates error results too). Paid results carry a `billing` receipt; `BUSY` carries `retryAfterSec`; prices live in the catalog beside each tool's contract; settlement moved from `auth.ts` to `billing.ts`.
- **Validator.** `null` is a supported type, and an `undefined` property counts as absent, as in JSON. The in-process synthetic probe passes `internalSecret: process.env.INTERNAL_API_SECRET`, which is undefined when unset; 1.3.0 rejected that as `INVALID_ARGS`.

Sources: [catalog](../../src/lib/mcp/catalog.ts), [output schemas](../../src/lib/mcp/outputSchemas.ts), [billing](../../src/lib/mcp/billing.ts), [invocation](../../src/lib/mcp/tools.ts), [validation](../../src/lib/mcp/validation.ts), [economy service](../../src/services/agentEconomyActionService.ts), [operator documentation](../../mcp-server/README.md).

### Independent review

Three read-only reviews ran against the change: PostgreSQL transaction and concurrency semantics, the published contract, and billing abuse. None found a path that charges a caller without storing the reflection, stores one without payment, replays or probes another account's key, or produces a payload that fails an advertised schema (checked with the SDK's ajv and Python `jsonschema` across success and error paths, the full recipe and ingredient catalogs, and real-database paths).

Their confirmed findings and outcomes:

- The empty standalone catalog (above): fixed, with an end-to-end regression test.
- A keyed retry could buy fresh results indefinitely: replays are now limited to 24 hours.
- A replay could republish a moderated reflection whose feed event had been deleted (`ON DELETE SET NULL`): moderated reflections are no longer republished.
- The economy service's `LIKE '<key>:%'` replay probe scanned the whole ledger on every keyed call: replaced with an exact, index-backed probe.
- Control-character-only text failed with `INTERNAL`: now `INVALID_ARGS` before charging.
- Two README statements were inaccurate (when `billing` appears; where the raw key is kept): corrected.

### Decisions left to the owner

- **Free recipes inside a partial snapshot.** A partial snapshot is an error and is not charged, but its data includes the recipe candidates. This gives away nothing that anonymous demo mode does not, so it is unchanged; if demo mode is ever restricted, strip priced components from unsettled partial snapshots.
- **No Planetary Agents webhook for MCP reflections.** 1.3.0 pushed agent-authored MCP reflections to PA's `/api/feed`. 1.4.0 publishes inside the settling transaction, where the push would precede the commit, so it skips the push, as the feed route does for PA-originated events. If PA relies on that push for reflections it did not originate, send it after the transaction commits instead.

### Remaining release and integration work

The 1.3.0 items stand: publish the package and registry metadata, then update PA's version pin and five-tool allowlist and pass its scoped credential. Not addressed here:

- With a transient database error inside a transaction, the economy service falls back to an empty in-memory balance and reports insufficient funds, so the caller sees `QUOTA` for a fault it should retry. Nothing is charged.
- On the feed route, the agent reflection charge autocommits before the reflection insert, outside a transaction.
- Resources, prompts, SDK v2 and remote HTTP/OAuth were not added; each still needs a named consumer.
