# Phase 45 B2/B4 recovery

Recovered 2026-10-14 from branch phase-45-admin-sql-b4 at 07294c01, based on master 790252390f4c0e52c5267523060234156e972521.

Unread action metrics use null values and render an em dash; measured empty reads remain zero. Agent pulse delivery volume is null when its reader fails. The unified admin reader now returns null for unread inbound delivery and marks the overview non-live, rather than constructing zero delivery counts. The actual ASOL health service rejects a database read failure; its aggregation logic is exercised with only the DB boundary replaced.

The PostgreSQL proof now imports the SQL used by the production action-metric/roster and stored-result readers instead of hand-copied strings. It PREPAREs twelve selected admin/ASOL/inbox statements before creating fixture relations, rejects a wrong-column control with PostgreSQL code 42703, then executes nine lifecycle/aggregation scenarios. Before fixture mutations, it requires all three table names to resolve to pg_my_temp_schema. No public data is changed.

Evidence: 39 focused service/inbox/idempotency tests passed, including the added unread unified-inbound regression (red on the interrupted code). The real SQL proof passed on disposable PostgreSQL 16.14, database phase45_admin_test on loopback: webhook/request-log relations provisioned from migrations 087/039 and a minimal users projection for the roster query. This verifies selected queries against that declared schema basis, not a production schema snapshot. Shared public sentinel row counts remained unchanged in the isolation run. Production database/provider traffic was not exercised. The script can run in CI with its existing database secret; its absence remains an explicit skip. Final integrated static/build evidence is recorded separately.

No baseline changed. Durable worker/recovery and production measurement decisions remain separate.
