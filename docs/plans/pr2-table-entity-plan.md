# PR 2 — The Table Entity: Implementation Plan (designed 2026-07-11)

Product decisions: Table = atomic social unit, lifecycle planned → live → memory (+cancelled); all four invite modes; real identity; SpacetimeDB live / Postgres record; ship visible, flag-gate risky. UI per `../design/tables-design-spec.md`. **Read `tables-program-sequencing.md` for cross-PR reconciliations (migration numbers, chat ownership).**

## 0. Design stance
Postgres is the authoritative record across the whole lifecycle. SpacetimeDB is an ephemeral UX layer for the live phase only (identities are anonymous localStorage tokens, unlinked to WTEN accounts — nothing durable derives from ST state). Memory artifacts are written exclusively from Postgres at close. Table name **`tables`** (`table` is reserved). API `/api/tables`, pages `/tables`, public invite landing `/t/[token]` (middleware doesn't gate either path).

## 1. Postgres schema — migration `tables-schema.sql` (number assigned at merge time, see sequencing doc)

House patterns: `DO $$` enum guard, `uuid_generate_v4()`, timestamptz, `update_updated_at_column()` triggers, plain CREATE INDEX.

```sql
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'table_status') THEN
    CREATE TYPE table_status AS ENUM ('planned', 'live', 'memory', 'cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS tables (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title                VARCHAR(160) NOT NULL,
  description          TEXT,
  scheduled_at         TIMESTAMPTZ NOT NULL,            -- "now" for impromptu tables
  venue_type           VARCHAR(20) NOT NULL DEFAULT 'home' CHECK (venue_type IN ('home','restaurant','other')),
  venue_restaurant_id  TEXT REFERENCES restaurants(id) ON DELETE SET NULL,  -- restaurants.id is TEXT
  venue_name           VARCHAR(200),
  venue_address        TEXT,
  status               table_status NOT NULL DEFAULT 'planned',
  visibility           VARCHAR(20) NOT NULL DEFAULT 'commensals' CHECK (visibility IN ('public','commensals','private')),
  composite_snapshot   JSONB,
  composite_updated_at TIMESTAMPTZ,
  menu                 JSONB NOT NULL DEFAULT '[]',     -- [{name, recipeRef?, course?}]
  memory               JSONB,                           -- frozen artifact, written once at close
  went_live_at         TIMESTAMPTZ,
  closed_at            TIMESTAMPTZ,
  feed_event_id        UUID REFERENCES feed_events(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tables_host   ON tables (host_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables (status, scheduled_at);

CREATE TABLE IF NOT EXISTS table_members (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id                  UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  user_id                   UUID REFERENCES users(id) ON DELETE CASCADE,   -- humans AND agents (is_agent users) — owner directive
  manual_companion_chart_id VARCHAR(255) REFERENCES manual_companion_charts(id) ON DELETE SET NULL,
  role                      VARCHAR(10) NOT NULL DEFAULT 'guest' CHECK (role IN ('host','guest')),
  rsvp_status               VARCHAR(10) NOT NULL DEFAULT 'invited' CHECK (rsvp_status IN ('invited','joined','declined')),
  joined_via                VARCHAR(10) CHECK (joined_via IN ('host','link','qr','invite','search','manual')),
  invited_by                UUID REFERENCES users(id) ON DELETE SET NULL,
  display_name              VARCHAR(120),               -- denormalized; required for manual guests
  rsvp_at                   TIMESTAMPTZ,
  created_at                TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at                TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT table_member_one_identity CHECK ((user_id IS NULL) <> (manual_companion_chart_id IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_table_member_user   ON table_members (table_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_table_member_manual ON table_members (table_id, manual_companion_chart_id) WHERE manual_companion_chart_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_table_members_user  ON table_members (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_table_members_table ON table_members (table_id);

CREATE TABLE IF NOT EXISTS table_invites (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id    UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  token       VARCHAR(64) NOT NULL UNIQUE,   -- crypto.randomBytes(24).toString('base64url')
  created_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  max_uses    INT NOT NULL DEFAULT 20 CHECK (max_uses BETWEEN 1 AND 100),
  use_count   INT NOT NULL DEFAULT 0,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_table_invites_table ON table_invites (table_id);

CREATE TABLE IF NOT EXISTS table_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_table_photos_table ON table_photos (table_id, created_at);

CREATE TABLE IF NOT EXISTS table_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body VARCHAR(1000) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_table_comments_table ON table_comments (table_id, created_at);
```
Plus `updated_at` triggers on `tables`/`table_members`. QR is NOT a separate invite kind — one token, two renderings; provenance on the member row (`joined_via`) at redemption.

Second migration `notification-types-tables.sql` (`-- migrate:no-transaction`, mirrors 30/49): `ALTER TYPE notification_type ADD VALUE IF NOT EXISTS` × `table_invite`, `table_rsvp`, `table_going_live`, `table_memory_posted`.

**dining_groups JSONB: left legacy/read-only** — no backfill (single-owner templates without lifecycle); "Start a Table with this group" is a fast follow.

## 2. Lifecycle & state machine
planned →(host: go-live)→ live →(host: close)→ memory (terminal); planned/live →(host: cancel)→ cancelled (terminal). Transitions host-only via guarded UPDATE (`WHERE id=$1 AND host_id=$2 AND status='planned' RETURNING *`; zero rows = 409 — race-safe, idempotent).
- planned: everything editable, invites issuable, RSVPs flow.
- live: menu editable; photos from joined members; RSVP-join still allowed (walk-ins via QR at the door). Go-live fans out `table_going_live` to joined members.
- memory: frozen. Close handler in `withTransaction`: re-read table+members+photos → build `memory` JSONB → status/closed_at → insert `feed_events` row (`event_type='table_memory'`, actor=host, skipWebhook) → stamp `feed_event_id`; post-commit `table_memory_posted` notifications (fire-and-forget). Photos/comments remain appendable on the page (memories accrete); the feed card payload stays frozen.
- cancelled: notifies joined members (metadata.cancelled=true, no new enum value); no feed event.

**SpacetimeDB mapping (live phase, flag `NEXT_PUBLIC_SPACETIME_LIVE_TABLES`):** NEW module tables keyed by `wten_table_id: String` (PG UUID as text) — existing lobby untouched. Host client calls idempotent `ensure_table_session`; guests `join_table_session`; no session-id sync needed (lookup by table UUID). ST presence rows carry client-claimed `wten_user_id` used ONLY as display hint against the PG member list — never authoritative. Close: host client best-effort `close_table_session`; PG close proceeds regardless. Flag off/degraded: live phase fully works minus presence/chat.

## 3. API surface
All routes nodejs runtime, force-dynamic, auth via validateRequest helpers, Zod, rateLimit.

| Route | Method | Auth | Notes |
|---|---|---|---|
| `/api/tables` | POST | req | create (title 1–160, scheduledAt ISO, venue, visibility); inserts table + host member row in one txn. RL 10/min |
| `/api/tables` | GET | req | `?scope=upcoming\|past\|hosting\|all` for caller |
| `/api/tables/[id]` | GET | cond | full detail (members joined to users/user_profiles for real name+avatar; host also sees invites). Access: any-status member, or anyone if memory+public |
| `/api/tables/[id]` | PATCH | host | edit core fields (planned only); menu (planned or live) |
| `/api/tables/[id]/go-live` `/close` `/cancel` | POST | host | guarded transitions; close writes memory+feed event |
| `/api/tables/[id]/rsvp` | POST | req | {response: joined\|declined}; needs existing invited row; joined → recompute + `table_rsvp` to host. RL 20/min |
| `/api/tables/[id]/members` | POST | host | {userId} in-app/search invite (joined_via=invite if accepted commensalship else search; REJECT if blocked either direction; `table_invite` notification) OR {manualCompanionChartId} (owner's offline guest, joined, recompute). Cap 24 rows |
| `/api/tables/[id]/members/[memberId]` | DELETE | host or self | remove/leave; recompute if joined |
| `/api/tables/[id]/invites` | POST | host | issue token {expiresInHours?=168, maxUses?=20} → {token, url:/t/token}; QR = same URL client-rendered. RL 10/min |
| `/api/tables/[id]/invites/[inviteId]` | DELETE | host | revoke |
| `/api/tables/[id]/photos` | POST | joined | {photoDataUrl} → R2 via storeTablePhoto; live or memory; cap 12/table |
| `/api/tables/[id]/comments` | GET/POST | member | body ≤1000 |
| `/api/tables/[id]/recompute` | POST | host | explicit composite recompute (recovery path) |
| `/api/table-invites/[token]` | GET | **none** | public preview {tableTitle, hostName, scheduledAt, venueName, joinedCount, valid} — never the member list. RL 30/min per IP |
| `/api/table-invites/[token]/redeem` | POST | req | atomic consume: `UPDATE ... SET use_count=use_count+1 WHERE token=$1 AND revoked_at IS NULL AND expires_at>now() AND use_count<max_uses RETURNING table_id` (0 rows = 410); membership checked FIRST (no-op success for existing members, no use consumed); upsert joined member (joined_via link\|qr); recompute + notify. Returns {tableId} |

Invite landing `/t/[token]` (outside `(alchm)`, lean): preview card → Join → if unauthenticated `signIn(undefined, {callbackUrl:'/t/token?join=1'})` → auto-redeem on return → push `/tables/[id]`. QR lands with `?src=qr` → `via:'qr'`.

## 4. Composite bridge — `src/lib/tables/composite.ts` (server-only, canonical)
`computeAndStoreTableComposite(tableId)`: collect joined members → resolve each to GroupMember (user members via the PR 1-fixed chart fallback chain, exposed as `loadUserChartMember(userId)`; **agent users resolve the same way** — their natal data lives in user_profiles; manual members via manual_companion_charts) → skip silently if no usable chart (never block RSVP) → cap 12 chart-bearing by rsvp_at (`truncated` flag; membership cap is 24) → `calculateCompositeNatalChart` + cuisine recs + cooking methods (top 5) + `EnhancedRecommendationService.getRecommendationsForComposite(composite, 5)` → persist `{version:1, computedAt, memberCount, includedMemberIds, compositeChart, cookingMethods, cuisineRecs, topRecipes}` to `composite_snapshot`.
Triggers: RSVP→joined, joined-member delete, manual attach, host recompute endpoint. Awaited in-request, failure-tolerant (keep stale snapshot, staleness visible via composite_updated_at; debounce option: skip if <30s old). `guest-recommendations` route NOT rewired — shared inner `computeCompositeBundle(members)` factored so both use identical math. UI never computes — `GET /api/tables/[id]` returns snapshot, `CompositeEnergyVisualizer` renders.

## 5. Feed artifact
`event_type='table_memory'` (VARCHAR col, no enum change; read path has no whitelist). metadata_payload (= tables.memory): `{card:'table_memory', tableId, title, scheduledAt, closedAt, venue{type,name}, guests:[{name, userId?}] (real identity; manual guests name-only; INCLUDES agent guests — real roster identities per design-spec §4.8), guestCount, composite{dominantElement, dominantModality, elementalBalance, alchemicalProperties}, menu(≤8), photoUrls(≤6, frozen), shareName:true}`.
Rendering: `src/components/feed/TableMemoryCard.tsx` dispatched in HumanFeedRow on `metadataPayload.card === 'table_memory'` (alongside 'cooked'); narration fallback in eventNarration.ts; extend FeedEvent.eventType union. Photos: `storeTablePhoto` in cookPhotoStorage.ts (key `table-photos/<tableId>/<hash>`, 5MB/mime, null-on-failure).

## 6. Notifications (created via notificationDatabase.createNotification; 60s poll, no new transport)
- `table_invite` → invitee {tableId, tableTitle, scheduledAt, venueName, hostName}; NotificationPanel gets accept/decline (clone of commensal_request block) → POST rsvp
- `table_rsvp` → host {tableId, tableTitle, response, guestName}
- `table_going_live` → joined members; expiresAt +24h (ephemeral)
- `table_memory_posted` → joined members {tableId, tableTitle, feedEventId, photoCount}

## 7. Build order — 4 commits
1. **Schema + types + domain services**: both migrations; `src/types/table.ts`; notification types+styles; `src/services/tableDatabaseService.ts` (create-with-host txn, detail, list, guarded transitions, member upsert/remove, atomic invite consume, photos/comments); `src/lib/tables/composite.ts`; service tests (transition guards, invite atomicity, member XOR).
2. **API + memory artifact + notifications**: all routes above; storeTablePhoto; feedDatabaseService union; route tests (create→invite→redeem→rsvp→go-live→close happy path; token expiry/exhaustion; non-host 403/409).
3. **UI (unflagged, visible)**: `useTables` hooks; components `src/components/tables/` (TableCard, MembersPanel, InvitePanel w/ copy-link+QR, LifecycleControls, TableCompositePanel, PhotoGrid, CommentList — compose from `src/components/tables/ui/` kit per design spec); pages `(alchm)/tables` + `(alchm)/tables/[tableId]` (all four statuses) + `/t/[token]`; TableMemoryCard + feed wiring + eventNarration; NotificationPanel actions; commensal-page cross-link banner; dep `qrcode.react`.
4. **Live phase (flag-gated `NEXT_PUBLIC_SPACETIME_LIVE_TABLES`)**: module tables TableSession {wten_table_id unique, host, title, status, …} + TablePresence {wten_table_id, member, wten_user_id, display_name}; reducers ensure_table_session (idempotent, first caller = host), join_table_session (fails if closed, dedupes), leave_table_session (host leaving does NOT close), close_table_session (host-only, deletes presence); regenerated bindings; `isLiveTablesEnabled()`; `LiveTableRoom.tsx` (expected-vs-present, graceful null when off/degraded); wire into table page for status live. **CHAT IS NOT IN PR 2** — see sequencing doc: table chat ships in PR 3 on its conversations/messages model.

Flags: commits 1–3 unflagged (additive, inert-until-used); commit 4 behind the flag. Existing lobby + its flag untouched.
Dependency on PR 1: composite loader consumes the fixed chart fallback chain via the `loadUserChartMember` boundary.

## 8. Risks (defaults chosen)
1. ST identity unlinked to accounts → PG authoritative for everything durable; ST = unverified presence hints; identity-linking later.
2. Composite caps at 12 charts, parties up to 24 → first 12 chart-bearing by rsvp_at, `truncated` flagged, UI notes it.
3. Invite links are bearer tokens → 7-day expiry, 20 uses, revocation, sign-in required to redeem, preview leaks card-level only. Fine for the dinner-party threat model.
4. Recompute cost on RSVP bursts → awaited but failure-tolerant + rate limits + optional 30s debounce; host recompute as catch-up.
5. Live chat permanence → chat is ephemeral (PR 3's Postgres record supersedes this concern); durable comments = table_comments.

Critical reference files: `database/init/15-commensals-schema.sql`, `src/app/api/commensal/guest-recommendations/route.ts`, `src/services/commensalDatabaseService.ts`, `src/app/api/feed/share/route.ts`, `spacetime-module/src/live_reducers.rs`.
