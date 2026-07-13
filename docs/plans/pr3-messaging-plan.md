# PR 3 — Messaging Implementation Plan (designed 2026-07-11)

Product decisions: full suite in one cycle — live Table chat (ships FIRST, visible), 1:1 DMs, Circle chats. SpacetimeDB live + Postgres record. Safety floor: block + report + host controls. Table chat visible to all; DMs/circles flag-gated. See `../design/tables-design-spec.md` for UI and the commensal-tables program memory for context.

**Owner directive (2026-07-11):** historical/planetary agents are first-class possible participants — `messages.sender_id` references `users(id)` and agents ARE users (`is_agent=true`), so agent senders need no schema change; the actual agent-responder integration (PA bridge into table chat) is flagged future work. All example/seed content uses REAL historical-agent identities (design-spec rule §4.8), never invented names.

**Key discovery correction:** the SpacetimeDB module lives IN-REPO at `spacetime-module/` (Rust, SDK 2.4.1, `live_tables.rs` / `live_reducers.rs`), deployed separately — module changes + regenerated TS bindings ride in this PR. All Spacetime tables are world-readable (no `client_visibility_filter` in SDK 2.4.1) — this drives the architecture split.

## 0. Architecture stance

Two delivery tiers, one Postgres data model:
- **Table chat**: bodies MAY mirror into SpacetimeDB (same trust tier as public `feed_event`); live delivery via Spacetime, canonical record in Postgres. Ships visible.
- **DMs/Circles**: bodies MUST NOT enter SpacetimeDB (world-readable). Postgres-only + adaptive polling behind flags; content-free Spacetime "inbox signal" is a specced hardening follow-up.

Write path (liveFeedPublish pattern): client → `POST /api/chat/.../messages` → Postgres write (auth/blocks/limits/membership enforced) → 200 returns canonical UUID → client fire-and-forgets the Spacetime reducer carrying that UUID over its own connection. PG is truth; live rows reconcile by `message_uuid` (canonical fetch on mount + 20s; unmatched live rows >30s dropped). Module-level enforcement bounds rogue rows: reducer only accepts posts from `commensal_member` identities; `sender_name` read from member row, never args.

## 1. Data model — `database/init/60-chat-schema.sql`

New empty tables (plain CREATE INDEX fine). Repo conventions: `uuid_generate_v4()`, timestamptz, `update_updated_at_column()` trigger, IF NOT EXISTS.

```sql
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kind TEXT NOT NULL CHECK (kind IN ('table','dm','circle')),
  subject_ref TEXT,                -- Spacetime session_id for 'table', circle id for 'circle', NULL for 'dm'
  title VARCHAR(255),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  dm_user_lo UUID REFERENCES users(id) ON DELETE CASCADE,   -- DM canonicalization: ordered pair
  dm_user_hi UUID REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT conversations_dm_pair CHECK ((kind = 'dm') = (dm_user_lo IS NOT NULL AND dm_user_hi IS NOT NULL)),
  CONSTRAINT conversations_dm_order CHECK (kind <> 'dm' OR dm_user_lo < dm_user_hi),
  CONSTRAINT conversations_subject CHECK (kind = 'dm' OR subject_ref IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_conversations_dm_pair ON conversations (dm_user_lo, dm_user_hi) WHERE kind = 'dm';
CREATE UNIQUE INDEX IF NOT EXISTS uniq_conversations_subject ON conversations (kind, subject_ref) WHERE kind <> 'dm';

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('host','member')),
  notify_level TEXT NOT NULL DEFAULT 'all' CHECK (notify_level IN ('all','mentions','none')),
  muted_by_host_until TIMESTAMP WITH TIME ZONE,
  last_read_at TIMESTAMP WITH TIME ZONE,
  last_read_message_id UUID,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP WITH TIME ZONE,
  banned BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON conversation_members (user_id) WHERE left_at IS NULL;

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,   -- agents are users: agent senders supported
  body TEXT NOT NULL CHECK (char_length(body) <= 2000),
  attachments JSONB NOT NULL DEFAULT '[]',      -- [{type:'photo', url}] max 1 in v1
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  client_key VARCHAR(64),                       -- optimistic-send idempotency
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  flagged_count INTEGER NOT NULL DEFAULT 0,
  hidden BOOLEAN NOT NULL DEFAULT false         -- auto-hide at flagged_count >= 3, or admin
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages (conversation_id, created_at DESC, id DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_messages_client_key ON messages (conversation_id, sender_id, client_key) WHERE client_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (sender_id, created_at DESC);

CREATE TABLE IF NOT EXISTS message_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam','harassment','inappropriate','other')),
  detail TEXT CHECK (char_length(detail) <= 1000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','dismissed','actioned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT uniq_message_report UNIQUE (message_id, reporter_id)
);
CREATE INDEX IF NOT EXISTS idx_message_reports_status ON message_reports (status, created_at DESC);

-- Binds app users to Spacetime browser identities (multi-device). Convenience/telemetry ONLY —
-- authorization stays in the module reducers.
CREATE TABLE IF NOT EXISTS user_spacetime_identities (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  identity_hex VARCHAR(66) NOT NULL,
  bound_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, identity_hex)
);
CREATE INDEX IF NOT EXISTS idx_user_spacetime_identity ON user_spacetime_identities (identity_hex);
```

