<!-- Plan authored 2026-07-12 by the PR5 design agent; verbatim. Read alongside tables-program-sequencing.md (binding arbitration). -->

# PR 5 — Feed Engagement: Reactions Everywhere, Comments, Push Notifications

Branch: `feat/feed-engagement`. Migrations **assigned** by `docs/plans/tables-program-sequencing.md`: `66-feed-comments-push.sql` and `67-notification-types-engagement.sql` (`-- migrate:no-transaction`). Re-verify numbers against `origin/master` immediately before the final commit per the sequencing doc's Reconciliation 2.

## 0. Verified ground truth (what exists today)

- **The react API already accepts all five kinds.** `src/app/api/feed/react/route.ts:22` has `KINDS = {spark, fire, water, earth, air}` and `database/init/58-feed-reactions.sql` stores `kind VARCHAR(20)`. Confirmed: the UI is the only gap — `CookedDishCard.tsx` never sends `kind` (defaults to `'spark'`) and narration rows in `src/app/(alchm)/feed/page.tsx` (`HumanFeedRow`, line ~701) have no reaction affordance at all.
- **The constraint is the blocker**: `uniq_feed_reaction UNIQUE (event_id, user_id)` — one reaction total per user per event.
- **The kit ReactionBar is ready** (`origin/master:src/components/tables/ui/ReactionBar.tsx`): renders all five kinds, takes `counts: Partial<Record<ReactionKind, number>>`, `active: ReactionKind[]` (an *array* — it is built for multiple simultaneous reactions per viewer), `onReact`, `aria-pressed`, `variant: "inline" | "chip"`. Note: kit kinds are `"spark" | "Fire" | "Water" | "Earth" | "Air"` (capitalized elements) while the DB uses lowercase — a mapping is required at the wiring layer.
- **Feed counts**: `feedDatabaseService.getRecentEvents` (line 112) already LATERAL-joins a total `reaction_count`; it must become per-kind. The GET `/api/feed` response is shared-cached (Redis 12s + s-maxage), so **only viewer-independent data can ride it**.
- **Live rows can't take reactions**: `useLiveFeedEvents` prepends rows with synthetic ids (`stdb-<eventId>`) and hex actor ids — engagement UI must only render for Postgres UUID event ids.
- **Historical-agent feed items are NOT `feed_events` rows** (`/api/feed/historical-agents` sources from a separate service/PA producer) — they cannot carry reactions/comments in PR 5 (see Risks).
- **Mass-broadcast hazard confirmed**: `src/app/api/feed/route.ts:302-321` does `getAllUsers()` then one `createNotification` INSERT per user per agent insight/lab_entry/made_it — O(users) round-trips per event. Worse: the /feed page filters `actorIsAgent` events out of display, so this spam has no click-through surface.
- **PWA**: service worker is **generated** by Workbox `GenerateSW` in `next.config.js` (~line 207), gated by build-time `ENABLE_PWA` + runtime `NEXT_PUBLIC_ENABLE_PWA` (documented at `.env.example:414`). `PwaRegistration.tsx` registers `/sw.js`. Zero push wiring; no `web-push` dependency in package.json.
- **Notifications**: enum in migration 13 (extended by 30/49 via `ADD VALUE`), TS union + exhaustive `NOTIFICATION_STYLES` in `src/types/notification.ts`, 60s poll in `src/hooks/useNotifications.ts:26`. ⚠️ Latent discrepancy: migration 13 declares `notifications.id UUID`, but `notificationDatabaseService.createNotification` inserts text ids `notif_<ts>_<rand>` — the deployed column evidently is not UUID-typed (see Risks §8.1).
- **Blocks**: `commensalships.status='blocked'` unordered pair (migration 59 + `/api/commensals/block`); PR 3 plans `isBlockedBetween` in `src/lib/chat/enforcement.ts`.
- **Economy**: `feed_reaction` / `work_resonated` exist in `src/lib/economy/practices.ts`, both in `SERVER_ONLY_PRACTICES`, anchored to the reaction row inside the react route. `practiceRewardService.recognize` dedupes on `(user, type, target)` — kind-agnostic, which matters below.
- **`users.preferences JSONB`** exists (migration 01) — home for the push preference; no dedicated preferences table.

