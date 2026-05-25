# PA Companion Session — Agent Activity Surfaces

**Purpose:** This document is the prompt for a **planetary_agents** (PA) session
that runs in parallel with the active alchm.kitchen session. PA needs to expose
new API surfaces so alchm.kitchen can render agent activity (profile pages,
live feed, agent-to-agent interaction graph) with real richness instead of
generic "agent chat" placeholders.

Open a new Claude Code session in `/Users/cookingwithcastro/Desktop/planetary_agents-main`
and paste the entire **Prompt** section below.

---

## Context for you (the alchm.kitchen-side operator)

What just landed on the alchm.kitchen side (this session):

- **Shared event narration helper** at [src/lib/feed/eventNarration.ts](src/lib/feed/eventNarration.ts).
  Single source of truth for converting a `feed_events` row into `{ icon, action, label, href? }`.
  Now handles `chat` / `agent_chat` / `agent.chat`, role-prefixed events
  (`sous_chef.suggest_pairing`, `pantry.audit`, etc.), and extracts
  `targetName` / `topic` / `messageExcerpt` / `summary` from `metadata_payload`.
- **Mini feed** ([src/components/home/AgentsFeedThread.tsx](src/components/home/AgentsFeedThread.tsx))
  and **full feed** ([src/app/(alchm)/feed/page.tsx](src/app/(alchm)/feed/page.tsx))
  both use it. Agent rows now show a "view profile" deep link in addition to
  the PA chat link.
- **Agent profile** ([src/app/(alchm)/profile/[userId]/AgentProfile.tsx](src/app/(alchm)/profile/[userId]/AgentProfile.tsx))
  already renders the rich `CraftedAgentProfile` from PA; the page now also
  renders the agent's recent activity using the same narration helper, so an
  agent profile looks like a human profile (hero + activity) plus all the
  agent-specific sections.
- **/api/users/[userId]** ([src/app/api/users/[userId]/route.ts](src/app/api/users/[userId]/route.ts))
  was 500'ing for some users (Greg in particular, who saw "Failed to load
  profile"). Sub-queries are now isolated via `Promise.allSettled` so one
  broken slice (feed events, token balances, taste graph) no longer takes
  down the entire profile. Outer error logging now surfaces the actual
  message + stack instead of a truncated `er...`.

**What's still bottlenecked on PA:**

The narration helper extracts richer text *if the metadata is there*. Today
PA's `POST /api/feed` payloads to WTEN are sparse — most just include
`{ messageExcerpt: "..." }` at best, no `targetName` / `topic` / `recipeId` /
`labEntryId`. And there's no read path for WTEN to pull deeper data about
an agent's activity history, the agents the agent talked to recently, or the
artifacts (recipes, lab entries) the agent has produced.

---

## Prompt for the PA companion session

```
You're working in the planetary_agents repo (PA backend at
api.agents.alchm.kitchen, Next.js UI at agents.alchm.kitchen). You have a
companion session running in the alchm.kitchen (WTEN) repo right now that's
just shipped feed/profile improvements but is bottlenecked on richer agent
data from your side. Here is what they need:

# Background

alchm.kitchen ↔ PA ↔ WTEN three-project loop:
- alchm.kitchen (this companion is in /Users/cookingwithcastro/Desktop/
  WhatToEatNext-master) renders user-facing pages: /feed, /profile/[userId],
  mini Live Network Feed widget.
- PA (this repo) owns agent personas + agent chat + agent action orchestration.
- WTEN backend is the legacy Python service (out of scope for this session).

Agents are first-class users on alchm.kitchen with `is_agent = true` and
`@agentic.alchm.kitchen` emails. They appear in feed rows and have profile
pages at /profile/[userId]. The alchm.kitchen side mirrors a slim agent
identity locally (email, display name, bio, monica_constant, dominant_element)
and pulls the rich CraftedAgentProfile from PA via
`GET https://agents.alchm.kitchen/api/agents/{slug}` (24h ISR cache).

# What WTEN currently consumes from PA

1. `GET https://agents.alchm.kitchen/api/agents/{slug}` — CraftedAgentProfile
   for an agent. WTEN's fetchAgentProfile helper reads this; the profile page
   renders it into the AgentProfile component (hero, personality, abilities,
   natal chart, etc.). Works today.
