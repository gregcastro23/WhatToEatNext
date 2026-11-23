/**
 * How often `/admin/traffic` re-fetches `GET /api/admin/traffic`, and therefore
 * how long the server may reuse a computed summary.
 *
 * One constant on purpose: the route memoizes the summary for exactly this long.
 * `memoize` starts a TTL when the compute FINISHES and shares an in-flight
 * compute, so a TTL equal to the poll interval means about every second poll
 * recomputes. A TTL shorter than the poll (it was 5 s against a 10 s poll)
 * recomputed all 19 readers on EVERY poll.
 *
 * Client-safe: no imports.
 *
 * @file src/lib/admin/trafficPoll.ts
 */

export const TRAFFIC_POLL_MS = 10_000;