---

## 1. Reactions everywhere

### Decision: one row per (event, user, kind), toggleable — not a switchable single reaction

Justification:
- The kit's `active: ReactionKind[]` prop is plural by design; the design spec (§2.10, §4.4) shows per-kind counts with multiple active tints.
- Elemental reactions are qualitative appraisals, not a rating: a dish can be both Fire and Earth. A switchable single reaction forces an artificial choice and produces count churn.
- **Migration is constraint-widening only**: every existing row is unique on `(event_id, user_id)`, therefore already unique on `(event_id, user_id, kind)` — no backfill, no dedup pass.
- **Economy is naturally spam-proof**: `feed_reaction`/`work_resonated` practice dedupe keys on `eventId` (kind-agnostic, dedupe `ever`), so adding four more kinds cannot multiply rewards — 5 reactions on one event still pay the reactor once and the poster once. Zero changes to practices.ts needed for reactions.

Toggle-off (un-react) is added: a second tap on an active kind deletes the viewer's own row. Rewards never reverse (practice ledger is append-once) — accepted asymmetry, amounts are sub-token and invisible.

### Migration (part of `database/init/66-feed-comments-push.sql`)

```sql
ALTER TABLE feed_reactions DROP CONSTRAINT IF EXISTS uniq_feed_reaction;
ALTER TABLE feed_reactions ADD CONSTRAINT uniq_feed_reaction_kind UNIQUE (event_id, user_id, kind);
ALTER TABLE feed_reactions ADD CONSTRAINT feed_reactions_kind_check
  CHECK (kind IN ('spark','fire','water','earth','air'));  -- safe: all existing rows are 'spark'
```
(Existing `ON CONFLICT ON CONSTRAINT uniq_feed_reaction` in the react route is updated in the same commit.)

### API

- **`POST /api/feed/react`** (modify): body `{eventId, kind}`; behavior becomes **toggle** — try INSERT `ON CONFLICT ... uniq_feed_reaction_kind DO NOTHING`; if no row inserted and the viewer's row exists, DELETE it (`removed: true`). Response: `{success, reacted, counts: Record<kind, n>, viewerKinds: string[], reward}`. Self-reaction 400 unchanged; rewards recognized only on fresh insert (unchanged anchor). Rate limit 30/min per user unchanged.
- **`GET /api/feed/reactions?eventIds=a,b,c`** (new, `src/app/api/feed/reactions/route.ts`): authenticated viewer bootstrap — up to 100 UUIDs, returns `{ [eventId]: kinds[] }` for the viewer. This exists because per-viewer state cannot ride the shared-cached `GET /api/feed`. Rate limit 60/min. Anonymous → empty map.
- **`GET /api/feed`** (modify `feedDatabaseService.getRecentEvents`): swap the count LATERAL for per-kind aggregation, plus comment count:
```sql
LEFT JOIN LATERAL (
  SELECT jsonb_object_agg(kind, n) AS by_kind FROM
    (SELECT kind, COUNT(*)::int n FROM feed_reactions WHERE event_id = f.id GROUP BY kind) s
) r ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*)::int AS n FROM feed_comments c
  WHERE c.event_id = f.id AND c.deleted_at IS NULL AND NOT c.hidden
) cc ON true
```
Both viewer-independent → still cacheable. `FeedEvent` gains `reactionCounts: Record<string, number>` and `commentCount: number` (keep `reactionCount` as derived sum for back-compat).

### UI

