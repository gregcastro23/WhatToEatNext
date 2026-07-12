<!-- Plan authored 2026-07-12 by the PR4 design agent; verbatim. Read alongside tables-program-sequencing.md (binding arbitration). -->

# PR 4 — Social graph & identity: Implementation Plan

Branch: `feat/social-graph-identity`. Depends on origin/master (PR #588 kit + PR #589 foundation, both merged) and `feat/tables-entity` (PR 2, assumed merged — degradation notes in §8). Note: the local checkout at `/Users/cookingwithcastro/Desktop/WhatToEatNext-master` is behind origin/master — implementation must start from `origin/master` (commit `3b83434e`), where `src/components/tables/ui/*` and the block endpoint actually exist.

## 0. Substrate findings that shape the design

- **Anonymity default lives in exactly one service**: `src/services/feedDatabaseService.ts` — identical anonymize blocks in `getRecentEvents` (~L138-155) and `getEventsByActor` (~L200-215): `if (!metadata || metadata.shareName !== true) { actorName = "Anonymous Alchemist"; actorImage = undefined; }`. Consumers: `GET /api/feed`, `GET /api/users/[userId]/feed`, `HumanFeedRow` in `src/app/(alchm)/feed/page.tsx` (~L701).
- **Write side**: `src/app/api/feed/share/route.ts` stamps `shareName: shareType === "cooked" ? false : shareName === true` — cooked cards are force-anonymous (chart-persona identity). Composers with opt-IN checkboxes: `src/app/menu-planner/page.tsx` (L109, L998), `src/components/recipe/CosmicRecipeGenerator.tsx` (L130, L840), `src/components/profile/FoodPreferences.tsx` (L72, hardcoded false).
- **Column conventions**: profile-facing data goes on `user_profiles` via `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS` (migrations 31, 52); every identity read already `LEFT JOIN user_profiles`. `users.image` exists (migration 07, OAuth-only; no upload path anywhere). `user_profiles.user_id` is UNIQUE → upsert-friendly.
- **R2 pattern**: `src/lib/feed/cookPhotoStorage.ts` — data-URL → sha256-keyed `PutObjectCommand`, 5MB / jpeg|png|webp allowlist, null-on-failure. PR 2 reuses it for `table-photos/`.
- **Sigil fallback already exists**: `src/components/tables/ui/AvatarCircle.tsx` renders element-glyph (via `@/components/ui/alchm/Glyph`) when no photo — built exactly for this (design-spec §4.8). It is *not* in the kit barrel yet.
- **nanobanana** (`src/app/api/nanobanana/generate/route.ts`) proxies to the PA Python backend `POST /api/generate-image` → `{url}`, Redis-cached. Reusing it for avatars means an external-service dependency, non-deterministic output, no R2 persistence, and face-generation/moderation questions. **Recommendation: ship the deterministic element-sigil fallback (zero new code — AvatarCircle) in this PR; AI cosmic avatars are a fast-follow** behind a dedicated `POST /api/user/avatar/generate` that persists the PA image to R2. This matches design-spec §4.2 ("until then OAuth image or generated sigil fallback").
- **Blocks**: `commensalships.status='blocked'` rows; `blockCommensal`/`unblockCommensal` in `src/services/commensalDatabaseService.ts` (~L484-621); endpoint `src/app/api/commensals/block/route.ts`. PR 2's `isBlockedPair` (tableDatabaseService ~L308) is the reusable check pattern.
- **Notifications**: `notifications.type` is a Postgres ENUM (extend via no-transaction migration mirroring `database/init/61` on the PR 2 branch); `createNotification(userId, type, title, message, {relatedUserId, metadata})`; per-day dedupe precedent `hasDailyInsightToday`. Styles consumed in `src/components/dashboard/NotificationPanel.tsx` L188 and `src/components/nav/NotificationBell.tsx` L102.
- **Economy**: `SERVER_ONLY_PRACTICES` in `src/lib/economy/practices.ts`; server routes call `practiceRewardService.recognize(userId, type, targetId)` keyed to a real row insert (pattern: `src/app/api/feed/react/route.ts` L71-77); toasts via `revealPracticeReward`.
- **PR 2 gives us**: `tables`/`table_members` (migration 60), `tableDatabaseService.listTablesForUser(userId, scope)`, member reads already joining `u.image AS user_image` (~L174) — a join PR 4 must upgrade; `closeTable` writes the `table_memory` feed event with hardcoded `shareName: true` and `TableMemoryPayload.shareName: true` (type literal) — PR 4 must make this respect the host's setting.

---

## 1. Migration 64 — `database/init/64-follows-avatars.sql`

Runs in a transaction (house default). Re-verify number is free against origin/master right before final commit per sequencing doc.

```sql
-- Asymmetric follow layer (two-tier graph: commensalships = inner circle, follows = public reach).
CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT follows_pkey    PRIMARY KEY (follower_id, followee_id),  -- unique pair
  CONSTRAINT follows_no_self CHECK (follower_id <> followee_id)
);
-- PK serves follower→followee direction; these serve recency-ordered lists both ways.
CREATE INDEX IF NOT EXISTS idx_follows_followee ON follows (followee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows (follower_id, created_at DESC);

-- Identity & avatar — user_profiles is canonical for profile-facing columns (migrations 31/52 precedent).
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS share_identity BOOLEAN NOT NULL DEFAULT true;
```

Plus `COMMENT ON` lines per house style. Decisions:

- **Blocked-pairs-cannot-follow is application-enforced** (write-time check + purge-on-block, §3/§below) — no DB trigger. A cross-table trigger into `commensalships` would couple schemas and complicate PR ordering; blocking here is abuse mitigation, not a security boundary (same rationale as PR 2's `isBlockedPair`). No backfill purge needed — table is born empty.
- **Avatar = `user_profiles.avatar_url` column, not a separate table.** One current avatar per user; every identity read already LEFT JOINs `user_profiles`; no history requirement (old R2 object deleted best-effort on replace). A separate table buys nothing but a join.
- **`share_identity BOOLEAN NOT NULL DEFAULT true`** on `user_profiles` — the per-user opt-out ("false" = post anonymously by default). Rows may not exist for all users → all writers use `INSERT ... ON CONFLICT (user_id) DO UPDATE`, all readers treat NULL row as `true`.

## 2. Migration 65 — `database/init/65-notification-type-social-graph.sql`

Mirrors PR 2's 61 exactly (header comment + `-- migrate:no-transaction` directive, idempotent):

```sql
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'new_follower';
```

**Only one value.** Follower milestones are ambient/economy territory (no bell spam); follow-back suggestions are PR 6 discovery. Nothing else justified.

## 3. New domain service — `src/services/followDatabaseService.ts`

Same class-singleton shape as `tableDatabaseService`. Surface:

- `follow(followerId, followeeId)` → `{created: boolean}` — validates target exists + `is_active` (agents allowed); **fail-closed** block check (unlike PR 2's fail-open invite check — a retried follow button beats a follow that slips past a block); `INSERT ... ON CONFLICT DO NOTHING`, `created = rowCount === 1` (idempotency signal drives notification/practice exactly-once).
- `unfollow(followerId, followeeId)` → idempotent DELETE.
- `getFollowCounts(userId)` → `{followers, following}` (two indexed COUNTs).
- `getFollowState(viewerId, targetId)` → `{follows, followedBy}` (one query, both directions).
- `listFollowers(userId, viewerId | null, limit=30, cursor?)` / `listFollowing(...)` — keyset pagination on `(created_at, follower_id)`; joins `users u` + `user_profiles up` returning `{userId, name: COALESCE(up.name, u.name, 'Alchemist'), avatarUrl: COALESCE(up.avatar_url, u.image), isAgent, dominantElement, followedByViewer}`. **Never email.** Block filtering at read time: `NOT EXISTS (SELECT 1 FROM commensalships WHERE status='blocked' AND pair(viewer, listed))` — write-time purge handles owner↔listed pairs, this anti-join handles viewer↔listed.
- `purgeFollowsBetween(a, b)` — `DELETE FROM follows WHERE (follower_id=$1 AND followee_id=$2) OR (follower_id=$2 AND followee_id=$1)`. Called from `commensalDatabaseService.blockCommensal` (both DB branches: chip-id and target-id paths) right after the blocked upsert, log-and-continue on failure. Silent (blocks emit no notifications — existing convention).

## 4. API surface

| Route | Method | Auth | Behavior |
|---|---|---|---|
| `/api/follows` | POST | req | `{targetUserId}`; self→400; blocked either direction→403 generic "Cannot follow this user"; idempotent 200 `{following:true}`. On `created===true` and followee is human: dedup-checked `new_follower` notification + practices (§7). RL 20/min/user, bucket `follows`. |
| `/api/follows` | DELETE | req | `{targetUserId}` (body or query). Idempotent 200 `{following:false}`. RL 20/min/user. |
| `/api/users/[userId]/followers` | GET | opt | Paginated block-filtered list (above). `?limit&cursor`. RL 60/min/IP. |
| `/api/users/[userId]/following` | GET | opt | Same. |
| `/api/user/avatar` | POST | req | `{photoDataUrl}` → `storeAvatar` (§below) → upsert `user_profiles.avatar_url`; best-effort delete of previous R2 object when key differs; first-ever set recognizes `visage_revealed`. Returns `{avatarUrl}`. RL 5/5min/user. DELETE clears column + best-effort R2 delete. |
| `/api/user/identity` | GET/PATCH | req | GET `{shareIdentity, avatarUrl}`; PATCH `{shareIdentity: boolean}` upserts `user_profiles.share_identity`. Modeled on `src/app/api/user/profile/layout/route.ts` (small, direct `executeQuery`) — do NOT bolt onto the heavy Hono-proxied `/api/user/profile`. RL 10/min. |
| `/api/users/[userId]` | GET | opt-viewer | **Extended** (existing route, `Promise.allSettled` isolation preserved): adds `avatarUrl` (COALESCE chain), owner-only `shareIdentity`, and `social` block: `{followers, following, commensals, tablesHosted, tablesJoined, viewer: {follows, followedBy, isCommensal} \| null}`. Table counts guarded by `to_regclass('public.tables')` → `null` when PR 2 absent (client hides those tiles). Commensals = COUNT accepted commensalships. Viewer resolved via `getUserIdFromRequest` without requiring auth. |
| `/api/users/[userId]/tables` | GET | opt | Memories for profile gallery: `?scope=hosted\|attended`, **status='memory' only**, visibility-gated: `public` for everyone; `commensals` only when viewer has an accepted commensalship with the profile owner; `private` only when viewer is a member. Returns card-shaped rows (title, closedAt, photoUrls[0..n], composite dominant, mini guest roster honoring frozen identity). Implemented as `listMemoriesForUser` added to `tableDatabaseService`. |

**Avatar storage** — `src/lib/profile/avatarStorage.ts`, a near-clone of `cookPhotoStorage.ts` (same env, same 5MB/mime regex validation on the data URL, sha256 content key): `avatars/<userId>/<hash>.<ext>`, plus `deleteAvatarObject(url)` that only deletes keys under the caller's own `avatars/<userId>/` prefix (prevents cross-user deletes via crafted URLs). Data-URL body (not multipart) — matches the existing `/api/food-lab/upload` → share pipeline the app already uses.

**Avatar read chain everywhere**: `COALESCE(up.avatar_url, u.image)` → client falls back to element sigil (`AvatarCircle`). Touch points: feed queries (§5), `/api/users/[userId]`, PR 2's member join in `tableDatabaseService` (~L174: `u.image AS user_image` → `COALESCE(up.avatar_url, u.image) AS user_image`, adding the `user_profiles` join), followers/following lists.

**Agents are followable** — recommended and adopted: they're first-class users (`is_agent=true`); no special-casing in the follows table. Only differences: no `new_follower` notification and no `first_follower_gained` practice when the followee is an agent (agents don't read bells or earn); follow buttons render on `AgentProfile` too.

## 5. The identity-default flip (no retroactive de-anonymization)

**Principle: identity is stamped at write time; the reader never *reveals* more than the stamp allows, but may *conceal* more.**

New helper `src/lib/feed/identity.ts`:

```ts
interface IdentityStamp { v: 2; share: boolean; explicit: boolean }
resolveFeedActorReveal({ isAgent, metadata, currentShareIdentity }): boolean
// 1. isAgent → true (agents always named — existing behavior)
// 2. no metadata.identity stamp (LEGACY event) → metadata.shareName === true   ← old rule frozen forever
// 3. stamp.share === false → false                                             ← per-post anonymous, permanent
// 4. stamp.explicit → true                                                     ← user actively chose to be named
// 5. else → currentShareIdentity !== false                                     ← default-named posts honor a LATER opt-out
```

This satisfies every requirement: legacy events keep rendering under the rules they were posted with (rule 2 — the flip cannot de-anonymize a single pre-existing row because they all lack the stamp); the per-user opt-out is honored everywhere including retroactively in the privacy-safe direction only (rule 5); per-post override in both directions (rules 3/4).

**Write side** (`feedDatabaseService.createEvent`): new optional arg `identity?: { share?: boolean; explicit?: boolean }`. When the payload lacks a stamp: resolve `share = identity?.share ?? (user_profiles.share_identity ?? true)` (one indexed query; merge with the existing webhook user query when `!skipWebhook`), then write both `metadataPayload.identity = {v:2, share, explicit: identity?.share !== undefined}` **and** the legacy mirror `metadataPayload.shareName = share` (rollback-safe: an old reader renders new events correctly).

**Read side** (`getRecentEvents` + `getEventsByActor`): SELECT adds `up.share_identity AS actor_share_identity, up.avatar_url AS actor_avatar_url`; the two duplicated anonymize blocks are replaced with the resolver; revealed image = `COALESCE(avatar_url, image)`; concealed = `"Anonymous Alchemist"` + no image (unchanged rendering path in `HumanFeedRow`).

**Share routes & composers**:
- `src/app/api/feed/share/route.ts`: accept `shareIdentity?: boolean` (keep accepting legacy `shareName` as alias); drop the `shareType === "cooked" ? false` force — cooked cards join the default. Pass through to `createEvent` as the explicit identity when the client sent it.
- Composer checkboxes flip from opt-in "share my name" to opt-out **"Post anonymously"** (default unchecked): `menu-planner/page.tsx`, `CosmicRecipeGenerator.tsx`, `FoodPreferences.tsx`. When the user's global `shareIdentity` is false, the toggle renders pre-checked (and unchecking it sends explicit `shareIdentity: true`).
- `CookedDishCard` (`src/components/feed/CookedDishCard.tsx`): gains optional `actorName/actorImage/actorId` props from the event; when revealed, real name + avatar head the card and the chart-persona (`persona`/`signature`/`transitLine`) becomes the signature line; when concealed, current pure-persona rendering unchanged.
- **PR 2 integration**: `tableDatabaseService.closeTable` — replace hardcoded `shareName: true` with the host's resolved setting via the same stamp (`TableMemoryPayload.shareName` type widens `true` → `boolean`, plus `identity` stamp); frozen `guests[]` entries respect each registered member's `share_identity` *at close time* (concealed guest freezes as "Anonymous Alchemist" + element only). `table_comments` reads resolve author name/avatar through the same COALESCE chain and conceal when the author's *current* setting is off (comments are live reads, not frozen artifacts).
- Emergency lever: `IDENTITY_DEFAULT_ANONYMOUS=1` env check inside `createEvent`'s default resolution flips the *default* back without redeploy (stamps stay coherent).

Out of scope, noted: `LiveCommensalLobby` (retiring old lobby) and Spacetime presence identities (deliberately anonymous per PR 2 plan) untouched.

## 6. Profile rework (design-spec §3.5)

Rework `src/app/(alchm)/profile/[userId]/page.tsx` for human profiles (the enriched `AgentProfile` branch stays, gaining `FollowButton` in its header). Layout md:4/md:8 two-column on the void bg with `TablesAura`-style treatment. New components under `src/components/profile/tables/`, composing **only** kit pieces from `src/components/tables/ui`:

| Component | Composes | Notes |
|---|---|---|
| `ProfileIdentityPanel.tsx` | `GlassPanel`, `AvatarCircle` (128px in `p-[2px] bg-gradient-alchm rounded-full` ring), `ElementChip` ("FIRE · ARIES SUN" from dominantElement + sun sign in natalPositions), `LabelXS` | Export `AvatarCircle` from the kit barrel (one-line kit change). Handle line: agent slug for agents; "Alchemist since {year}" for humans (no email leak). Owner sees `AvatarUpload` affordance on the avatar + "Post anonymously by default" toggle (PATCH `/api/user/identity`). |
| `FollowButton.tsx` + `src/hooks/useFollow.ts` | `GradientButton` | Optimistic FOLLOW/FOLLOWING; hidden when viewer===owner or blocked pair (API omits `viewer` state → hide). |
| `BreakBreadButton.tsx` | glass `GradientButton` variant | **BREAK BREAD** → deep-link `/tables?invite=<userId>` into PR 2's create/invite flow (PR 4 adds the tiny `?invite=` prefill handling to PR 2's tables page: pre-selects that user in the member-invite step). Fallback const `BREAK_BREAD_FALLBACK_HREF = "/commensal"` if PR 2 slips. |
| message icon button | lucide `MessageCircle` | Rendered only when `process.env.NEXT_PUBLIC_CHAT_DMS_ENABLED === "1"` (PR 3's client twin); links to PR 3 DM compose. |
| `ProfileStatsPanel.tsx` | `GlassPanel`, `LabelXS` | 2×2: TABLES HOSTED / TABLES JOINED / COMMENSALS / FOLLOWERS (24px copper numbers). Tiles with `null` counts (PR 2 absent) hidden. FOLLOWERS/COMMENSALS tap → `FollowListSheet`. |
| `CosmicIdentityPanel.tsx` | `GlassPanel`, `ElementBars` + `elementPercentages` | Elemental balance from the profile's natal chart (same source the existing `alchemicalConstitution` block in `ProfileBlockRegistry` uses — reuse its derivation, don't re-derive). |
| `TableMemoriesGallery.tsx` | `GlassPanel`, `LabelXS` tabs (HOSTED/ATTENDED, copper underline, proper `role="tablist"`), `AvatarRow`, `CompositeRadialBadge` | Fed by `GET /api/users/[userId]/tables`; empty state "No table memories yet — break bread to begin"; section hidden entirely when API 404s/degrades. |
| `FollowListSheet.tsx` | `GlassPanel`, `AvatarCircle`, `LabelXS` | Paginated followers/following with inline follow buttons. |

The existing ESMS balance tiles and `PROFILE_BLOCKS` tabs fold beneath the new §3.5 header sections for the owner view (don't delete the customize-layout system — it renders under the gallery). Kill the emoji header block (🤖/🜍) — replaced by the real avatar/sigil ring. **All demo/test/seed identities: historical roster only** (da Vinci, Shakespeare, Tesla, Curie, Cleopatra, Einstein, Jung, Newton) per design-spec §4.8 — e.g. route tests use "Marie Curie follows Nikola Tesla", never invented personas.

## 7. Notifications & economy

**`new_follower`** (types + styles in `src/types/notification.ts`: add to union; style `{ bg: '#E8EAF6', border: '#9FA8DA', icon: '🤝' }`; metadata `{followerUserId}` + `relatedUserId` for the profile deep-link; `NotificationPanel`/`NotificationBell` need no structural change, just the style entry + a "View profile" link on `relatedUserId` like the commensal blocks). **Dedup rule against follow/unfollow churn**: emit only when (a) the INSERT actually created a row (`created === true` — re-follows of a standing edge are silent no-ops) AND (b) no `new_follower` notification from the same follower exists within 30 days: `SELECT 1 FROM notifications WHERE user_id=$followee AND type='new_follower' AND related_user_id=$follower AND created_at > now() - interval '30 days'` (pattern: `hasDailyInsightToday`). Serial follow→unfollow→follow therefore pays one bell per pair per 30 days, max.

**Follower-count ambient surfacing**: the FOLLOWERS stat tile on the profile (§6) + the bell notification. Nothing in-feed, no counters on posts — consistent with subtle-ambient.

**Economy** — three additions to `PRACTICES` + all three to `SERVER_ONLY_PRACTICES` (each keyed to a real row transition, per the `feed/react` precedent), recognized server-side:

| Practice | Token | Amount | Dedupe / cap | Anchor |
|---|---|---|---|---|
| `follow_made` (follower side) | Spirit | 0.5 | ever per target (followee id), 5/day | `created===true` in POST /api/follows |
| `first_follower_gained` (followee side) | Spirit | 2 | ever, no target, 1/day | first-ever follower row (COUNT check), human followee only |
| `visage_revealed` | Matter | 2 | ever, 1/day | first-ever `avatar_url` set in POST /api/user/avatar (Matter per `photo_added` precedent) |

Hints in-voice (e.g. `follow_made`: "A thread tied between charts"; `first_follower_gained`: "Your table has found its first witness"; `visage_revealed`: "The alchemist steps from behind the sigil"). No visible amounts anywhere — toasts only via the existing delight host.

## 8. Build order — 4 reviewable commits; rollout & PR 2 dependency

1. **Graph substrate** — migrations 64+65; `src/types/social.ts`; `followDatabaseService` + tests (idempotency, self-follow CHECK, block-aware write fail-closed, purge-on-block, pagination/block-filtered lists); `blockCommensal` purge hook; notification type+style; `/api/follows` + `/api/users/[userId]/followers|following` routes + route tests; practices catalog additions.
2. **Avatars** — `avatarStorage.ts` + tests (mime/size/foreign-key-prefix delete refusal); `/api/user/avatar`; COALESCE chain into `/api/users/[userId]`, feed queries' SELECTs (read-only prep — resolver still old rule here), PR 2's member join; `AvatarUpload.tsx`; kit barrel export of `AvatarCircle`; `visage_revealed`.
3. **Identity flip** — `src/lib/feed/identity.ts` + exhaustive resolver unit tests (legacy/stamped/explicit × setting matrix); `createEvent` stamping + env lever; both read paths swapped to resolver; `/api/user/identity`; share route + 3 composers flipped to "Post anonymously"; `CookedDishCard` real-identity header; PR 2 `closeTable`/comments integration.
4. **Profile rework** — extended `/api/users/[userId]` social block; `/api/users/[userId]/tables` + `listMemoriesForUser`; all §6 components; page rework; `?invite=` prefill on the tables page; `AgentProfile` follow button.

**Rollout (locked decision 20: ship visible, gate the risky)**: follows, avatars, identity flip, and the profile rework all ship **visible, unflagged**. Gated/deferred: message icon behind `NEXT_PUBLIC_CHAT_DMS_ENABLED` (PR 3's flag); AI cosmic avatar generation deferred to fast-follow (sigil fallback ships); `IDENTITY_DEFAULT_ANONYMOUS` env as an emergency default-reverter (not a feature flag — no UI difference).

**If PR 2 is unmerged when PR 4 lands** (graceful degradation, all server-checked): table stat tiles hidden (`to_regclass` guard returns null); Table Memories section hidden (route 404s cleanly); BREAK BREAD href falls back to `/commensal`; the `closeTable`/member-join/comments integration edits move to a rebase commit once PR 2 merges (they touch files that only exist on that branch). Everything else in PR 4 is PR 2-independent.

## 9. Risks & open questions (with recommended defaults)

1. **Later opt-out semantics** — does flipping `share_identity` off anonymize past default-named posts? **Default: yes for default-stamped posts, no for explicit per-post opt-ins, never reveals anything new** (the resolver in §5). Privacy-safe in both directions; costs one already-joined column at read time.
2. **Cooked-card persona collision** — real identity vs the chart-persona design. **Default: real name+avatar header, persona demoted to signature line; per-post anonymous toggle restores pure-persona mode.** Alternative (keep cooked force-anonymous) contradicts locked decision 4.
3. **AI avatar fallback scope** — **Default: sigil-first this PR; nanobanana avatars as fast-follow** (external PA dependency, persistence + face-moderation questions; the kit fallback already satisfies §4.8).
4. **Public follower lists as a scraping surface** — lists expose name+avatar+element of everyone a user knows. **Default: ship public (matches "public reach" intent) with RL 60/min/IP + max limit 50 + never email; revisit private-lists toggle in PR 6.**
5. **Fail-open vs fail-closed on the block check at follow time** — PR 2 fails open for invites. **Default: fail-closed for follows** (a transient 500 on a follow button is cheap; a follow slipping past a block notifies the blocker — the worse failure), while list reads stay fail-open with the anti-join as backstop.

### Critical Files for Implementation
- /Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/feedDatabaseService.ts (anonymity default lives here — both read paths + createEvent stamping)
- /Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/api/users/[userId]/route.ts (profile GET — social block, avatar, table counts)
- /Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/(alchm)/profile/[userId]/page.tsx (§3.5 rework mount point)
- /Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/feed/cookPhotoStorage.ts (R2 pattern to clone for avatarStorage)
- /Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/commensalDatabaseService.ts (blockCommensal purge hook + block-check patterns)