`database/init/61-notification-type-chat.sql` — must carry `-- migrate:no-transaction` (runner detects it, `scripts/migrate.ts:53`; mirrors migrations 30/49):
```sql
-- migrate:no-transaction
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'dm_message';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'circle_message';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'table_chat_mention';
```

Retention: canonical kept indefinitely; soft-deleted bodies retained 30 days for moderation then scrubbed via cron; Spacetime `table_chat_message` pruned to newest 200/session by the send reducer, wholesale prune on session close; table conversations auto-archive on close.

## 2. SpacetimeDB module (`spacetime-module/src/`)

Tables: `TableChatMessage { chat_id (pk, auto_inc), session_id (btree), message_uuid, sender: Identity, sender_name (from member row, never args), body, reply_to_uuid, created_at, deleted }` and `TableChatMute { row_id, session_id (btree), member: Identity, muted_by, created_at }`.

Reducers (constants: body ≤2000, uuid ≤64, retain 200/session):
- `send_table_chat_message(ctx, session_id, message_uuid, body, reply_to_uuid)` — enforces: session exists & not CLOSED, sender is a `commensal_member`, no mute row, body 1..=2000; prunes beyond 200.
- `delete_table_chat_message(ctx, chat_id)` — sender or session host; tombstone (deleted=true, body blanked).
- `set_table_chat_mute(ctx, session_id, member, muted)` — host-only.
- `kick_commensal_member(ctx, session_id, member)` — host-only: remove + insert mute row; `join_commensal_session` extended to reject muted identities (kick = remove+mute; unmute readmits).

Deliberate v1 omissions: no typing indicators, no Spacetime read receipts (`last_read_at` is Postgres). After module changes: `spacetime publish` (out-of-band) + regenerate `src/lib/spacetime/generated/`; client helper `src/lib/spacetime/liveTableChatPublish.ts` mirrors `liveFeedPublish.ts`.

## 3. API — new namespace `src/app/api/chat/` (NOT `group-chat`, that's the agent-council proxy)

All: nodejs runtime, force-dynamic, `getDatabaseUserFromRequest`, Zod in `src/lib/chat/schemas.ts`, `rateLimit()` keyed by userId.

| Route | Method | Purpose | Limit |
|---|---|---|---|
| `/api/chat/conversations` | POST | ensure/create dm (by otherUserId) / table (by sessionId) / circle; upsert via unique indexes | 10/min |
| `/api/chat/conversations` | GET | inbox: memberships + last preview + unread (blocked senders filtered) | 60/min |
| `/api/chat/conversations/[id]/messages` | GET | keyset pagination `?limit=50&before=base64(created_at\|id)`; hidden filtered, deleted as tombstones, blocked senders excluded for blocker | 120/min |
| `/api/chat/conversations/[id]/messages` | POST | send {body, clientKey?, replyToId?, attachmentDataUrl?} → canonical message | 20/min + 5/10s |
| `/api/chat/conversations/[id]/read` | POST | set last_read; clears that conversation's chat notifications | 60/min |
| `/api/chat/conversations/[id]/mute` | POST | per-user notify_level | 20/min |
| `/api/chat/conversations/[id]/moderate` | POST | host-only kick/mute/unmute/archive | 20/min |
| `/api/chat/messages/[id]` | DELETE | soft delete (sender/host/admin) | 30/min |
| `/api/chat/messages/[id]/report` | POST | report; unique per reporter; auto-hide at 3 | 5/min |
| `/api/chat/unread` | GET | {total, byConversation} for nav badge | 60/min |
| `/api/chat/spacetime-identity` | POST | bind identityHex | 5/min |
| `/api/admin/chat/reports` (+`/[id]`) | GET/PATCH | admin review/resolve | — |

**Send enforcement chain** (`src/lib/chat/enforcement.ts`, unit-tested): auth → active membership (not left/banned) → host-mute check → not archived → **blocks both directions** (`isBlockedBetween` on commensalships status='blocked'; DM create + every DM send → 403 neutral message; table/circle: send allowed, list filters blocked senders for the blocker) → DM gate: accepted commensals only (v1) → content: trim, strip control chars, ≤2000, 1 photo ≤5MB via new `storeChatPhoto()` (R2, `chat-photos/<userId>/<hash>`), reply must be same-conversation → flag gates (server `CHAT_DMS_ENABLED` / `CHAT_CIRCLES_ENABLED`) → idempotent insert on clientKey → bump last_message_at → notify → practices.

