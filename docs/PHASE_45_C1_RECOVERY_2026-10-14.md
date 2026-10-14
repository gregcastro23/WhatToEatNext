# Phase 45 C1 recovery — 2026-10-14

Recovered from C1 code `54075f0e` and its tracking commit `70e00a3e`.
The original tracking document is preserved. This follow-up completes the
consumer/publication and existing-interaction gaps found during independent review.

- The shared runtime contract checks the fields actually rendered by the
  council, including the three provenance states. Confirmed publication requires
  a server timestamp; unpublished content cannot carry one. The server retains
  the older `review` response alias.
- The council labels live, gateway-degraded and curated content. It displays
  feed publication separately, removes decorative five-star evidence, and keeps
  the previous valid reflection if a later request fails or has malformed 2xx
  data. An unreadable 2xx/network result explicitly leaves publication uncertain.
- The publication callback carries no invented review or timestamp. It runs only
  after a validated confirmed publication and refreshes authoritative Community
  Tips instead of inserting an optimistic tip. Unrated reflections are not
  represented as rated Community Tips.
- Critique events omit rating and cooking fields. A catalog critique never
  overwrites an existing interaction, including its explicit rating, cooking
  flag, review or update time. Ordinary text events preserve existing rating and
  cooking fields when those fields were omitted; subsequent explicit human
  interaction updates remain supported.
- `published` confirms the feed insert. The optional interaction mirror can
  fail independently; neither API nor council claims both writes succeeded.
- Invalid JSON returns 400 before catalog lookup, inference or publication.

## Validation

- Focused route/component/mirror tests: 25 passed. Existing boundary-schema
  regression suite: 80 passed. Combined focused run: 105 passed.
- Real PostgreSQL 16.14: four production-service tests passed on disposable
  loopback `phase45_test`, using session-local TEMP tables only. These prove
  conflict preservation across repeated critiques, unrated insertion, subsequent
  explicit interaction updates, omitted-field preservation, and feed-only success
  when the mirror fails. No shared schema or production data was changed.
- `bun run typecheck`: passed, including fresh route type generation.
- `check:diff-assertions`: zero new assertions; `check:read-json` and
  `check:route-validation`: zero unvalidated boundaries. Focused production ESLint
  passed. No baseline files were changed.

Full integration/static/build receipts belong to the final integrated SHA.
No real inference, historical-data repair, production publication or deployment
was performed. PostgreSQL tests skip unless an explicit disposable loopback URL
is supplied in `PHASE45_TEST_DATABASE_URL`.
