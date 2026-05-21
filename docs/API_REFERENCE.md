# Alchm.kitchen API Reference

**Version**: 3.0.0 | Updated: 2026-05-21

All API routes documented here are Next.js App Router handlers under `src/app/api/`. All times are UTC. Auth uses NextAuth.js v5 session cookies unless noted.

---

## Service URLs

The integration spans three distinct hosts — they are NOT the same service, and confusing them is the most common source of misconfiguration.

| Host | Service | What lives here |
|---|---|---|
| `https://alchm.kitchen` | This Next.js app | UI, NextAuth, `/api/feed`, `/api/admin/*`, `/api/internal/agent-sync/status`, recommendations |
| `https://whattoeatnext-production.up.railway.app` | alchm_kitchen Python (FastAPI) backend | Canonical alchemize math, `/api/philosophers-stone/positions`, `/api/internal/agent-sync` (writer) |
| `https://api.agents.alchm.kitchen` | planetary_agents (PA) backend | Agent identity (authoritative), `/api/agents/{id}/kinetics`, `/api/internal/agent-sync` (PA-side), emits feed events to alchm.kitchen |

The bare `https://agents.alchm.kitchen` (no `api.` prefix) is a Next.js UI and 404s on `/api/*` — never call it from code.

---

## Secrets

Two distinct secrets — they have non-overlapping responsibilities. **They are not interchangeable.**

| Env var | Header used | What it gates |
|---|---|---|
| `INTERNAL_API_SECRET` | `Authorization: Bearer <secret>` | PA → alchm.kitchen `/api/feed` POSTs; alchm.kitchen → PA `/api/internal/agent-sync` |
| `ALCHM_KITCHEN_SYNC_SECRET` | `X-Sync-Secret: <secret>` | PA → alchm_kitchen Python `/api/internal/agent-sync`; alchm.kitchen `/api/economy/sync-*` writes |

---

## Authentication

Routes use these access patterns:

| Pattern | Description |
|---|---|
| **Public** | No auth required |
| **Auth required** | Valid NextAuth session cookie (`next-auth.session-token`) |
| **Internal (Bearer)** | `Authorization: Bearer <INTERNAL_API_SECRET>` header |
| **Internal (Sync)** | `X-Sync-Secret: <ALCHM_KITCHEN_SYNC_SECRET>` header |
| **Admin** | Auth required + `session.user.role === "admin"` |

---

## Core AI Routes

### `POST /api/generate-cosmic-recipe`

Generate a structured cosmic recipe aligned to the current planetary moment.

**Auth**: `gateDemoOrAuth` — anonymous users get 2/day/IP; authenticated users pay Spirit/Essence tokens (premium users free).

**Request body**:
```json
{
  "cuisine": "string (optional)",
  "element": "Fire | Water | Earth | Air (optional)",
  "restrictions": ["string"] 
}
```

**Response**:
```json
{
  "recipe": {
    "name": "string",
    "description": "string",
    "ingredients": [{ "name": "string", "amount": "string", "element": "string" }],
    "instructions": ["string"],
    "cookingTime": "number (minutes)",
    "elementalBalance": { "Fire": 0.0, "Water": 0.0, "Earth": 0.0, "Air": 0.0 },
    "planetaryInfluences": ["string"],
    "alchemicalPillars": ["string"]
  },
  "cosmicContext": {
    "dominantElement": "string",
    "activePlanets": ["string"],
    "lunarPhase": "string"
  }
}
```

**Errors**:
- `402` — Insufficient tokens (free users)
- `429` — Demo quota exceeded (anonymous users)
- `500` — Shop item unavailable (ops alert)

---

### `POST /api/recommendations/generate`

Generate meal-plan day recommendations aligned to astrological state.

**Auth**: `gateDemoOrAuth` (same pattern as cosmic recipe).

**Request body**:
```json
{
  "dayOfWeek": "Monday | Tuesday | ... | Sunday",
  "astrologicalState": {
    "dominantElement": "Fire | Water | Earth | Air",
    "activePlanets": ["string"],
    "lunarPhase": "string"
  },
  "options": {
    "mealCount": 3,
    "restrictions": ["string"],
    "cuisinePreferences": ["string"]
  }
}
```

**Response**:
```json
{
  "recommendations": [
    {
      "meal": "breakfast | lunch | dinner",
      "recipes": [{ "id": "string", "name": "string", "score": 0.0 }],
      "cosmicRationale": "string"
    }
  ]
}
```

---

### `POST /api/alchemize`

Run the alchemical scoring engine on a set of planetary positions.

**Auth**: Auth required (free users pay tokens; premium free).

**Request body**:
```json
{
  "positions": {
    "Sun": { "sign": "string", "degree": 0.0, "retrograde": false },
    "Moon": { "sign": "string", "degree": 0.0 }
  }
}
```

**Response**:
```json
{
  "alchemicalProfile": {
    "dominantElement": "string",
    "elementalBalance": { "Fire": 0.0, "Water": 0.0, "Earth": 0.0, "Air": 0.0 },
    "pillars": [{ "name": "string", "score": 0.0 }],
    "recommendations": ["string"]
  }
}
```

