/**
 * Client-side validator for GET /api/admin/traffic.
 *
 * The compile-time check at the bottom fails the build if the server's
 * `TrafficSummary` stops satisfying this schema, so the two cannot drift
 * silently. The import is type-only: no server code reaches the client bundle.
 *
 * @file src/lib/admin/schemas/traffic.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type { TrafficSummary } from "@/services/admin/trafficTypes";

export const CountRowSchema = z.object({
  label: z.string(),
  count: z.number(),
  visitors: z.number().optional(),
});

const TotalsSchema = z.object({
  pageviews: z.number(),
  visitors: z.number(),
  sessions: z.number(),
  signedInUsers: z.number(),
  bounceRate: z.number().nullable(),
  pagesPerSession: z.number().nullable(),
});

export const TrafficSummarySchema = z.object({
  generatedAt: z.string(),
  range: z.enum(["24h", "7d", "30d"]),
  status: z.enum(["live", "missing-table", "error"]),
  detail: z.string().optional(),
  trackingSince: z.string().nullable(),
  totalPageviewsAllTime: z.number(),
  activeNow: z.object({ visitors: z.number(), pages: z.array(CountRowSchema) }),
  totals: TotalsSchema,
  previous: TotalsSchema,
  series: z.array(z.object({ key: z.string(), pageviews: z.number(), visitors: z.number() })),
  bucketUnit: z.enum(["hour", "day"]),
  topPages: z.array(CountRowSchema),
  entryPages: z.array(CountRowSchema),
  referrers: z.array(CountRowSchema),
  utmSources: z.array(CountRowSchema),
  countries: z.array(CountRowSchema),
  devices: z.array(CountRowSchema),
  browsers: z.array(CountRowSchema),
  operatingSystems: z.array(CountRowSchema),
  bots: z.number(),
  recent: z.array(
    z.object({
      id: z.string(),
      at: z.string(),
      path: z.string(),
      referrerHost: z.string().nullable(),
      country: z.string().nullable(),
      region: z.string().nullable(),
      city: z.string().nullable(),
      deviceType: z.string(),
      browser: z.string().nullable(),
      os: z.string().nullable(),
      sessionId: z.string().nullable(),
      user: z
        .object({ id: z.string(), email: z.string(), name: z.string().nullable(), isAdmin: z.boolean() })
        .nullable(),
    }),
  ),
});

export type TrafficSummaryView = z.infer<typeof TrafficSummarySchema>;

type _TrafficDrift = AssertTrue<ServerSatisfies<TrafficSummary, TrafficSummaryView>>;
