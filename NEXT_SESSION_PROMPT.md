# WTEN Agentic Intelligence & Historical Profiles Mission

## 1. Executive Mission
Equip **WhatToEatNext (`alchm.kitchen`)** with full, authentic agent interaction capabilities. Every canonical historical agent (e.g. Leonardo da Vinci, Socrates, Aristotle, Carl Jung, Cleopatra, Hildegard von Bingen, Isaac Newton, Paracelsus) must have a rich, navigable profile on `alchm.kitchen`, active ESMS essence balances, authentic dietary lore, and the ability to interact with existing catalog recipes (reviews, made-it attestations, community tips) and engage users in individual and council conversations.

---

## 2. Completed Architecture & Foundation

The architectural bridge between **AlchmAgentsSolana (ASOL)** and **WhatToEatNext (WTEN)** is now live and committed:

### A. Planetary Agents Gateway (`src/lib/agents/planetaryAgentsGateway.ts`)
- **Host Routing**: Routes Next.js ephemeris & degree requests to `agentsUi` (`https://agents.alchm.kitchen`) and LLM chat/reasoning requests to `planetaryAgentsApi` (`https://api.agents.alchm.kitchen`).
- **Exact-Transit Gating**: Validates whether a planetary body occupies a degree on a selected date. Historical agents are perpetual alchemical stewards (always active); dormant degree agents return celestial resting status before LLM inference.
- **Session & Context Continuity**: Maintains stable `sessionId` across multi-turn exchanges, forwarding ingredients, dietary preferences, cuisine, and selected recipe IDs.
- **MCP Provenance**: Preserves live sky ephemeris, ingredient scans, candidate recipes, and provider telemetry returned by ASOL.

### B. Local Server-Side Proxy Routes
- `GET /api/agents/activations`: Cached, date-gated proxy to ASOL `agentsUi`.
- `GET /api/agents/degrees`: Full 360-degree ephemeris map.
- `GET /api/agents/degree/[degree]`: Exact-degree placement inspector.
- `POST /api/agents/chat`: Single-agent chat via gateway with transit validation and session continuity.
- `POST /api/agents/council-chat`: Multi-agent council conversation with persona system prompt overrides.
- `src/lib/planetaryAgentsClient.ts`: Direct gateway calls on server, same-origin relative URLs in browser.

### C. Profile Resolution & Surface Connections
- **Slug-Based Lookups**: `GET /api/users/[userId]` supports UUID, exact email, and friendly agent slugs (`/profile/leonardo-da-vinci`, `/profile/socrates`).
- **Historical Fallback Synthesis**: If an agent has not yet been seeded locally, `/api/users/[userId]` fetches their canonical profile from `agentsUi` (`https://agents.alchm.kitchen/api/agents/[slug]`) and synthesizes their profile so `/profile/[slug]` never 404s.
- **Service Target Alignment**: `src/lib/agents/fetchAgentProfile.ts` targets `agentsUi` for `actions`, `artifacts`, and `interactions`.
- **Recipe Review Mirroring**: `feedDatabaseService.ts` dual-writes agent reviews with `recipeId` and rating directly into `user_recipe_interactions`, rendering them under `GET /api/recipes/[recipeId]/community-tips` and `SocialSection.tsx`.
- **Agents Pane**: `src/components/profile/AgentsPane.tsx` displays live active degree agents or falls back to the perpetual historical council with real roles and balances.

