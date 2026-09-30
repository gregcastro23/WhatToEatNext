/**
 * Client schemas for the Transmutation Circle (GET/POST /api/economy/transmute).
 *
 * Each schema carries a compile-time drift guard against the server type it
 * validates: rename or retype a field in `@/types/transmutation` and `tsc`
 * fails here, so the UI can never parse a shape the server stopped sending.
 *
 * @file src/lib/validation/transmutationResponseSchemas.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type {
  TransmutationBoardOffer,
  TransmutationCircleSnapshot,
  TransmutationOfferView,
  TransmutationOwnOffer,
  TransmutationTrade,
} from "@/types/transmutation";

const TokenSchema = z.enum(["Spirit", "Essence", "Matter", "Substance"]);

const PartySchema = z.object({ name: z.string(), isAgent: z.boolean() });

const MarketViewSchema = z.object({
  parityWantAmount: z.number(),
  takerEdgePct: z.number(),
  withinCorridor: z.boolean(),
});

export const TransmutationOfferViewSchema = z.object({
  id: z.string(),
  giveToken: TokenSchema,
  giveAmount: z.number(),
  wantToken: TokenSchema,
  wantAmount: z.number(),
  message: z.string().nullable(),
  status: z.enum(["open", "filled", "cancelled", "declined", "expired"]),
  directed: z.boolean(),
  replyToOfferId: z.string().nullable(),
  createdAt: z.string(),
  expiresAt: z.string(),
  closedAt: z.string().nullable(),
  market: MarketViewSchema.nullable(),
});

const BoardOfferSchema = TransmutationOfferViewSchema.extend({
  maker: PartySchema,
  directedToYou: z.boolean(),
  youCanFill: z.boolean(),
  complementsYou: z.boolean(),
});

const OwnOfferSchema = TransmutationOfferViewSchema.extend({
  funded: z.boolean(),
  counterparty: PartySchema.nullable(),
  taker: PartySchema.nullable(),
});

const TermsSchema = z.object({
  giveToken: TokenSchema,
  giveAmount: z.number(),
  wantToken: TokenSchema,
  wantAmount: z.number(),
});

const CircleSnapshotSchema = z.object({
  board: z.array(BoardOfferSchema),
  mine: z.array(OwnOfferSchema),
  needs: z.object({ lacking: z.array(TokenSchema), surplus: z.array(TokenSchema) }).nullable(),
  suggestion: TermsSchema.nullable(),
  stats: z.object({ trades: z.number(), partners: z.number(), lastTradeAt: z.string().nullable() }),
  pulse: z.object({ trades24h: z.number(), openOffers: z.number() }),
  market: z.object({
    live: z.boolean(),
    prices: z
      .object({ Spirit: z.number(), Essence: z.number(), Matter: z.number(), Substance: z.number() })
      .nullable(),
    priceBucketStartUtc: z.string().nullable(),
    corridorPct: z.number(),
  }),
  bonus: z.object({
    tokenType: TokenSchema,
    baseAmount: z.number(),
    minTradeValue: z.number(),
    perPartnerPerDay: z.literal(1),
  }),
});

export const TransmutationCircleResponseSchema = CircleSnapshotSchema.extend({
  success: z.literal(true),
});

const TradeSchema = z.object({
  gave: z.object({ tokenType: TokenSchema, amount: z.number() }),
  received: z.object({ tokenType: TokenSchema, amount: z.number() }),
  transactionGroupId: z.string(),
});

/** Every POST answer: success with whatever the act returns, or a refusal. */
export const TransmutationActionResponseSchema = z
  .object({
    success: z.boolean(),
    reason: z.string().optional(),
    message: z.string().optional(),
    offer: TransmutationOfferViewSchema.passthrough().optional(),
    trade: TradeSchema.optional(),
    bonus: z.object({ tokenType: z.string(), amount: z.number(), hint: z.string() }).nullable().optional(),
  })
  .passthrough();

export type TransmutationCircleView = z.infer<typeof CircleSnapshotSchema>;

type _CircleDrift = AssertTrue<ServerSatisfies<TransmutationCircleSnapshot, TransmutationCircleView>>;
type _BoardDrift = AssertTrue<ServerSatisfies<TransmutationBoardOffer, z.infer<typeof BoardOfferSchema>>>;
type _OwnDrift = AssertTrue<ServerSatisfies<TransmutationOwnOffer, z.infer<typeof OwnOfferSchema>>>;
type _OfferDrift = AssertTrue<ServerSatisfies<TransmutationOfferView, z.infer<typeof TransmutationOfferViewSchema>>>;
type _TradeDrift = AssertTrue<ServerSatisfies<TransmutationTrade, z.infer<typeof TradeSchema>>>;
