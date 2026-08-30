# ESMS SPL Mirror Mainnet Cutover Runbook

**Status:** Mainnet cutover blocked pending measured 4/4 verification  
**Program:** `5QheuqaicKvPPRFEoEXwaE5xaFp7gauvJCfsjpQv8WzD`  
**Authority boundary:** ASOL Cloud KMS; WTEN holds no Solana signer  
**Rollback switch:** `NEXT_PUBLIC_ESMS_SPL_ENABLED=false`

This runbook is intentionally sequential. A later step must not begin until the
evidence from every earlier step is recorded. PDA derivation alone is not
evidence that a Mainnet account exists.

## Preconditions

- K0 metadata authority is accepted in ADR-015; final Mainnet Arweave URIs are
  frozen before mint initialization.
- Migration 81 is applied and K1 SQL parse/behaviour gates pass.
- ADR-014's zero-signer boundary and K4 exact-atom supply invariant tests pass.
- `NEXT_PUBLIC_ESMS_SPL_ENABLED` remains `false` in production.

## Ordered cutover

### 1. ASOL deploys and initializes

ASOL deploys the audited program to Mainnet-Beta and initializes all four
Token-2022 mint PDAs through its Cloud KMS authority. Record the ASOL commit,
deployment signature, program-data address, and initialization signatures.
Stop if any one mint or permanent metadata URI differs from the approved
identity fixtures.

### 2. WTEN proves the cluster

From a trusted operator shell, run:

```bash
bun scripts/verify-spl-mirror-cluster.ts --cluster mainnet-beta --rpc "$SOLANA_MAINNET_RPC_URL"
```

The command must report `4/4`. Every mint must be owned by Token-2022 and show
decimals `4`, null freeze authority, the program-authority PDA, and all five
extensions: NonTransferable, PermanentDelegate, MetadataPointer, TokenMetadata,
and PermissionedBurn. Any mismatch is a hard stop.

### 3. Commit the measurement

Copy the verifier's timestamp, observed slot, mint table, and extension matrix
into `docs/solana/SPL_MIRROR_VERIFICATION.md`. Replace ADR-011's Mainnet
`NOT VERIFIED` cells with that measured evidence. Review the committed diff;
never enter a slot or status from memory.

### 4. Validate ledger isolation and supply backing

Run the K1/K4 focused suites and the SQL gates against the release database:

```bash
bun run test --runInBand \
  src/services/__tests__/chainReconcileService.dualRail.test.ts \
  src/services/__tests__/economyIntegrityService.supplyInvariant.test.ts
bun scripts/checkEconomySqlParses.ts
bun scripts/checkEconomyStatementBehaviour.mjs
```

The exact-atom invariant must show no Mainnet on-chain supply above the sum of
`minted` claims scoped to `solana:mainnet-beta`.

### 5. Deploy the public mirror gate

In Vercel, set the four already-derived mint variables, then set:

```text
NEXT_PUBLIC_ESMS_SPL_CLUSTER=mainnet-beta
NEXT_PUBLIC_ESMS_SPL_ENABLED=true
```

Deploy once, confirm launch readiness reports `READY`, verify all four explorer
links, metadata documents, and the non-transferable/closed-loop disclosure, then
observe the supply invariant for one complete integrity interval.

## Rollback

If verification, explorer resolution, readiness, or supply monitoring degrades:

1. Set `NEXT_PUBLIC_ESMS_SPL_ENABLED=false` and redeploy immediately. This hides
   the mirror without changing ledger balances or on-chain state.
2. Do not rotate, burn, mint, or update Solana accounts from WTEN. Escalate all
   state-changing remediation to ASOL's Cloud KMS operators.
3. Preserve the failed verifier output, slot, deployment id, and integrity
   payload in the incident record.
4. Re-enable only by repeating this runbook from Step 2 with new evidence.

Rollback of the presentation gate is safe because WTEN's authoritative economy
remains PostgreSQL and the mirror gate is presence-only; disabling it cannot
debit, credit, mint, or burn tokens.
