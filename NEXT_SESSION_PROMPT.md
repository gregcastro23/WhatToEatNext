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

---

## 3. High-Priority Tasks for This Session

### Task 1: Complete Historical Agent Database Sync
- **Target**: Run and verify `scripts/sync-agentic-users.ts` (or `scripts/backfill-agent-sync.ts`).
- **Objective**: Ensure all ~71 historical figures are persisted in the PostgreSQL database:
  - `users`: `email = <slug>@agentic.alchm.kitchen`, `is_agent = true`, `role = USER` (or `ALCHEMIST`), `is_active = true`.
  - `user_profiles`: Populated with `name`, `bio`, `dominant_element`, `historical_diet`, and `birth_data`/`natal_chart`.
  - `token_balances`: Initialized with live ESMS essence balances.
  - `user_streaks`: Initialized tracking streaks.
- **Execution Command**:
  ```bash
  bun run scripts/sync-agentic-users.ts
  ```

### Task 2: Polish the Historical Agent Profile Page (`/profile/[userId]`)
- **File**: `src/app/(alchm)/profile/[userId]/page.tsx`
- **Objective**:
  - Verify that navigating to `/profile/leonardo-da-vinci` renders the full `<AgentProfile />` component.
  - Ensure that the agent's historical dietary philosophy, cultural cuisine, avoided foods, and alchemical element badges display prominently.
  - Ensure their recent activity feed displays authentic catalog recipe reviews (`made_it`, cooking reflections) linking to `/recipes/${recipeId}` rather than synthetic placeholders.
  - Add a **"Commune with [Agent Name]"** action button on their profile that launches the chat drawer / Time Laboratory modal with that agent pre-selected.

### Task 3: Enable On-Demand Agent Recipe Critique / Tip Generation
- **Target**: Add an agent interaction point on the recipe page (`src/components/recipes/SocialSection.tsx` or a new `RecipeAgentCouncil.tsx` component).
- **Objective**:
  - Allow a user viewing any catalog recipe to request a culinary critique or alchemical pairing tip from an active historical figure (e.g. Leonardo's vegetarian take, Socrates' moderation perspective, Jung's archetypal fermentation view).
  - The generated review writes to `feed_events` (`recipe_generation` or `recipe_review`) and mirrors to `user_recipe_interactions` so it permanently becomes part of the community tips for that recipe.

### Task 4: Verify Community & Network Roster Endpoints
- **Endpoints**:
  - `GET /api/community/agents`
  - `GET /api/internal/agent-roster`
  - `GET /api/feed/historical-agents`
- **Objective**:
  - Verify that all synced historical agents appear in the "View Network" drawer on `/feed`.
  - Ensure each listing links directly to their public `/profile/[slug]` page.

---

## 4. Verification & Repo Hygiene

### Environment Constraints (Mandatory)
- **Runtime**: Always use `bun` or `bun --bun run`.
- **Process Hygiene**: Check `lsof -ti:<port>` before launching dev servers; kill existing listeners if needed.
- **Apple Silicon / 16GB RAM**: Avoid leaving background servers running when moving between tasks.

### Static Verification Gates
Before committing or creating a PR on `WhatToEatNext-master`:
1. `bun scripts/lintChanged.ts` (0 errors, 0 warnings)
2. `bun run typecheck` (0 errors)
3. `bun run test` (Verify unit tests pass)
