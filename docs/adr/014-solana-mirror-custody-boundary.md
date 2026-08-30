# ADR-014: Zero-Signer Solana Mirror Custody Boundary and Secret-Free Web Surface

**Status:** Accepted  
**Date:** 2026-08-25  
**Companion Program:** `AlchmAgentsSolana` — `5QheuqaicKvPPRFEoEXwaE5xaFp7gauvJCfsjpQv8WzD`  
**Related ADRs:** [ADR-004](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/docs/adr/004-device-sessions.md), [ADR-011](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/docs/adr/011-elemental-exchange-index.md), [ADR-013](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/docs/adr/013-cross-site-esms-price-contract.md), [ADR-015](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/docs/adr/015-token-metadata-hosting-authority.md)

---

## Context

`WhatToEatNext` (`alchm.kitchen`, WTEN) operates a culinary recommendation and token economy platform integrated with the sibling `AlchmAgentsSolana` (ASOL) ecosystem.

In previous architectures and typical multi-chain Web3 frontends, web applications often embed client-side signing SDKs (e.g. `@solana/web3.js`, `@coral-xyz/anchor`), custody hot signer wallets on web server instances, or process direct on-chain RPC transactions. This introduces significant attack surfaces, key leakage vulnerabilities, and runtime bundle bloat.

To establish absolute operational security prior to Solana Mainnet synchronization, WTEN and ASOL define a strict, audited **Zero-Signer Custody Boundary**.

---

## Architectural Principles & Custody Separation

### 1. Zero Solana Key Material in WTEN
- **No Private Keys:** WTEN holds zero Solana private keys, keypairs, seed phrases, or signing credentials in source code, environment variables, databases, or deployment configurations.
- **Audited Verification:** Verified via repository and history secret scans (`scripts/find-secret-copies.sh`), asserting that zero base58 Solana private keys or raw keypair files (`id.json`) exist in WTEN.
- **KMS Authority Isolation:** All Solana on-chain mint authorities, program administration, and Token-2022 instructions are custodied exclusively by Google Cloud KMS within the ASOL backend.

### 2. Base Settlement Rail Custody
- For the primary settlement rail on Base (ERC-1155), server-side custody relies strictly on **Privy Server Wallets** (`PRIVY_MINTER_WALLET_ID`, `PRIVY_REDEEMER_WALLET_ID`).
- Raw private keys (`MINTER_PRIVATE_KEY`) are permitted only for local developer testing and migration scripts, and are blocked from production environments.

### 3. Zero Runtime Solana SDK Dependencies
- `package.json` runtime `dependencies` contains **zero** `@solana/*` or `@coral-xyz/*` packages.
- Web3 Solana SDKs are strictly restricted to `devDependencies` for standalone off-chain verification and deployment inspection scripts (e.g. `scripts/verify-spl-mirror-cluster.ts`).
- Production client bundles and Next.js server route runtimes are guaranteed free of Web3 RPC overhead.

### 4. Self-Contained SPL Mirror Reader
- The client-side mirror configuration module (`src/lib/esms-chain/solanaMirror.ts`) is completely pure and self-contained with:
  - Zero imports of any kind.
  - Zero network transport calls (`fetch`, `XMLHttpRequest`, `axios`, `http`, `https`).
  - Zero dynamic imports (`import(...)`).
  - Zero key-material or signer interfaces.
- The module validates base58 string shapes using regular expressions (`BASE58_ADDRESS`) without invoking external cryptographic libraries.

---

## Invariant Enforcement & CI Gates

This architectural decision is permanently enforced by automated CI test suites:

1. **Dependency Gate (`src/lib/esms-chain/__tests__/solanaMirror.test.ts`):**
   - Automatically inspects `package.json` to assert zero `@solana/*` or `@coral-xyz/*` packages in runtime `dependencies`.
2. **AST / Import Graph Boundary Gate:**
   - Evaluates `src/lib/esms-chain/solanaMirror.ts` to assert that its transitive dependency closure introduces zero network calls, dynamic imports, or key-material references.
3. **Launch Readiness Subsystem Gate (`src/services/launchReadinessService.ts`):**
   - Evaluates `esms-spl-mirror` presence cleanly without exposing address strings or secrets, returning `READY`, `PARTIAL`, or `OFF`.

---

## Consequences

### Positive
- **Immunity to Solana Hot-Wallet Theft:** Because WTEN has zero key material, compromise of WTEN web servers cannot result in unauthorized Solana token minting or asset transfer.
- **Zero Bundle Overhead:** End users download lightweight Next.js pages without multi-megabyte cryptographic Web3 libraries.
- **Strict Compliance with CryptoPromo Doctrine:** The UI displays live Solana SPL mirror links and quotes only when verified environment configurations are active, failing closed otherwise.

### Operational Responsibilities
- On-chain Solana administrative tasks, mint creations, and supply adjustments must be performed through ASOL's Cloud KMS pipeline or audited developer CLI scripts.
- Cluster verification is conducted out-of-band via developer verification scripts (`scripts/verify-spl-mirror-cluster.ts`).
- K4 aggregate supply monitoring may issue read-only `getTokenSupply` JSON-RPC
  requests. It imports no Solana SDK, exposes no transaction surface, and holds
  no signer; all state-changing instructions remain exclusively in ASOL's KMS
  pipeline.
