# Device session management for alchm.kitchen + Planetary Agents

**Date checked:** 2026-09-14 · **Scope:** Auth.js v5 JWT sessions, device list / revocation, cookie scope across `*.alchm.kitchen`
**Evidence tags:** **READ** = seen in a spec, doc or installed source · **MEASURED** = ran a Node probe against the installed packages today · **INFERRED** = my reasoning, not verified at runtime.
WTEN line numbers are from branch `fix/auth-sessions-current-device` as read today. The `/api/auth/sessions*` routes were being fixed on that branch while this was researched, so they are cited without lines. The **Audit** section near the end records what was measured in both codebases and in production, and reconciles it with sections 1–7.

## Sources consulted

- **Auth.js source:** `next-auth@5.0.0-beta.31` and `@auth/core@0.41.2` as installed. Upstream `nextauthjs/next-auth` `main` @ `a1a16a5a77` (2026-07-22). The npm beta is now `5.0.0-beta.32` / `0.41.3`.
- **Auth.js docs:** [migrating-to-v5](https://authjs.dev/getting-started/migrating-to-v5), [reference/core/jwt](https://authjs.dev/reference/core/jwt), [session-strategies](https://authjs.dev/concepts/session-strategies), [protecting](https://authjs.dev/getting-started/session-management/protecting).
- **OWASP Cheat Sheet Series** @ `e2d4221`: Session Management, JSON Web Token, Cookie Theft Mitigation, Authentication, CSRF Prevention. **OWASP WSTG:** WSTG-CONF-10 (Subdomain Takeover) and WSTG-SESS-02.
- **NIST SP 800-63B-4, Final.** Published 2025-07-31 per [CSRC](https://csrc.nist.gov/pubs/sp/800/63/b/4/final); text at [pages.nist.gov](https://pages.nist.gov/800-63-4/sp800-63b.html).
- **IETF:** RFC 9700, 8725, 9449, 7519, 8693. [draft-ietf-httpbis-rfc6265bis-22](https://datatracker.ietf.org/doc/draft-ietf-httpbis-rfc6265bis/) is still a **draft**; datatracker shows "RFC Ed Queue", not yet an RFC.
- **OpenID:** Connect Core 1.0 §3.1.2.1 · Back-Channel Logout 1.0 (errata 1) · [Google OIDC docs](https://developers.google.com/identity/openid-connect/openid-connect) and its [discovery document](https://accounts.google.com/.well-known/openid-configuration).
- **DBSC:** [W3C Editor's Draft, 8 Sep 2026](https://w3c.github.io/webappsec-dbsc/) (repo @ `f873903`) · chromestatus feature `5140168270413824` (read via its API) · blink-dev Intent to Ship (2026-02-06) · mozilla/standards-positions#912 · WebKit/standards-positions#281.
- **User-Agent:** [Chromium UA reduction](https://www.chromium.org/updates/ua-reduction/) · [WICG UA Client Hints](https://wicg.github.io/ua-client-hints/) (Draft CG Report, 2026-02-10) · MDN browser-compat-data @ `483bb6c` (`Sec-CH-UA`).
- **Other:** [Vercel request headers](https://vercel.com/docs/headers/request-headers) (updated 2025-12-13) · GDPR Recital 30 and Art. 5(1)(c),(e).
- *Secondary, not relied on:* DBSC posts on corbado.com, helpnetsecurity.com, spycloud.com and scotthelme.co.uk.

## Executive summary

- **Current-device lookup:** use `auth()` and read `session.user.sessionId`. The v5 migration guide replaces `getToken` with `auth()`. `getToken` falls back to the *unprefixed* cookie name and HKDF salt unless told otherwise, whatever its type doc says (MEASURED).
- **Never key revocation on `jti`:** Auth.js writes a fresh `jti`/`iat`/`exp` on every re-encode, and the JWT session action re-encodes on every call (MEASURED). ADR-004's "JWT `jti`" wording is wrong.
- **No absolute cap exists:** in JWT mode `updateAge` is ignored and each session call re-issues a full 30-day cookie. A token with 5 minutes left came back with 30 days (MEASURED). NIST 800-63B-4 requires a defined overall timeout, ≤30 days even at AAL1.
- **Device rows go stale:** `last_seen_at` is never written after sign-in, but the cleanup cron deletes by it, and a missing row counts as revoked. With the flag on, active users are bounced about 30 days after sign-in; with it off, their devices vanish from the list (INFERRED from READ code).
- **Revocation only covers protected pages in middleware.** Auth.js docs warn against relying on the proxy alone. The 59 routes using `getUserIdFromRequest` never check revocation, and they fall back to the Planetary Agents cookie bridge.
- **`Domain=.alchm.kitchen` sends the WTEN bearer cookie to every sibling host,** including PA's Railway API. NIST and OWASP prefer host-only `__Host-` cookies. SameSite does not separate siblings, so mutating session endpoints need Origin checks.
- **DBSC shipped in Chrome desktop (M145; Windows TPM first),** but Mozilla's position is negative and WebKit has not given one. For this stack it is a *later* item. DPoP is for OAuth tokens, not first-party cookies.
- **Audit, most urgent (see Audit):**
  - `agents.alchm.kitchen` serves a CLI build that included uncommitted files, so no commit reproduces it (P0).
  - The legacy cookie fallback in its `auth()` was measured **closed**. PA authorization hardening is handled in a separate PA security patch.
  - WTEN's device table is never refreshed, and its cleanup cron never runs. Fixing the cron first would drop 21 of 22 live sessions (W2, W4).

---

## 1. Identifying the current device session server-side

**READ, `@auth/core@0.41.2`:**
- **`getToken` defaults:** `cookieName = defaultCookies(secureCookie ?? false).sessionToken.name` and `salt = cookieName` (`jwt.js:86`). The salt feeds HKDF (`jwt.js:122`), so a wrong name means no cookie is found *and* the wrong key would be derived.
- **Docs vs code:** the type doc says `secureCookie` defaults from `NEXTAUTH_URL` (`jwt.d.ts:54`, repeated on authjs.dev). The code never reads env, and upstream `main` is unchanged.
- **Cookie prefixes:** `defaultCookies(true)` prefixes the session cookie with `__Secure-`; only the CSRF cookie gets `__Host-` (`lib/utils/cookie.js:44-56, 67-69`). User `cookies` are merged over these, and `useSecureCookies` defaults to `https:` (`lib/init.js:69`).
- **Chunked cookies:** `SessionStore` takes every cookie whose name *starts with* the configured name, sorts by numeric suffix (`.0`, `.1`) and joins them (`cookie.js:128-148, 174-186`). `getToken` and `auth()` share this code.
- **Bearer fallback:** `getToken` reads `Authorization: Bearer` only when no cookie exists, and decodes it with the same salt (`jwt.js:92-96`).
- **Duplicate names:** the vendored parser keeps the *first* cookie with a given name (`lib/vendored/cookie.js:97-99`). RFC 6265bis-22 §5.8.3 sorts longer `Path` first, then older cookies.

**READ, `next-auth@5.0.0-beta.31`:**
- **`auth()` config path:** `auth()` runs the core session action with the app's own config and forwards only the `cookie` header (`lib/index.js:7-13`). The configured name and salt always apply; Bearer is never read.
- **Refresh depends on call style:** bare `auth()` in an RSC or Route Handler returns `r.json()` and drops `Set-Cookie` (`:91`). The `auth(handler)` wrapper and middleware do append refreshed cookies (`:166-169`).
- **Docs:** the protecting guide never mentions `getToken`. The core module notes JWTs are "meant to be used by the same app that issued them" (`jwt.js:12`).

**MEASURED** (probe config mirrors the `auth.config.ts` cookie block):

| Probe | Result |
|---|---|
| `getToken({req, secret})`, cookie `__Secure-authjs.session-token` | `null` |
| + `secureCookie: true`, or + `cookieName` only | decodes |
| chunks sent `.1` before `.0` | decodes |
| Bearer with default name / with `secureCookie: true` | `null` / decodes |
| malformed Bearer percent-encoding | throws `URIError` (upstream `main` now returns `null`) |
| two cookies with the same name | first wins |

**Recommendation:**
- In Route Handlers, use `auth()` and read `session.user.sessionId`. It is already exposed at `src/lib/auth/auth.config.ts:246-249`.
- If a `getToken` call is ever unavoidable, pass `cookieName` from one exported constant.
- **Test trap (INFERRED):** Jest sets `NODE_ENV=test`, so the config picks the dev name `authjs.session-token` (`auth.config.ts:96`). That equals `getToken`'s default, so a JWE-level test under the dev name would hide the production bug (§7). *In this repo's current jest config `next-auth/jwt` does not load at all (MEASURED; see Audit → Reconciliation).*

## 2. Stateless JWT vs server-side records: revocation

**Guidance (READ):**
- **OWASP JWT cheat sheet:** JWT sessions need an invalidation mechanism (a denylist), which ends "statelessness" (L80-82). Key the denylist on claims such as `jti`+`iss`, kept until `exp`, never on a token hash, because of malleability. Alternatives are short expiry and sender-constrained tokens (L357-395).
- **OWASP Session Management cheat sheet:** the server must invalidate sessions on logout and expiry, not just clear the cookie ("Session Expiration").
- **Auth.js session-strategies page:** a JWT session can't be ended before its expiry without a server-side blocklist. Database sessions support sign-out-everywhere.
- **RFC 9700 §4.14.2:** refresh tokens for public clients MUST be sender-constrained or rotated with replay detection, and SHOULD expire after client inactivity.
- **RFC 7519 §4.1.7:** `jti` identifies one JWT. OIDC Back-Channel Logout §2.1 defines `sid` for a device session.

**Auth.js behaviour (MEASURED):**
- `encode()` sets a new `iat`, a new `exp = now+maxAge` and a random `jti` on every call (`jwt.js:57-59`).
- The JWT branch of the session action re-encodes on every call (`lib/actions/session.js:21-64`). `updateAge` is used only in the database branch (`:77-92`).
- Custom claims survive. The old JWE stays valid until its own `exp`, so this "rotation" detects no replay.

**WTEN gaps (READ; consequences INFERRED):**
1. **Naming:** the code keys on the custom `sessionId` claim, which is correct. But the column `jti`, the function `isJtiRevoked` and ADR-004's wording all invite use of the real `jti`, which changes on every refresh.
2. **Redis TTL:** the Redis TTL is the **full** `maxAge` (`sessionRevocation.ts:117`), not "remaining JWT lifetime" as ADR-004 says. Under sliding refresh the remaining lifetime is unbounded anyway. This only stays safe because a missing row counts as revoked (`:92-103`).
3. **Revoked cookie is re-extended:** middleware resolves and re-issues the session *before* `authorized()` runs, then appends those cookies to the redirect (`next-auth lib/index.js:129-134, 166-169`). A revoked session's redirect to `/login` therefore still carries an extended cookie. Only the `jwt` callback returning `null` actually clears it (`session.js:54-55`).
4. **Enforcement coverage:**
   - The `jwt`-callback check runs only on `trigger === "update"` (`src/lib/auth/auth.ts:579-597`).
   - The middleware matcher covers protected pages only, with no `/api` (`src/middleware.ts:76-104`).
   - `getUserIdFromRequest` tries session → bearer → PA bridge with no revocation check (`src/lib/auth/validateRequest.ts:288-370`).
5. **Sign-out:** the `signOut` event deletes the `sessions` row but never sets `device_sessions.revoked_at` (`auth.ts:303-327`). A copied cookie from a signed-out device still passes the check.

**Recommended hybrid (INFERRED):**
- **Key:** a stable `sid`-like claim (`deviceSessionId`). Postgres row as source of truth, Redis as tombstone cache.
- **Check point:** the Node-side `jwt` callback on every resolution, returning `null` when revoked.
  - Put a 30–60 s per-instance LRU in front of Redis.
  - This covers bare `auth()` (the body becomes null even though the cookie can't be cleared there), the wrapper and middleware.
  - Route `getUserIdFromRequest` through the same check.
- **Tombstone TTL:** the absolute cap (§3).
- **Failure policy:** fail open for reads; fail closed or require step-up for sensitive mutations. The sources require server-side enforcement but don't mandate one policy.
- **Refresh-token patterns:** RFC 9700 rotation applies only where OAuth tokens exist, for example future PA↔WTEN delegated calls.

## 3. Idle vs absolute timeouts and reauthentication

**NIST SP 800-63B-4, Final (READ §2.1.3, 2.2.3, 2.3.3, 5.1, 5.1.1, 5.2):**

| AAL | Overall (reauth) timeout | Inactivity timeout |
|---|---|---|
| AAL1 | SHALL be set; SHOULD be ≤ 30 days | MAY |
| AAL2 | SHOULD be ≤ 24 h | SHOULD be ≤ 1 h |
| AAL3 | SHALL be ≤ 12 h | SHOULD be ≤ 15 min |

Other NIST points:
- Activity resets the inactivity timer; reauthentication resets both (§5.2).
- Cookie expiry SHALL NOT be relied on to enforce timeouts (§5.1.1).
- Bearer session secrets SHOULD NOT persist across restarts (§5.1).
- Under federation, the relying party decides whether reauthentication requirements are met, and the limits must be documented (§5.2).
- *INFERRED:* Google sign-in, where WTEN cannot see which authenticator was used, is AAL1 at best.

**OWASP (READ, "Session Expiration"):**
- Idle timeouts of 2–5 min for high-value apps and 15–30 min for low-risk ones; absolute timeouts of 4–8 h for full-day use.
- Both kinds of timeout should exist, enforced server-side.
- OWASP gives no consumer "remember me" range.

**Auth.js mapping (MEASURED/READ):**
- `maxAge` is an **idle** timeout, counted from the last request able to write `Set-Cookie`: a middleware-matched page, the wrapper, or the client's `/api/auth/session` poll.
- There is **no absolute cap**, and no original-authentication-time claim survives, because `iat` resets on every encode.
- With the flag on, cleanup creates an accidental ~30-day cap (INFERRED):
  - `last_seen_at` is written only at sign-in, via `ON CONFLICT` (`auth.ts:663`).
  - The schema comment claims it is written on every refresh (`database/init/33-device-sessions.sql:5`).
  - The cron deletes by `last_seen_at` (`scripts/cleanup-device-sessions.ts:109`).

**Recommendations:**
- **Absolute cap:** stamp an `authTime` claim when the `jwt` callback fires with `trigger` `signIn`/`signUp`. It survives re-encode (MEASURED) and is tamper-proof under A256CBC-HS512 authenticated encryption. Return `null` once `now − authTime > ABSOLUTE_MAX`, and mirror the check on `device_sessions.created_at`.
- **Starting values:** absolute 30 days (the NIST AAL1 SHOULD); idle 7–14 days is a product decision. Document both.
- **Step-up:** OWASP's Authentication cheat sheet asks for re-authentication before sensitive changes. Require `authTime` freshness (≤10–15 min) for revoke-all, email change and payment-method change; otherwise run a fresh OAuth round-trip (`signIn` accepts `authorizationParams`, `next-auth lib/actions.js:6,19`).
  - OIDC defines `max_age` and `prompt=login` (Core §3.1.2.1).
  - Google's docs list only `prompt=none|consent|select_account`, and its discovery `claims_supported` omits `auth_time`. WTEN therefore **cannot verify** that Google re-prompted, so treat the round-trip as a presence check.
  - A passkey step-up would be stronger (`next-auth` ships `webauthn`; maturity not checked).
- **Session renewal on sign-in:** a fresh sign-in already mints a new session id, since the callback builds a new `defaultToken` (`lib/actions/callback/index.js:71-84`). This matches OWASP's "renew the session ID". Mark the superseded row revoked so re-logins don't pile up duplicate devices.

## 4. "Sign out other devices" / "revoke this device"

- **Exclude the current session:**
  - Get the current id from `auth()`. If it can't be resolved, refuse (409). Never run `id <> NULL` logic that also revokes the caller.
  - The per-device DELETE should keep refusing the caller's own id.
- **Rotate the current session too:**
  - OWASP says to renew the session ID after privilege changes and to reauthenticate after risk events. "Sign out others" is usually a suspected-compromise action, and the current cookie may also have been copied.
  - Offer "sign out everywhere including here", or rotate the current id in place: `update()` → mint a new id, revoke the old one.
  - This must run where `Set-Cookie` can be written, not in a bare RSC `auth()` (INFERRED).
- **Honest copy:** state the real revocation latency. `docs/admin/AUDIT_2026_08_17.md:270-271` already flagged over-claiming.
- **`last_seen_at` throttling:**
  - Auth.js's database strategy writes only after `updateAge` elapses (`session.js:77-92`), which is a good precedent.
  - Touch at most every 5–15 min, gated by Redis `SET NX EX`.
  - Until that exists, clean up on `created_at` + cap instead.
- **Device labels:**
  - Chromium's UA reduction froze the minor version, model (`K`) and OS version in the UA string (desktop by M107, Android by M110).
  - UA-CH low-entropy hints (`Sec-CH-UA`, `-Mobile`, `-Platform`) are sent by default; model and platform version need `Accept-CH`.
  - MDN BCD shows `Sec-CH-UA` unsupported in Firefox and Safari.
  - Store a coarse "Browser on Platform" label parsed at sign-in, with no high-entropy hints.
- **IP and geolocation:**
  - GDPR Recital 30 names IP addresses as online identifiers, and Art. 5 requires data minimisation and limited retention.
  - NIST §5.3 requires IP, geolocation and device monitoring to go through a privacy risk assessment.
  - Vercel supplies `x-vercel-ip-country`, `-country-region` and `-city`, and overwrites `X-Forwarded-For` to stop spoofing.
  - The schema already has `ip_hash` and `location_*` columns (`33-device-sessions.sql:16-19`), but the sign-in insert fills none of them (`auth.ts:660`).
  - Store coarse location plus a keyed HMAC of the IP, labelled "approximate". The `jwt` callback has no request object, so capture these in a Route Handler (INFERRED).

## 5. Cookie scope and sibling-subdomain SSO

**Current state:**
- The production cookie is set as `__Secure-authjs.session-token; Domain=.alchm.kitchen; Path=/; HttpOnly; Secure; SameSite=Lax` (MEASURED; `auth.config.ts:94-104`).
- `agentsBridge` forwards the **whole** cookie header, WTEN's JWE included, to `agents.alchm.kitchen/api/auth/session` (`src/lib/auth/agentsBridge.ts:68-71`). Its header comment still names the cookie `authjs.session-token`, which is stale.

**Guidance (READ):**
- **NIST §5.1.1:** cookies SHALL reach only the minimum practical hostnames and SHOULD use `__Host-`, `Path=/` and `SameSite=Lax` or `Strict`.
- **OWASP Session Management:** don't set `Domain`; `__Host-` is recommended for session IDs, and `__Secure-` is only for when subdomain sharing is required.
- **RFC 6265bis-22 §4.1.3.2:** `__Host-` means no `Domain` and `Path=/`.
- **RFC 6265bis-22 §8.6:** siblings can overwrite parent-domain cookies, and encryption does not stop a replay of the attacker's *own* valid cookie. *INFERRED:* a sibling that plants one with a longer `Path` sorts first and wins the first-wins parse (§1), enabling session fixation.
- **OWASP CSRF cheat sheet:** SameSite is scoped to the registrable domain, so sibling hosts count as same-site (L430). It advises treating `Sec-Fetch-Site: same-site` as untrusted for state changes (L226-236).
- **WSTG-CONF-10:** a subdomain takeover can yield session cookies.
- **Keep `Lax`:** the OAuth return from Google is a cross-site top-level navigation (INFERRED).

**SSO patterns (INFERRED):**

| Pattern | Exposure if a sibling is compromised | Logout | Effort |
|---|---|---|---|
| A. Parent-domain cookie + shared secret (WTEN today) | Every sibling holds the bearer cookie; a shared secret also lets it mint sessions | Per app only | Low |
| B. Host-only `__Host-` cookie per app + narrow server-to-server introspection | Only that app's own cookie | Bridge must honour revocation | Medium |
| C. One OIDC provider (WTEN or `auth.`), host-only RP cookies, `aud`-bound tokens | Nothing cross-app | Global, via `sid` + Back-Channel Logout (§2.1, §2.4) | High |

- **Tokens across apps:** RFC 8725 §3.9 requires `aud` validation when one issuer serves several apps, and §3.12 requires mutually exclusive validation rules.
- **Server-to-server:** prefer RFC 8693 token exchange over forwarding browser cookies.
- **Migration cost:** renaming the cookie changes the HKDF salt (`jwt.js:122`), so a `__Host-` migration logs everyone out unless it dual-reads both names for a transition window (INFERRED).

## 6. Session-theft resistance

**DBSC:**
- **Spec:** an Editor's Draft (8 Sep 2026). A registration header, a public-key JWT, a refresh endpoint answering signed challenges, and short-lived bound cookies. Site-scoped sessions (`include_site`) require a `/.well-known/device-bound-sessions` check.
- **Chromestatus (API, today):** desktop ships at M145, with rollout stages at 145 and 147. Its top-level status text still says "In development". Firefox is Negative (#912, closed); Safari has no signal (#281, open).
- **Intent to Ship:** "initial support for TPMs is Windows-only". The origin-trial notes advised against strict enforcement.
- **NIST §5.1:** device-bound secrets may persist, but lifetime limits still apply.
- **Adoptability (INFERRED):** Auth.js has no DBSC support, so this means custom registration/refresh handlers plus a separate bound cookie. Enforce it only for sessions that registered, and only on sensitive routes. **Later.**

**DPoP (RFC 9449):**
- It sender-constrains OAuth access and refresh tokens and does not apply to first-party cookie sessions.
- XSS can still mint proofs while the client is online (§11.4).
- It becomes relevant only if OAuth tokens cross the apps.

**Fallback now:**
- Absolute cap plus revocation on every auth path (§2–3).
- Coarse drift detection (country, UA family, platform) that triggers step-up, not automatic kills. OWASP's Cookie Theft Mitigation cheat sheet warns of false positives and favours reauthentication before side-effecting actions.
- New-device sign-in notices.
- Host-only cookie, no forwarding to PA.
- `Cache-Control: no-store` + `Clear-Site-Data` on logout (OWASP).

## 7. Testing strategy

1. **Route contract:** mock `@/lib/auth/auth` (the existing repo pattern) so `auth()` returns `user.sessionId`.
   - Assert the `current` flag is set.
   - Assert revoke-all excludes that id and refuses when it is absent.
   - Assert DELETE refuses its own id.
2. **Real-JWE contract:**
   - `encode({ token, secret, salt: <configured name> })` from `@auth/core/jwt`.
   - Call core `Auth(new Request(".../api/auth/session", { headers: { cookie } }), authConfig)` and assert `body.user.sessionId` (MEASURED works in Node).
   - Parametrise over **both** cookie names, loading `auth.config` under each `NODE_ENV` with `jest.isolateModules`.
3. **Red-proof:** assert the old `getToken({ req, secret })` returns `null` for the `__Secure-` fixture but decodes the dev fixture. This shows why a dev-name-only test passes with the bug present.
4. **Edge cases:**
   - Reversed `.0/.1` chunks and duplicate cookie names.
   - A malformed Bearer header.
   - `jwt` callback → `null` emits `Max-Age=0` cleanup cookies.
   - Absolute cap with an injected clock.
   - `isJtiRevoked` returning true / false / null against each route's failure policy.
5. **Harness (INFERRED, not executed):**
   - `jose@6.2.3` and `@auth/core` are ESM-only, while `jest.config.js:70-72` transforms only `@upstash/redis|uncrypto` and the default environment is `jsdom`.
   - Use `@jest-environment node` plus a transform allowlist (`@auth/core|jose|@panva/hkdf|preact`), or a Node/Bun runner.
   - Test the revoke-all `($2 IS NULL OR id <> $2)` predicate against real Postgres.

---

## Audit of our codebases (measured 2026-09-14)

Scope: WhatToEatNext at `master` `8aaa0644` (PR #846), and Planetary Agents.
PA runs as **two different builds** (MEASURED via Railway and Vercel):

| Host | Platform | Code |
|---|---|---|
| `api.agents.alchm.kitchen` | Railway `passionate-vibrancy` | GitHub `alchm-agents-app@beedf47a` (deployed 2026-08-02) |
| `agents.alchm.kitchen` | Vercel project `planetary_agents-main` | **CLI deploy** by `antigravity`, 2026-06-09, GitLab branch `fix/pa-mcp-desktop-backend-url` @ `68153bc2`, **`gitDirty: 1`** — an ancestor of `beedf47a` plus uncommitted files, so no commit reproduces it exactly |

Findings P1–P5 were read at `beedf47a`; P0 and the P-table notes marked "live"
were read at `68153bc2`. The local `PA_legacy` checkout carries 57 uncommitted
files, so committed trees were read, not the working copy. Production numbers
come from read-only aggregate queries against the alchm.kitchen Postgres
(counts only, no identifiers).

Legend: **MEASURED** = observed in prod data, a script run, or a test run;
**READ** = read in source at the stated commit; **INFERRED** = reasoning.

### WTEN

| # | Finding | Evidence | Effect |
|---|---|---|---|
| W1 | `GET/DELETE/revoke-all` under `/api/auth/sessions` called `getToken({ req, secret })`, which defaults the cookie name and HKDF salt to `authjs.session-token`; production names the cookie `__Secure-authjs.session-token`. | MEASURED (bun script: prod cookie → `null`; `secureCookie: true`, explicit `cookieName`+`salt`, and core `Auth()` with the real `authConfig` all decode). | No session is ever marked current; a user can revoke the device they are on; revoke-all revokes the caller too and reports `preservedCurrent: false`. **Fixed on branch `fix/auth-sessions-current-device`** (reads `session.user.sessionId` from `auth()`), 7 route tests red on old code / green on new. |
| W2 | `device_sessions.last_seen_at` is written only by the sign-in INSERT. The migration comment ("updates last_seen_at on each token refresh") describes code that does not exist. | MEASURED: 22/22 rows have `last_seen_at` within 5 s of `created_at`. READ: only writer is `auth.ts` jwt callback on sign-in. | /profile/security shows sign-in time as "last active"; the list is ordered by sign-in; the cleanup cron's staleness predicate measures time since sign-in, not inactivity. |
| W3 | The JWT session never expires while in use: for `strategy: "jwt"`, `@auth/core` re-encodes the token with a fresh `maxAge` on every session read; `updateAge` is only consulted in the database-strategy branch. | READ: `@auth/core@0.41.2 lib/actions/session.js:21-63` (JWT branch) vs `:66-` (DB branch uses `updateAge`). `SessionProvider` defaults refetch on window focus (`src/app/providers.tsx`). | No absolute session lifetime exists. `updateAge: 24h` in `auth.config.ts` is inert. A stolen cookie that is used at least once every 30 days lives forever unless revoked. |
| W4 | The daily `device-sessions-cleanup` Railway cron is not pruning. | MEASURED: 21 of 22 rows are >30 days old and match the script's own delete predicate; oldest row 2026-05-21. Service exists (`bun run cleanup:device-sessions`). Its two most recent active deployments (live 08-28→09-08 and 09-09→09-13) logged nothing but "Stopping Container" — no `[cleanup-device-sessions] start` line, where a daily 03:15 job would have written ~14. Most likely the job is never invoked (e.g. no cron schedule attached); the schedule itself was not visible through the Railway tools used. | ⚠️ **Ordering trap:** fixing the cron before W2 deletes 21 of 22 live sessions' rows. With `AUTH_REVOCATION_CHECK=on`, `isJtiRevoked` treats a missing row as revoked → those users are bounced to /login; with it off, those devices vanish from the list and become unrevocable while their JWTs keep rolling (W3). |
| W5 | Sign-out does not revoke. The `signOut` event deletes the NextAuth `sessions` row (a table nothing reads) and leaves `device_sessions` untouched. | MEASURED: 2 of 2 `signout` auth_events map to a device row that is still unrevoked. READ: `auth.ts` `events.signOut`; `sessions` has no reader in `src/`. | A copied cookie survives logout; the signed-out device stays listed as active. |
| W6 | "SIGN OUT EVERYWHERE" (`AuthFollowups.tsx`) calls `signOut()` — this browser only. `POST /api/auth/sessions/revoke-all` has no UI caller. | READ. | The button's label promises the opposite of what it does. |
| W7 | No device label or location is ever stored: the sign-in INSERT writes only `id, user_id, jti, provider, current_for_jti`. | MEASURED: 22/22 rows have null `user_agent`/`device`, null location, null `ip_hash`. | Every row renders "Unknown device · —", so users cannot tell devices apart even once W1 is fixed. |
| W8 | Revocation only guards middleware-matched **pages**. API routes (economy, payments, the session routes themselves) and `GET /api/auth/session` never check it; the jwt callback checks only on `trigger === "update"`. | READ: `auth.config.ts` `authorized()`, `middleware.ts` matcher, `auth.ts` jwt callback; ADR-004 "soft" revocation. | A revoked session can still call `revoke-all` against the real user, move tokens, and — via the PA bridge (P1) — sign in to Planetary Agents. |
| W9 | "Missing row ⇒ revoked" is unsafe given how rows go missing. | MEASURED: 23 `signin_complete` events vs 22 device rows (one sign-in has no row). READ: `sessionRevocation.ts:92-103`; device INSERT is non-blocking. | Any failed INSERT or cron deletion becomes a lockout once the flag is on. |
| W10 | Session constants are duplicated: cookie name (fixed by W1), `maxAge` in `auth.config.ts` + `AUTH_JWT_MAX_AGE_SECONDS` in `sessionRevocation.ts` + `DEVICE_SESSIONS_MAX_AGE_DAYS` in the cron. Redis denylist TTL is the full `maxAge`, not the remaining lifetime ADR-004 describes. Revocation looks up `WHERE jti = $1`, but the only index leads with `user_id`. | READ. | Drift risk; negligible cost at 22 rows, O(n) later (`id` is the PK and equals `jti`). |
| W11 | Reverse bridge: `getUserIdFromRequest` (59 route files) falls back, after session and Bearer, to `resolveAgentsBridgeUser`, which forwards the **whole** cookie header — WTEN's own session JWE included — to `agents.alchm.kitchen/api/auth/session` and trusts the returned email to pick a WTEN user. No revocation check on any branch. | READ: `src/lib/auth/validateRequest.ts:288-370`, `src/lib/auth/agentsBridge.ts:62-97`; also called directly by `api/stripe/restaurant-order`. | An agents-app session (7-day, unrevocable, served by the unreproducible build above) authenticates WTEN spend paths by email; whoever controls that host's session endpoint can name any WTEN user. |

### Planetary Agents (P0 at live `68153bc2`; P1–P5 at `beedf47a`)

| # | Finding | Evidence | Effect |
|---|---|---|---|
| P0 | `agents.alchm.kitchen` cannot be reproduced from git (CLI deploy with uncommitted files). At its base commit `68153bc2`, PA's `auth()` still contains a legacy fallback that trusted a client-set cookie as identity; `beedf47a` removed it. | READ: `lib/auth.ts` @ `68153bc2`. **MEASURED 2026-09-14:** a request carrying a forged identity cookie for a non-existent user id got the route's own 401. The live `auth()` does not honour it, so the uncommitted files evidently included the removal. | No exposure measured for `auth()`. The build's other authorization paths can only be checked behaviourally, so a separate PA security patch plus a clean, reproducible redeploy covers them. Specifics are deliberately not recorded in this public repository until fixed. |
| P1 | PA recognises WTEN users by calling `https://alchm.kitchen/api/auth/session` server-to-server with the browser's **entire** cookie header, 2.5 s timeout, any failure → anonymous. WTEN answers with a re-encoded token in `Set-Cookie`, which PA discards. | READ: `lib/auth-bridge.ts`, `lib/auth.ts`; `@auth/core session.js:45-51`. | PA activity never extends the shared login: a user who only uses agents.alchm.kitchen is signed out 30 days after their last alchm.kitchen visit (INFERRED from W3 + discarded cookie). A WTEN response slower than 2.5 s makes a signed-in user anonymous for that request. PA's own cookies are sent to WTEN on every bridged request. |
| P2 | PA runs **next-auth v4** with its own Google login: JWT strategy, 7-day `maxAge`, cookie `__Secure-next-auth.session-token`, no session id, no device table, no revocation. `middleware.ts` has an empty matcher (disabled). | READ: `package.json`, `lib/auth-options.ts`, `middleware.ts`. | Two independent sessions for one person; `auth()` prefers the native PA session, so signing out of WTEN leaves PA signed in, and two different accounts can be active across the two sites in one browser. |
| P3 | The shared cookie domain is chosen by platform detection (`VERCEL_ENV === 'production'`) in both `auth-options.ts` and `/api/logout`. `agents.alchm.kitchen` is served by Vercel; `api.agents.alchm.kitchen` by Railway. | MEASURED: response headers (`server: Vercel` vs `server: railway-hikari`). READ (cookie block identical at `68153bc2` and `beedf47a`). | The same cookie config sets a `.alchm.kitchen` cookie on the Vercel host and a host-only cookie on the Railway host; logout on the Railway host cannot clear the shared cookie. |
| P4 | `/api/logout` (GET and POST) only expires cookies; it never revokes WTEN's device row — its own comment says it should redirect through WTEN signout once revocation exists. It does not clear chunked `…session-token.0/.1` cookies. | READ. | Logout is cookie-deep only (compounds W5); GET makes it CSRF-triggerable. |
| P5 | Desktop linking (`/api/desktop/session/link`) deactivates **all** of the user's "Alchm Desktop Companion" keys before minting one; keys are stored and looked up in plaintext; `GET /api/desktop/session` returns a fabricated 150/150/150/150 "local-dev" session to anonymous callers in production. | READ. | Linking a second computer silently logs out the first; the raw key also travels in the `alchm://` deep-link URL. |

### Reconciliation with sections 1–7

- **Jest cannot load `next-auth/jwt` here (MEASURED).** A probe under this repo's jest config got `SyntaxError: Unexpected token 'export'` from `await import("next-auth/jwt")`. So the "test trap" in §1 and the real-JWE tests in §7.2–7.3 cannot run in the current jest setup as written. What shipped instead:
  - The route contract (§7.1) is tested with `auth()` mocked, in `src/app/api/auth/sessions/__tests__/route.test.ts`. All 7 tests; 4 failed on the old routes, 3 pin preserved behaviour.
  - The library-level red-proof (§7.3) was run under bun, not jest. The old call returns `null` for the production cookie; `secureCookie`, explicit `cookieName`+`salt`, and core `Auth()` with the real `authConfig` all decode it; a dev-named cookie is not read by the production config.
  - Making that proof a permanent CI check needs either the §7.5 transform allowlist or a bun-run script.
- **"Revoke-all refuses (409) when the current id is unresolved" (§4, §7.1, checklist) — not adopted, by reasoning.**
  - With `auth()` as the source, `session.user.sessionId` is absent only when the token carries neither `deviceSessionId` nor `sessionId`.
  - Rows are only ever written with `id = sessionId`, so such a session has no row. `($2 IS NULL OR id <> $2)` therefore cannot revoke the caller.
  - The branch keeps today's behaviour (`$2 = null`, `preservedCurrent: false`), pinned by a test. Revisit if rows ever get ids that differ from the token claim.
- **§2's "the 59 routes … fall back to the PA cookie bridge"** is W11 above. The bridge target is the unreproducible Vercel build, which raises the stakes of any PA authorization flaw.
- **Open questions now answered:**
  - Cleanup impact: the cron is not running, so no rows have been deleted yet (W4).
  - PA cookie name and scope: P2/P3.
  - P0 cookie fallback: not live (MEASURED).
- **Still open:**
  - `AUTH_REVOCATION_CHECK` in Vercel production.
  - Whether PA and WTEN share `AUTH_SECRET` (the formats differ — v4 vs v5 key derivation — but the root secret would still be shared).

---

## Recommended architecture for alchm.kitchen + Planetary Agents

**First (in progress):** PA security patch, then a clean, reproducible redeploy of `agents.alchm.kitchen`. No more CLI deploys with uncommitted files to production. *(Audit P0)*

**Policy decided 2026-09-14:**
- Absolute session lifetime: **30 days**.
- Idle limit: **7 days**.
- Revocation is checked on **every** session lookup (pages, API routes, bridges), backed by Redis.
- Money routes **fail closed** when the check cannot complete.
- WTEN becomes the single sign-in (SSO) provider for Planetary Agents.

1. **[now]** Resolve the current device via `auth()` → `session.user.sessionId` in the three session routes and delete `getToken`. Revoke-all fails closed when the id is unknown. Export one `SESSION_COOKIE_NAME`. Add the §7 tests 1–3. *(§1, §7)*
   - **Status:** the `auth()` switch and the route tests are done on `fix/auth-sessions-current-device`.
   - Fail-closed was not adopted, and the JWE red-proof ran under bun rather than jest; both are explained in Audit → Reconciliation.
2. **[now]** Fix the device-row lifecycle. *(§2, §4)*
   - Add a throttled `last_seen_at` touch, or clean up by `created_at` + cap until it exists.
   - `signOut` sets `revoked_at` and writes the tombstone.
   - Record a coarse label, coarse location and `ip_hash`.
3. **[now]** Require `Origin: https://alchm.kitchen` or `Sec-Fetch-Site: same-origin` on the DELETE and revoke-all endpoints. *(§5)*
4. **[next]** Add the `authTime` absolute cap in the `jwt` callback and document the idle/absolute values. *(§3)*
5. **[next]** Enforce revocation during session resolution. *(§2)*
   - Use a `jwt` callback with LRU → Redis → Postgres that returns `null` when revoked.
   - Route `getUserIdFromRequest` through it, PA-bridge branch included. Today that branch can authenticate spend paths for a user whose WTEN session is revoked.
   - Tombstone TTL = absolute cap; fail closed on sensitive mutations.
6. **[next]** Require step-up freshness for revoke-all, email and payment changes, and rotate the current id on "sign out others". *(§3, §4)*
7. **[next]** Make `agentsBridge` forward only the PA cookie, and define cross-app revocation. *(§5)*
8. **[later]** Move to host-only `__Host-authjs.session-token` with a dual-read window, then to pattern B or C (OIDC `aud`, `sid` back-channel logout, RFC 8693). *(§5)*
9. **[later]** Opportunistic DBSC on Chrome desktop; DPoP only if OAuth tokens cross apps. *(§6)*

**Amend ADR-004:**
- **Title and "Decision":** Auth.js rewrites `jti` on every encode. Name the stable claim (`deviceSessionId`, `sid`-like) and plan the column/function rename.
- **"TTL = remaining JWT lifetime":** the code uses the full `maxAge`, and sliding refresh leaves remaining lifetime unbounded. Use the absolute cap.
- **"Middleware checks … every protected-route hit":** add Auth.js's "don't rely on the proxy exclusively" guidance and the new enforcement point.
- **The "edge compatibility" rationale:** middleware now runs `runtime = "nodejs"` (`src/middleware.ts:74`). Re-evaluate `strategy: "database"`, which Auth.js documents as supporting sign-out-everywhere.
- **Add:** idle and absolute timeouts, the cookie-scope decision versus NIST/OWASP `__Host-` guidance, the PA bridge's effect on revocation, the per-route failure policy, and the fact that cleanup depends on a `last_seen_at` that nothing writes.

## Checklist

- [ ] PA security patch merged and `agents.alchm.kitchen` redeployed from a clean commit (P0 cookie fallback measured closed 2026-09-14)
- [x] No `getToken` without a shared `cookieName`; routes use `auth()` `sessionId` *(branch `fix/auth-sessions-current-device`)*
- [ ] ~~Revoke-all refuses when the current id is unresolved~~ *not adopted; see Audit → Reconciliation*
- [ ] Tests encode real JWEs under both cookie names, with a red-proof against the old call *(route contract done in jest; JWE proof run under bun, not yet a CI check)*
- [ ] `last_seen_at` touch ships **before** the cleanup cron is fixed (W4 ordering trap)
- [ ] `last_seen_at` is written (throttled), or cleanup no longer keys on it
- [ ] `signOut` marks `device_sessions.revoked_at`
- [ ] `authTime` absolute cap enforced; idle and absolute values documented
- [ ] Revocation checked during session resolution, `getUserIdFromRequest` included
- [ ] Tombstone TTL = absolute cap
- [ ] Origin / `Sec-Fetch-Site` check on mutating session endpoints
- [ ] Step-up freshness for revoke-all, email and payment changes
- [ ] Bridge forwards only the PA cookie; cross-app revocation defined
- [ ] Coarse label and geo stored, `ip_hash` only, retention tied to the row
- [ ] `__Host-` migration plan with a dual-read window
- [ ] UI copy states the real revocation latency

## Open questions / could not verify

- **Production flag:** whether `AUTH_REVOCATION_CHECK` is `on` in Vercel prod. It is not readable from the repo, and the audit says `.env.example` ships `off`.
- ~~**Cleanup impact:** whether the cron is deleting active users' rows in prod.~~ **Answered (Audit W4):** it is not running at all; 21 of 22 rows would be deleted once it does.
- **Revoked-cookie re-extension:** read in `next-auth lib/index.js:129-169`, not exercised in running middleware.
- **PA side:**
  - Cookie name and scope: **answered** (Audit P2/P3).
  - Whether PA and WTEN share `AUTH_SECRET`: still open.
  - P0 cookie fallback: measured closed.
- **Google reauthentication:** whether Google honours `prompt=login` or `max_age`. Undocumented and not tested.
- **DBSC on macOS:** only secondary sources claim it; chromestatus's M147 rollout stage names no platform.
- **Jest ESM allowlist:** not executed.
- **DNS:** dangling `*.alchm.kitchen` records not checked.
- **Not consulted:** OWASP ASVS and NIST SP 800-63C (§4.7, federation sessions).