New `src/components/feed/FeedEngagementBar.tsx` (client): wraps the kit `ReactionBar` + a comment toggle (lucide `MessageCircle` + count in `LabelXS`). Props: `eventId`, `initialCounts`, `viewerKinds`, `commentCount`, `onToggleComments`. Owns: lowercase↔kit-kind mapping (`fire` ⇄ `Fire`), optimistic count updates, POST to `/api/feed/react`, `revealPracticeReward` on reward, and a localStorage cache keyed `alchm:feed:reactions:v2` (migrating the legacy `alchm:feed:sparked` set as `spark` entries) as an optimistic hint reconciled by the bootstrap endpoint.

Wire into:
1. `CookedDishCard.tsx` — replace the bespoke spark button (lines 133-148) with `FeedEngagementBar`; keep persona/signature/transit rendering untouched.
2. `HumanFeedRow` narration rows in `feed/page.tsx` — append the bar under the narration line, **only when `event.id` is a UUID** (skip `stdb-` live rows; they converge into Postgres rows within one poll).
3. `TableMemoryCard.tsx` (from feat/tables-entity) — one-line mount in its footer, matching design-spec §3.1 footer blueprint. If that PR is unmerged at build time this is a deferred 5-line follow-up; nothing else depends on it.

The feed page performs one `GET /api/feed/reactions` per refresh with the visible UUID event ids and threads `viewerKinds` down.

---

## 2. Comments (migration 66)

### Schema (`database/init/66-feed-comments-push.sql`, continued)

```sql
CREATE TABLE IF NOT EXISTS feed_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES feed_events(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  flagged_count INTEGER NOT NULL DEFAULT 0,
  hidden BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_feed_comments_event
  ON feed_comments (event_id, created_at DESC, id DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_feed_comments_author
  ON feed_comments (author_id, created_at DESC);

CREATE TABLE IF NOT EXISTS feed_comment_reports (   -- mirrors PR 3's message_reports shape exactly
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES feed_comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam','harassment','inappropriate','other')),
  detail TEXT CHECK (char_length(detail) <= 1000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','dismissed','actioned')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT uniq_feed_comment_report UNIQUE (comment_id, reporter_id)
);
CREATE INDEX IF NOT EXISTS idx_feed_comment_reports_status ON feed_comment_reports (status, created_at DESC);
```

Flat threads v1 — **no `reply_to_id`, no `comment_reply` notification type** (justification in §3). Distinct from PR 2's `table_comments` (comments on the *table page*, accreting memories); `feed_comments` attach to *feed events*. They serve different surfaces; do not merge them in this PR (convergence is a PR 6+ question).

### API (`src/app/api/feed/comments/…`, all nodejs + force-dynamic + `getUserIdFromRequest` + `rateLimit` keyed by userId)

