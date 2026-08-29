# alchm.kitchen (WTEN) — Solana Mainnet Sync Roadmap & Prompt-by-Prompt Execution Blueprint

**Document Version:** `2.0.3-PROD`

**Last Progress Update:** `2026-08-29`

**Companion Document:** `AlchmAgentsSolana/docs/SOLANA_MAINNET_MIGRATION_ROADMAP.md` (v2.0.0-PROD)  
**Program ID (sibling authority):** `5QheuqaicKvPPRFEoEXwaE5xaFp7gauvJCfsjpQv8WzD`  
**Runtime & Toolchain:** Bun `1.3.13` | Next.js | Jest | raw SQL via `@/lib/database`  
**Authoritative Ledger:** PostgreSQL `token_balances` / `esms_onchain_claims` — `DECIMAL(12,4)`  

---

## 1. Executive Summary & Grounded Codebase Findings

A rigorous audit of the WhatToEatNext (WTEN) repository and the sibling `AlchmAgentsSolana` (ASOL) codebase yields five critical architectural corrections and four hard schema blockers that define the exact execution sequence for Solana Mainnet synchronization.

### Part I — Codebase Corrections

- **C1: The Premise Correction (Cross-Repo Architecture)**  
  ASOL does not share direct database access to WTEN's `esms_onchain_claims` table. ASOL maintains its own Prisma database (`bridge_transfer(source_chain, target_chain, ...)`, `verified_solana_wallet`, `solana_sync_outbox`), with cross-site synchronization executing over authenticated HTTP endpoints (`/api/economy/sync-{credit,debit,event}`) touching `token_balances`.  
  The unscoped join in [src/services/chainReconcileService.ts:196](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/chainReconcileService.ts#L196) remains a real defect: it fires when WTEN grows a second rail or reconciles multi-chain entries.
- **C2: Shipped Capabilities vs. New Scope**  
  The `esms-spl-mirror` subsystem already exists in [src/services/launchReadinessService.ts:204-214](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/launchReadinessService.ts#L204-L214), and [src/lib/esms-chain/__tests__/solanaMirror.test.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/esms-chain/__tests__/solanaMirror.test.ts) already pins literal-"true", 3-of-4 failure, base58 rejection, devnet defaults, explorer cluster suffixes, and `.env.example` validity. The genuine new work is surfacing the distinct `misconfigured` state and asserting the runtime zero-signer boundary.
- **C3: Five Extensions Define the Mint (Ground Truth)**  
  Per ASOL's on-chain `validate_existing_mint` ([programs/asol_program/src/instructions/esms.rs:388-399](file:///Users/cookingwithcastro/Desktop/AlchmAgentsSolana/programs/asol_program/src/instructions/esms.rs)), the Token-2022 mints require five extensions:
  1. `NonTransferable`
  2. `PermanentDelegate` (equal to program authority PDA)
  3. `MetadataPointer`
  4. `TokenMetadata`
  5. `PermissionedBurn`  
  plus `decimals == 4`, `mint_authority == program authority PDA`, and `freeze_authority == None`.
- **C4: The Metadata URI 404 Blocker (WTEN Blocks ASOL)**  
  All live Devnet mints carry `uri = https://alchm.kitchen/metadata/esms/*.json`. WTEN currently serves no route, file, or rewrite at this path, returning 404s. Because `TokenMetadata` has no on-chain update instruction in `asol_program` and the Devnet mints lack `CloseAuthority`, WTEN must either host these files or coordinate the permanent Arweave freeze in ASOL Phase 4.
- **C5: Reconciler Job Scoping**  
  Only Jobs 1 (`settleStaleClaims`) and 3 (`checkWalletInvariants`) in [src/services/chainReconcileService.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/chainReconcileService.ts) touch claims. Job 2 (`healBurnedPurchases`) audits shop purchases, and Job 4 (`backfillPendingNfts`) handles recipe NFTs.

---

### Part II — Physical Schema Blockers & Invariant Vulnerabilities

- **B1: Four Schema Blockers in `esms_onchain_claims`** ([database/init/56-esms-onchain-claims.sql](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/database/init/56-esms-onchain-claims.sql)):
  1. `wallet_address VARCHAR(42)` $\rightarrow$ Postgres errors on Solana base58 addresses (32–44 chars, typically 43–44). `createPending` catches and returns `null`, silently dropping the claim.
  2. `tx_hash VARCHAR(66)` $\rightarrow$ Fails on Solana transaction signatures (64 bytes $\rightarrow$ 86–88 base58 characters).
  3. `claim_id VARCHAR(66)` $\rightarrow$ Holds EVM `keccak256("esms-claim:<id>")`. Must accommodate Solana's `CLAIM_RECEIPT_SEED` PDA derivation.
  4. `uniq_esms_onchain_claims_pending ON (user_id)` $\rightarrow$ Restricts each user to one in-flight claim across *all* chains. Must become `(user_id, target_chain)`.
- **B2: Uncovered Readers & SQL CI Gates**  
  The claims table is referenced across six files: [src/types/economy.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/types/economy.ts#L82-L88), [src/app/api/cron/chain-reconcile/route.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/api/cron/chain-reconcile/route.ts), [src/services/economyIntegrityService.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/economyIntegrityService.ts), [src/services/esmsOnchainClaimService.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/esmsOnchainClaimService.ts), [src/services/chainReconcileService.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/chainReconcileService.ts), and [src/services/tokenEconomyQueries.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/tokenEconomyQueries.ts).  
  Changes must be verified by the SQL PREPARE gates in [scripts/checkEconomySqlParses.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/scripts/checkEconomySqlParses.ts) (`EXPECTED_TOTAL = 44`) and [scripts/checkEconomyStatementBehaviour.mjs](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/scripts/checkEconomyStatementBehaviour.mjs).
- **B3: Invariant Epsilon Defect (Full-Quantum Blind Spot)**  
  In [src/services/chainReconcileService.ts:210](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/chainReconcileService.ts#L210), `EPSILON = 0.0001` equals exactly 1 Solana atom at `decimals = 4` ($10^{-4}$). The smallest representable Solana over-mint sits exactly on the boundary and is never flagged. Epsilon must be rail-keyed (tolerance on Base 18-dp, exact integer comparison on Solana 4-dp).
- **B4: Invariant Scan Sampling Defect**  
  `checkWalletInvariants` queries `LIMIT 20` over `GROUP BY` without `ORDER BY`, repeatedly scanning the same 20 wallets while reporting "0 violations". Must adopt deterministic hourly rotation (e.g. `md5(user_id || hour)`) matching the `healBurnedPurchases` pattern.

---

### Part III — Token Value & Precision Model

#### The 4-Rung Precision Ladder

```
Rung 1: Wave-Function Quantization  →  10⁻⁶  (ADR-013 §3)
Rung 2: Authoritative Ledger        →  10⁻⁴  (PostgreSQL DECIMAL(12,4))
Rung 3: Base Settlement Rail        →  10⁻¹⁸ (parseUnits(v, 18))
Rung 4: Solana Settlement Rail      →  10⁻⁴  (ESMS_DECIMALS = 4)
```

- Micro-ESMS resolution ($10^{-6}$) is floored at the ledger ($10^{-4}$), meaning sub-quantum resolution is lost at ledger entry, never on-chain.
- Solana 4-decimal precision matches the ledger exactly with zero fractional dust.
- Base scales to 18 decimals ($10^{14}$ raw atom gap); the two on-chain integer scales must never be cross-compared.

#### Cross-Rail Supply Invariant
The aggregate circulating supply of each Solana Token-2022 mint must satisfy:
$$\text{Solana Circulating Supply}_q \le \sum \text{Ledger Minted Claims}(\text{token}_q, \text{rail}=\text{solana:*})$$
Devnet currently carries unbacked test supplies (989.0007 / 478.0014 / 217.0021 / 81.0028 per ADR-011). On Mainnet, this check must run periodically in the background to ensure that on-chain supply never exceeds verified ledger claims.

#### Token Disclosure Doctrine
Under the expanded `cryptoPromo` doctrine, WTEN must never advertise a utility or value the token does not have:
- **Soulbound**: Non-transferable via `NonTransferable` extension.
- **Program-Custodied**: `PermanentDelegate` assigned to the program authority PDA.
- **Dimensionless Index**: Token quotes represent index points, not USD currency.
- **Closed-Loop Utility**: Strictly for culinary alchemy actions and restaurant partner perks as stated on `/rewards`.

---

## 2. Revised Phase Order & Status

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              REVISED WTEN SYNC PIPELINE (K0–K5)                        │
├───────────────────────────────┬──────────────────────────────┬─────────────────────────┤
│ K0: Metadata URI Ruling       │ K1: Dual-Rail Isolation      │ K2: Custody & Readiness │
│ [STATUS: IMMEDIATE / BLOCKS]  │ [STATUS: CRITICAL]           │ [STATUS: READY]         │
├───────────────────────────────┼──────────────────────────────┼─────────────────────────┤
│ K3: Cluster Verification      │ K4: Supply Invariant & Value │ K5: Parity & Cutover    │
│ [STATUS: QUEUED]              │ [STATUS: VALUE GUARANTEE]    │ [STATUS: QUEUED]        │
└───────────────────────────────┴──────────────────────────────┴─────────────────────────┘
```

| Phase | Title | Focus | Status | Primary Surface |
| :--- | :--- | :--- | :--- | :--- |
| **K0** | Token Metadata URI Ruling | Resolve 404 vs. Arweave permanent freeze | **IMMEDIATE (BLOCKS ASOL)** | `public/metadata/esms/` or Arweave config |
| **K1** | Dual-Rail Ledger Isolation & Schema | Widen columns, split pending index, rail-scope jobs | **CRITICAL** | [src/services/chainReconcileService.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/chainReconcileService.ts) |
| **K2** | Custody Boundary & Readiness | Misconfiguration reporting & zero-runtime-signer test | **READY** | [src/services/launchReadinessService.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/launchReadinessService.ts) |
| **K3** | Cluster Verification Prover | 5-extension verifier script & PDA derivation | **QUEUED** | `scripts/verify-spl-mirror-cluster.ts` |
| **K4** | Supply Invariant & Value Disclosure | Aggregate supply invariant check & token disclosures | **VALUE GUARANTEE** | [src/services/economyIntegrityService.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/economyIntegrityService.ts) |
| **K5** | Identity Parity & Mainnet Cutover | Local fixture parity & ordered cutover runbook | **QUEUED** | `docs/deployment/SPL_MIRROR_CUTOVER_RUNBOOK.md` |

---

### Phase 7 Type-Safety Readiness Progress — 2026-08-29

This is a supporting reliability workstream for the Solana program. It hardens shared API and sync boundaries but does not change the K0–K5 completion states above.

| Lint Batch | Status | Measured Result |
| :--- | :--- | :--- |
| **Batch 0 — Governance** | **COMPLETE** | Declined `no-void` and established the honest `4,987` starting baseline. |
| **Batch A — Tables & Feed Boundaries** | **COMPLETE** | Removed `98` tracked warnings; repository baseline ratcheted to `4,889`. |
| **Batch B — API & Agent Communication** | **COMPLETE** | Removed all `109` tracked warnings from the six named files; each target now reports `0` tracked warnings. |
| **Batch C — Calculations, Recipes & Grocery Adapters** | **COMPLETE** | Removed all `118` tracked warnings from the six named files; each target now reports `0` tracked warnings. |
| **Batch D — Custom Hooks & State Contexts** | **COMPLETE** | Removed all `93` freshly measured tracked warnings from the five named files; each target now reports `0` tracked warnings. The honest shared astrology contract also removed `14` downstream unsafe-access warnings, for a `107`-warning repository-wide reduction. |

Batch B added validated request/response boundaries for cuisine generation, menu persistence, Food Lab persistence, planetary API responses, admin agent-network metadata, and internal agent synchronization. Production-critical failure paths now use `_logger.error`, while non-critical cache degradation remains explicitly lower severity. Unified menu recipes without a display title are normalized at the boundary, and nested planetary positions are structurally validated before persistence.

Batch C added validated cuisine/recipe deserialization, runtime-safe extended-recipe ingredient normalization, lossless alchemical affinity adapters, canonical and legacy grocery ingredient normalization, typed astronomical orbital and midheaven boundaries, and canonical elemental/zodiac steering calculations. Valid siblings are preserved when malformed boundary entries are skipped, and adapter provenance plus engine metadata now survives round trips through the canonical affinity model.

Batch D added runtime-validated token balance and daily-claim responses, finite planetary-position normalization for the current-chart boundary, canonical lunar-phase and tarot adapters, an honest lowercase astrology position-map contract, and schema-validated recipe-queue persistence/import. Malformed siblings are skipped without discarding valid entries, zero-valued coordinates are preserved, additive tarot boosts are explicitly distinguished from normalized elemental balances, and malformed browser vibration capabilities cannot convert a successful token claim into a failure.

The repository-wide baseline is ratcheted to `4,654`, an exact `107`-warning decrease from the pre-Batch-D baseline of `4,761` and a net decrease of `333` from the governed `4,987` starting point. The Batch D reduction comprises the `93` warnings in its five named files plus `14` downstream unsafe-access warnings eliminated by replacing the false astrology return contract. The earlier net `99` warnings introduced outside Batch B remain part of milestone arithmetic. Reaching the `<= 4,500` milestone now requires `154` additional tracked-warning removals.

Verification evidence:

- `bun run typecheck` passes; `bun run lint` passes with `0` errors and `22` pre-existing warnings outside Batch D.
- Unified-engine witness: `28/28` tests pass; snapshot parity is `100%`.
- Batch D focused gate: `13/13` tests pass across five boundary suites.
- Full test gate: `313/313` suites pass (`3,278` active tests passed, `10` skipped). In the restricted workspace, the same `bun run test` gate uses the established no-IPC `bunx tsx` wrapper so the four determinism subprocess checks can run without a sandbox socket error.
- Standards and specification re-reviews found no remaining Batch D correctness or hard-governance violations after remediation. Shared record guards and repeated planetary-position normalization remain nonblocking deep-module cleanup candidates.

Next steps:

1. Begin Phase 7 Batch E with a fresh per-file audit of its seven named files; do not rely on stale plan estimates, and keep every target at `0` tracked warnings after remediation.
2. Close the remaining `154`-warning gap to the `<= 4,500` milestone. If the fresh Batch E yield is insufficient, name and audit any governance-approved extension files explicitly rather than using unnamed quota filler.
3. Continue the Solana execution sequence with K0 metadata hosting resolution, followed by K1 dual-rail isolation and schema hardening.

---

## 3. Prompt-by-Prompt Execution Blueprints

---

### Prompt K0 — Token Metadata URI Ruling & Hosting `[IMMEDIATE — BLOCKS ASOL]`

#### Context & Architectural Seams
Devnet mints carry `uri = https://alchm.kitchen/metadata/esms/*.json`. WTEN currently serves nothing at this route. Because Token-2022 `TokenMetadata` lacks an update instruction in `asol_program`, whatever URI is set at mint initialization is immutable. WTEN must either host the static JSON metadata documents or coordinate with ASOL to freeze Arweave URIs before Mainnet initialization.

#### Target Files
- `[NEW]` `public/metadata/esms/spirit.json`
- `[NEW]` `public/metadata/esms/essence.json`
- `[NEW]` `public/metadata/esms/matter.json`
- `[NEW]` `public/metadata/esms/substance.json`
- `[NEW]` `docs/adr/015-token-metadata-hosting-authority.md`

#### Prompt K0 (XML Specification)
```xml
<prompt id="wten-k0-metadata-uri-ruling">
  <context>
    <repository>WhatToEatNext / alchm.kitchen (WTEN)</repository>
    <sibling_authority>AlchmAgentsSolana — program 5QheuqaicKvPPRFEoEXwaE5xaFp7gauvJCfsjpQv8WzD</sibling_authority>
    <runtime>Bun 1.3.13 | Next.js</runtime>
    <description>
      Resolve the on-chain metadata URI 404. Live Devnet mints point to https://alchm.kitchen/metadata/esms/*.json.
      Ensure valid static metadata is served immediately, and record the permanent hosting decision before ASOL Mainnet minting.
    </description>
  </context>
  <task>
    Deploy canonical metadata JSON fixtures to public/metadata/esms/ and record the URI hosting decision.
  </task>
  <target_files>
    <file action="create">public/metadata/esms/spirit.json</file>
    <file action="create">public/metadata/esms/essence.json</file>
    <file action="create">public/metadata/esms/matter.json</file>
    <file action="create">public/metadata/esms/substance.json</file>
    <file action="create">docs/adr/015-token-metadata-hosting-authority.md</file>
  </target_files>
  <technical_specifications>
    <metadata_payloads>
      1. Create static JSON files adhering strictly to standard SPL Token Metadata standards:
         - `name`: "Spirit", "Essence", "Matter", "Substance"
         - `symbol`: "SPIRIT", "ESSENCE", "MATTER", "SUBSTANCE"
         - `description`: Formal alchemical definition matching ADR-011 and closed-loop utility doctrine.
         - `image`: Hosted SVG/PNG icon URLs on alchm.kitchen.
         - `attributes`: NonTransferable (true), ProgramDelegate (5QheuqaicKvPPRFEoEXwaE5xaFp7gauvJCfsjpQv8WzD), Decimals (4).
      2. Ensure Next.js public directory serves these files with `Content-Type: application/json` and CORS headers allowing public explorer reads.
    </metadata_payloads>
    <adr_decision>
      Record in `docs/adr/015-token-metadata-hosting-authority.md`:
      - Option A: Permanent alchm.kitchen serving obligation.
      - Option B: Mainnet freezes permanent Arweave URIs; Devnet remains on alchm.kitchen placeholder.
    </adr_decision>
  </technical_specifications>
  <testing_and_verification>
    1. Curl local dev endpoints `http://localhost:3000/metadata/esms/{spirit,essence,matter,substance}.json` and assert valid JSON.
    2. Confirm standard Solana explorer metadata fetch resolves with 200 OK.
  </testing_and_verification>
</prompt>
```

---

### Prompt K1 — Dual-Rail Ledger Isolation & Schema Hardening `[CRITICAL]`

#### Context & Architectural Seams
Widen `esms_onchain_claims` schema columns to support Solana base58 addresses and transaction signatures, split the unique pending index by target chain, rail-scope `checkWalletInvariants` and `settleStaleClaims`, rail-key the comparison epsilon, and add deterministic scan rotation.

#### Target Files
- `[NEW]` [database/init/81-esms-claims-target-chain.sql](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/database/init/81-esms-claims-target-chain.sql) — schema migration.
- `[MODIFY]` [src/services/esmsOnchainClaimService.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/esmsOnchainClaimService.ts) — widened types & target chain support.
- `[MODIFY]` [src/services/chainReconcileService.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/chainReconcileService.ts) — rail-scoped queries, scan rotation, rail-keyed epsilon.
- `[MODIFY]` [src/services/tokenEconomyQueries.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/tokenEconomyQueries.ts) — extracted SQL builders for invariant checks.
- `[MODIFY]` [src/types/economy.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/types/economy.ts) — updated type annotations.
- `[MODIFY]` [src/app/api/cron/chain-reconcile/route.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/api/cron/chain-reconcile/route.ts) — per-rail cron alerts.
- `[MODIFY]` [src/services/economyIntegrityService.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/economyIntegrityService.ts) — updated backlog checks.
- `[MODIFY]` [scripts/checkEconomySqlParses.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/scripts/checkEconomySqlParses.ts) — update `EXPECTED_TOTAL` and gate builders.
- `[NEW]` [src/services/__tests__/chainReconcileService.dualRail.test.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/__tests__/chainReconcileService.dualRail.test.ts) — isolation test suite.

#### Prompt K1 (XML Specification)
```xml
<prompt id="wten-k1-dual-rail-isolation">
  <context>
    <repository>WhatToEatNext / alchm.kitchen (WTEN)</repository>
    <runtime>Bun 1.3.13 | Next.js | Jest | raw SQL via @/lib/database</runtime>
    <description>
      Eliminate schema blockers and isolate multi-chain reconciliations.
      Widen wallet_address and tx_hash columns, partition in-flight claim indexes per rail,
      and scope invariant checks with exact rail-keyed scaling.
    </description>
  </context>
  <task>
    Apply Migration 81, update all 6 claim readers, rail-scope reconciler jobs 1 and 3,
    and update SQL PREPARE gates.
  </task>
  <target_files>
    <file action="create">database/init/81-esms-claims-target-chain.sql</file>
    <file action="modify">src/services/esmsOnchainClaimService.ts</file>
    <file action="modify">src/services/chainReconcileService.ts</file>
    <file action="modify">src/services/tokenEconomyQueries.ts</file>
    <file action="modify">src/types/economy.ts</file>
    <file action="modify">src/app/api/cron/chain-reconcile/route.ts</file>
    <file action="modify">src/services/economyIntegrityService.ts</file>
    <file action="modify">scripts/checkEconomySqlParses.ts</file>
    <file action="create">src/services/__tests__/chainReconcileService.dualRail.test.ts</file>
  </target_files>
  <technical_specifications>
    <schema_migration>
      1. In `81-esms-claims-target-chain.sql`:
         - Alter `wallet_address` to `VARCHAR(64)` (supports Solana 32-44 char base58).
         - Alter `tx_hash` to `VARCHAR(128)` (supports Solana 86-88 char signatures).
         - Add `target_chain TEXT NOT NULL DEFAULT 'eip155:8453'` with CHECK constraint for known CAIP-2 values (`eip155:8453`, `eip155:84532`, `solana:mainnet-beta`, `solana:devnet`).
         - Drop old `uniq_esms_onchain_claims_pending` index; recreate as:
           `CREATE UNIQUE INDEX IF NOT EXISTS uniq_esms_onchain_claims_pending_rail ON esms_onchain_claims (user_id, target_chain) WHERE status = 'pending';`
         - Create index `idx_esms_claims_rail_reconcile` on `(target_chain, status, created_at)`.
    </schema_migration>
    <reconciler_hardening>
      1. Move invariant queries from inline SQL in `chainReconcileService.ts` to named builders in `tokenEconomyQueries.ts` so `checkEconomySqlParses.ts` validates them.
      2. Scope `checkWalletInvariants` to require an explicit `rail: string` argument with join condition `AND c.target_chain = $rail`.
      3. Implement deterministic hourly scan rotation in `checkWalletInvariants`:
         `ORDER BY md5(u.id::text || to_char(now(), 'YYYY-MM-DD-HH24'))` so all wallets are periodically audited.
      4. Rail-key the invariant comparison epsilon:
         - Base (`eip155:*`): `EPSILON = 0.0001` (sub-quantum dust tolerance for 18-dp).
         - Solana (`solana:*`): `EPSILON = 0` (exact atom comparison for 4-dp).
      5. Job 1 `settleStaleClaims` must only retry claims matching the active runner's rail.
    </reconciler_hardening>
    <ci_gates>
      1. Update `scripts/checkEconomySqlParses.ts` to include the new query builders and adjust `EXPECTED_TOTAL`.
    </ci_gates>
  </technical_specifications>
  <testing_and_verification>
    1. Run `chainReconcileService.dualRail.test.ts`:
       - Assert user with 10 Base claims and 50 Solana claims only counts 10 on Base.
       - Assert 0.0001 Solana over-mint is flagged with EPSILON = 0.
       - Assert scan rotation produces varied batches across simulated hours.
    2. `bun run test -- src/services/__tests__/chainReconcileService`
    3. `bun run scripts/checkEconomySqlParses.ts` (against test DB)
  </testing_and_verification>
</prompt>
```

---

### Prompt K2 — Custody Boundary & Readiness Refinement

#### Context & Architectural Seams
WTEN holds zero Solana private keys and performs no runtime Solana RPC calls. Launch readiness must distinguish a partial configuration (misconfiguration) from an intentional off state, and a Jest test must enforce zero runtime `@solana/*` dependencies in `src/`.

#### Target Files
- `[MODIFY]` [src/services/launchReadinessService.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/launchReadinessService.ts) — distinguish misconfiguration from off.
- `[MODIFY]` [src/lib/esms-chain/__tests__/solanaMirror.test.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/esms-chain/__tests__/solanaMirror.test.ts) — assert zero runtime dependencies.
- `[NEW]` [docs/adr/014-solana-mirror-custody-boundary.md](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/docs/adr/014-solana-mirror-custody-boundary.md) — record custody boundary.

#### Prompt K2 (XML Specification)
```xml
<prompt id="wten-k2-custody-boundary">
  <context>
    <repository>WhatToEatNext / alchm.kitchen (WTEN)</repository>
    <runtime>Bun 1.3.13 | Next.js | Jest</runtime>
    <description>
      Refine launch readiness to detect partial SPL mirror misconfigurations and pin the zero-signer custody boundary.
    </description>
  </context>
  <task>
    Add misconfiguration state to launch readiness and pin zero runtime Solana dependencies via Jest.
  </task>
  <target_files>
    <file action="modify">src/services/launchReadinessService.ts</file>
    <file action="modify">src/lib/esms-chain/__tests__/solanaMirror.test.ts</file>
    <file action="create">docs/adr/014-solana-mirror-custody-boundary.md</file>
  </target_files>
  <technical_specifications>
    <launch_readiness>
      1. Update `launchReadinessService.ts` for `esms-spl-mirror`:
         - If `NEXT_PUBLIC_ESMS_SPL_ENABLED === "true"` but `mintsConfigured < 4`, return `status: "PARTIAL"` with an explicit diagnostic note.
         - Maintain booleans-only reporting (never emit raw addresses).
    </launch_readiness>
    <dependency_assertion>
      1. In `solanaMirror.test.ts`:
         - Read `package.json` and assert `dependencies` contains zero `@solana/*` or `@coral-xyz/*` packages (devDependencies allowed for verification scripts).
         - Read `src/lib/esms-chain/solanaMirror.ts` and assert no import statements contain `@solana/` or `fetch`.
    </dependency_assertion>
    <adr_record>
      1. Record in `docs/adr/014-solana-mirror-custody-boundary.md`:
         - WTEN holds zero Solana key material.
         - Base custody relies on Privy server wallets; raw keys are local-only.
         - All Solana mint authority is held by Cloud KMS in ASOL.
    </adr_record>
  </technical_specifications>
  <testing_and_verification>
    1. `bun run test -- src/lib/esms-chain`
    2. Confirm `/admin/settings` displays READY, PARTIAL (misconfigured), and OFF states correctly.
  </testing_and_verification>
</prompt>
```

---

### Prompt K3 — Cluster-Verified Mirror Prover

#### Context & Architectural Seams
Because the four mint PDAs derive identically on Devnet and Mainnet-Beta under program `5QheuqaicKvPPRFEoEXwaE5xaFp7gauvJCfsjpQv8WzD`, `NEXT_PUBLIC_ESMS_SPL_CLUSTER` is an unverified assertion unless proven by reading on-chain accounts. WTEN requires a dev-only verification script that asserts all 5 Token-2022 extensions.

#### Target Files
- `[NEW]` [scripts/verify-spl-mirror-cluster.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/scripts/verify-spl-mirror-cluster.ts) — cluster verification harness.
- `[NEW]` [docs/solana/SPL_MIRROR_VERIFICATION.md](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/docs/solana/SPL_MIRROR_VERIFICATION.md) — measurement record.
- `[MODIFY]` [src/lib/esms-chain/solanaMirror.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/esms-chain/solanaMirror.ts) — document cluster verification requirements.

#### Prompt K3 (XML Specification)
```xml
<prompt id="wten-k3-cluster-verification">
  <context>
    <repository>WhatToEatNext / alchm.kitchen (WTEN)</repository>
    <runtime>Bun 1.3.13 | TypeScript</runtime>
    <description>
      Create a standalone dev verification script to measure Token-2022 mint accounts and all 5 extensions on-chain.
    </description>
  </context>
  <task>
    Build scripts/verify-spl-mirror-cluster.ts and record verified cluster state in docs/solana/SPL_MIRROR_VERIFICATION.md.
  </task>
  <target_files>
    <file action="create">scripts/verify-spl-mirror-cluster.ts</file>
    <file action="create">docs/solana/SPL_MIRROR_VERIFICATION.md</file>
    <file action="modify">src/lib/esms-chain/solanaMirror.ts</file>
  </target_files>
  <technical_specifications>
    <verification_script>
      1. Implement `scripts/verify-spl-mirror-cluster.ts` using `@solana/web3.js` (devDependency):
         - Command: `bun scripts/verify-spl-mirror-cluster.ts --cluster <devnet|mainnet-beta>`.
         - Re-derive each PDA from seeds `["esms_mint", Uint8Array.from([id])]` under program `5QheuqaicKvPPRFEoEXwaE5xaFp7gauvJCfsjpQv8WzD`.
         - Fetch account info and assert account is owned by Token-2022 (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`).
         - Assert all 5 extensions: `NonTransferable`, `PermanentDelegate`, `MetadataPointer`, `TokenMetadata`, `PermissionedBurn`.
         - Assert `decimals === 4`, `freezeAuthority === null`, and `mintAuthority === programAuthorityPDA`.
         - Output Markdown table with slot number, timestamp, and extension status. Exit non-zero on mismatch.
    </verification_script>
    <documentation>
      1. Commit Devnet baseline measurements into `docs/solana/SPL_MIRROR_VERIFICATION.md`.
    </documentation>
  </technical_specifications>
  <testing_and_verification>
    1. `bun scripts/verify-spl-mirror-cluster.ts --cluster devnet` (must pass 4/4).
    2. Confirm script fails cleanly when pointing at an uninitialized cluster.
  </testing_and_verification>
</prompt>
```

---

### Prompt K4 — Cross-Rail Supply Invariant & Value Presentation

#### Context & Architectural Seams
Implement the aggregate cross-rail supply invariant check in background integrity auditing, and update client-side mirror disclosures to reflect the closed-loop, soulbound utility of ESMS.

#### Target Files
- `[MODIFY]` [src/services/economyIntegrityService.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/economyIntegrityService.ts) — add aggregate Solana supply check.
- `[MODIFY]` [src/lib/esms-chain/solanaMirror.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/esms-chain/solanaMirror.ts) — token utility disclosure metadata.
- `[NEW]` [src/services/__tests__/economyIntegrityService.supplyInvariant.test.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/__tests__/economyIntegrityService.supplyInvariant.test.ts) — invariant tests.

#### Prompt K4 (XML Specification)
```xml
<prompt id="wten-k4-supply-invariant-value">
  <context>
    <repository>WhatToEatNext / alchm.kitchen (WTEN)</repository>
    <runtime>Bun 1.3.13 | Next.js | Jest</runtime>
    <description>
      Implement aggregate on-chain supply invariant monitoring and update token disclosures to reflect soulbound utility.
    </description>
  </context>
  <task>
    Add Solana supply invariant check to economyIntegrityService and document soulbound utility properties.
  </task>
  <target_files>
    <file action="modify">src/services/economyIntegrityService.ts</file>
    <file action="modify">src/lib/esms-chain/solanaMirror.ts</file>
    <file action="create">src/services/__tests__/economyIntegrityService.supplyInvariant.test.ts</file>
  </target_files>
  <technical_specifications>
    <supply_invariant>
      1. In `economyIntegrityService.ts`, add an audit method:
         `checkSolanaSupplyInvariants(cluster: "devnet" | "mainnet-beta")`:
         - Reads aggregate minted claims for `target_chain = solana:<cluster>`.
         - Compares against total on-chain supply.
         - Emits alert if `onchain_supply > ledger_minted_claims + EPSILON`.
    </supply_invariant>
    <value_disclosure>
      1. In `solanaMirror.ts`, expose utility attributes (`soulbound: true`, `closedLoop: true`, `decimals: 4`).
      2. Ensure UI tooltips explicitly describe ESMS as non-transferable culinary alchemy units.
    </value_disclosure>
  </technical_specifications>
  <testing_and_verification>
    1. `bun run test -- src/services/__tests__/economyIntegrityService.supplyInvariant.test.ts`
  </testing_and_verification>
</prompt>
```

---

### Prompt K5 — Identity Parity & Ordered Cutover Runbook

#### Context & Architectural Seams
Define the exact cutover runbook for transitioning the mirror from Devnet to Mainnet-Beta, and establish unit tests pinning token identity constants against ASOL.

#### Target Files
- `[MODIFY]` [docs/adr/011-elemental-exchange-index.md](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/docs/adr/011-elemental-exchange-index.md) — record Mainnet verification table.
- `[NEW]` [src/lib/esms-chain/__tests__/splIdentityParity.test.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/esms-chain/__tests__/splIdentityParity.test.ts) — identity parity test.
- `[NEW]` [docs/deployment/SPL_MIRROR_CUTOVER_RUNBOOK.md](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/docs/deployment/SPL_MIRROR_CUTOVER_RUNBOOK.md) — cutover runbook.
- `[MODIFY]` [.env.example](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/.env.example) — document SPL variables.

#### Prompt K5 (XML Specification)
```xml
<prompt id="wten-k5-identity-cutover">
  <context>
    <repository>WhatToEatNext / alchm.kitchen (WTEN)</repository>
    <sibling_authority>AlchmAgentsSolana</sibling_authority>
    <runtime>Bun 1.3.13 | Next.js | Jest</runtime>
    <description>
      Pin SPL identity parity against ASOL constants and produce the operational cutover runbook.
    </description>
  </context>
  <task>
    Create splIdentityParity.test.ts and write docs/deployment/SPL_MIRROR_CUTOVER_RUNBOOK.md.
  </task>
  <target_files>
    <file action="modify">docs/adr/011-elemental-exchange-index.md</file>
    <file action="create">src/lib/esms-chain/__tests__/splIdentityParity.test.ts</file>
    <file action="create">docs/deployment/SPL_MIRROR_CUTOVER_RUNBOOK.md</file>
    <file action="modify">.env.example</file>
  </target_files>
  <technical_specifications>
    <identity_parity>
      1. In `splIdentityParity.test.ts`, pin expected token constants:
         - Names: `["Spirit", "Essence", "Matter", "Substance"]`
         - Symbols: `["SPIRIT", "ESSENCE", "MATTER", "SUBSTANCE"]`
         - Decimals: `4`
      2. Match ASOL commit constants without reaching into external checkouts in CI.
    </identity_parity>
    <cutover_runbook>
      1. In `docs/deployment/SPL_MIRROR_CUTOVER_RUNBOOK.md`, define strict sequential gates:
         - Step 1: ASOL deploys program and initializes Mainnet mints.
         - Step 2: WTEN executes `bun scripts/verify-spl-mirror-cluster.ts --cluster mainnet-beta` (4/4 pass required).
         - Step 3: Slot measurement committed to `SPL_MIRROR_VERIFICATION.md`.
         - Step 4: Deploy `NEXT_PUBLIC_ESMS_SPL_CLUSTER=mainnet-beta` on Vercel.
      2. Rollback instructions: Set `NEXT_PUBLIC_ESMS_SPL_ENABLED=false` to safely hide mirror.
    </cutover_runbook>
  </technical_specifications>
  <testing_and_verification>
    1. `bun run test -- src/lib/esms-chain`
    2. `bun run typecheck`
  </testing_and_verification>
</prompt>
```

---

## 4. Verification & Gate Matrix

```bash
# 1. Full workspace verification
bun run typecheck
bun run lint
bun run test:fast

# 2. Targeted test suites (included in CI full run)
bun run test -- src/lib/esms-chain
bun run test -- src/services/__tests__/chainReconcileService
bun run test -- src/services/__tests__/economyIntegrityService

# 3. Cluster verification (dev-only script)
bun scripts/verify-spl-mirror-cluster.ts --cluster devnet
```

| Verification Check | Target Standard | Expected Outcome |
| :--- | :--- | :--- |
| **cryptoPromo Doctrine** | Presence-gated rendering | Partial config $\rightarrow$ `PARTIAL` status in admin, UI rendered absent. |
| **Custody Boundary** | Zero runtime Solana dependencies | Zero `@solana/*` in `dependencies`; `solanaMirror.ts` has 0 imports. |
| **Cluster Verification** | Measured on-chain existence | 5 extensions verified (`NonTransferable`, `PermanentDelegate`, `MetadataPointer`, `TokenMetadata`, `PermissionedBurn`). |
| **Dual-Rail Isolation** | `target_chain` on every claim | Base ceiling counts Base claims only; 0.0001 Solana over-mint caught. |
| **Scan Coverage** | Hourly rotation | `checkWalletInvariants` rotates scanned cohort every hour via md5 hash. |
| **Cross-Rail Supply** | Aggregate ledger backing | Total Solana supply $\le \sum \text{claims}(\text{solana:*})$ verified periodically. |
| **Cutover Ordering** | Verify-then-flip sequence | `NEXT_PUBLIC_ESMS_SPL_CLUSTER` flips only after committed on-chain proof. |

---

## 5. Open Architectural Decisions for the Owner

1. **Metadata URI Scheme**:
   - **Recommendation**: Mainnet freezes permanent Arweave URIs (`ESMS_METADATA_URIS`), while Devnet mints are retired in place. WTEN serves placeholder metadata at `public/metadata/esms/*.json` for Devnet explorer compatibility.
2. **Solana `claim_id` Format**:
   - Adopt the program's `CLAIM_RECEIPT_SEED` PDA derivation for Solana claims, stored in the widened `VARCHAR(66)` / `VARCHAR(128)` `claim_id` column.
3. **WTEN Solana Settlement Role**:
   - WTEN remains an off-chain ledger authority and read-only identity mirror. Solana wallet bindings and settlement execution remain exclusively owned by ASOL via authenticated HTTP sync endpoints.
