# Phase 45 — remaining durability and measurement decisions

Design recorded 2026-10-15 during crash recovery. This document does not claim a deployed worker, migration, production measurement, or recovery guarantee.

## Current boundary

The generation request can debit tokens, call ASOL, verify/retry content, and attempt an idempotent refund in the same HTTP process. B1 now reports the observed credit outcome and includes the debit transaction group and refund idempotency reference. PostgreSQL proves atomic credits and safe replay while that process is alive. A process kill after debit can prevent any refund attempt or response; a pending receipt does not schedule recovery. Process-local telemetry can also disappear on restart.

## Proposed durable operation

Before introducing automation, design one generation-operation record keyed by the authenticated actor and a validated client request ID. Persist its normalized request fingerprint, stable operation ID, debit group, exact positive NET refund axes, provider request reference when available, and state. The debit and creation of the durable operation must share a transaction. A retry with the same ID and different normalized input must reject rather than return unrelated content. Requests without client IDs need an explicit compatibility policy.

Use explicit states such as accepted, debited, generating, verified, refund_pending, refunded, and recovery_required. Store transition timestamps and attempt/error provenance; never infer completion solely from a timeout or a missing log. Persist the final verified recipe/response receipt before acknowledging completion. Saving an operation must not manufacture provider success, publication, or physical cooking evidence.

A recovery worker would claim expired operations with a bounded lease, inspect persisted state and ledger evidence, and retry the stable refund basket through the existing atomic credit service. Per-axis refund keys must derive from the persisted operation/debit identity, never from a new retry UUID. Ledger idempotency prevents a second credit; the worker must also reconcile an uncertain prior credit before updating its operation state. The worker must tolerate a kill after a ledger commit and before its state update. Refund failures remain visible and retryable, with an operator path for non-transient failures.

Decisions still required: recovery deadline/SLO, maximum provider/refund retries, lease duration, who owns alerts and manual resolution, operation retention/privacy, whether late provider success can be delivered after refund, and how the provider exposes request/replay status. Deployment and schema rollout must precede any code that relies on durable recovery. This phase does not add a production worker or incidental migration.

## Minimum proof for that follow-up

Use a disposable PostgreSQL database and fault injection at each persisted transition. Kill/restart after debit, before/after provider response, midway through verification, before/after refund commit, and before acknowledgement. Concurrent retries and two recovery workers must converge on one terminal receipt and the exact original ledger delta. Confirm request fingerprint isolation across actors and malformed requests. An in-process exception test alone does not prove crash recovery.

## Durable generation measurement

Measure operations and attempts separately. Persist generation/provider/verification/refund transitions against the same stable operation ID, distinguish live provider success from degraded output, and record requested/evaluated/unknown restrictions and failure reasons without raw private chart/prompt data in telemetry. Count one terminal operation outcome while retaining individual repair/provider attempts. Record observed provider usage/cost only when the provider supplies it; unavailable readings remain unknown.

Before budget or retry tuning, name the environment, query, time window, commit/provider version, denominator, coverage, and sample size. A static corpus resolver percentage measures catalog coverage, not user failure, safety, provider reliability, or production conversion. In-memory counters and CI greens are useful diagnostics but are not a durable production measurement.

## Probe and product deferrals

B5 observes WTEN receiver responses from WTEN. An ASOL-side delivery/signature/queue/retry probe needs its own vantage, read-only fixture and contract, severity thresholds, routing owner, and alert policy. No synthetic credit/debit/transmutation liveness traffic is authorized by this design.

Pressure/time cooking models, product-specific allergen attestations, derived dietary chips, Ignite fallback labeling, historical reflection-data remediation, and house-stellium scoring remain separate product/data decisions. A catalog qualities tag has no certification effect unless the gate validates and consumes its source, basis and scope. Adapted/Made their version must remain distinct from physical cooked `made_it` and ratings.
