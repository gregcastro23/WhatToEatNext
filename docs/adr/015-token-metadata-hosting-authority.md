# ADR-015: Token Metadata Hosting Authority & Dual-Cluster URI Immutability Doctrine

**Status:** Accepted  
**Date:** 2026-08-24  
**Companion Program:** `AlchmAgentsSolana` — `5QheuqaicKvPPRFEoEXwaE5xaFp7gauvJCfsjpQv8WzD`  
**Vendored Commit:** `AlchmAgentsSolana@7183c95`  
**Related ADRs:** [ADR-011](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/docs/adr/011-elemental-exchange-index.md), [ADR-013](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/docs/adr/013-cross-site-esms-price-contract.md)

---

## Context

The SPL Token-2022 ESMS tokens (Spirit, Essence, Matter, Substance) deployed by the sibling `AlchmAgentsSolana` (ASOL) program carry off-chain metadata conforming to the Metaplex / SPL Token Metadata standard.

When initialized on Solana Devnet, the four mints were configured with the following on-chain URI pointers:
- `https://alchm.kitchen/metadata/esms/spirit.json`
- `https://alchm.kitchen/metadata/esms/essence.json`
- `https://alchm.kitchen/metadata/esms/matter.json`
- `https://alchm.kitchen/metadata/esms/substance.json`

Prior to this ruling, `alchm.kitchen` served no static documents or API routes at these paths, causing public Solana block explorers (Solana Explorer, Solscan, SolanaFM) and Web3 wallet interfaces to report 404 Not Found when inspecting the Devnet mint PDAs.

### On-Chain Authority & Immutability Mechanics

A technical audit of `asol_program` establishes the exact cryptographic and operational state of the token metadata:

1. **Update Authority Allocation:** During mint initialization (`instructions/esms.rs:368`), `asol_program` sets `update_authority` to the `ProgramConfig` PDA (`4YCVh9...`, bump 255), and `validate_existing_mint` asserts `metadata.update_authority.0 == *authority` (`:479`). The update authority exists and is program-custodied.
2. **Instruction Surface Limitation:** The on-chain Anchor program currently exposes no instruction that invokes the Token-2022 `token_metadata_update_field` system instruction. 
3. **Operational Immutability:** Because the program lacks an update instruction, the URI written at mint initialization is practically immutable unless and until ASOL deploys an authorized program upgrade that adds an update instruction.
4. **Devnet Status:** Devnet mints cannot be modified on-chain without such an upgrade. They are retired in place as a test cluster.

As the system prepares for Solana Mainnet initialization, WTEN and ASOL must establish a definitive hosting authority and URI doctrine across both clusters to eliminate the 404 blocker and ensure decentralized, permanent provenance for production mints.

---

## Options Considered

### Option A: Permanent `alchm.kitchen` HTTPS Hosting (Centralized Web2 Obligation)
Under Option A, both Devnet and Mainnet mints would point indefinitely to `https://alchm.kitchen/metadata/esms/*.json`.

- **Pros:** Full dynamic control over copy, imagery, and links via Next.js static asset deployments without executing Solana transactions.
- **Cons:** Violates Web3 provenance standards for immutable SPL tokens. Creates a hard operational dependency on DNS registration, TLS certificate renewal, web server availability, and CDN routing. If the web domain lapses or routing breaks, on-chain tokens lose their public identity.

### Option B: Dual-Cluster Strategy — Decentralized Arweave for Mainnet, Best-Effort HTTPS for Devnet (Ruled)
Under Option B, Mainnet and Devnet follow distinct, explicit hosting models:
- **Mainnet:** ASOL freezes permanent decentralized Arweave URIs (`https://arweave.net/<txId>`) uploaded via Irys during ASOL Phase 4 prior to initializing Mainnet mints.
- **Devnet:** WTEN immediately resolves the Devnet 404 by hosting canonical, vendored static metadata JSON files and self-contained SVG icon assets at `public/metadata/esms/*.json` and `public/icons/esms/*.svg` on a best-effort basis.

- **Pros:** 
  - Mainnet achieves true decentralized permanence, zero server-maintenance risk, and immutable content addressing.
  - Devnet 404 is resolved immediately without requiring a program upgrade or abandoning existing Devnet mint accounts.
  - Zero divergence between repository manifests through strict byte-for-byte vendoring.
- **Cons:** Mainnet metadata becomes permanently unmodifiable once minted on-chain, requiring absolute perfection in the pre-mint upload step.

---

## Decision

### 1. Adopt Option B (Dual-Cluster Hosting Split)

We adopt **Option B**. Production Mainnet Token-2022 mints will freeze permanent Arweave URIs produced by ASOL's Phase 4 two-pass Irys uploader. Devnet mints will remain pointed to `https://alchm.kitchen/metadata/esms/*.json`, which WTEN commits to serving on a best-effort testnet basis.