Links: store plain text; client escapes + linkifies only http(s) with `rel="noopener noreferrer nofollow ugc"`; no unfurl v1.

Table-conversation host (interim until PR 2's Postgres Tables entity): first-ensurer from the create-session flow gets role='host'; live-plane host powers are module-authoritative regardless.

## 4. Safety
Reports + auto-hide at 3 + admin queue (`src/app/admin/chat-reports/page.tsx`, pattern of admin/users) + `ReportMessageDialog` in every message menu. Host powers: delete-any (both planes), mute, kick, lock (existing), archive. Per-conversation mute = notifications only. Caps: 2000 chars, 1 photo 5MB, detail 1000.

## 5. Client
- `useTableChat` — Spacetime sub on `table_chat_message WHERE session_id` merged w/ canonical fetch + 20s reconcile; 10s poll fallback when disconnected or `NEXT_PUBLIC_SPACETIME_LIVE_TABLE_CHAT !== "1"`. Exposes messages/send/remove/hostMute/hostKick/connectionMode.
- `useConversation` — DM/circle poll (5s focused / 30s blurred / pause hidden), keyset load-earlier, optimistic send by clientKey.
- `useChatUnread` — 30s + focus + Spacetime-insert-triggered refetch (60s useNotifications untouched).
- Components `src/components/chat/`: MessageList (newest 100 + load earlier; no virtualization v1), MessageBubble, MessageComposer, TableChatPanel (prop-driven: sessionId/isHost — mounts in LiveCommensalLobby expanded card now, PR 2 Table screen later unchanged), ConversationView, InboxList, ReportMessageDialog, HostModerationMenu.
- Routes: `(alchm)/messages` + `(alchm)/messages/[conversationId]` (flag-gated). Nav: `MessagesBadge` beside NotificationBell.
- Identity binding: effect POSTs identityHex once per session.

## 6. Notifications
Types: dm_message, circle_message, table_chat_mention (enum + union + styles). **Dedup: max ONE unread row per (recipient, conversation)** — `notify.ts` upserts (bump count in metadata + refresh preview) else inserts. Suppress: sender, notify_level, blocked, and table kind entirely (table badge = /api/chat/unread, not notification rows). Mark-read clears rows. PWA-push seam: `dispatchMessageNotification()` ends in no-op `queueWebPush()` stub. `table_chat_mention` emitter DEFERRED until unique handles exist.

## 7. Economy (server-anchored, both in SERVER_ONLY_PRACTICES, ambient)
- `table_toasted` — Spirit 1, dedupe ever, cap 2/day, target=conversationId; first-ever message in that table conversation.
- `dm_thread_started` — Spirit 1, dedupe ever, cap 2/day, BOTH parties when the second distinct sender posts (unanswered spam earns nothing).
Transit modulation/daily budget apply via `practiceRewardService.computeReward()`.

## 8. Build order (8 reviewable commits)
1. Schema + `chatDatabaseService` + `enforcement.ts` + unit tests
2. Core API routes + `storeChatPhoto` + route tests
3. Spacetime module (+tables/+reducers/join guard) + regenerated bindings + `liveTableChatPublish` + `isLiveTableChatEnabled`
4. Table chat UI (ships visible) — useTableChat + panel components + LiveCommensalLobby mount + poll fallback
5. Safety — delete/report/moderate/mute routes + admin queue + dialogs
6. DMs + inbox (flag-gated) + Message affordance on companion cards + circle kind
7. Notifications + unread badge
8. Economy practices

Flags: server `CHAT_DMS_ENABLED`/`CHAT_CIRCLES_ENABLED`; client `NEXT_PUBLIC_CHAT_DMS`/`NEXT_PUBLIC_CHAT_CIRCLES`/`NEXT_PUBLIC_SPACETIME_LIVE_TABLE_CHAT`. Visible at launch: table chat. Gated: DMs, circles, /messages inbox.

## 9. Risks (defaults chosen)
1. Spacetime world-readable → accept for table chat only; never mirror DM/circle bodies; revisit on client_visibility_filter.
2. No PG record of live sessions yet → PG host = first-ensurer; live powers module-authoritative; reconcile when PR 2 lands.
3. Identity binding client-asserted → telemetry only, never authorization.
4. Mentions need unique handles → enum now, emitter fast-follow.
5. DM 5s-poll load → fine at current scale; add 304/ETag + content-free `inbox_signal` Spacetime table before broad DM flag flip.

Critical reference files: `spacetime-module/src/live_reducers.rs`, `src/lib/spacetime/liveFeedPublish.ts`, `src/components/commensal/LiveCommensalLobby.tsx`, `src/services/practiceRewardService.ts`, `src/app/api/feed/share/route.ts`.