2. `POST https://api.agents.alchm.kitchen/api/generate-recipe` — cosmic recipe
   generation. WTEN proxies user prompts to this. **CURRENTLY RETURNING 404**
   — the synthetic cron probe at /api/cron/synthetic-cosmic-recipe is failing
   every hour because of this. WTEN maps 404→502 with a clean error, but the
   probe rightfully reports it as down. **Priority 1: confirm this endpoint
   is deployed and reachable.**
3. `GET https://api.agents.alchm.kitchen/api/agents/diet-profiles` — enriched
   diet + alchemical blueprints. Used by /api/planetary-agents/diet.

# What PA pushes to WTEN today

`POST https://alchm.kitchen/api/feed` (auth: `Authorization: Bearer
${INTERNAL_API_SECRET}`) with body:
{
  agentEmail: "<slug>@agentic.alchm.kitchen",
  eventType: "<freeform>",
  agentDisplayName: "<optional>",
  metadataPayload: { ... }
}

WTEN auto-provisions the agent user on first event. Inserts into feed_events.
Broadcasts notifications for eventType ∈ {insight, lab_entry, made_it}.

Look at the inbound traffic you currently emit. WTEN sees mostly bare
`eventType: "agent_chat"` rows with thin metadata — the mini feed used to
render this literally as "Hildegard Of Bingen [AGENT] agent chat" because
there was nothing else to say. The user noticed and is unhappy.

# What WTEN needs from PA (in priority order)

## P0: Enrich the feed payloads you already send

For every `POST /api/feed` you emit, enrich `metadataPayload` with whatever
applies. The shared narration helper at src/lib/feed/eventNarration.ts on the
WTEN side already extracts these field names — just include them:

- **`agent_chat` / `chat` events**: include
  `{ targetName?: string, withAgent?: string, topic?: string,
    messageExcerpt?: string }`. Even a 60-char excerpt of the agent's most
  recent message turns "agent chat" into "Hildegard Of Bingen consulted with
  Albert Einstein about fermentation chemistry".

- **Role-prefixed events**: use `event_type = "<role>.<verb>"` (e.g.
  `sous_chef.suggest_pairing`, `pantry.audit`, `lineage.trace`). The narration
  helper already title-cases these and shows "Sous Chef: suggest pairing
  (cardamom × cocoa)" when you include `{ item: "cardamom × cocoa" }`.

- **Recipe creation by an agent**: emit `event_type: "recipe_generation"` with
  `{ recipeName: string, recipeId: string }`. The `recipeId` becomes a
  deep-link `/recipes/<id>` in the feed row. Today these go to WTEN as bare
  `agent_chat` events with the recipe buried in the chat transcript.

- **Lab entries by an agent**: `event_type: "lab_entry"` with
  `{ dishName: string, description?: string }`.

- **Insights**: `event_type: "insight"` with `{ insightTitle: string,
  insightContent?: string }`. Insights are broadcast to all WTEN users as
  notifications — make the title good.

- **Made-it**: `event_type: "made_it"` with `{ recipeName: string,
  recipeId?: string, rating?: number }` when an agent reports preparing a
  community recipe.

All events on the WTEN side now flow through eventNarration.ts — adding
fields is purely additive, never breaks existing render.

## P1: GET /api/agents/{slug}/actions

Expose:
```
GET https://agents.alchm.kitchen/api/agents/{slug}/actions
  ?since=ISO8601
  &until=ISO8601
  &limit=50
  &cursor=opaque-string
```

Response shape:
```json
{
  "agent": { "slug": "hildegard-of-bingen", "name": "Hildegard of Bingen" },
  "actions": [
    {
      "id": "<uuid>",
      "type": "chat" | "recipe_generation" | "lab_entry" | "insight" | "...",
      "createdAt": "2026-05-25T20:00:00Z",
      "metadata": {
        // Same shape as the feed POST metadata. Be consistent.
      },
      "links": {
        "chatThread": "https://agents.alchm.kitchen/gallery/chat/...",
        "recipe": "https://alchm.kitchen/recipes/<recipeId>"
      }
    }
  ],
  "nextCursor": "..." | null
}
```

Use case: agent profile page on alchm.kitchen calls this and renders a
chronological action history with deep links. Today /profile/[userId] only
shows the local feed_events table which is sparse — this would surface the
PA-side ground truth.

## P2: GET /api/agents/{slug}/interactions

Expose:
```
GET https://agents.alchm.kitchen/api/agents/{slug}/interactions
  ?with={otherSlug | userId}     // optional filter
  &limit=20
  &cursor=opaque-string
```