### D. Authoritative ESMS Ledger & Canonical 71 Historical Roster Sync
- **Scoped Idempotent Sync (`scripts/sync-agentic-users.ts`, PR #966)**:
  - Synchronizes all **71** canonical historical NPC personas (`<slug>@agentic.alchm.kitchen`, excluding non-NPC `greg-castro-1991` by default) in PostgreSQL across `users`, `user_profiles` (`dietary_preferences`, `birth_data`, `natal_chart`, `natal_positions`, `monica_method = 'full-chart'`), `token_balances`, and `user_streaks`.
  - Supports `--dry-run` (`-n`), `--only-missing`, `--slug=<slug>`, and `--include-non-npc`, preserving existing ledger history via atomic `AGENT_ESMS_SEED_SQL`.
- **Cross-Service Rating & ESMS Ledger Parity (WTEN → ASOL → Pentacles `asol`)**:
  - ASOL (`bd5db1c` on `main`, deployed at `https://agents.alchm.kitchen/api/agents/rating`) resolves WTEN's `DATABASE_PUBLIC_URL` fallback and returns `esmsSource: "database"` and `sky.source: "swiss-ephemeris"` for all **71 / 71** canonical historical NPCs (`0` fallback).
  - Railway `pentacles-agent-ratings` sweeps publish all **71 / 71** live ratings into SpacetimeDB `asol` (`agent_rating` table: `published: 71, partial: 0, failed: 0, unmatched: 0`).

### E. Historical Agent Profile Activity, Critiques & Community Roster
- **Profile Recent Activity (`GET /api/users/[userId]`, `RecentActivityItem.tsx`, `eventNarration.ts`)**:
  - Filters out legacy ungrounded `mcpCatalog = false` rows (`COALESCE(metadata_payload->>'mcpCatalog', 'true') <> 'false'`) and orders authentic culinary activity (`recipe_review`, `recipe_adapted`, `made_it`, `recipe_generation`, `lab_entry`, `weekly_menu`) ahead of bulk `insight` events.
  - Renders saved adaptation links (`/recipes/versions/[versionId]`), catalog critique links (`/recipes/[recipeId]`), `insightContent` blockquotes, and provenance badges (`Live`, `Curated`, `Degraded`, `Saved Adaptation`, `Critique`, `Transmuted`).
  - Suppresses unverified star ratings on `catalog_critique` / `catalog_review` events and suppresses broken recipe links when `mcpCatalog === false`.
- **On-Demand Recipe Critiques & Saved Adaptations (`SocialSection.tsx`, `RecipeAgentCouncil.tsx`)**:
  - `POST /api/recipes/[recipeId]/critique` and `POST /api/recipes/[recipeId]/adapt` record truthful provenance (`live`, `gateway_degraded`, `curated`) without fabricating 5-star ratings or `made_it` cooking claims, and persist chart- and diet-informed adaptations (`/recipes/versions/[versionId]`).
- **Community & Historical Feed Endpoints (`GET /api/community/agents`, `GET /api/feed/historical-agents`, `GET /api/internal/agent-roster`)**:
  - `GET /api/community/agents` (`community:agents:v2:${limit}`) prioritizes chart-bearing historical agents (`BOOL_OR(...) DESC NULLS LAST, MAX(f.created_at) DESC NULLS LAST, up.name ASC NULLS LAST`) so `?limit=80` on `/feed` ("View Network") returns all **71 / 71** canonical historical agents with `/profile/[slug]` links ahead of synthetic planetary/degree agents.
  - `GET /api/feed/historical-agents` combines narrated `getHistoricalAgentEvents` (including `recipe_adapted` and `recipe_review`, excluding `mcpCatalog = false`), `getHistoricalAgentRecipes`, and `getPlanetaryResonanceFeed`.

### F. Idempotent Catalog Critiques & Saved Adaptations Across All 71 Historical Personas (`scripts/seedHistoricalCatalogCritiques.ts`)
- **Catalog Critique Seeding (`recipe_review`)**:
  - Deterministic, diet-compliant seeding script (`bun scripts/seedHistoricalCatalogCritiques.ts`, supporting `--dry-run`, `--slug=<slug>`, `--per-agent=<count>`) populates **142** curated catalog critiques (`2` per agent across all **71** canonical historical NPCs) in `feed_events`.
  - Every critique uses a real public catalog recipe (`mcpCatalog: true`, `source: "catalog_critique"`, `contentState: "curated"`, `rating: null`, `madeIt: false`), strictly respects each persona's `avoidedFoods` and vegetarian dietary philosophies, and mirrors into `user_recipe_interactions` (`helpful_tip`) so critiques appear on `/profile/[slug]`, `/feed`, and `/recipes/[recipeId]` community tips.
- **Saved Historical Vegetarian Adaptations (`recipe_adapted` + `user_custom_recipes`)**:
  - Seeds **12** schema-validated `SavedAdaptation` versions (`user_custom_recipes` with `source = 'saved-adaptation'` and deterministic UUIDv5 `versionId`s) and matching `recipe_adapted` events for historical vegetarian personas (`leonardo-da-vinci`, `albert-einstein`, `jean-jacques-rousseau-1712`, `benjamin-franklin`, `siddhartha-gautama-buddha`, `socrates`, `joan-of-arc`, `thomas-aquinas`, `voltaire-1694`, `mahatma-gandhi`, `murasaki-shikibu`, `lao-tzu`).

### G. Phase 45 Culinary Gate, Settlement Truth & Adaptation Handoff Alignment
- **Workstreams A & B (`PR #962`, `PR #963`, `docs/PHASE_45_CLOSEOUT.md`)**:
  - Expanded `verifyRecipeContent` restriction coverage (`Dairy-Free`, `Nut-Free`, `Pescatarian`, `Tree Nuts` normalization), explicit catalog mappings, clause/protein thermal attribution, cosmic recipe failed-refund telemetry (`src/app/api/generate-cosmic-recipe/route.ts`), unknown admin health source representation, and inbound claim terminal settlement.
- **Workstream C (`src/app/recipes/[recipeId]/RecipeClient.tsx`, `src/components/recipes/DietaryAdaptationPanel.tsx`)**:
  - Active dietary adaptations on `/recipes/[recipeId]` now pass `activeIngredients`, `activeTitle`, and `activeCartId` (`${recipe.id}__adapted_${dietaryMode}`) to grocery cart handoff (`handleAddToGroceryCart`), `OrderIngredientsModal`, `IngredientDrawer`, and clipboard export (`handleCopyRecipe`).
  - Displays explicit adaptation notices when instructions or elemental/alchemical/nutrition readings remain anchored to the original unadapted recipe, and runs `verifyRecipeContent` inside `DietaryAdaptationPanel` to surface evaluated vs. unevaluated restrictions and any remaining non-compliant items honestly.

---

## 3. High-Priority Tasks for Next Session

### Task 1: Expand Live LLM Critique & Council Activity Across Historical Personas
- **Objective**:
  - Monitor and optionally trigger live ASOL-backed critiques (`POST /api/recipes/[recipeId]/critique`) and council adaptations (`POST /api/recipes/[recipeId]/adapt`) so `contentState: "live"` interactions continue to accumulate alongside the curated baseline across `/profile/[slug]` and `/feed`.
  - Ensure Redis caches (`community:agents:v2:*`) and SpacetimeDB `asol` rating sweeps remain synchronized as new `feed_events` are recorded.

### Task 2: End-to-End Instruction & Nutrition Recomputation for Adapted Recipes
- **Objective**:
  - When a user or historical agent applies a dietary adaptation on `/recipes/[recipeId]` or saves a version on `/recipes/versions/[versionId]`, optionally recompute or annotate step-by-step instructions (replacing swapped ingredient references inline) and recompute elemental/nutrition totals from the adapted ingredient list so the original-reading fallback banner is no longer needed when full recomputation succeeds.

---

## 4. Verification & Repo Hygiene

### Environment Constraints (Mandatory)
- **Runtime**: Always use `bun` or `bun --bun run`.
- **Process Hygiene**: Check `lsof -ti:<port>` before launching dev servers; kill existing listeners if needed.
- **Apple Silicon / 16GB RAM**: Avoid leaving background servers running when moving between tasks.

### Static Verification Gates
Before committing or creating a PR on `WhatToEatNext-master`:
1. `bun run check:untracked && bun run check:route-validation && bun run check:read-json && bun run check:bare-json && bun run check:diff-assertions && bun run check:scripts`
2. `bun run typecheck` (0 errors)
3. `bun run lint:changed` (0 errors)
4. `bun run test` (or targeted `bunx jest --runTestsByPath ...` for modified suites)
5. `bun scripts/auditAgentDataIntegrity.ts` (when touching agent profile / Monica / ledger data)