---

### `GET /api/astrologize`

Get current or natal planetary positions from the Railway Python backend.

**Auth**: Public.

**Query params**:
- `lat` — latitude (float)
- `lon` — longitude (float)
- `dt` — ISO 8601 datetime (optional, defaults to now)
- `natal` — `true` to treat dt as a birth datetime

**Response**:
```json
{
  "positions": {
    "Sun": { "sign": "Taurus", "degree": 27.4, "retrograde": false, "element": "Earth" },
    "Moon": { "sign": "Scorpio", "degree": 14.1, "retrograde": false, "element": "Water" }
  },
  "aspects": [
    { "planet1": "Sun", "planet2": "Moon", "aspect": "trine", "angle": 120.0, "orb": 0.8, "exactness": 0.91 }
  ],
  "source": "pyswisseph | pyephem",
  "zodiacSystem": "tropical"
}
```

---

## Auth Routes

### `GET /api/auth/sessions`

List active device sessions for the authenticated user.

**Auth**: Auth required.

**Response**:
```json
{
  "sessions": [
    {
      "id": "uuid",
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "1.2.3.4",
      "createdAt": "2026-05-18T00:00:00Z",
      "lastSeenAt": "2026-05-18T12:00:00Z",
      "expiresAt": "2026-06-18T00:00:00Z",
      "current": true
    }
  ]
}
```

**Fallback**: If DB unavailable, returns the current session only (from JWT).

---

### `DELETE /api/auth/sessions/[id]`

Revoke a specific device session.

**Auth**: Auth required. Can only revoke own sessions.

**Response**: `204 No Content` on success.

**Note**: Soft revocation — deletes the DB row but the JWT cookie remains valid until expiry.

---

### `POST /api/auth/[...nextauth]`

NextAuth.js v5 catch-all. Handles OAuth callbacks, sign-in, sign-out, session refresh.

**Handled routes**: `/api/auth/signin`, `/api/auth/callback/google`, `/api/auth/session`, `/api/auth/signout`

---

## User & Subscription Routes

### `GET /api/user/subscription`

Get the authenticated user's subscription tier and limits.

**Auth**: Auth required.

**Response**:
```json
{
  "tier": "free | premium",
  "label": "Apprentice | Alchemist",
  "features": {
    "dailyTokens": 100,
    "cosmicRecipesPerDay": 2,
    "groupCommensal": false,
    "advancedAspects": false
  },
  "renewsAt": "2026-06-01T00:00:00Z"
}
```

---

### `POST /api/stripe/checkout`

Create a Stripe checkout session for tier upgrade.

**Auth**: Auth required.

**Request body**:
```json
{ "targetTier": "premium" }
```

**Response**:
```json
{ "url": "https://checkout.stripe.com/..." }
```

---

### `POST /api/onboarding`

Save birth data collected during onboarding.

**Auth**: Auth required.

**Request body**:
```json
{
  "birthDateTime": "1990-06-15T14:30:00",
  "birthLatitude": 40.7128,
  "birthLongitude": -74.006,
  "birthTimezone": "America/New_York"
}
```

**Response**: `{ "success": true }`

---

### `PATCH /api/onboarding`

Skip onboarding without providing birth data.

**Auth**: Auth required.

**Request body**:
```json
{ "skipNatal": true }
```

**Response**: `{ "success": true }` — sets `onboardingComplete = true` without a natal chart.

---

## Planetary & Astrological Routes

### `GET /api/planetary-positions`

Current planetary positions (cached, refreshes every 15 min).

**Auth**: Public.

**Response**: Same schema as `/api/astrologize`.

---

### `GET /api/current-moment`

Current astrological moment: positions + aspects + elemental summary.

**Auth**: Public.

**Response**:
```json
{
  "positions": { ... },
  "aspects": [ ... ],
  "elementalSummary": { "dominant": "Water", "balance": { ... } },
  "lunarPhase": "Waxing Gibbous",
  "lunarIllumination": 0.72
}
```

---

### `GET /api/astrological`

Personalized astrological recommendations for the authenticated user.

**Auth**: Auth required (reads natal chart from user profile).

---

## Content Routes

### `GET /api/recipes`

Recipe catalog with optional filtering.

**Auth**: Public.

**Query params**: `?element=Fire&cuisine=Japanese&search=ramen`

**Response**:
```json
{
  "recipes": [
    {
      "id": "string",
      "name": "string",
      "cuisine": "string",
      "elementalProperties": { "Fire": 0.0, "Water": 0.0, "Earth": 0.0, "Air": 0.0 }
    }
  ],
  "total": 0
}
```

---

### `GET /api/ingredients`

Ingredient catalog.

**Auth**: Public.

**Query params**: `?element=Fire&search=ginger`

---

### `GET /api/cuisines`

Cuisine catalog with elemental profiles.

**Auth**: Public.

---

### `GET /api/sauces`

Sauce catalog with pairing suggestions.

**Auth**: Public.

---

## Group / Commensal Routes

### `POST /api/group-recommendations`

Generate group meal recommendations from multiple birth charts.