### 2. Byte-for-Byte Manifest Vendoring from ASOL & SHA-256 Digest Pinning

To prevent downstream drift and dual-document discrepancies (reproducing the defect addressed in ADR-013), WTEN vendors the canonical token manifests and SVG icons directly from `AlchmAgentsSolana/metadata/solana/` at pinned commit `7183c95`.

The exact SHA-256 digests pinned across the repository and validated in CI:

| Asset Path | SHA-256 Digest |
| :--- | :--- |
| `public/metadata/esms/spirit.json` | `0cb525797ecab5007030da9882a8af288b1ab203e9054bb523f413e95b0a5dc5` |
| `public/metadata/esms/essence.json` | `770af5bd11c1f312dc598db6e556c99a15f0800d2167d8cbf0dbad3d964d6301` |
| `public/metadata/esms/matter.json` | `3dbfa64753f41c9f6c1cd48be1d2e99bc31abad65b295b8dedb514d38084503f` |
| `public/metadata/esms/substance.json` | `83c0a12137a619c32ff9c56bcb7bc73986470c1aa5c7f84cbcdf865821ed1069` |
| `public/icons/esms/spirit.svg` | `d2a8105f4906f9cd18c32739c99e81242a0c0db70b726411a79270dfea4f1737` |
| `public/icons/esms/essence.svg` | `2f3935f041f9486302e1bb7a8e43456a43b427adb953b2ddc9bbc54908c4819b` |
| `public/icons/esms/matter.svg` | `89700503a70d834976efa6f3bdd08b64c65971e450c1ccf01f8eb81f3f68309f` |
| `public/icons/esms/substance.svg` | `fb8aad0ad4aaa6e526c4d0efc7fdf2470ae86bbe802e3d400f516fbc51020b20` |

**Re-vendor Trigger:** Any future upstream changes in ASOL (e.g. updating description prose before Mainnet freeze, or patching Arweave `image: "https://arweave.net/<txid>"` in Phase 4) will trigger a failing digest test in WTEN CI, requiring an explicit re-vendoring pass and updated digest table.

### 3. Static Icon Hosting & SVG Security

WTEN hosts the 512x512 techno-occult vector icons under `public/icons/esms/{spirit,essence,matter,substance}.svg`.
All SVGs strictly comply with Web3 security standards:
- Strictly self-contained vectors with valid `viewBox="0 0 512 512"`.
- Zero `<script>` or executable tags.
- Zero `<foreignObject>` containers.
- Zero external HTTP/HTTPS links, `@import` rules, or remote font/image dependencies.

### 4. HTTP Headers: Spec-Valid CORS & Staging Caching Policy

Per `next.config.js`, requests matching `/metadata/esms/:path*` and `/icons/esms/:path*` are served with dedicated static CORS headers:
- `Access-Control-Allow-Origin: *` without `Access-Control-Allow-Credentials: true` (ensuring full W3C spec compliance for public cross-origin explorer/wallet fetches).
- `Access-Control-Allow-Methods: GET,OPTIONS` restricting allowed verbs on immutable read-only assets.
- `Cache-Control: public, max-age=3600, must-revalidate` during pre-upload staging (where `image: null` is present). Once permanent Arweave image and URI hashes are frozen in ASOL Phase 4, caching will flip to `immutable`.

### 5. Orthogonality with ADR-013 Quantity Engine

The token metadata manifests describe the qualitative alchemical archetypes (Fire/Water/Earth/Air, Sun/Moon/Saturn/Mercury) governing the four tokens. As established in ADR-013, the quantitative pricing oracle (`/api/economy/price-index`) operates independently via continuous quantized Gaussian field equations and astronomical ephemerides. The qualitative identity documents in metadata do not alter or govern the mathematical price indices.

---

## Consequences

- **Explorer Resolution:** Navigating to Devnet mint addresses on Solana Explorer resolves the token metadata JSON without 404 errors.
- **Mainnet Preparedness:** ASOL can proceed with Phase 4 Arweave upload and verifiable Anchor builds without being blocked by WTEN hosting ambiguity.
- **Verification Guarantees:** Jest test suite `src/lib/esms-chain/__tests__/tokenMetadata.test.ts` continuously asserts SHA-256 digest pins, schema validation, SVG cleanliness, unshadowed routes, and spec-valid CORS headers without requiring a sibling checkout.
- **Operational Scope:** WTEN provides best-effort hosting for Devnet assets without guaranteeing high-availability production SLAs for deprecated testnet environments.
- **Post-Deployment Live Origin Verification:** Upon Vercel deployment, the following checks verify the live HTTPS witness:
  ```bash
  # Check status 200, JSON Content-Type, CORS, and Cache-Control
  curl -I https://alchm.kitchen/metadata/esms/spirit.json
  # Check SVG Content-Type and CORS
  curl -I https://alchm.kitchen/icons/esms/spirit.svg
  ```
