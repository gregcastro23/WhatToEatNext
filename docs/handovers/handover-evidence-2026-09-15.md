# Historical Evidence & Telemetry: Phase 1 Closeout (2026-09-15)

_Reference document linked from [NEXT_SESSION_PROMPT.md](../../NEXT_SESSION_PROMPT.md)._

---

## 1. Production Build Cache Anomaly Telemetry (2026-09-15)

During deployment of PR #846, builds repeatedly failed with exit code 137 (OOM) or 46-minute timeouts when reusing the Vercel build cache. When executed without cache, builds completed cleanly in 5 minutes:

| Build ID | Commit | Cache Origin | Source Drift (files) | Result | Duration | Notes |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| `4s55xdamw` | `2c43d39` | `11a154f` | 34 | OOM (exit 137) | ~8m | Cache hit from stale baseline |
| `8l8dfthkt` | `2c43d39` | _Skipped_ | — | Ready | 5m | Clean build without cache |
| `odqwli2rb` | `8c20867` | `91813d9` | 41 | Timeout | 46m | Stalled in Next.js compile |
| `bod5hr7ja` | `995805e` | `91813d9` | 41 | Ready | 3m | Same tree, succeeded |
| `j8dvn6676` | `d0b3eba` | `995805e` | 54 | Timeout | 46m | Stalled in Next.js compile |
| `j6vibobfe` | `d0b3eba` | _Skipped_ | — | Ready | 6m | Clean build without cache |
| `q8dv3cm3y` | `6e4130f` | `d0b3eba` | 16 | Ready | 2m | Clean cache reused (#848 merge) |

---

## 2. Red-Proofing Deletion Tests (Commit `a43690ec`)

To prove tests actually fail when load-bearing wiring is deleted, targeted code deletions were tested in throwaway worktrees prior to merge:

| Deleted / Modified Code Segment | Commit `7b4c5d8e` (Old Tests) | Commit `a43690ec` (Hardened Tests) | Failing Test Assertion |
| :--- | :---: | :---: | :--- |
| Delete `events.signOut` in `auth.ts` | Passed (Silent) | **1 Failed** | `wires NextAuth signOut event to onSignOutEvent` |
| Delete middleware `.auth` handler | Passed (Silent) | **1 Failed** | `wires onAuthMiddlewareRequest to NextAuth(...).auth` |
| Delete `GET /session` touch call | Passed (Silent) | **1 Failed** | `schedules session touch when GET /api/auth/session succeeds` |
| Throttle clause replaced with `FALSE` | Passed (Silent) | **3 Failed** | `last_seen_at < NOW() - interval '10 minutes'` |
| Device label shortcut replaced with `TRUE` | Not tested | **3 Failed** | `(device IS NULL AND $2::text IS NOT NULL)` |

---

## 3. Production Origin Probes Post-Deploy (`6e4130f2`)

Probed against `https://alchm.kitchen` immediately following the 20:33Z deployment of `q8dv3cm3y`:

```bash
# Missing Origin header on state-changing endpoint
POST /api/auth/sessions/revoke-all                                   → 403 Forbidden

# Untrusted sibling subdomain Origin
POST /api/auth/sessions/revoke-all  Origin: https://agents.alchm.kitchen → 403 Forbidden

# Canonical production Origin (unauthenticated)
POST /api/auth/sessions/revoke-all  Origin: https://alchm.kitchen        → 401 Unauthorized

# Unauthenticated public session probe
GET  /api/auth/session              (no session cookie)              → 200 OK (null)
```

---

## 4. Live Production Database Read-Only Inspection (2026-09-15 21:40Z)

Direct query against Railway PostgreSQL following deployment and browser sign-out:

```sql
SELECT count(*) as total FROM device_sessions;
-- Result: 22

SELECT count(*) as post_deploy FROM device_sessions WHERE last_seen_at > '2026-09-15 20:33:00Z';
-- Result: 1

SELECT id, user_id, device, last_seen_at, revoked_at, created_at
FROM device_sessions
ORDER BY last_seen_at DESC NULLS LAST
LIMIT 1;
```

**Result Row**:
- `id`: `5bb8b074-29ce-4407-a539-767ce831b41c`
- `user_id`: `ce117d50-e3e3-4c53-8514-69bf8c21fca9`
- `device`: `"Firefox on macOS"`
- `last_seen_at`: `2026-09-15T21:15:26.733Z` (verified live touch after 20:33Z deploy)
- `revoked_at`: `2026-09-15T21:34:32.874Z` (verified live revocation on sign-out)
- `created_at`: `2026-08-06T22:39:30.108Z`