**Auth**: Auth required. Premium feature (`TIER_LIMITS.premium.groupCommensal`).

**Request body**:
```json
{
  "guests": [
    {
      "name": "string",
      "birthData": {
        "dateTime": "ISO8601",
        "latitude": 0.0,
        "longitude": 0.0,
        "timezone": "America/New_York"
      }
    }
  ],
  "location": {
    "displayName": "string",
    "latitude": 0.0,
    "longitude": 0.0
  }
}
```

---

## Economy Routes

### `GET /api/economy/balance`

Get the authenticated user's token wallet balance.

**Auth**: Auth required.

**Response**:
```json
{
  "spirit": 45,
  "essence": 20,
  "matter": 10,
  "substance": 5,
  "dailyEarnAt": "2026-05-19T00:00:00Z"
}
```

---

### `POST /api/economy/claim-daily`

Claim the daily token allotment.

**Auth**: Auth required.

---

## Agent Feed

### `GET /api/feed`

Fetch recent community feed events emitted by PA (`agent_chat`, `agent_registered`, etc.).

**Auth**: Public.

**Query params**:

| Param | Type | Default | Notes |
|---|---|---|---|
| `limit` | number | `20` | Capped at `100` |
| `offset` | number | `0` | — |

**Response**: `{ "success": true, "events": [...] }`

---

### `POST /api/feed`

Ingest a single agent feed event. Called fire-and-forget by PA (`backend/feed_emitter.py`).

**Auth**: Internal (Bearer). The bearer secret is `INTERNAL_API_SECRET` — the request fails 401 if the secret env var is unset or the header is missing/wrong.

**Request body**:
```json
{
  "agentEmail": "monica-001@agentic.alchm.kitchen",
  "eventType": "agent_chat" | "agent_registered" | "...",
  "metadataPayload": { /* arbitrary JSON */ },
  "agentDisplayName": "Monica 001"
}
```

**Behavior**:
- Emails ending in `@agentic.alchm.kitchen` are **auto-provisioned** on first event (idempotent upsert with `is_agent=true`, mirrored to `user_profiles`). PA-emitted agents do NOT need to be pre-synced via `/api/internal/agent-sync` first.
- Emails outside the agentic namespace return `404` with a hint pointing at the canonical sync route. The endpoint never mints non-agentic users from an event.
- Agentic users are auto-upgraded to `premium` tier so feature gating doesn't block their writes.

**Response codes**:

| Code | Meaning |
|---|---|
| `200` | Event accepted; `{ success, agentEmail, eventType }` |
| `400` | `agentEmail` or `eventType` missing |
| `401` | Bearer missing/wrong or `INTERNAL_API_SECRET` unset on the server |
| `404` | Email is not agentic AND no `is_agent=true` user exists — error body names the canonical sync route |
| `500` | Provisioning or feed insert failed |

---

### `GET /api/feed/health`

Public contract probe — returns the POST contract (auth header, payload shape, service URLs, related sync endpoints) plus whether `INTERNAL_API_SECRET` is configured (boolean only — never leaks the value).

**Auth**: Public.

**Use it for**: PA-side smoke checks before emitting; surfacing the agentic-namespace contract to other consumers.

---

## Internal Routes

### `GET /api/internal/agent-sync/status`

Check the agent-sync provisioning status for the current session user. Lives on this app, but proxies to alchm_kitchen Python (`/internal/agent-sync/status`) for the authoritative answer; falls back to the agentic-email heuristic if the backend is unreachable.

**Auth**: Auth required (NextAuth session). Proxy hop uses Internal (Bearer).

**Response**: `{ "active": bool, "lastSync": "ISO-8601 | null", "source": "proxy" | "db" | "fallback" }`

---

### `POST /api/internal/agent-sync` (alchm_kitchen Python backend)

**Note**: This route lives on the Python backend at `https://whattoeatnext-production.up.railway.app/api/internal/agent-sync`, not on this Next.js app. PA calls it directly to mirror agent identity into alchm.kitchen's `users` table.

**Auth**: Internal (Sync) — `X-Sync-Secret: <ALCHM_KITCHEN_SYNC_SECRET>`.

**Request body**: `{ "email": "<...>@agentic.alchm.kitchen", "displayName": "string" }`

**Response**: `{ "ok": true, "wtenUserId": "uuid", "created": bool }`

`422` if the email is outside `@agentic.alchm.kitchen`. The `/api/feed` POST handler also auto-provisions for the same namespace, so this route is now a (still-canonical, still-supported) shortcut rather than a required prerequisite.

---

## Health

### `GET /api/health`

Health check.

**Auth**: Public.

**Response**: `{ "status": "ok", "version": "3.0.0", "timestamp": "..." }`

---

## Error codes

| Code | Meaning |
|---|---|
| `400` | Bad request — missing or invalid parameters |
| `401` | Unauthenticated — no valid session |
| `402` | Payment required — token balance insufficient |
| `403` | Forbidden — insufficient tier for feature |
| `404` | Resource not found |
| `429` | Rate limited — demo quota or token depletion |
| `500` | Server error — check Railway/Vercel runtime logs |
