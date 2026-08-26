# SPL Token-2022 Mirror On-Chain Cluster Verification

**Attestation Date:** 2026-08-25  
**Attestation Type:** Point-in-Time On-Chain Measurement  
**Verification Harness:** [scripts/verify-spl-mirror-cluster.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/scripts/verify-spl-mirror-cluster.ts)  
**Program ID:** `5QheuqaicKvPPRFEoEXwaE5xaFp7gauvJCfsjpQv8WzD`  
**Program Authority PDA:** `4YCVh9KHrhN6mFSMvybGVqLeGfaRkfUtqrn19mLLJGku`  
**Token-2022 Program ID:** `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`  
**Related ADRs:** [ADR-014](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/docs/adr/014-solana-mirror-custody-boundary.md), [ADR-015](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/docs/adr/015-token-metadata-hosting-authority.md)

---

## 1. Executive Summary

This document serves as an immutable point-in-time record of on-chain cluster measurements for the four ESMS Token-2022 mint accounts (Spirit, Essence, Matter, Substance).

Live cluster state is actively verified using the standalone prover tool:
```bash
bun scripts/verify-spl-mirror-cluster.ts --cluster devnet
bun scripts/verify-spl-mirror-cluster.ts --cluster mainnet-beta --rpc <rpc-url>
```

---

## 2. Devnet Point-in-Time Measurement

- **Cluster:** Solana Devnet (`https://api.devnet.solana.com`)
- **Observed Slot:** `488023005`
- **Measured Timestamp:** `2026-08-25T22:21:26Z`
- **Result:** **4/4 Mints 100% Verified**

### On-Chain Account & Extension Verification

| Coin | Mint Account Address | Owner Program | Decimals | Freeze Authority | Mint Authority |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Spirit** | `K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ` | Token-2022 | 4 | `null` | `4YCVh9KHrhN6mFSMvybGVqLeGfaRkfUtqrn19mLLJGku` |
| **Essence** | `3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf` | Token-2022 | 4 | `null` | `4YCVh9KHrhN6mFSMvybGVqLeGfaRkfUtqrn19mLLJGku` |
| **Matter** | `7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4` | Token-2022 | 4 | `null` | `4YCVh9KHrhN6mFSMvybGVqLeGfaRkfUtqrn19mLLJGku` |
| **Substance** | `6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa` | Token-2022 | 4 | `null` | `4YCVh9KHrhN6mFSMvybGVqLeGfaRkfUtqrn19mLLJGku` |

### Required Token-2022 Extension Compliance Matrix

| Token | NonTransferable | PermanentDelegate | MetadataPointer | TokenMetadata | PermissionedBurn | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **SPIRIT** | ✅ Enabled | ✅ Program PDA | ✅ Pointer Active | ✅ Verified (`spirit.json`) | ✅ Program PDA | **VERIFIED** |
| **ESSENCE** | ✅ Enabled | ✅ Program PDA | ✅ Pointer Active | ✅ Verified (`essence.json`) | ✅ Program PDA | **VERIFIED** |
| **MATTER** | ✅ Enabled | ✅ Program PDA | ✅ Pointer Active | ✅ Verified (`matter.json`) | ✅ Program PDA | **VERIFIED** |
| **SUBSTANCE** | ✅ Enabled | ✅ Program PDA | ✅ Pointer Active | ✅ Verified (`substance.json`) | ✅ Program PDA | **VERIFIED** |

---

## 3. Metadata URIs & Content Resolution

Each on-chain mint account carries a `TokenMetadata` extension pointing to its canonical off-chain metadata JSON:
- **Spirit:** `https://alchm.kitchen/metadata/esms/spirit.json`
- **Essence:** `https://alchm.kitchen/metadata/esms/essence.json`
- **Matter:** `https://alchm.kitchen/metadata/esms/matter.json`
- **Substance:** `https://alchm.kitchen/metadata/esms/substance.json`

Per ADR-015, all Devnet metadata manifests and SVG icons are hosted statically under `public/metadata/esms/` and `public/icons/esms/`, resolving HTTP 200 with immutable SHA-256 digests validated in CI.
