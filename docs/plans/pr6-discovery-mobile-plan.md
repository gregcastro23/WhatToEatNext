<!-- Plan authored 2026-07-12 by the PR6 design agent; verbatim. Read alongside tables-program-sequencing.md (binding arbitration). -->

# PR 6 — Discovery & Mobile: Implementation Plan

Branch: `feat/tables-discovery`. Hard dependency: `feat/tables-entity` (PR 2) merged — `/api/discover/tables` reads its `tables` schema and the bottom tab targets `/tables`. Everything else degrades gracefully (details in §6).

## 0. What investigation established

- **Tables schema (verified on `feat/tables-entity`, `database/init/60-tables-schema.sql`)**: has `visibility public|commensals|private`, `scheduled_at`, `composite_snapshot`, but **no venue coordinates and no seat capacity** — venue is `venue_type/venue_restaurant_id/venue_name/venue_address` only. The `restaurants` table (`database/init/27-restaurant-connect-schema.sql`) also has no lat/lng; coordinates in the best-match explorer come from providers (Google/Yelp/Foursquare/Overpass) at query time inside `src/services/restaurantDiscoveryService.ts` (which has a private `haversineMeters` at line 1232). Geocoding exists: `GET /api/geocoding` → `geocodeLocation`. **Conclusion: migration 68 is genuinely needed** (geo columns + seat cap + discovery indexes).
- **Compatibility math to reuse**: `elementalHarmony` (cosine similarity over Fire/Water/Earth/Air, neutral 0.7 for empty vectors) is module-private in `src/app/api/group-recommendations/route.ts` (lines 76–84); `src/utils/groupDynamics.ts` uses `calculateElementalHarmony` from `src/utils/astrology/elementalValidation.ts`. Per-user elemental profiles come from `commensalDatabase.getUserElementalProfile` — the PR #589-fixed chain (`user_profiles.natal_chart` → `users.profile` JSONB). `composite_snapshot.compositeChart.elementalBalance` exists (`src/lib/tables/composite.ts`, `CompositeSnapshot` v1).
- **Synastry cache (migration 47)**: `agent_natal_positions` + materialized views `synastry_aspects`/`synastry_scores`, consumed by `src/lib/mcp/synastryTools.ts` (`readCachedScores`, `upsertNatalPositions` + global `refresh_synastry_views()`). It is **agent-keyed and its refresh is a global O(N²) MV rebuild** — wrong tool for a paginated human directory. User-facing person↔person deep synastry already exists at `POST /api/users/[userId]/synastry`.
- **Directory pattern**: `GET /api/community/agents` (public, `redisCached` 30s, `is_agent=true`, `up.bio/dominant_element`) + `AgentsTab` in `src/app/(alchm)/feed/page.tsx` (client search/sort). `GET /api/users/search` is auth-required/min-3-chars/LIMIT 10 — unsuitable for a directory, left untouched.
- **Blocks**: `commensalships.status='blocked'` pair rows; `isBlockedPair`/`hasAcceptedCommensalship` already exist in `tableDatabaseService` on the PR 2 branch; block endpoint `POST /api/commensals/block` (PR #589).
- **Opt-out storage**: `users.preferences JSONB DEFAULT '{}'` exists (migration 12) — no migration needed for the directory opt-out.
- **Nav**: `src/config/navigation.ts` (`NAV_IA`) feeds `RedesignedHeader` (iterates `PRIMARY_KEYS`) and `CommandPalette` (`getAllNavRoutes()`) automatically; `MobileGlassTabBar` has its own hardcoded `TABS` (4 tabs + 56px center quick-action FAB, grid `1fr 1fr 56px 1fr 1fr`). Existing `/discover` (`src/app/discover/page.tsx`) is the pantry launchpad. Middleware does not gate `/discover` or `/tables`.
- **UI kit (merged, on origin/master)**: `src/components/tables/ui/` — `CompositeRadialBadge` already ships `variant="compatibility"` (0..1 value, copper→violet arc, centered %, progressbar a11y), plus `GlassPanel`, `ElementChip`, `LabelXS`, `AvatarRow`, `AvatarCircle`, `GradientButton`.
- **Economy**: `practice_events` ledger (migration 57) + `src/lib/economy/practices.ts`; `recommendation_acted`'s description already covers "a cuisine, recipe, **or table**"; `DISCOVERABLE_SURFACES` allowlist is the control point for `surface_discovered`. No map library exists in package.json — map strip must be the static styled fallback.
- **Feed-driven discovery (mode d)**: confirmed **no work needed** — PR 2's `table_memory` feed cards + PR 5 reactions/comments are the feed-driven path; PR 6 adds nothing there.

---

## 1. Migrations (slot 68 — genuinely needed)

**`database/init/68-tables-discovery.sql`**
```sql
ALTER TABLE tables ADD COLUMN IF NOT EXISTS venue_lat DOUBLE PRECISION;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS venue_lng DOUBLE PRECISION;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS seat_cap SMALLINT
  CHECK (seat_cap IS NULL OR seat_cap BETWEEN 2 AND 24);
-- privacy invariant: home tables NEVER carry coordinates (defense-in-depth;
-- app layer also refuses them). Guarded DO $$ ADD CONSTRAINT (no IF NOT EXISTS for constraints).
--   CHECK (venue_type <> 'home' OR (venue_lat IS NULL AND venue_lng IS NULL))
CREATE INDEX IF NOT EXISTS idx_tables_discover
  ON tables (visibility, status, scheduled_at) WHERE visibility IN ('public','commensals');
CREATE INDEX IF NOT EXISTS idx_tables_geo
  ON tables (venue_lat, venue_lng) WHERE venue_lat IS NOT NULL;
```

**`database/init/69-notification-type-table-join-request.sql`** (`-- migrate:no-transaction`, mirrors 49/61/63): `ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'table_join_request';`

Per the sequencing doc's mandatory rule: re-verify `68-`/`69-` are free against origin/master immediately before the final commit and update `docs/plans/tables-program-sequencing.md` with the assigned numbers.

**Geo writes** (small patch to PR 2's `POST /api/tables` + `PATCH /api/tables/[id]`): accept optional `venueLat/venueLng` (Zod, valid ranges) and `seatCap`, **rejected when `venueType === 'home'`**. When a restaurant/other venue has an address but no coords, best-effort server-side `geocodeLocation(venue_address)` (awaited, failure-tolerant — coords stay NULL, table still saves). Client passes provider coords when the host picks a restaurant from search. No backfill needed.

## 2. Compatibility computation — exact reuse plan

- **Extract, don't invent**: move the cosine `elementalHarmony` out of `src/app/api/group-recommendations/route.ts` into a new shared `src/utils/elemental/harmony.ts` (`elementalCosineHarmony(a, b): number`), and import it back into that route (zero behavior change; add a parity test). This one function powers both discovery scores. `calculateElementalHarmony`/`computeGroupDynamics` remain untouched for their existing consumers.
- **User↔table**: `pct = round(100 * elementalCosineHarmony(viewerBalance, snapshot.compositeChart.elementalBalance))`. Viewer balance loaded **once per request** via `commensalDatabase.getUserElementalProfile(viewerId)`; the table side is extracted in SQL (`composite_snapshot->'compositeChart'->'elementalBalance'`) — no chart computation per row. Null when either side is missing (UI degrades, see §4). **Invalidation is free**: PR 2 recomputes the snapshot on RSVP/member changes; discovery always reads the current snapshot.
- **Person↔person (directory + kindred rail)**: cosine over precomputed `user_profiles.natal_chart->'elementalBalance'` extracted in the directory SQL. Cost bound: ≤ page-size (24–48) float ops per request; **never** N full-chart computations, never per-row `getUserElementalProfile` calls.
- **Synastry cache (47)**: explicitly NOT used for the directory (agent-keyed, global O(N²) MV refresh). It stays serving the Jing Arena + the existing `POST /api/users/[userId]/synastry` profile deep-dive, which PR 6 merely links to from person profiles. Do not upsert human users into `agent_natal_positions`.
- **Caching**: anon public-tables responses `redisCached` 60s keyed on a params hash; the per-viewer "kindred alchemists" rail `redisCached` 300s (`discover:kindred:<viewerId>`, candidate pool = 200 most-recently-created active users with non-null balance); paginated authed pages uncached (cheap arithmetic). Rails compute over a bounded candidate window (≤ 60 tables / ≤ 200 people) then sort and slice server-side.

## 3. Discovery APIs

New service `src/services/discoveryService.ts` (SQL + scoring composition; reuses `tableDatabaseService` row mappers where exported) and two routes (nodejs, force-dynamic, Zod, `rateLimit` from `src/lib/rateLimit.ts`).

**`GET /api/discover/tables`** — auth optional (`getUserIdFromRequest`).
- Params: `lat,lng,radiusKm` (default 25, max 100 — near-me), `element` (my-element filter vs snapshot dominant), `openSeats` (bool), `windowDays` (default 30), `q` (title/venue_name ILIKE), `sort=soonest|match|distance` (match auth-only; distance requires lat/lng), `cursor`, `limit` (default 20, max 40).
- Base predicate: `status IN ('planned','live') AND scheduled_at BETWEEN now()-interval '3 hours' AND now()+windowDays` AND visibility gate: `visibility='public'` OR (viewer present AND `visibility='commensals'` AND EXISTS accepted commensalship(host, viewer)). `private` never surfaces. Viewer present → `NOT EXISTS` blocked pair (viewer, host) — both directions, same SQL as `isBlockedPair`. Viewer's own/joined tables excluded (they live on `/tables`).
- Near-me: bounding-box prefilter on `venue_lat/venue_lng` (uses `idx_tables_geo`), exact haversine + `distanceKm` computed in JS — **export/reuse the haversine from `restaurantDiscoveryService.ts`** rather than writing a new one. Home tables have NULL coords by invariant, so they can never appear in geo results.
- Keyset pagination: `ORDER BY scheduled_at ASC, id ASC`, cursor = base64 `(scheduled_at, id)`, `LIMIT limit+1` → `nextCursor`.
- Row payload: `{id, title, scheduledAt, status, venue:{type, name}, distanceKm?, photoUrl?, host:{id, name, avatarUrl|null, dominantElement|null}, joinedCount, seatCap|null, seatsLeft|null, compatibility|null, dominantElement|null}`. **Never `venue_address`, never member lists, never home coordinates** — home venues render as `{type:'home'}` with no name/geo. `seatsLeft = seat_cap - joinedCount` only when `seat_cap` set; `openSeats` filter falls back to `joinedCount < 24` when unset.
- Anon: public tables only, `compatibility: null`, RL 20/min per IP (`bucket:'discover-tables'`); authed 60/min per user id.
- Rail: "Tables near your energy" = same service, `sort=match&limit=6` over the next-60 candidate window.

**`GET /api/discover/people`** — **auth required** (anon UI uses the already-public `/api/community/agents` for the agents rail + sign-in CTA; a logged-out human directory is a scraping surface we don't open).
- Params: `q` (≥2 chars, ILIKE on `up.name`/`u.name`), `kind=all|people|agents` (default all — **agents are first-class entries**, filterable), `element`, `sort=recent|match` (match = kindred rail path), `cursor`, `limit` (default 24, max 48).
- Predicate: `u.is_active AND u.id <> viewer AND NOT blocked-pair(u.id, viewer) AND COALESCE((u.preferences->>'discoverable')::boolean, true)` — the opt-out key. Agents ignore the opt-out (they are content). Keyset: `ORDER BY u.created_at DESC, u.id DESC`.
- SELECT per row: id, display name (`up.name → u.name → email local-part`), `u.image`, `up.bio`, `up.dominant_element`, `up.natal_chart->'elementalBalance'`, `u.is_agent`. JS enrichment: dominant element (derive from balance for humans), `compatibility|null`, `mutualCommensals` (one batched query: viewer's accepted-partner set loaded once, then a single `ANY($candidateIds)` aggregate — not per-row round-trips), `followState|null` + `isCommensal`.
- **Follow state is runtime-guarded**: query PR 4's `follows` table in try/catch (or `to_regclass('public.follows')` probe once); when absent, return `followState: null` and the UI hides the FOLLOW pill.
- **Opt-out coordination with PR 4**: PR 6 defines the key `users.preferences.discoverable` (default true) and adds a "Discoverable in the People directory" toggle to account settings via the existing profile/preferences write path (`src/app/api/user/profile/route.ts`). If PR 4 lands a dedicated identity-preferences shape first, read through its helper instead — the SQL predicate is the single point to swap.
- RL 60/min per user.

**`POST /api/tables/[id]/join-request`** — closes the discovery dead-end (all four invite modes are host-initiated; a discoverer otherwise can only look). Auth; table must be `public` + `planned|live`; not blocked either direction; not already a member; capacity not exhausted. Creates a `table_join_request` notification to the host `{tableId, tableTitle, requesterId, requesterName}` (dedupe: skip if an unactioned request notification for the pair exists, or a member row exists). `NotificationPanel` gets an "Invite" action → existing `POST /api/tables/[id]/members {userId}` → standard `table_invite` → RSVP. Fully reuses PR 2 rails (block checks, cap, notifications). Server kill-switch env `TABLE_JOIN_REQUESTS_ENABLED` (default true). RL 10/min. Declines are silent by design.

## 4. Discover UI (design-spec §3.6)

**Route decision (recommended): extend `/discover` with tabs — no new route.** The spec's BottomNav has both Discover and Tables tabs, and its §3.6 Discover screen IS tables+people matchmaking; the repo's `/discover` is the pantry launchpad. Resolution: `src/app/discover/page.tsx` becomes a shell with a segmented control **[Tables | People | Pantry]** driven by `?tab=` (default `tables`); current pantry content extracted verbatim into `PantryDiscover`. All existing deep links (`/cuisines`, etc.) are untouched; `/discover?tab=pantry` preserves the old page. One Discover surface, matching the spec's nav anatomy, no parallel route to maintain.

New components under `src/components/discover/`, composed from the merged kit (`src/components/tables/ui/`):
- **Search pill** (rounded-full glass, violet focus ring, "Search realms, energies, or ingredients…") — feeds `q` of the active tab.
- **Filter chips**: Near me (requests browser geolocation → `lat/lng`; active = copper border+tint; denial degrades to soonest-ordered, chip shows off state), My element, Open tables, People (switches tab, per spec).
- **"Tables near your energy"** (header + pulsing violet dot): grid of `TableMatchCard` — `CompositeRadialBadge variant="compatibility"` top-left; "N SEATS LEFT" `LabelXS` pill top-right (pulsing copper dot when ≤2; hidden when `seatCap` null); h-32 photo or element-gradient placeholder; 20px title; date row; footer `border-t`: host `AvatarCircle` + `LabelXS` "HOSTED BY" + name + circular ArrowRight → `/tables/[id]` (which shows the Ask-to-join CTA for non-members of public tables — requires the small PR 2 detail-access amendment: public planned/live tables return card-level detail to any authed viewer).
- **Map strip** (static styled fallback — verified no map lib in the repo): h-48 `GlassPanel`, dark radial "void map" backdrop with a dotted grid and up to 6 glowing element dots positioned by normalizing real venue coords into the strip bounds; copy "Explore the Realm" + "N open tables nearby"; "VIEW MAP" glass chip links to `/restaurants` (the best-match explorer) for now.
- **"Kindred alchemists"** rail: horizontal snap-scroll 240px `PersonCard`s — compat % top-right, 80px gradient-ring avatar (element sigil fallback per spec §4.8 — never invented faces), name, element-sign `ElementChip`, "N mutual commensals", outlined violet FOLLOW pill (hidden when follows unavailable), secondary "BREAK BREAD" → plan-a-table with invitee preselected.
- **People tab**: kind chips (All | Alchemists | Agents), element chips, `PersonRow` list (avatar, name, one-line bio, chip, mutual count, small compat ring, view profile), keyset "Load more". Agents render with their real historical/planetary identity from the DB (roster via `is_agent` — same rows `/api/community/agents` serves); examples/seeds/tests use real roster identities only.
- **Empty states (no dead-ends, per the audit)**: near-me empty → "No tables near you yet — set the first one" + `GradientButton` "Host a Table" → plan-a-table, and the non-geo upcoming list still renders below; no chart → ring replaced by sigil + inline "Add your standing chart to see resonance" → `/birth-chart`; anon → public tables without % + people tab shows the agents rail with a sign-in CTA; empty people search → agents suggestions + invite-link copy action.
- Mobile-first: single column, rails as snap-scroll, filters as horizontally scrollable chip row; grid ≥ 768px.

## 5. Mobile & nav (design-spec §2.11)

- **`src/components/nav/MobileGlassTabBar.tsx`**: `TABS` becomes 5 — Kitchen `/`, Discover `/discover`, Plan `/menu-planner`, **Tables `/tables`** (glyph `ring` — the repo's blur_circular equivalent per §5), Profile `/profile`; grid → `repeat(5, 1fr)`; **the center quick-action FAB and its `QUICK_ACTIONS` dialog are removed** (recommended reconciliation: its four actions are all reachable — recipe-builder/pantry under Plan, the palette via the header, commensal invite becomes the Tables tab itself; the header ⌘K stays on mobile). Active-tab treatment upgraded to the spec pill: icon wrapped in `rounded-full p-2` white-alpha pill with copper ring (`ring-1`, `var(--accent)`-mixed) + copper text + soft amber glow; inactive tabs unchanged; `aria-current` retained. `Tab.matchKey` union gains no new member — Tables uses `matchKey: "commensal"`.
- **`src/config/navigation.ts`**: keep the internal `PrimaryKey` `"commensal"` (avoids rippling through every consumer) but relabel the section — label "Tables", path `/tables`, sub "Break bread — live tables, kindred alchemists"; routes: Tables Home `/tables`, Discover Tables & People `/discover?tab=tables`, Dinner Party (legacy) `/commensal`, Live Feed `/feed`, Restaurant Creator (unchanged). `activePrimaryFromPathname`: add `/tables` and `/t/` to the commensal cluster. **Header and CommandPalette pick this up automatically** (verified: `RedesignedHeader` iterates `PRIMARY_KEYS`/`NAV_IA`; palette uses `getAllNavRoutes()`), so no edits there beyond a visual check.

## 6. Economy (ambient, server-anchored, no visible amounts)

- Add `"tables"` to `DISCOVERABLE_SURFACES` in `src/lib/economy/practices.ts` — first `/tables` visit earns the once-ever `surface_discovered` through the existing recognition path.
- Joining a table recognizes the existing **`recommendation_acted`** practice (its catalog description already names tables) — recognized **server-side** inside PR 2's RSVP handler (and invite-redeem) on the first `joined` transition, `targetId = tableId`, daily-deduped, capped. No new practice types, no copy changes, delight toast only.

## 7. Build order — 3 reviewable commits

1. **Backbone** (visible-inert): `database/init/68-tables-discovery.sql` + `69-notification-type-table-join-request.sql`; `src/utils/elemental/harmony.ts` extraction (+ parity test, `group-recommendations` re-import); `src/services/discoveryService.ts`; `src/app/api/discover/tables/route.ts` + `src/app/api/discover/people/route.ts`; `src/app/api/tables/[id]/join-request/route.ts` + notification type registration; venueLat/venueLng/seatCap acceptance + geocode fallback in the tables create/PATCH routes; PR 2 detail-access amendment for public tables. Tests: visibility matrix (public/commensals/private × anon/stranger/commensal/blocked), keyset determinism, geo prefilter + home-table exclusion, opt-out, join-request dedupe.
2. **Discover UI**: `src/components/discover/*` (tab shell, TableMatchCard, MapStrip, KindredRail, PersonCard/Row, filter chips, hooks); rework `src/app/discover/page.tsx`; NotificationPanel join-request action; empty states; economy hooks (surface allowlist + RSVP recognition).
3. **Mobile & nav**: `MobileGlassTabBar` 5-tab + active pill; `navigation.ts` relabel/paths/`activePrimaryFromPathname`; `activePrimaryFromPathname` tests; header/palette smoke check.

**Visible vs gated**: everything ships visible (locked decision 20); the only gate is the `TABLE_JOIN_REQUESTS_ENABLED` server kill-switch. **Degradation if in-flight PRs slip**: PR 2 unmerged → PR 6 cannot ship (hard dep, tables tab and discovery both read its schema); PR 3 → omit message/chat affordances on cards; PR 4 → FOLLOW pill hidden (guarded query), OAuth image/sigil avatars, opt-out key still works via `users.preferences`; PR 5 → nothing (feed-driven mode needs no PR 6 work).

## 8. Risks & open questions (defaults chosen)

1. **FAB removal vs 5 tabs** — spec says 5 tabs, current bar is 4+FAB. Default: remove the FAB (all actions remain reachable); revisit only if the owner objects.
2. **Migration numbering** — 68/69 could collide with concurrent sessions (it happened at 59). Default: re-verify against origin/master immediately pre-merge and update the sequencing doc, per its own rule.
3. **Cosine scores cluster high** (~70–100% for non-degenerate profiles) so rings may read uniformly warm. Default: display raw rounded cosine in v1 (reuse-don't-invent); note a display-only normalization curve as a follow-up if it reads flat.
4. **Home-table privacy** — default locked in: home venues never geocoded, never carry coords (DB CHECK + app refusal), never show distance/map dots/address; they surface only in non-geo lists as "Home table". City-level labels deferred (would need a column).
5. **Join-request abuse** on public tables — default: RL 10/min, block enforcement, dedupe, host-silent declines, env kill-switch; no requester-visible rejection state in v1.

### Critical Files for Implementation
- /Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/discoveryService.ts (new — visibility/block enforcement, keyset, scoring)
- /Users/cookingwithcastro/Desktop/WhatToEatNext-master/database/init/68-tables-discovery.sql (new — venue geo, seat_cap, discovery indexes)
- /Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/discover/page.tsx (tabbed Discover shell per §3.6)
- /Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/nav/MobileGlassTabBar.tsx (5-tab bar + active pill per §2.11)
- /Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/config/navigation.ts (Tables IA — header/palette realign automatically)