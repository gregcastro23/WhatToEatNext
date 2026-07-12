# PR 3 — Known limitations (deferred from review)

These findings are bounded and do not block the PR. Postgres is authoritative
for every durable behavior (messages, membership, moderation, unread); the
items below are about the **flag-gated, ephemeral SpacetimeDB live mirror**
(`NEXT_PUBLIC_SPACETIME_LIVE_TABLE_CHAT`, off by default) or are tracked
follow-ups the plan already deferred.

1. **Module-side chat moderation trusts an unverified host identity.**
   The chat moderation reducers in `spacetime-module/src/live_reducers.rs`
   (`delete_table_chat_message` host-branch, `set_table_chat_mute`,
   `kick_table_chat_member`) gate on `TableSession.host` — the **unverified
   first-ensurer** identity. Because `ensure_table_session` is a race, a guest
   who wins it could gain live-mirror moderation powers (mute/kick/delete on
   the ephemeral rows). This is **bounded, not a security hole**: the mirror is
   flag-gated and non-durable, and all DURABLE moderation is Postgres
   `tables.host_id`, enforced by `POST /api/chat/[id]/moderate` and
   `DELETE /api/chat/messages/[id]`. Matches the PR 2 stance (do not
   re-architect the module identity model in this PR). **Fast-follow:**
   server-authenticated Spacetime identity binding — the app already records
   `user_spacetime_identities` (telemetry-only today); a signed binding would
   let the module cross-check the caller's identity against Postgres
   `tables.host_id` before honoring a moderation reducer. Until then, treat the
   module host check as a UX gate, never a trust boundary. (Reducers carry an
   inline note pointing here; the chat section header in `live_reducers.rs`
   documents the caveat in full.)

2. **`table_chat_mention` emitter deferred** (plan §6). The
   `table_chat_mention` notification enum value exists (migration 63) but no
   code emits it — mentions need unique, parseable handles, which don't exist
   yet. Table chat emits NO notification rows regardless (its badge is
   `/api/chat/unread`); this is purely the future @-mention path.

3. **Soft-deleted message bodies are retained, not yet scrubbed.** Deleted
   messages keep their body in Postgres for the 30-day moderation window (plan
   §1). The scheduled scrub (a cron that blanks `body` past 30 days) is a
   specced follow-up; every read path already returns a tombstone, so no
   deleted body is ever served.

Everything that ships enabled — the entire Postgres chat data model, the send
enforcement chain, table-chat UI (visible), safety (report/auto-hide/admin
queue), and the flag-gated DM/circle surfaces — is fully covered by tests.
