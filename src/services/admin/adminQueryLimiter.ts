/**
 * Per-instance cap on concurrent admin analytics queries.
 *
 * `/api/admin/traffic` issues 19 readers' worth of queries at once (more, counting
 * the readers that run two or three each) and `/api/admin/growth` issues 9, and
 * the admin pages poll them. Each serverless instance owns a 4-connection pool
 * (`DB_MAX_CONNECTIONS=4` in production; the code default is 3 on Vercel, see
 * `src/lib/database/config.ts`), so an admin refresh used to queue 17-44 acquires
 * behind itself and in front of real user requests on the same instance.
 *
 * CAP = 2, BASIS: half of the configured 4-connection pool, which always leaves
 * connections for user traffic, and the same cap PR #1044 gave the other admin
 * routes (`/api/admin/dashboard`, `/api/admin/agents/network`,
 * `trafficDigestService`) per request. It is a protective ceiling, not a tuned
 * optimum: a refresh now takes about 2-3 s instead of about 1.2 s.
 *
 * The limiter is module-level, so it bounds the instance, not one request: two
 * admin tabs polling at once share the same 2 slots instead of each taking 2.
 *
 * It wraps ONLY the leaf database call. A limited section never awaits another
 * limited call, so a cap of 2 cannot deadlock (two outer tasks each holding a
 * slot while waiting for an inner one). Keep it that way: never wrap a function
 * that itself calls `executeAdminAnalyticsQuery`.
 *
 * @file src/services/admin/adminQueryLimiter.ts
 */

import { createConcurrencyLimiter } from "@/lib/async/concurrency";
import { executeQuery } from "@/lib/database/connection";
import type { QueryResult, QueryResultRow } from "pg";

export const ADMIN_ANALYTICS_QUERY_CONCURRENCY = 2;

const limitAdminAnalyticsQuery = createConcurrencyLimiter(ADMIN_ANALYTICS_QUERY_CONCURRENCY);

/**
 * Drop-in for `executeQuery` from `@/lib/database/connection` that waits for one
 * of the {@link ADMIN_ANALYTICS_QUERY_CONCURRENCY} slots first. Arguments are
 * forwarded exactly as received (no defaults filled in), results and rejections
 * pass through unchanged, and a rejection frees its slot.
 */
export function executeAdminAnalyticsQuery<T extends QueryResultRow = Record<string, unknown>>(
  ...args: Parameters<typeof executeQuery>
): Promise<QueryResult<T>> {
  return limitAdminAnalyticsQuery(() => executeQuery<T>(...args));
}
