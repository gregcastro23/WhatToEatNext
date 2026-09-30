/**
 * Client-side validators for the account, economy and security responses the
 * account surfaces read: ESMS balances, on-chain claims, API keys, sessions
 * and agent-sync status.
 *
 * Each schema checks the fields its reader uses, and a compile-time drift
 * guard (same pattern as src/lib/admin/schemas/) fails `tsc` if the server
 * type stops satisfying it, so a renamed or newly nullable server field breaks
 * the build instead of silently failing the parse in the browser. The server
 * imports are type-only: no server code reaches the client bundle.
 *
 * @file src/lib/validation/accountResponseSchemas.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type { ApiKeyRow } from "@/lib/api-keys/queries";
import { CoinAmountsSchema } from "@/lib/validation/shopResponseSchemas";
import type {
  EsmsClaimResponse,
  EsmsClaimStatusResponse,
  EsmsOnchainClaim,
} from "@/services/esmsOnchainClaimService";
import type { AgentSyncStatusResponse, AuthSessionsResponse } from "@/types/authSessions";
import type { EconomyBalanceResponse } from "@/types/economy";

// ─── ESMS balances — GET /api/economy/balance ─────────────────────────────

/** Both readers use only the four axes (the server-to-server path sends nothing else). */
export const EconomyBalanceResponseSchema = z.object({
  balances: CoinAmountsSchema,
});

export type EconomyBalanceView = z.infer<typeof EconomyBalanceResponseSchema>;

type _EconomyBalanceDrift = AssertTrue<ServerSatisfies<EconomyBalanceResponse, EconomyBalanceView>>;

export const CelestialLabTokenBalancesSchema = CoinAmountsSchema.extend({
  lastDailyClaimAt: z.string().nullable(),
  lastDailyClaimAgentsAt: z.string().nullable(),
  updatedAt: z.string(),
});

export const CelestialLabUserStreakSchema = z.object({
  currentStreak: z.number(),
  longestStreak: z.number(),
  lastActivityDate: z.string().nullable(),
  streakFrozenUntil: z.string().nullable(),
  updatedAt: z.string(),
});

export const CelestialLabBalanceResponseSchema = z.object({
  success: z.boolean(),
  balances: CelestialLabTokenBalancesSchema,
  streak: CelestialLabUserStreakSchema,
  canClaimDaily: z.boolean(),
});

export type CelestialLabBalanceResponse = z.infer<typeof CelestialLabBalanceResponseSchema>;

type _CelestialLabBalanceDrift = AssertTrue<ServerSatisfies<EconomyBalanceResponse, CelestialLabBalanceResponse>>;

// ─── Celestial Lab Live Quantities — GET /api/alchm-quantities ────────────

/**
 * Consumed-fields view for the Celestial Lab live quantities display.
 * Validates only the fields the lab page renders (quantities, diurnal sect,
 * thermodynamic metrics, kalchm/monica, momentum, and degraded reasons),
 * passing through unrelated structural blocks (kinetics, circuit, etc.)
 * so changes to other surfaces never break the lab's live values.
 */
export const CelestialLabQuantitiesResponseSchema = z.object({
  success: z.literal(true),
  quantities: z.object({
    Spirit: z.number().optional(),
    Essence: z.number().optional(),
    Matter: z.number().optional(),
    Substance: z.number().optional(),
  }),
  dominantElement: z.string().optional(),
  isDiurnal: z.boolean(),
  heat: z.number(),
  entropy: z.number(),
  reactivity: z.number(),
  energy: z.number(),
  kalchm: z.number(),
  monica: z.number(),
  planetaryMomentum: z.record(z.string(), z.number()).optional(),
  degraded: z.object({
    reasons: z.array(z.string()),
  }).optional(),
}).passthrough();

export type CelestialLabQuantitiesResponse = z.infer<typeof CelestialLabQuantitiesResponseSchema>;

type _CelestialLabQuantitiesDrift = AssertTrue<ServerSatisfies<import("@/lib/validation/apiSchemas").AlchmQuantitiesApiResponse, CelestialLabQuantitiesResponse>>;

