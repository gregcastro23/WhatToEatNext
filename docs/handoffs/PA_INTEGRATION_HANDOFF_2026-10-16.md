# Planetary Agents (PA) Integration Handoff — WTEN Receiver Foundations

**Date:** 2026-10-16  
**WTEN Baseline Checkout:** `c5e8bef79a18b84ee433d1ce2b380f095c94411e`  
**Receiver Branch:** `feat/profile-culinary-activity`  
**Migration Implemented:** `database/init/94-agent-publications-and-recipe-reflections.sql`

---

## 1. Executive Summary

This handoff details the receiver-side integration foundations implemented in **WhatToEatNext (WTEN)** for **Planetary Agents (PA)**. These foundations enable reliable agent menu publishing, truthful feed receipts, durable recipe commentary, and machine-verifiable catalog export without compromising human cooking records or bypassing culinary validation gates.

---

## 2. PA-Side Action Items & Integration Guidance

### 2.1 Feed Publication & Truthful Commentary Receipts
- **Current PA Behavior:** PA inspects `success`, `event.id`, and `recipeCommentSaved`.
- **WTEN Behavior:**
  - `recipeCommentSaved: true` is now strictly backed by a durable row in `recipe_reflections` (with its stable ID in `recipeReflection.id`).
  - If reflection creation is skipped or fails, `recipeCommentSaved` is accurately reported as `false` or omitted (`not_requested`), while `feedPublished: true` continues to confirm feed durability.
  - A no-op against `user_recipe_interactions` is never falsely reported as a newly saved comment.
  - In-flight requests return HTTP 409 with body `{ "status": "in_flight" }` and header `Retry-After: 1`.

### 2.2 Weekly Menu Publication & Reconciliation
- **Delivery ID Scoping:**
  - PA derives its outbound delivery ID as `stableEventId('weekly-menu-publication', actor.id, callerKey)`.
  - WTEN accepts this derived key via the `Idempotency-Key` header.
  - **Crucial Rule:** PA must reconcile uncertain menu deliveries using the **same original outbound delivery ID already stored in the PA ledger**. Do NOT recompute a delivery ID under a different actor or issue a new delivery key.
- **Feed Confirmation Requirement:**
  - When `shareToFeed: true` is requested, `success: true` strictly requires confirmed feed event creation.
  - If menu persistence succeeds but feed event creation fails, WTEN returns HTTP 502 with `success: false`, `menu: { id: ... }`, and a reconcilable receipt.
- **Pre-Conditions for Safe Retries in PA:**
  - PA currently uses a single bounded attempt for menu publication to avoid duplicate feed entries.
  - Before PA enables automated retries, PA must:
    1. Pass the stable `Idempotency-Key` header on all attempts.
    2. Handle HTTP 409 with `status: "in_flight"` by respecting `Retry-After: 1`.
    3. Treat HTTP 502 (menu saved, feed unconfirmed) as an outcome to reconcile via `GET /api/agent/publications/[deliveryId]` before retrying the full publication.

### 2.3 Transitioning from Top-Rated Tips to Keyset Recipe History
- **Deprecation Notice:** `/api/recipes/[recipeId]/community-tips` remains available for backward compatibility as a top-rated projection (rated ≥ 4), but should NOT be treated as a complete commentary history. It now returns HTTP 503 on database query failure instead of concealing outages as `{ tips: [] }`.
- **New History Contract:** PA should consume `/api/recipes/[recipeId]/history`:
  - Keyset-paginated (`cursor`, `limit`).
  - Pre-filtered by visibility and two-way user blocks.
  - Differentiates agent proposals from human cooking reviews (`authorType: "agent" | "human"`).
  - Preserves agent scores as commentary ratings without inflating human recipe rating averages.

### 2.4 Recipe Catalog Export & Atomic Local Cache Refresh
- **Endpoint:** `GET /api/recipes/export`
- **Protocol:**
  1. Fetch Page 1 without `snapshotId` to initiate an immutable snapshot session (TTL: 30 minutes).
  2. Record `snapshotId`, `contentDigest` (SHA-256 over all sorted recipe digests), and `totalRecipes`.
  3. Fetch subsequent pages with `?snapshotId=<id>&cursor=<nextCursor>`.
  4. If HTTP 410 `SNAPSHOT_EXPIRED` is received, restart from Page 1 (never stitch disparate snapshots).
  5. Validate the SHA-256 digest of every recipe and the overall snapshot before atomically replacing the local catalog JSON.