| Route | Method | Behavior | Limit |
|---|---|---|---|
| `/api/feed/comments?eventId&limit=30&before=` | GET | keyset (base64 `created_at\|id`, newest-first fetch, rendered ascending); excludes deleted; excludes hidden (except viewer's own); **blocked both directions filtered** via NOT EXISTS on `commensalships status='blocked'`; returns resolved author identity | 60/min |
| `/api/feed/comments` | POST | `{eventId, body}` → trim, strip control chars, 1–1000; event must exist; **403 neutral if (author, event actor) pair is blocked either direction**; insert; recognize practices; notify; return canonical comment + `reward` | 10/min + 3/10s |
| `/api/feed/comments/[id]` | DELETE | soft delete — author or admin; sets `deleted_at/deleted_by` | 30/min |
| `/api/feed/comments/[id]/report` | POST | `{reason, detail?}`; unique per reporter; increments `flagged_count`; **auto-hide at 3** (identical mechanics to PR 3 §4) | 5/min |
| `/api/admin/feed/comment-reports` (+`[id]` PATCH) | GET/PATCH | admin triage, `src/app/admin/users` route pattern; converges visually with PR 3's chat-reports queue | admin |

Enforcement + queries live in `src/lib/feed/commentEnforcement.ts` + `src/services/feedCommentsDatabaseService.ts` (unit-tested like `commensalDatabaseService.test.ts`). Bodies stored plain; client escapes and linkifies only http(s) with `rel="noopener noreferrer nofollow ugc"` (PR 3's rule, reused).

### Identity (PR 4 compatibility)

Comments show **real names + avatars** (locked decision 4; PR 4 flips the feed default, comments start there). Author display is resolved server-side in ONE helper — `src/lib/social/identity.ts` → `resolveDisplayIdentity(userIds[])` returning `{name, image}` via `COALESCE(user_profiles.name, users.name)` + `users.image`, element-sigil fallback client-side for agents without images. PR 4 swaps this helper's internals (avatar pipeline, handles) without touching comment code. Note the deliberate asymmetry: a cooked card's *poster* stays chart-persona (share route forces `shareName:false`), while *commenters* are real-identity — this is by design and should be stated in the PR description.

### UI

- `src/components/feed/CommentThread.tsx` — expandable panel under any card (mounted by `FeedEngagementBar`'s comment toggle); lazy-fetches on first expand; "View earlier" keyset paging; rows: 28px avatar, author name in `LabelXS` (violet; copper if author is the event actor — design-spec §3.4 Resonance blueprint), body, relative timestamp, overflow menu (Delete own / Report).
- `src/components/feed/CommentComposer.tsx` — inline composer built from kit primitives (`GlassPanel` + transparent input + `GradientButton` send), placeholder "Add a memory..." (spec copy voice); disabled when signed out (sign-in link); optimistic append; fires `revealPracticeReward` when the response carries a reward.
- `ReportCommentDialog` mirroring PR 3's `ReportMessageDialog` (same reasons enum).
- All demo/seed/test fixtures use REAL roster identities per design-spec §4.8 — pull historical agents from `GET /api/community/agents` / the DB seed, never invented names. No token amounts in any copy.

---

## 3. Notifications (migration 67)

`database/init/67-notification-types-engagement.sql`:
```sql
-- migrate:no-transaction
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'reaction_received';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'comment_received';
```
**No `comment_reply`**: flat threads have no reply target; the only recipient is the event owner. Adding the enum value "for later" would force a dead entry in the exhaustive `NOTIFICATION_STYLES` record and an unreachable emitter — add it in the PR that adds threading.

TS: extend the union + `NOTIFICATION_STYLES` in `src/types/notification.ts` (record is exhaustive — compile breaks if missed) and `NotificationMetadata` with `eventId`, `count`, `lastActorName`, `kind`.

### Dispatcher — `src/lib/notifications/engagementNotify.ts`

`notifyReactionReceived({eventId, actorId, recipientId, kind, dishLabel})` and `notifyCommentReceived({eventId, actorId, recipientId, excerpt})`, both fire-and-forget from the react/comment routes. Mechanics **identical to PR 3 §6's dedup rule** so the systems converge — max ONE unread row per (recipient, event, type):

```sql
WITH bumped AS (
  UPDATE notifications
     SET metadata = metadata || jsonb_build_object(
           'count', COALESCE((metadata->>'count')::int, 1) + 1,
           'lastActorName', $actorName),
         message = $rebuiltMessage, updated_at = now()
   WHERE user_id = $recipient AND type = $type::notification_type
     AND is_read = false AND metadata->>'eventId' = $eventId
   RETURNING id)
INSERT INTO notifications (id, user_id, type, title, message, related_user_id, metadata)
SELECT $newId, $recipient, $type::notification_type, $title, $message, $actorId, $metadata
WHERE NOT EXISTS (SELECT 1 FROM bumped);
```
(id generation follows the existing service convention — see Risk 1.) Implement as `notificationDatabase.createOrBumpEventNotification()` so PR 3's chat dedup can adopt the same method.

Suppression rules: **never on own actions** (react route already 400s self-reactions; comment route skips notify when `actorId === recipientId`); **skip when recipient has blocked the actor or vice versa** (writes are already refused for blocked pairs, so this is defense-in-depth); **skip agent recipients** (`users.is_agent`) — historical agents don't read bells. Copy carries NO token amounts: "«name» resonated with your dish" / "«name» and 3 others commented on Solstice Feast". Metadata carries `eventId` for deep links; card wrappers gain `id="event-<uuid>"` and the bell click routes to `/feed#event-<uuid>`.

Un-react does NOT decrement or retract notifications (rows are cheap, retraction is racy).

---

## 4. Web push

### Schema (rest of migration 66)

```sql
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  CONSTRAINT uniq_push_endpoint UNIQUE (endpoint)
);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions (user_id);
```

### Keys, flags, dependency

- Dependency: `web-push` (+ `@types/web-push` dev).
- Env (documented in `.env.example` beside the PWA block at line 414, including the generation command **`npx web-push generate-vapid-keys`**): `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (mailto:), `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (same value as public key, for the client `applicationServerKey`).
- **Kill switch**: server `WEB_PUSH_ENABLED` (default unset → every push path is a no-op, subscriptions still accepted); client affordance flag `NEXT_PUBLIC_WEB_PUSH` gates the enable-notifications UI. Both layered on top of the existing `ENABLE_PWA`/`NEXT_PUBLIC_ENABLE_PWA` opt-in.

### Service worker

The SW is Workbox-generated, so push handlers go in a **static** `public/push-listener.js` pulled in via `GenerateSW`'s `importScripts: ["/push-listener.js"]` option in `next.config.js` (one-line config addition; survives `CopyPwaAssetsPlugin` untouched since it lives in public/). Handlers: `push` → `showNotification(title, {body, tag, data:{url}, icon: manifest icon})` with `tag: "evt-<eventId>"`/`"conv-<id>"` so the OS collapses batched events, mirroring the DB dedup; `notificationclick` → focus-or-open `data.url`; `pushsubscriptionchange` → re-subscribe and re-POST.

### Lifecycle API (`src/app/api/push/subscribe/route.ts`)

- `POST` `{subscription: {endpoint, keys:{p256dh, auth}}}` → upsert by endpoint (`ON CONFLICT (endpoint) DO UPDATE SET user_id, p256dh, auth, last_used_at` — endpoint reassignment covers device user-switches). 10/min.
- `DELETE` `{endpoint}` → delete own row. 10/min.
- **Prune-on-410**: the sender catches `WebPushError` status 404/410 and deletes that subscription row inline (no cron needed).

### The seam — `queueWebPush`

`src/lib/notifications/queueWebPush.ts` exports **exactly** PR 3's contracted signature `queueWebPush(recipientId: string, payload: PushPayload)` where `PushPayload = {type, title, body, url, tag}`. Internals: (1) bail unless `WEB_PUSH_ENABLED === "true"`; (2) bail unless `payload.type ∈ PUSH_ELIGIBLE_TYPES`; (3) bail if the recipient's `users.preferences->'push'->>'enabled'` is `'false'` (default: enabled — browser permission is already the opt-in); (4) load subscriptions, `webpush.sendNotification` each (TTL 24h), prune dead rows; fully fire-and-forget (`void …catch(log)`), never blocks the response. If PR 3 merges first with its no-op stub, this PR replaces the stub body with a re-export of this module (3-line change); if PR 5 merges first, PR 3's notify simply imports this.

**Launch push set** (`PUSH_ELIGIBLE_TYPES`): `table_invite`, `table_going_live`, `comment_received`, and `dm_message` (which only ever fires when PR 3's `CHAT_DMS_ENABLED` is on). **Poll-only**: `reaction_received` (too chatty for a device buzz), everything else, and `agent_broadcast` permanently excluded. Wiring points: `comment_received` in this PR's dispatcher; `table_invite`/`table_going_live` are one-line `queueWebPush` calls added in PR 2's emitters if merged (guarded no-ops otherwise).

### Client

`src/hooks/usePushSubscription.ts` (permission state, subscribe with `urlBase64ToUint8Array(NEXT_PUBLIC_VAPID_PUBLIC_KEY)`, unsubscribe → `subscription.unsubscribe()` + DELETE) and a small "Device notifications" toggle row in the `NotificationBell` dropdown footer (`src/components/nav/NotificationBell.tsx`), rendered only when `NEXT_PUBLIC_WEB_PUSH === "1"` && `NEXT_PUBLIC_ENABLE_PWA === "true"` && SW registered && permission not denied. The toggle also PATCHes the `preferences.push.enabled` gate (via existing account/preferences route or a thin `POST /api/push/preference`).

---

## 5. Economy (server-anchored, ambient, no visible amounts)

Add to `src/lib/economy/practices.ts` + `SERVER_ONLY_PRACTICES`, recognized only inside `POST /api/feed/comments` (the comment row is the proof):

- `comment_posted` — Spirit, base 0.5, `dedupe: "ever"`, `requiresTarget: true` (**target = eventId**, not commentId — 50 comments on one event pay once), `dailyCap: 3`. Hints in catalog voice (e.g. "A word left at the table lingers").
- `work_discussed` — the `work_resonated` analog: Spirit, base 1, `dedupe: "ever"`, target = eventId, `dailyCap: 2`; recognized for the **event actor** when a comment lands from another user (first-ever comment pays, catalog caps per day). Skipped for agent recipients.

Both flow through `practiceRewardService.recognize` unchanged (transit modulation + daily celestial budget apply automatically). The commenter's reward rides the POST response → `revealPracticeReward` toast, matching the react route's pattern. Reactions need no catalog change (§1).

## 6. Mass-broadcast scaling fix (`src/app/api/feed/route.ts:302-321`)

Minimal fix, one commit-contained change, so PR 5's notification volume doesn't compound it:
1. Replace `getAllUsers()` + per-user `createNotification` fan-out with **one set-based statement**: `INSERT INTO notifications (id…, user_id, type, title, message, related_user_id, metadata) SELECT …, id, 'agent_broadcast', … FROM users WHERE is_agent = false` (single round-trip regardless of user count; id per existing convention).
2. Gate it behind `AGENT_BROADCAST_NOTIFICATIONS_ENABLED` (default **off**): the /feed UI already filters agent events out of the stream, so today these rows are pure bell spam with no click-through. Feed-event ingestion itself is untouched.
3. `agent_broadcast` is hard-excluded from `PUSH_ELIGIBLE_TYPES` (a mass-broadcast must never fan out to devices).
Full pub/sub or digest batching is explicitly deferred — out of PR 5 scope.

## 7. Build order — 4 reviewable commits

**Commit 1 — schema + reactions everywhere (visible):** migrations 66 + 67 (verify numbers against origin/master first); react route → toggle + `uniq_feed_reaction_kind`; new `GET /api/feed/reactions`; `feedDatabaseService` per-kind counts + commentCount; `FeedEngagementBar` + kit-kind mapping; wire into `CookedDishCard` + `HumanFeedRow` (UUID-only guard); localStorage v2 migration; route/service tests.

**Commit 2 — comments (visible):** `feedCommentsDatabaseService` + `commentEnforcement` + `resolveDisplayIdentity`; list/create/delete/report routes + admin queue; `CommentThread`/`CommentComposer`/`ReportCommentDialog`; block filtering both directions; `comment_posted`/`work_discussed` practices; tests (enforcement unit + route).

**Commit 3 — engagement notifications + broadcast fix (visible):** `engagementNotify` dedup/batch upsert (`createOrBumpEventNotification`); wiring in react + comments routes; TS union + styles; `id="event-<uuid>"` anchors + bell deep-link; agent-broadcast set-based + gated; tests for the upsert (bump vs insert vs suppress-self/blocked/agent).

**Commit 4 — web push (flag-gated):** `web-push` dep; `push_subscriptions` API; `public/push-listener.js` + `GenerateSW importScripts`; `src/lib/push/webPush.ts` sender with prune-on-410; `queueWebPush` seam (+ PR 3 stub swap if present); `usePushSubscription` + bell toggle + preference gate; `.env.example` VAPID docs incl. generation command; sender tests with mocked web-push.

**Visible vs gated:** reactions, comments, engagement notification rows ship visible (locked decision 20 — ship visible, gate risky). Push is the risky surface: triple-gated (`ENABLE_PWA` build, `WEB_PUSH_ENABLED` server kill switch, `NEXT_PUBLIC_WEB_PUSH` client affordance). Agent broadcast default-off.

**Dependency degradation:**
- *PR 2 (feat/tables-entity) unmerged*: no `TableMemoryCard` to mount the bar in (deferred one-liner); no `table_memory` events exist so nothing renders; `table_invite`/`table_going_live` push wiring points don't exist yet — the eligible-type set already lists them, wiring is a later one-liner. Nothing breaks.
- *PR 3 unmerged*: no stub to swap — `queueWebPush` ships standalone; `dm_message` never fires; `feed_comment_reports` stands alone (identical shape ensures later convergence with `message_reports`).
- *PR 4 unmerged*: `resolveDisplayIdentity` falls back to `user_profiles.name`/`users.name` + `users.image` (already real identity for OAuth users); PR 4 later swaps one helper.

## 8. Risks & open questions (defaults chosen)

1. **`notifications.id` type mismatch** — migration 13 says UUID, the service inserts `notif_…` text. Before writing the batching upsert, verify the live column type (`\d notifications` on the deployed DB). Default: follow the existing service's id convention (it demonstrably works in prod); file the schema-drift reconciliation as a separate chore.
2. **Blocked users' reactions inside cached counts** — `GET /api/feed` counts are shared-cached and viewer-independent, so a blocked user's reactions still count in aggregates. Default: accept — counts are identity-free; blocks filter *comments* (identity-bearing) both directions, which is the safety-relevant surface.
3. **Historical-agent feed items can't take reactions/comments** (not `feed_events` rows; PA-producer items have foreign ids). Default: defer — engagement UI renders only on Postgres-backed rows; when PA items are mirrored into `feed_events` they inherit engagement for free. Do not build a parallel reaction store.
4. **Un-react vs immutable rewards** — toggling off keeps the earned practice row (ledger is append-once) and re-reacting pays nothing. Default: accept the asymmetry; amounts are sub-token, invisible, and the alternative (reversing ledger credits) risks farming and violates the append-only practice model.
5. **iOS push reach** — Web Push on iOS requires ≥16.4 *and* home-screen install, and the PWA is currently opt-in-off in production. Default: ship push fully built but dark (`WEB_PUSH_ENABLED` unset); flip on a staging deploy with `ENABLE_PWA=true` first; treat iOS as best-effort and keep the 60s bell poll as the universal fallback.

### Critical Files for Implementation
- /Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/api/feed/react/route.ts — extend to toggle + per-kind; the reward-anchor pattern every new route copies
- /Users/cookingwithcastro/Desktop/WhatToEatNext-master/database/init/58-feed-reactions.sql — the constraint migration 66 rewrites (and the schema-style template for 66)
- /Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/(alchm)/feed/page.tsx — HumanFeedRow/CookedDishCard dispatch where all engagement UI mounts
- /Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/notificationDatabaseService.ts — gains the dedup/batch upsert both notification types run through
- /Users/cookingwithcastro/Desktop/WhatToEatNext-master/next.config.js — GenerateSW block where `importScripts: ["/push-listener.js"]` lands