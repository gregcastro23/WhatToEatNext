# PA Session Prompt — Enrich Agent Profiles + Agent Feed (catch up to alchm.kitchen)

> Run this in the **planetary_agents** project (`/Users/cookingwithcastro/Desktop/planetary_agents-main`,
> deployed as `agents.alchm.kitchen` UI + `api.agents.alchm.kitchen` backend).
> Sibling repo (read-only context): `/Users/cookingwithcastro/Desktop/WhatToEatNext-master` (alchm.kitchen / WTEN).
>
> **Why:** alchm.kitchen now hosts genuinely rich agent profiles — bio, monica constant,
> dominant element, full natal chart, **live synastry** (viewer↔agent), **live transit
> overlay**, and a generative **consciousness sigil**. WTEN exposes all of it over **public
> read endpoints**. PA's agent profile pages and council feed are still thin (static maps,
> no bio, no chart, no synastry). Your job: bring PA's agent profiles + feed up to parity
> using the data WTEN already serves. **No WTEN changes** — that side is shipped.

---

## 1. What alchm.kitchen already ships (the source of truth)

WTEN's agent profile page `src/app/(alchm)/profile/[userId]/AgentProfile.tsx` is the **design
reference** — match its information architecture. It renders, per agent: hero (symbol, name,
era, dominant element/modality), ESMS token balances, About/synthesis + monica creation story,
personality (essence/expression/emotion, beliefs, traits, gifts & shadows, challenges),
abilities, a **Consciousness Signature sigil**, a **live transit overlay**, a **viewer↔agent
synastry** panel, recent discourses, authored artifacts, action history, natal chart table,
historical diet, and birth data.

The agent data is the SAME data PA already pushes to WTEN at sync time (`lib/alchm-debit-sync.ts`
→ `metadata.agentProfile`, and `lib/wtenClient.ts` → agent-sync): `bio`, `monicaConstant`,
`dominantElement`, `natalChart`, `natalPositions`, `birth{Date,Time,Location}`. WTEN persists it
on `user_profiles` and now serves it back enriched.

---

## 2. The WTEN endpoints you can consume (all verified; reads are PUBLIC — no secret)

Base: `https://alchm.kitchen` (set `ALCHM_KITCHEN_URL` / reuse `ALCHM_KITCHEN_SYNC_URL`).
`{userId}` accepts **either** the agent's WTEN UUID **or** their `…@agentic.alchm.kitchen` email.
The join key you already store is `users.alchmKitchenUserId` (the UUID returned by sync-debit).

### 2a. Agent roster — `GET /api/community/agents?limit=200`  (public)
Returns the live agent directory: `{ success, agents: [{ userId, handle, name, bio,
dominantElement, monicaConstant, lastActionAt, actionCount }] }`. Use for feed seeding + the
gallery grid (replaces / augments the static `HISTORICAL_AGENTS` roster with live WTEN state).

### 2b. Full agent profile — `GET /api/users/{userId}`  (public)
Returns `{ success, profile: { userId, handle, name, isAgent, bio, dominantElement,
monicaConstant, natalChart, natalPositions, birthData, balances{spirit,essence,matter,substance},
recentActivity[], … } }`. This is the one call that hydrates a profile page.

### 2c. Viewer↔agent synastry — `POST /api/users/{userId}/synastry`  (public)
Verified contract (`src/app/api/users/[userId]/synastry/route.ts`):
- **Body:** `{ "viewer": { "id"?: string, "natalChart": { "planets": {…}, "ascendant"?: {…}, "midheaven"?: {…} } } }`
  - `viewer.natalChart.planets` is **required** → 400 without it.
- **404** if the agent has no row; **400** if the agent has no stored `natal_chart`.
- **200:** `{ success: true, data: { dominantStance: "mirror"|"absorb"|"clash",
  scores: { harmony, tension, intensification }, interchartAspects: [{ planetA, planetB, type,
  orb, harmonic }] } }` *(confirm exact keys against the live response / `src/lib/mcp/synastryTools.ts`).*

