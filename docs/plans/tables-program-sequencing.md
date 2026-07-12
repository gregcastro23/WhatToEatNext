# Tables Program — Cross-PR Sequencing & Reconciliation (2026-07-11)

The PR 2 (Table entity) and PR 3 (messaging) plans were designed in parallel and overlap in two places. This document is the arbitration — implementation agents follow THIS where the plans disagree.

## PR order & branches
1. **PR 1 — foundation repair** (`feat/commensal-foundation`, in flight): chart fallback chain, companion-storage unification, rate limits, block endpoint, save-group txn, reciprocal-request fix, copy repairs, tests.
2. **UI kit** (`feat/tables-ui-kit`, in flight): tokens + shared components per `../design/tables-design-spec.md` §1–2. Independent; can merge before/after PR 1.
3. **PR 2 — Table entity** (`pr2-table-entity-plan.md`): depends on PR 1's `loadUserChartMember`/fallback chain for the composite bridge.
4. **PR 3 — messaging** (`pr3-messaging-plan.md`): depends on PR 2's `tables` entity for host determination and conversation subjects.
5. Later per roadmap: PR 4 graph/avatars/profile, PR 5 feed/reactions/comments/push, PR 6 discovery/mobile tab.

## Reconciliation 1 — table chat is owned by PR 3 (single chat system)
Both plans independently designed live table chat in the Spacetime module. Resolution:
- **PR 2 ships the live room presence-only**: module tables `TableSession` + `TablePresence` and reducers `ensure/join/leave/close_table_session`. PR 2 does NOT add `TableChatMessage` or `post_table_chat` (drop from its commit 4).
- **PR 3 owns ALL chat** on its `conversations`/`messages` Postgres model + Spacetime mirror, with these amendments now that PR 2's entity exists:
  - `conversations.subject_ref` for `kind='table'` = the **Postgres `tables.id` UUID** (NOT a Spacetime session id).
  - The module's `TableChatMessage`/`TableChatMute` key on `wten_table_id: String` (same key as PR 2's `TableSession`), and chat membership checks reference `TablePresence` (PR 2's table) instead of `commensal_member`.
  - PR 3's "interim first-ensurer host" workaround is DELETED: table-conversation host = `tables.host_id`, authoritative. The ensure-table-conversation call happens server-side inside PR 2's go-live handler (creates the conversation + seeds `conversation_members` from joined table members), not from the host's client.
  - `TableChatPanel` mounts in PR 2's `LiveTableRoom.tsx` / table page (not `LiveCommensalLobby` — that mount point in the PR 3 plan is superseded; the old lobby stays untouched and is retired later).
  - PR 2's risk-5 default ("chat ephemeral, deleted at close") is superseded: PR 3's Postgres record is canonical and survives close; only the Spacetime mirror rows are pruned at close.

## Reconciliation 2 — migration numbers (ASSIGNED, not just reserved)
PR 1 merged as `59-commensalships-unordered-pair.sql`. **Note:** a concurrent, unrelated session independently merged `59-recipe-embeddings.sql` in the same window — origin/master now has two files sharing the "59" prefix. This is NOT a functional bug (the runner in `scripts/migrate.ts` sorts and tracks migrations by full filename, not a parsed integer, so both apply exactly once, deterministically, `c` before `r`) — it is left as-is rather than renaming an already-merged, possibly-already-deployed file. It is purely a numbering-hygiene wart. (A second, older, pre-existing collision at "19" was found during this check and is unrelated to this program — not touched.)

Given that history, PR 2 and PR 3 numbers are assigned explicitly here rather than left to "check highest number at merge time" (which is exactly the process that produced the 59 collision):
- **PR 2**: `60-tables-schema.sql` (tables/table_members/table_invites/table_photos/table_comments), `61-notification-types-tables.sql` (`-- migrate:no-transaction`, 4 ALTER TYPE ADD VALUE).
- **PR 3**: `62-chat-schema.sql` (conversations/conversation_members/messages/message_reports/user_spacetime_identities), `63-notification-type-chat.sql` (`-- migrate:no-transaction`, 3 ALTER TYPE ADD VALUE).
- **PR 4 (graph & identity)**: `64-follows-avatars.sql` (follows table + avatar columns/tables as its plan specifies), `65-notification-type-social-graph.sql` (`-- migrate:no-transaction`, e.g. new_follower).
- **PR 5 (feed & engagement)**: `66-feed-comments-push.sql` (feed comments + web-push subscriptions), `67-notification-types-engagement.sql` (`-- migrate:no-transaction`, reaction/comment/mention types).
- **PR 6 (discovery & mobile)**: `68-*.sql` only if its plan genuinely needs one (synastry-cache already exists as migration 47); prefer no migration.

Implementation agents MUST still re-verify immediately before their final commit (`git fetch origin master && git ls-tree origin/master -- database/init/ | grep '/60-\|/61-'` etc.) in case yet another concurrent session claimed the same number in the meantime — bump to the next free integer and update this doc if so, rather than silently colliding again.

## Reconciliation 3 — shared conventions both plans must honor
- Agents-are-users: historical/planetary agents participate via `user_id` in `table_members` and `sender_id` in `messages` — no special columns. Real roster identities only in all seeds/examples (design-spec §4.8).
- One Spacetime key: `wten_table_id` (PG UUID as text) across TableSession/TablePresence/TableChatMessage/TableChatMute.
- Both plans' notification metadata carries `tableId`/`conversationId` for deep links; dedup rule (one unread row per recipient+conversation) applies to chat only.
- R2 key prefixes: `table-photos/<tableId>/…` (PR 2), `chat-photos/<userId>/…` (PR 3), both via `cookPhotoStorage.ts` helpers.
- Flags: `NEXT_PUBLIC_SPACETIME_LIVE_TABLES` (PR 2 live room), `NEXT_PUBLIC_SPACETIME_LIVE_TABLE_CHAT` + server `CHAT_DMS_ENABLED`/`CHAT_CIRCLES_ENABLED` + client twins (PR 3). Table pages/invites/feed cards ship unflagged.
