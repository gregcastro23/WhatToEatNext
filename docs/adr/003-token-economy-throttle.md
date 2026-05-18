# ADR-003: Token Economy as the Primary AI Throttle

**Status**: Accepted  
**Date**: 2026-05-09  
**Deciders**: Greg Castro  

---

## Context

AI generation routes (cosmic recipe, recommendation generation) need rate limiting to prevent:
1. Cost explosions from heavy users
2. Anonymous users scraping generation at scale
3. Free-tier bypass via direct API calls

Two approaches were considered:

**Option A — Hard monthly caps per tier**: Simple, predictable, but binary. A free user who generates 5 cosmic recipes/month is blocked on recipe 6 even if they have low API cost.

**Option B — Token economy**: Users have a wallet of Spirit/Essence/Matter/Substance tokens. AI actions cost tokens. Users earn tokens daily. Premium users get unlimited tokens. Free users can purchase more. Costs are personalized by natal chart × current chart.

## Decision

Use the **token economy** (Option B) as the primary throttle for authenticated users.

- **Anonymous users**: Hard demo quota (2 cosmic recipes/IP/day) enforced in `gateDemoOrAuth()`.
- **Free authenticated users**: Charged per action from their token wallet. Token debit happens server-side before the AI call.
- **Premium users**: Bypass the token debit. Their throttle is Vercel's request timeout (60s).

Personalized live pricing (`src/lib/economy/livePricing.ts`) adjusts the token cost by the user's elemental resonance at the moment of the request. This creates a natural variation in effective limits and rewards astrologically aligned timing.

**Server-side enforcement** happens in:
- `POST /api/generate-cosmic-recipe` — debit `unlock-cosmic-recipe` shop item
- `POST /api/recommendations/generate` — debit `unlock-basic-recipe` shop item
- `POST /api/alchemize` — debit per call (free users only)

## Consequences

**Positive:**
- Granular, continuous throttle (not binary month-end cliff)
- Personalized pricing creates genuine astrological game mechanics
- Token economy is also a monetization vector (token packs for purchase)
- Daily token earn gives users a reason to return daily

**Negative:**
- More complex than hard caps — shop items must be configured correctly in DB
- If `tokenEconomy.getShopItem()` returns null (misconfiguration), the API returns 500 instead of gracefully throttling
- Free users who run out of tokens mid-session get a worse UX than a clean "monthly limit reached" message

**Monitoring**: Token depletion events are logged. If the shop item is unavailable, the route returns `{ error: "shop_item_unavailable" }` with a 500 — this is an ops alert, not a user error.
