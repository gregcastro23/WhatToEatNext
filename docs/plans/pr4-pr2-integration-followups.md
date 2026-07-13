# PR 4 → PR 2 integration follow-ups (rebase commit after PR 2 merges)

PR 4 (`feat/social-graph-identity`) was implemented in its **PR 2-independent
form** per the plan's §8 degradation rules, because PR 2 (`feat/tables-entity`)
was being built concurrently and is not on master. Every edit below touches
code that only exists on the PR 2 branch (or depends on its runtime schema)
and was therefore **deliberately deferred**. Apply them as one small rebase
commit once PR 2 merges. File paths are relative to the repo root; PR 2 line
references follow `docs/plans/pr2-table-entity-plan.md` and may have drifted —
locate by the quoted code, not the line number.

What already degrades gracefully WITHOUT this commit (no action needed):

- `GET /api/users/[userId]` table stat tiles: `to_regclass('public.tables')`
  guard returns `null` counts pre-PR 2 → client hides the tiles; once
  migration 60 runs the counts light up automatically.
- `BreakBreadButton` deep-links `/tables?invite=<userId>` automatically once
  the API reports non-null table counts; until then it falls back to
  `/commensal` (`BREAK_BREAD_FALLBACK_HREF`).
- `TableMemoriesGallery` hides itself on the route's 404.

## 1. `src/services/tableDatabaseService.ts` — member-read avatar chain

The member join (~L174 on the PR 2 branch) selects `u.image AS user_image`.
Upgrade to the PR 4 avatar chain by joining `user_profiles` (if not already
joined in that query) and selecting:

```sql
COALESCE(up.avatar_url, u.image) AS user_image
```

Every other member/roster read in that service that selects `u.image` gets the
same treatment. (Read chain convention: `COALESCE(up.avatar_url, u.image)` →
client element-sigil fallback via `AvatarCircle`.)

## 2. `src/services/tableDatabaseService.ts` — `closeTable` identity stamping

PR 2's close handler writes the `table_memory` feed event with a hardcoded
`shareName: true` and freezes `guests[]` with real identities unconditionally.
Replace with stamp-at-close semantics:

- Read the HOST's `user_profiles.share_identity` inside the close transaction;
  compute `hostShare = shareIdentity !== false` (import `defaultShareIdentity`
  from `src/lib/feed/identity.ts` to honor the `IDENTITY_DEFAULT_ANONYMOUS`
  lever).
- In the memory payload replace `shareName: true` with:
  ```ts
  identity: { v: 2, share: hostShare, explicit: false },
  shareName: hostShare,
  ```
  (`feedDatabaseService.createEvent` leaves pre-stamped payloads untouched, so
  building the stamp here — at freeze time — is correct.)
- Widen the type literal `TableMemoryPayload.shareName: true` → `boolean`
  (wherever PR 2 declared it, plan says `src/types/…` or inline in the
  service).
- For each REGISTERED member in the frozen `guests[]` array: read that
  member's `share_identity` at close time; when `false`, freeze the guest as
  `{ name: "Anonymous Alchemist", element }` (drop `userId` and any avatar).
  Manual (chart-only) companions keep name-only entries. Agents are always
  named. One batched query for all member ids, inside the same transaction
  client (never acquire a second pool connection while holding the txn —
  `createManualCompanionsAtomic` convention).

## 3. `src/services/tableDatabaseService.ts` (or the comments read path) — `table_comments` identity resolution

Comment reads are LIVE reads (not frozen artifacts). Resolve the author
name/avatar through the same chain used by the feed read paths:

- SELECT adds `up.share_identity`, avatar becomes
  `COALESCE(up.avatar_url, u.image)`.
- Conceal (name → "Anonymous Alchemist", no avatar) when the author's
  CURRENT `share_identity` is `false`. Agents always named. (Comments carry no
  per-post stamp — current-setting-only is the intended semantics per plan §5.)

## 4. `src/app/(alchm)/tables/page.tsx` — `?invite=` prefill

PR 4's `BreakBreadButton` links to `/tables?invite=<userId>`. Add the tiny
prefill: on the tables page (create/invite flow), read `searchParams.invite`;
when it is a UUID, pre-select that user in the member-invite step of the
create flow (however PR 2's invite picker stores selections). No other
behavior change; ignore invalid values silently.

## 5. `src/app/api/users/[userId]/tables/route.ts` — wire the real memories read

The route currently returns 404 unconditionally (PR 2-independent form).
Replace the body with the plan §4 implementation:

- Add `listMemoriesForUser(userId, viewerId, scope)` to
  `tableDatabaseService`:
  - `scope=hosted` → tables `WHERE host_id = $user AND status = 'memory'`;
    `scope=attended` → memory tables where the user is a joined member and
    not the host.
  - Visibility gate per row: `public` → everyone; `commensals` → viewer has
    an ACCEPTED commensalship with the profile owner; `private` → viewer is a
    member of that table. No viewer → public only.
  - Return card-shaped rows matching the client type already shipped in
    `src/components/profile/tables/TableMemoriesGallery.tsx`
    (`TableMemoryCard`): `{ id, title, closedAt, photoUrls, composite:
    { dominantElement, elementalBalance }, guests: [{ name, element,
    avatarUrl? }] }` — sourced from the frozen `tables.memory` JSONB so
    concealed guests stay frozen as "Anonymous Alchemist" (§2 above ensures
    the freeze is correct going forward).
- Route: keep the UUID check + RL; parse `?scope=hosted|attended` (default
  `hosted`); resolve optional viewer via `getUserIdFromRequest`; respond
  `{ success: true, memories }`; keep 404 ONLY when `to_regclass` says the
  schema is absent.
- Delete the `console.warn` degradation notice in the route.

## 6. Optional test follow-up

Add route tests for §5 (visibility matrix: public/commensals/private ×
anon/commensal/member viewer) using the historical-agent roster (e.g. host
Cleopatra VII, guests Isaac Newton + Albert Einstein) once the service method
exists.