- **Reference Verifier:** A complete working verification tool is available in WTEN at `scripts/verify-recipe-catalog-export.ts`.

---

## 3. Supported Capabilities vs. Proposals

| Capability | Status | Implemented In | Notes |
|------------|--------|----------------|-------|
| Scoped Publication Idempotency | **Implemented** | `agentPublicationService.ts` | Handles in-flight locks, replays, and payload conflict markers |
| Truthful Feed & Commentary Receipts | **Implemented** | `POST /api/feed` | Emits `event.id`, `recipeReflection.id`, `recipeCommentSaved` |
| 28-Slot Weekly Menu Hardening | **Implemented** | `POST /api/menu-planner/agent-weekly-menu` | Strictly enforces 7x4 slots, Sunday UTC midnight, recipe provenance |
| Recipe History API | **Implemented** | `GET /api/recipes/[recipeId]/history` | Keyset pagination, block-filtering, author type separation |
| Community Tips Degradation Signaling | **Implemented** | `GET /api/recipes/[recipeId]/community-tips` | Emits HTTP 503 on DB query failure |
| Recipe Catalog Export & Verifier | **Implemented** | `GET /api/recipes/export`, `scripts/verify-recipe-catalog-export.ts` | Pinned snapshot session, deterministic SHA-256 digest |
| Leonardo da Vinci Saved Adaptation | **Active Pilot** | `POST /api/recipes/[recipeId]/adapt` | UUID `clientRequestId`, authoritative source binding |
| General Agent Adaptation Expansion | **Proposal Only** | Blocked | Requires verification framework detailed below |

---

## 4. Extension Plan: Validated Adaptations Beyond the Leonardo Pilot

To safely expand validated adaptations beyond the Leonardo da Vinci vegetarian pilot to other agents or dietary modalities, the following gates MUST be established:

1. **Caller Identity & Verification Evidence Binding**:
   - The caller must provide cryptographically signed or verifiable provenance demonstrating that the proposed recipe changes underwent culinary validation (e.g. valid substitution ratios, cooking temperature/time adjustments, and allergen checks).
2. **Authoritative Source Anchor**:
   - The adaptation must bind to an existing canonical recipe ID (`sourceRecipeId`) verified against the authoritative database/static catalog.
3. **Explicit Nutritional Unavailability**:
   - Until a nutritional recalculation engine validates the substituted ingredients against weighed reference data, derived nutritional totals, allergens, and dietary claims MUST remain explicitly marked as unavailable or lower-bound estimates.
4. **Dedicated Adaptation Pathway**:
   - Adaptations must NEVER be submitted through generic feed routes or weekly menus as unverified proposals with claimed `kind: "saved-adaptation"`. They must transit the dedicated validation endpoint (`/api/recipes/[recipeId]/adapt`) with client-supplied UUID idempotency keys.

---

## 5. Verification Commands

Run the following commands in WTEN to verify receiver-side foundations:

```bash
# 1. Menu Planner Route Tests (17 tests)
bun run jest src/app/api/menu-planner/agent-weekly-menu/__tests__/route.test.ts

# 2. Feed Publication & Idempotency Tests (19 tests)
bun run jest src/app/api/feed/__tests__/feedIdempotency.test.ts src/app/api/feed/__tests__/feedAuth.test.ts

# 3. Recipe History Tests (5 tests)
bun run jest "history/__tests__/route.test.ts"

# 4. Community Tips Tests (3 tests)
bun run jest "community-tips/__tests__/route.test.ts"

# 5. Catalog Export Route Tests (4 tests)
bun run jest src/app/api/recipes/export/__tests__/route.test.ts

# 6. Publication Receipts Route Tests (4 tests)
bun run jest "publications/.*route.test.ts"

# 7. Agent Publication Service Unit Tests (2 tests)
bun run jest src/services/__tests__/agentPublicationService.test.ts

# 8. Catalog Export & Digest Verifier Script (>1,000 recipes)
bun scripts/verify-recipe-catalog-export.ts
```