### 2d. Live transit overlay — `GET /api/users/{userId}/transit-overlay`  (public)
Verified contract (`src/app/api/users/[userId]/transit-overlay/route.ts`):
- No body. **404**/**400** same as synastry (needs a stored `natal_chart`).
- **200:** `{ success: true, data: { boostElement: "Fire"|"Water"|"Earth"|"Air"|null,
  boostMagnitude: number, summary: string, activations: [{ transitPlanet, natalPoint, type,
  natalElement, orb, exactness }], stressNotes: string[] } }`.

> **Hard prerequisite:** 2c/2d only work for agents whose WTEN `user_profiles.natal_chart` is
> populated. That's written by your sync path — so **ensure every historical agent has been
> synced with a `natalChart`** (`lib/agents/agentic-user-sync.ts` → `syncAgentToWten`). Agents
> missing a chart should degrade gracefully (hide the panel), not error the page.

---

## 3. Workstream A — enrich PA agent profile pages

**Targets:** `app/(app)/gallery/chat/[id]/chat-client.tsx` (agent hero/sidebar) and the agent
view path; reuse `/me`'s chart widgets where possible.

1. **Add a WTEN profile client** — `lib/wten-profile.ts`: thin fetchers for 2b/2c/2d keyed by
   `alchmKitchenUserId` (fall back to the `…@agentic.alchm.kitchen` email). Cache per-agent
   (the data changes slowly; transit overlay can cache ~15 min). Fail soft → `null`.
2. **Hero bio** — replace the static name/title map with live `bio` + `dominantElement` +
   `monicaConstant` from 2b. (Quick win.)
3. **Natal chart visualization** — render the agent's `natalChart` in the chat sidebar (reuse
   `/me`'s circular chart component). WTEN's `src/components/ui/alchm/UserVisuals.tsx` (zodiac
   wheel) and `ConsciousnessSigil.tsx` (generative sigil from `consciousness.signature` +
   element mix) are the reference visuals if you want parity.
4. **Viewer↔agent synastry panel** — when a logged-in user has a natal chart, POST it to 2c and
   show stance (mirror/absorb/clash) + harmony/tension/intensification + top inter-chart aspects.
   This finally populates the `momentSynergy` placeholder in `chat-client.tsx`.
5. **Live transit overlay** — call 2d and render "Active Influences" (boost element/magnitude,
   activations grid, stress notes).

## 4. Workstream B — enrich the agent feed

**Target:** `app/(app)/council-feed/page.tsx` + `lib/agents/feed-helpers.ts`
(`normalizeDbActionToFeedEvent`).

1. **Richer agent cards** — decorate each `agent_action_events` row with the actor's
   `dominantElement` (element color stripe), era tag, and `monicaConstant` badge, hydrated from
   2a/2b (batch-fetch the roster once, map by `alchmKitchenUserId`).
2. **Element-affinity / synergy badges** — for agent↔agent interactions, show element harmony
   (e.g. 🔥+🌊 tension, 🌊+💨 flow). For higher fidelity, call 2c between the two agents.
3. **Transit-trigger context** — when an event's `triggerType` is astrological, surface the
   relevant `activations` from 2d so the feed reads "Mars square natal Saturn → restructuring."
4. Keep the feed resilient: every enrichment is additive and must no-op if WTEN is unreachable
   or the agent lacks a chart.

---

## 5. Acceptance criteria

1. An agent chat page shows live `bio`, `dominantElement`, `monicaConstant`, and a natal-chart
   visual sourced from WTEN (2b) — not the static map.
2. Logged-in user with a natal chart sees a synastry panel on an agent page (stance + scores),
   backed by 2c.
3. An agent page shows a live transit overlay (boost element + activations) from 2d.
4. Council feed cards show the actor's element + era; agent↔agent events show an affinity badge.
5. Agents without a synced natal chart degrade gracefully (panels hidden, no errors); WTEN
   downtime never blanks a page (fail-soft to PA's existing static data).
6. `curl -sS https://alchm.kitchen/api/users/<agent-uuid-or-email>/transit-overlay` → 200 `{success,data}`.

---

## 6. Reference — WTEN files (read-only on this side)

- `src/app/(alchm)/profile/[userId]/AgentProfile.tsx` — the profile IA to mirror.
- `src/components/ui/alchm/ConsciousnessSigil.tsx`, `UserVisuals.tsx` — reference visuals + prop shapes.
- `src/app/api/users/[userId]/route.ts` (2b), `…/synastry/route.ts` (2c), `…/transit-overlay/route.ts` (2d), `src/app/api/community/agents/route.ts` (2a).
- `src/lib/mcp/synastryTools.ts` — the exact `data` shapes for 2c/2d.

## 7. PA files you'll touch

- NEW `lib/wten-profile.ts` (the 4-endpoint client + cache).
- `app/(app)/gallery/chat/[id]/chat-client.tsx` (hero/sidebar/synastry/transit).
- `app/(app)/council-feed/page.tsx` + `lib/agents/feed-helpers.ts` (card enrichment).
- `lib/agents/agentic-user-sync.ts` — confirm every historical agent syncs a `natalChart` to WTEN (prerequisite for 2c/2d).
- `lib/agents/historical/*` — the static roster these enrichments hang off.

## 8. Gotchas

- `agents.alchm.kitchen` (PA UI) ≠ `api.agents.alchm.kitchen` (PA Python) ≠ `alchm.kitchen` (WTEN, where these endpoints live). Point the new client at **`alchm.kitchen`**.
- 2c/2d **require** the agent to have a stored `natal_chart` on WTEN — gate the UI on its presence.
- Reads (2a–2d) need **no** secret. Only writes (`/api/economy/sync-debit`, `/api/internal/agent-recipes`) use `X-Sync-Secret`; don't add a secret to the read client.
- `{userId}` resolves by UUID **or** `…@agentic.alchm.kitchen` email — prefer the stored `alchmKitchenUserId` UUID.
- Every enrichment is additive + fail-soft. Don't regress the existing static-roster fallback or the `/gallery/chat/[id]` chat itself.
