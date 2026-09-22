/**
 * Client-side validator for GET /api/admin/code-health.
 *
 * @file src/lib/admin/schemas/codeHealth.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type { CodeHealthPayload } from "@/services/admin/codeHealthService";

const SourceStateSchema = z.union([
  z.object({ status: z.literal("live") }),
  z.object({ status: z.enum(["rate-limited", "error", "not-found"]), detail: z.string() }),
]);

const ReadingSchema = z.object({
  commitSha: z.string(),
  source: z.string(),
  measuredAt: z.string(),
  committedAt: z.string().nullable(),
  commitMessage: z.string().nullable(),
  tscErrors: z.number().nullable(),
  eslintErrors: z.number().nullable(),
  eslintWarnings: z.number().nullable(),
  eslintByRule: z.array(z.object({ rule: z.string(), errors: z.number(), warnings: z.number() })),
  eslintTopFiles: z.array(z.object({ file: z.string(), warnings: z.number(), errors: z.number() })),
  tscByCode: z.array(z.object({ code: z.string(), count: z.number() })),
  census: z.object({ sourceFiles: z.number(), sourceLines: z.number(), testFiles: z.number() }).nullable(),
});

const RuleCountSchema = z.object({ rule: z.string(), count: z.number() });

const RatchetSummarySchema = z.object({
  trackedTotal: z.number().nullable(),
  castsTotal: z.number().nullable(),
  asAny: z.number().nullable(),
  asUnknownAs: z.number().nullable(),
  assertionSites: z.number().nullable(),
  nonNullAssertions: z.number().nullable(),
  looseOptionality: z.number().nullable(),
  declinedPool: z.number().nullable(),
  preferNullishCoalescing: z.number().nullable(),
  suppressions: z.number().nullable(),
  topRules: z.array(RuleCountSchema),
  declinedRules: z.array(RuleCountSchema),
});

export const CodeHealthSchema = z.object({
  generatedAt: z.string(),
  repo: z.string(),
  deploy: z.object({
    sha: z.string().nullable(),
    message: z.string().nullable(),
    author: z.string().nullable(),
    branch: z.string().nullable(),
    env: z.string().nullable(),
  }),
  readings: z.object({
    status: z.enum(["live", "missing-table", "error"]),
    detail: z.string().optional(),
    latest: ReadingSchema.nullable(),
    history: z.array(ReadingSchema),
  }),
  ratchets: z.object({
    basis: z.string(),
    lintDebt: RatchetSummarySchema.nullable(),
    bareJsonCasts: z.object({ total: z.number(), production: z.number().nullable() }).nullable(),
    scriptsTypecheckErrors: z.number().nullable(),
    routeValidation: z.object({ unvalidated: z.number(), bodyReadingRoutes: z.number() }).nullable(),
  }),
  ratchetHistory: z.object({
    state: SourceStateSchema,
    points: z.array(
      z.object({
        sha: z.string(),
        date: z.string(),
        title: z.string(),
        url: z.string(),
        trackedTotal: z.number().nullable(),
        castsTotal: z.number().nullable(),
        asAny: z.number().nullable(),
        assertionSites: z.number().nullable(),
        nonNullAssertions: z.number().nullable(),
        declinedPool: z.number().nullable(),
      }),
    ),
  }),
  ci: z.object({
    state: SourceStateSchema,
    runs: z.array(
      z.object({
        id: z.number(),
        sha: z.string(),
        title: z.string(),
        conclusion: z.string().nullable(),
        status: z.string().nullable(),
        event: z.string(),
        createdAt: z.string(),
        durationMs: z.number().nullable(),
        url: z.string(),
      }),
    ),
    latestJobs: z.array(
      z.object({
        name: z.string(),
        conclusion: z.string().nullable(),
        status: z.string(),
        durationMs: z.number().nullable(),
        url: z.string().nullable(),
      }),
    ),
    passRate: z.number().nullable(),
  }),
  commits: z.object({
    state: SourceStateSchema,
    commits: z.array(
      z.object({ sha: z.string(), title: z.string(), author: z.string(), date: z.string(), url: z.string() }),
    ),
  }),
  pulls: z.object({
    state: SourceStateSchema,
    pulls: z.array(
      z.object({
        number: z.number(),
        title: z.string(),
        url: z.string(),
        author: z.string(),
        draft: z.boolean(),
        branch: z.string(),
        updatedAt: z.string(),
      }),
    ),
  }),
});

export type CodeHealthView = z.infer<typeof CodeHealthSchema>;
export type CodeReadingView = z.infer<typeof ReadingSchema>;

type _CodeHealthDrift = AssertTrue<ServerSatisfies<CodeHealthPayload, CodeHealthView>>;