// ─── On-chain ESMS claims — /api/economy/claim-onchain ────────────────────

const ClaimStatusSchema = z.enum(["pending", "minted", "refunded"]);

/** A claim as the POST returns it. */
export const OnchainClaimSchema = z.object({
  claimId: z.string(),
  amounts: CoinAmountsSchema,
  status: ClaimStatusSchema,
  txHash: z.string().nullable(),
  explorerUrl: z.string().nullable(),
});

export type OnchainClaimView = z.infer<typeof OnchainClaimSchema>;

type _OnchainClaimDrift = AssertTrue<ServerSatisfies<EsmsClaimResponse, OnchainClaimView>>;

/** A stored claim row as the GET returns it (pending and recent claims). */
export const StoredOnchainClaimSchema = z.object({
  id: z.string(),
  claimId: z.string(),
  amounts: CoinAmountsSchema,
  status: ClaimStatusSchema,
  txHash: z.string().nullable(),
  createdAt: z.string(),
});

type _StoredClaimDrift = AssertTrue<
  ServerSatisfies<EsmsOnchainClaim, z.infer<typeof StoredOnchainClaimSchema>>
>;

export const OnchainEsmsStatusSchema = z.object({
  success: z.boolean(),
  configured: z.boolean(),
  walletAddress: z.string().nullable(),
  walletLinked: z.boolean(),
  offchain: CoinAmountsSchema,
  onchain: CoinAmountsSchema.nullable(),
  pendingClaim: StoredOnchainClaimSchema.nullable(),
  recentClaims: z.array(StoredOnchainClaimSchema),
  chain: z.object({
    chainId: z.number(),
    chainName: z.string(),
    testnet: z.boolean(),
    contractAddress: z.string().nullable(),
    explorerBaseUrl: z.string().nullable(),
  }),
});

export type OnchainEsmsStatusView = z.infer<typeof OnchainEsmsStatusSchema>;

type _OnchainStatusDrift = AssertTrue<ServerSatisfies<EsmsClaimStatusResponse, OnchainEsmsStatusView>>;

/** POST: success, or a failure carrying a code and optionally the claim. */
export const OnchainClaimPostResponseSchema = z.object({
  success: z.boolean().optional(),
  error: z.string().optional(),
  code: z.string().optional(),
  retryable: z.boolean().optional(),
  claim: OnchainClaimSchema.optional(),
});

// ─── API keys — /api/account/api-keys ─────────────────────────────────────

export const ApiKeyRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  scopes: z.array(z.string()),
  rate_limit_tier: z.string(),
  is_active: z.boolean(),
  expires_at: z.string().nullable(),
  last_used_at: z.string().nullable(),
  usage_count: z.number(),
  created_at: z.string(),
});

export type ApiKeyRowView = z.infer<typeof ApiKeyRowSchema>;

type _ApiKeyRowDrift = AssertTrue<ServerSatisfies<ApiKeyRow, ApiKeyRowView>>;

export const ApiKeyListResponseSchema = z.object({
  success: z.boolean(),
  keys: z.array(ApiKeyRowSchema).optional(),
});

/** The only response that carries the plaintext key. */
export const ApiKeyMintResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  key: ApiKeyRowSchema.optional(),
  plaintext: z.string().optional(),
});

// ─── Security page — sessions and agent-sync status ───────────────────────

export const AuthSessionsResponseSchema = z.object({
  sessions: z.array(
    z.object({
      id: z.string(),
      sub: z.string(),
      device: z.string(),
      loc: z.string(),
      time: z.string(),
      current: z.boolean(),
    }),
  ),
  memberSince: z.string().nullable(),
});

type _AuthSessionsDrift = AssertTrue<
  ServerSatisfies<AuthSessionsResponse, z.infer<typeof AuthSessionsResponseSchema>>
>;

export const AgentSyncStatusResponseSchema = z.object({
  active: z.boolean(),
  lastSync: z.string().nullable(),
});

type _AgentSyncDrift = AssertTrue<
  ServerSatisfies<AgentSyncStatusResponse, z.infer<typeof AgentSyncStatusResponseSchema>>
>;
