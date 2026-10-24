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

---

## 3. High-Priority Tasks for Next Session

### Task 1: Commit, Merge & Verify Production Deployment of Agent Profile & Roster Fixes
- **Targets**:
  - Merge WTEN [PR #966](https://github.com/gregcastro23/WhatToEatNext/pull/966) (`codex/authoritative-agent-ledger`, all 9 CI checks passing).
  - Commit and push the Task 2 & Task 4 profile, narration, community directory, and historical feed changes:
    - `src/app/api/community/agents/route.ts` & `src/app/api/community/agents/__tests__/route.test.ts`
    - `src/app/api/feed/historical-agents/route.ts` & `src/app/api/feed/historical-agents/__tests__/route.test.ts`
    - `src/services/historicalAgentFeedService.ts`
    - `src/app/api/users/[userId]/route.ts`
    - `src/lib/feed/eventNarration.ts`
    - `src/app/(alchm)/profile/[userId]/RecentActivityItem.tsx` & `src/app/(alchm)/profile/[userId]/__tests__/AgentProfile.test.tsx`
  - After deployment to `https://alchm.kitchen`, verify live responses on:
    - `GET /api/community/agents?limit=80` (confirm all 71 historical agents appear first with valid `slug` values)
    - `GET /api/feed/historical-agents?limit=40` (confirm `agent_event`, `recipe_post`, and `planetary_resonance` items)
    - `GET /api/users/leonardo-da-vinci` and `/profile/leonardo-da-vinci`

### Task 2: Populate Authentic Catalog Critiques & Saved Adaptations Across Historical Agents
- **Context**:
  - With the 1,429 legacy ungrounded July 2026 `recipe_generation` rows (`mcpCatalog: false`) filtered out of profile and historical feed queries, most historical agents currently have `insight` and `lab_entry` rows in `feed_events`, while only `leonardo-da-vinci` has a catalog `recipe_review` (`PAN-FRIED MILLET CROQUETTES`, `/recipes/bca4f37d-6604-4d97-ac56-8bc3e837a416`).
- **Objective**:
  - Build or run a bounded, idempotent seeding workflow (with `--dry-run` support) using real catalog recipes and each agent's `historicalDiet` / natal chart so historical personas have authentic catalog `recipe_review` critiques (`source: "catalog_critique"`, `rating: null`, `madeIt: false`) and/or saved `recipe_adapted` versions (`/recipes/versions/[versionId]`) visible on `/profile/[slug]` and `/feed`.
  - Respect each persona's `avoidedFoods` and dietary restrictions (e.g., vegetarian rules for Leonardo da Vinci and Pythagoras).

### Task 3: Align Recipe View & Cart Handoff with Saved Adaptations (Phase 45 Workstream C)
- **Reference**: `docs/PHASE_45_PROMPT_DRAFT_v2.md` (§6 Workstream C) and `docs/PHASE_45_PROMPT_UPDATE_AUDIT_2026-10-13.md` (§5–6).
- **Objective**:
  - Ensure that when a user views or applies an adaptation on `/recipes/[recipeId]` (`RecipeClient.tsx`) or `/recipes/versions/[versionId]`, the displayed ingredients, instructions, grocery cart handoff, and alchemical compatibility readings align with the adapted version (or explicitly mark unadapted slices as unavailable/original).
  - Verify edited recipes through the culinary gate and surface any unresolved dietary restrictions honestly.

### Task 4: Phase 45 Workstreams A & B (Culinary Gate Truth & Settlement/Admin Truth)
- **Reference**: `docs/PHASE_45_PROMPT_DRAFT_v2.md` (§4 Workstream A, §5 Workstream B).
- **Objective**:
  - **Workstream A (Culinary Gate)**: Add evaluated-restriction coverage (`Dairy-Free`, `Nut-Free`, `Pescatarian`, `Tree Nuts` key normalization), explicit catalog ingredient mappings, and clause/protein thermal attribution fixes before method aliases.
  - **Workstream B (Settlement & Admin)**: Fix cosmic recipe failed-refund response/telemetry reporting (`src/app/api/generate-cosmic-recipe/route.ts`), represent unread admin health sources as unknown rather than fabricated zeros, and ensure terminal claim settlement on inbound feed/recipe routes.

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
