import { z } from "zod";

/**
 * Railway Usage GraphQL Response Schema
 */
export const RailwayGraphQLResponseSchema = z
  .object({
    data: z
      .record(
        z.string(),
        z.array(
          z
            .object({
              measurement: z.string(),
              value: z.number().optional(),
              estimatedValue: z.number().optional(),
            })
            .passthrough(),
        ),
      )
      .optional(),
    errors: z
      .array(
        z
          .object({
            message: z.string(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();

export type RailwayGraphQLResponse = z.infer<
  typeof RailwayGraphQLResponseSchema
>;

/**
 * GitHub Issue Row Schema (canonical triage queue)
 */
export const GithubIssueRowSchema = z
  .object({
    number: z.number(),
    title: z.string(),
    html_url: z.string(),
    updated_at: z.string(),
    pull_request: z.unknown().optional(),
  })
  .passthrough();

export const GithubIssuesResponseSchema = z.array(GithubIssueRowSchema);

export type GithubIssueRow = z.infer<typeof GithubIssueRowSchema>;

/**
 * Google Places API (New) Place Raw Schema
 */
export const GooglePlaceRawSchema = z
  .object({
    id: z.string().optional(),
    displayName: z.object({ text: z.string().optional() }).optional(),
    formattedAddress: z.string().optional(),
    rating: z.number().optional(),
    userRatingCount: z.number().optional(),
    priceLevel: z.string().optional(),
    photos: z.array(z.object({ name: z.string().optional() })).optional(),
    primaryType: z.string().optional(),
    primaryTypeDisplayName: z
      .object({ text: z.string().optional() })
      .optional(),
    types: z.array(z.string()).optional(),
    location: z
      .object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
      .optional(),
  })
  .passthrough();

export const GooglePlacesResponseSchema = z
  .object({
    places: z.array(GooglePlaceRawSchema).optional(),
  })
  .passthrough();

export type GooglePlacesResponse = z.infer<typeof GooglePlacesResponseSchema>;

/**
 * MCP Telemetry Summary Schema
 */
export const McpVerdictSchema = z.enum([
  "OK",
  "DEGRADED",
  "INCIDENT",
  "UNKNOWN",
]);

export const McpNetworkSummarySchema = z
  .object({
    live: z.boolean().optional(),
    generatedAt: z.string().optional(),
    windowMinutes: z.number().optional(),
    verdict: McpVerdictSchema.optional(),
    totals: z
      .object({
        calls: z.number().default(0),
        success: z.number().default(0),
        failures: z.number().default(0),
        errorRate: z.number().default(0),
        p50LatencyMs: z.number().nullable().optional(),
        p95LatencyMs: z.number().nullable().optional(),
        p99LatencyMs: z.number().nullable().optional(),
      })
      .passthrough()
      .optional(),
    byTool: z
      .array(
        z
          .object({
            tool: z.string(),
            calls: z.number(),
            failures: z.number(),
            p95LatencyMs: z.number().nullable().optional(),
          })
          .passthrough(),
      )
      .optional(),
    byAgent: z
      .array(
        z
          .object({
            agentId: z.string(),
            calls: z.number(),
            modelTierMix: z.record(z.string(), z.number()).optional(),
          })
          .passthrough(),
      )
      .optional(),
    byCaller: z
      .array(
        z
          .object({
            caller: z.string(),
            calls: z.number(),
          })
          .passthrough(),
      )
      .optional(),
    syntheticProbe: z
      .object({
        verdict: McpVerdictSchema.optional(),
        lastCalledAt: z.string().nullable().optional(),
        lastSuccess: z.boolean().nullable().optional(),
        consecutiveFailures: z.number().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type McpNetworkSummaryResponse = z.infer<
  typeof McpNetworkSummarySchema
>;
