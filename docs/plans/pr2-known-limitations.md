# PR 2 — Known limitations (deferred from review)

Two review findings touch only the **flag-gated** live-presence layer
(`NEXT_PUBLIC_SPACETIME_LIVE_TABLES`, off by default) and require a Rust
module rebuild + `spacetime generate` binding regeneration. They do not affect
any surface that ships enabled, so they are deferred to a fast-follow rather
than blocking this PR. Both are cosmetic presence-accuracy issues, not
correctness or security defects.

1. **Host re-entry doesn't restore presence** — `ensure_table_session`
   (`spacetime-module/src/live_reducers.rs`, the "session already exists"
   branch) returns `Ok` without re-inserting the caller's `TablePresence` row.
   A host who leaves and re-opens a live room shows as absent in the presence
   list until a reducer that writes their row runs. Fix: on the already-exists
   path, upsert the caller's presence row (mirror `join_table_session`'s
   insert-or-update). Then `cargo check --target wasm32-unknown-unknown` +
   `cargo test`, regenerate bindings with the version-matched CLI
   (`~/.local/share/spacetime/bin/2.4.1/spacetimedb-cli generate
   --module-path spacetime-module --lang typescript --out-dir
   src/lib/spacetime/generated`), no `spacetime publish`.

2. **No `onUpdate` handler for `table_presence`** — `LiveTableRoom.tsx`
   subscribes with `onInsert`/`onDelete` only, but `join_table_session`'s
   dedupe path *updates* an existing presence row (refreshing
   `display_name`/`wten_user_id`) instead of inserting. Those refreshes never
   reach the UI. Fix: register an `onUpdate` handler that reconciles the
   presence row in local state.

Everything that ships enabled (the entire Postgres Table lifecycle, invites,
composite bridge, memory artifact, feed card, notifications) is fully covered.