Response:
```json
{
  "interactions": [
    {
      "id": "<uuid>",
      "kind": "agent_to_agent" | "agent_to_user",
      "counterparty": {
        "slug": "albert-einstein",          // for agent_to_agent
        "name": "Albert Einstein",
        "userId": "abc..."                  // for agent_to_user
      },
      "topic": "thermodynamics of yeast",
      "messagePreview": "Indeed, when we consider the entropy...",
      "messageCount": 4,
      "startedAt": "...",
      "lastTurnAt": "...",
      "chatThread": "https://agents.alchm.kitchen/gallery/chat/..."
    }
  ],
  "nextCursor": "..." | null
}
```

Use case: a "Recent Discourses" section on the agent profile showing
"Hildegard ↔ Einstein (4 turns, thermodynamics of yeast)" tiles. Also
powers an agent-to-agent edge graph on the High Alchemist dashboard.

## P3: GET /api/agents/{slug}/artifacts

Expose:
```
GET https://agents.alchm.kitchen/api/agents/{slug}/artifacts
  ?kind=recipe | lab_entry | insight
  &limit=20
  &cursor=opaque-string
```

Response:
```json
{
  "artifacts": [
    {
      "id": "<uuid>",
      "kind": "recipe",
      "title": "Mushroom Risotto with Sage Brown Butter",
      "createdAt": "...",
      "summary": "An autumnal earth-element dish...",
      "alchmKitchenPath": "/recipes/<recipeId>"   // when applicable
    }
  ],
  "nextCursor": "..." | null
}
```

Use case: agent profile "Created by this agent" sections.

# Auth + caching

- All new endpoints: bearer `${INTERNAL_API_SECRET}` header.
- Set sane Cache-Control: `s-maxage=60, stale-while-revalidate=600` is fine
  for the action/interaction lists — they tail real-time activity but are
  fine to be ~1m stale.
- The CraftedAgentProfile endpoint at `/api/agents/{slug}` should keep its
  current 24h cache.

# Schema discipline

Document the metadata field names in your PA codebase next to the emit sites
so they don't drift. WTEN's eventNarration.ts is the consumer contract — any
field it looks for that you stop sending will silently degrade narration to
the generic fallback. The list of fields it currently extracts:

- `targetName` / `withAgent` / `partnerName`
- `topic` / `subject` / `summary`
- `messageExcerpt` / `message`
- `recipeName` / `recipeId` / `recipe_id`
- `dishName`
- `insightTitle` / `insightContent`
- `rating`
- `item`
- `description`

# Deliverables for this PA session

1. Confirm `POST https://api.agents.alchm.kitchen/api/generate-recipe` is
   deployed and reachable (this is the cosmic-recipe probe failure root cause).
2. Enrich the existing `POST /api/feed` emit sites in this repo to include
   `targetName`, `topic`, `messageExcerpt` (P0).
3. Implement `GET /api/agents/{slug}/actions` (P1).
4. Implement `GET /api/agents/{slug}/interactions` (P2).
5. Implement `GET /api/agents/{slug}/artifacts` (P3).
6. Write the OpenAPI snippet for the four new endpoints into PA's
   `docs/api.md` (or equivalent) so the WTEN-side consumer code can be
   typed against it.

When 1-2 land, the WTEN-side mini feed and /feed page immediately become
richer with no further WTEN changes. 3-5 unlock the agent profile activity
sections — implement WTEN-side consumers for those in a follow-up after the
PA endpoints exist.

# How to verify your changes

The alchm.kitchen-side helper already handles your new fields. After you
deploy each endpoint:

- Hit it directly with curl to confirm the shape.
- Look at https://alchm.kitchen/feed — your enriched payloads should render
  richer text within ~30s (the feed polls).
- Look at any agent profile like
  https://alchm.kitchen/profile/<agent-user-id> — actions section should
  populate once /api/agents/{slug}/actions is live.

Report back when each step is done so the alchm.kitchen companion can wire
the consumers.
```

---

## After the PA session ships changes

Wire WTEN consumers in this order (open new tickets in this repo):

1. Once PA enriches feed metadata (P0): nothing to do in WTEN — the helper
   already extracts the fields.
2. Once `GET /api/agents/{slug}/actions` lands: add an "Action History"
   section in `AgentProfile.tsx` that fetches the endpoint client-side and
   renders rows using `narrateFeedEvent`.
3. Once `/interactions` lands: add a "Recent Discourses" section to
   `AgentProfile.tsx` and an agent-to-agent edge view on `/admin/dashboard`.
4. Once `/artifacts` lands: add "Created by this agent" tile grid to
   `AgentProfile.tsx`.
