import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type {
  FeedComment,
  FeedCommentListResponse,
  FeedCommentPostResponse,
} from "@/services/feedCommentsDatabaseService";
import type { TokenType } from "@/types/economy";
import { TOKEN_TYPES } from "@/types/economy";

export interface FeedEventWire {
  id: string;
  actorId: string;
  actorName: string;
  actorImage?: string | undefined;
  actorIsAgent: boolean;
  actorSlug?: string | undefined;
  eventType: string;
  metadataPayload: Record<string, unknown>;
  createdAt: string;
  reactionCount?: number | undefined;
  reactionCounts?: Record<string, number> | undefined;
  commentCount?: number | undefined;
  actorRevealed?: boolean | undefined;
}

export interface AgentSummaryWire {
  userId: string;
  handle: string;
  name: string;
  bio: string | null;
  dominantElement: string | null;
  monicaConstant: number | null;
  lastActionAt: string | null;
  actionCount: number;
}

export interface NetworkTransactionWire {
  id: string;
  userId: string;
  tokenType: string;
  amount: number;
  sourceType: string;
  description: string | null;
  createdAt: string;
  actorIsAgent: boolean;
  actorName: string;
}

export interface SwapRateWire {
  fromToken: TokenType;
  toToken: TokenType;
  rate: number;
  modifier: number;
}

export const FeedEventWireSchema = z
  .object({
    id: z.string(),
    actorId: z.string(),
    actorName: z.string(),
    actorImage: z.string().optional(),
    actorIsAgent: z.boolean().optional().default(false),
    actorSlug: z.string().optional(),
    eventType: z.string(),
    metadataPayload: z.record(z.string(), z.unknown()).optional().default({}),
    createdAt: z.string(),
    reactionCount: z.number().optional(),
    reactionCounts: z.record(z.string(), z.number()).optional(),
    commentCount: z.number().optional(),
    actorRevealed: z.boolean().optional(),
  })
  .passthrough();

export const FeedEnvelopeSchema = z
  .object({
    success: z.boolean().optional(),
    events: z.array(z.unknown()).optional().default([]),
  })
  .passthrough();

export const FeedApiResponseSchema = z
  .object({
    success: z.boolean().optional(),
    events: z.array(FeedEventWireSchema).optional(),
  })
  .passthrough();

export type FeedApiResponseWire = z.infer<typeof FeedApiResponseSchema>;

export const FeedReactionsResponseSchema = z
  .object({
    success: z.boolean().optional(),
    viewerKinds: z.record(z.string(), z.array(z.string())).optional(),
  })
  .passthrough();

export type FeedReactionsResponseWire = z.infer<typeof FeedReactionsResponseSchema>;

export const AgentSummarySchema: z.ZodType<AgentSummaryWire> = z
  .object({
    userId: z.string(),
    handle: z.string(),
    name: z.string(),
    bio: z.string().nullable().optional().transform((v) => v ?? null),
    dominantElement: z.string().nullable().optional().transform((v) => v ?? null),
    monicaConstant: z.number().nullable().optional().transform((v) => v ?? null),
    lastActionAt: z.string().nullable().optional().transform((v) => v ?? null),
    actionCount: z.number(),
  });

export const AgentsEnvelopeSchema = z
  .object({
    success: z.boolean().optional(),
    agents: z.array(z.unknown()).optional().default([]),
  })
  .passthrough();

export const AgentsApiResponseSchema = z
  .object({
    success: z.boolean().optional(),
    agents: z.array(AgentSummarySchema).optional(),
  })
  .passthrough();

export type AgentsApiResponseWire = z.infer<typeof AgentsApiResponseSchema>;

export const NetworkTransactionSchema: z.ZodType<NetworkTransactionWire> = z
  .object({
    id: z.string(),
    userId: z.string(),
    tokenType: z.string(),
    amount: z.number(),
    sourceType: z.string(),
    description: z.string().nullable().optional().transform((v) => v ?? null),
    createdAt: z.string(),
    actorIsAgent: z.boolean(),
    actorName: z.string(),
  });

export const TransactionsEnvelopeSchema = z
  .object({
    success: z.boolean().optional(),
    transactions: z.array(z.unknown()).optional().default([]),
  })
  .passthrough();

export const TransactionsApiResponseSchema = z
  .object({
    success: z.boolean().optional(),
    transactions: z.array(NetworkTransactionSchema).optional(),
  })
  .passthrough();

export type TransactionsApiResponseWire = z.infer<typeof TransactionsApiResponseSchema>;

export const SwapRateSchema: z.ZodType<SwapRateWire> = z
  .object({
    fromToken: z.enum(TOKEN_TYPES),
    toToken: z.enum(TOKEN_TYPES),
    rate: z.number(),
    modifier: z.number(),
  });

export const SwapRatesApiResponseSchema = z
  .object({
    success: z.boolean().optional(),
    rulingHourPlanet: z.string(),
    rulingDayPlanet: z.string(),
    rates: z.array(SwapRateSchema),
    generatedAt: z.string(),
    validUntil: z.string(),
  })
  .passthrough();

export type SwapRatesApiResponseWire = z.infer<typeof SwapRatesApiResponseSchema>;

export const SwapActionResponseSchema = z
  .object({
    success: z.boolean().optional(),
    message: z.string().optional(),
  })
  .passthrough();

export type SwapActionResponseWire = z.infer<typeof SwapActionResponseSchema>;

// ─── Feed comments — /api/feed/comments ───────────────────────────────────

/** Every FeedComment field; guarded both ways so readers keep the domain type. */
export const FeedCommentSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorImage: z.string().nullable(),
  authorIsAgent: z.boolean(),
  authorElement: z.string().nullable(),
  body: z.string(),
  createdAt: z.string(),
  isEventActor: z.boolean(),
});

type _FeedCommentDrift = AssertTrue<ServerSatisfies<FeedComment, z.infer<typeof FeedCommentSchema>>>;
type _FeedCommentExact = AssertTrue<ServerSatisfies<z.infer<typeof FeedCommentSchema>, FeedComment>>;

export const FeedCommentListResponseSchema = z.object({
  success: z.literal(true),
  comments: z.array(FeedCommentSchema),
  nextCursor: z.string().nullable(),
});

type _FeedCommentListDrift = AssertTrue<
  ServerSatisfies<FeedCommentListResponse, z.infer<typeof FeedCommentListResponseSchema>>
>;

export const FeedCommentPostResponseSchema = z.object({
  success: z.literal(true),
  comment: FeedCommentSchema,
  reward: z
    .object({ tokenType: z.string(), amount: z.number(), hint: z.string() })
    .nullable(),
});

type _FeedCommentPostDrift = AssertTrue<
  ServerSatisfies<FeedCommentPostResponse, z.infer<typeof FeedCommentPostResponseSchema>>
>;

/** Any failure body from the comment routes: `{ success: false, message }`. */
export const FeedCommentFailureSchema = z.object({ message: z.string().optional() });
