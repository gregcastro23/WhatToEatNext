# Next session — post-Phase 44 culinary authority, verification gate, and observability targets

Phase 44 is complete on branch `phase-44-culinary-authority` (base `origin/master` at `60309daf`). Read `docs/PHASE_44_CLOSEOUT.md` and check the PR's latest status before beginning. Work from an updated `master` after the PR merges.

## 1. Post-Phase 44 Culinary Authority & Verification Gate Context

Phase 44 established WTEN's deterministic culinary verification gate (`src/lib/cooking/recipeVerificationGate.ts`), robust food safety and physical limits (`src/data/cooking/foodSafety.ts`), single settlement in `/api/generate-cosmic-recipe`, and unified admin diagnostics at `/admin/agents`:

- **Food Safety & Thermal Physics:** Adheres to USDA FSIS (9 CFR § 381.150 for poultry, 9 CFR § 318.17/23 for cooked beef) and U.S. FDA Food Code 2022 § 3-401.11. Step temperature validation checks all temperatures in a step, eliminates sous vide blanket exemptions, enforces the 212°F water boiling limit (320°F for sugar/candy), handles 4-digit oven temps, and supports household batches up to 15 kg (allowing a 24 lb turkey).
- **Dietary & Allergen Verification:** Uses multi-restriction parsing (`"Vegetarian, Gluten-Free"`), checks ingredient catalog taxonomy (ensuring dairy items like quark, burrata, and pecorino are flagged as non-vegan), maps quiz allergen category keys (`eggs`, `fish`, `dairy`, `shellfish`, `peanuts`, `tree-nuts`, `soy`, `sesame`) via `allergensNamedBy`, and truthfully sets `verification.verified: false` whenever dietary claims (like gluten-free) lack certified manufacturer attestations.
- **Pipeline Budget & Single Settlement:** `/api/generate-cosmic-recipe` enforces a strict 45-second upstream budget (`MAX_UPSTREAM_BUDGET_MS = 45_000`, `MIN_RETRY_TIMEOUT_MS = 15_000`) measured from request start to protect against Vercel's 60s hard kill. Settlement happens strictly in `finally`, reversing debits with genuine idempotent credits (`cosmic_recipe_refund:<groupId>`) and logging explicit alerts if a refund fails.
- **Admin Honesty & Route Observability:** All monitored routes (`/api/economy/swap`, `/api/cron/agents-daily-yield`, `/api/cron/prewarm-agent-recipes`) are wrapped with `withObservability`. Admin queries use correct schema columns (`users.last_login_at`, `token_transactions.source_type`, and `COUNT(DISTINCT transaction_group_id)`). UI cards display `"—"` rather than deceptive `"0"` or green badges when services are offline or verdicts are UNKNOWN.

## 2. Next Implementation Targets

1. **Client-side Verification Badge & Allergen Guidance:**
   - The `/api/generate-cosmic-recipe` response provides `verification: { verified: boolean, repaired: boolean, audit: GateAudit, advisoryFindings: GateFinding[] }`.
   - Update `CosmicRecipeGenerator` and recipe presentation cards to render culinary verification badges, audit details, and clear diner advisories when claims cannot be certified without manufacturer package inspection.

2. **ASOL Contract Heartbeat & Inbound Delivery Monitoring:**
   - Expand the `/admin/agents` contract probe and webhook audit.
   - Ensure inbound delivery health from ASOL continues to handle degraded database states and distinct transaction groups cleanly.

3. **Catalog Dietary Attestation Expansion:**
   - As documented in `ingredientDietaryClassification.ts`, positive allergen/diet attestations require record-level data.
   - Extend the ingredient catalog pipeline to support explicit positive allergen attestations for common pantry staples.
