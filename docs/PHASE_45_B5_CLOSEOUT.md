# Phase 45 B5 — WTEN receiver diagnostics

Recovered and completed 2026-10-14 on `codex/phase-45-completion`, based on master `790252390f4c0e52c5267523060234156e972521` plus A1/B3. The interrupted B5 patch was preserved before application.

The probe reports its `wten-internal-receiver` vantage, exact configured destination, timeout, and healthy/degraded/unreachable verdict. Admin readers validate these required fields and show the scope and failed-check details. This is an observation from WTEN of its own receivers; it does not verify ASOL delivery, signatures, queues, retries, or end-to-end liveness.

Credentials are sent only to the exact configured origin (HTTPS, or explicitly configured HTTP loopback), never another preview project, a request-selected loopback, or a credential-bearing URL. Every fetch refuses redirects. The origin comes from INTERNAL_API_URL, NEXT_PUBLIC_APP_URL, VERCEL_URL, or the local development default, in that order. A request origin which differs from configuration yields an untrusted-destination result without network access.

A success must validate the receiver evidence: versioned roster/count and agent IDs/emails, exact requested sync key and applied boolean, versioned four-axis vessel balances, and a shared-email list. A recognized user_not_found proves only authentication/route handling and remains degraded because the ledger was not read. Set ASOL_RECEIVER_PROBE_EMAIL to an existing authorized read-only fixture to verify a ledger; the fallback probe address is never created by this diagnostic. Unreachable transport and malformed/rejected HTTP responses remain distinct. No sync-credit, sync-debit, or transmutation calls are made.

Evidence: regression tests first failed on the recovered code (11 failures); focused service/schema/UI/admin tests pass on the implementation. The opt-in `PHASE45_PROBE_HTTP=1 bun run jest src/services/__tests__/asolContractProbe.http.test.ts --runInBand` passed against an ephemeral loopback HTTP server using real fetch: redirects did not reach their target and an unanswered receiver request aborted at the configured timeout. Ordinary unit tests keep the repository's no-network stub. Production HTTP and ASOL provider delivery were not exercised. Final integrated static/build/test evidence belongs to the phase closeout at its named commit.

Scheduling, alert severity/routing, and an ASOL-side vantage remain deferred decisions. No baseline changed.
