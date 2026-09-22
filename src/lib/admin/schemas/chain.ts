/**
 * Client-side validator for GET /api/admin/chain.
 *
 * @file src/lib/admin/schemas/chain.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type { BaseProgress } from "@/services/admin/baseProgressService";
import type { SolanaProgress } from "@/services/admin/solanaTypes";

const PoolSchema = z.object({
  version: z.number(),
  poolId: z.number(),
  elementA: z.number(),
  elementB: z.number(),
  feeBps: z.number(),
  reserveA: z.string(),
  reserveB: z.string(),
  totalShares: z.string(),
  bootstrapped: z.boolean(),
  paused: z.boolean(),
  pda: z.string(),
  pair: z.string(),
  explorerUrl: z.string(),
});

const DevnetSchema = z.object({
  reachable: z.boolean(),
  error: z.string().nullable(),
  rpc: z.string(),
  slot: z.number().nullable(),
  genesisMatch: z.boolean().nullable(),
  program: z
    .object({
      id: z.string(),
      deployed: z.boolean(),
      executable: z.boolean(),
      lastDeploySlot: z.number().nullable(),
      upgradeAuthority: z.string().nullable(),
      explorerUrl: z.string(),
    })
    .nullable(),
  config: z
    .object({
      version: z.number(),
      admin: z.string(),
      attestor: z.string(),
      pauser: z.string(),
      pauseClaims: z.boolean(),
      pauseRedemptions: z.boolean(),
      pda: z.string(),
    })
    .nullable(),
  deployer: z.object({ address: z.string(), sol: z.number().nullable(), low: z.boolean() }).nullable(),
  mints: z.array(
    z.object({
      symbol: z.string(),
      address: z.string(),
      decimals: z.number(),
      supply: z.string().nullable(),
      holdersTop20: z.number().nullable(),
      explorerUrl: z.string(),
    }),
  ),
  pools: z.array(PoolSchema),
  governance: z
    .object({
      multisigPda: z.string(),
      vaultPda: z.string(),
      threshold: z.number(),
      members: z.number(),
      multisigExists: z.boolean().nullable(),
      vaultSol: z.number().nullable(),
      drillStatus: z.string().nullable(),
    })
    .nullable(),
  activity: z
    .object({
      recent: z.array(
        z.object({ signature: z.string(), at: z.string().nullable(), ok: z.boolean(), explorerUrl: z.string() }),
      ),
      last24h: z.number(),
      last7d: z.number(),
      failedRecent: z.number(),
      lastTxAt: z.string().nullable(),
    })
    .nullable(),
  auditReceipt: z.object({ at: z.string(), status: z.string(), errors: z.number() }).nullable(),
});

export const SolanaSchema = z.object({
  generatedAt: z.string(),
  manifestSource: z.string(),
  manifestsFound: z.object({
    devnet: z.boolean(),
    governance: z.boolean(),
    audit: z.boolean(),
    mainnet: z.boolean(),
  }),
  devnet: DevnetSchema,
  mainnet: z.object({
    reachable: z.boolean(),
    error: z.string().nullable(),
    manifestStatus: z.string().nullable(),
    programDeployed: z.boolean().nullable(),
    mintsCreated: z.number().nullable(),
    mintsTotal: z.number(),
    upgradeAuthorityTransferred: z.boolean().nullable(),
  }),
  asolHealth: z.object({
    status: z.enum(["ok", "unauthorized", "not-configured", "error"]),
    detail: z.string().nullable(),
    body: z.record(z.string(), z.unknown()).nullable(),
  }),
  repo: z.object({
    status: z.enum(["live", "rate-limited", "error", "not-found"]),
    detail: z.string().nullable(),
    commits: z.array(
      z.object({ sha: z.string(), title: z.string(), date: z.string(), url: z.string(), author: z.string() }),
    ),
    commits7d: z.number(),
    commits30d: z.number(),
    openPulls: z.array(z.object({ number: z.number(), title: z.string(), url: z.string(), draft: z.boolean() })),
  }),
});

const LedgerStatus = z.enum(["live", "missing-table", "error"]);

export const BaseSchema = z.object({
  generatedAt: z.string(),
  chain: z.string(),
  chainId: z.number(),
  explorer: z.string(),
  reachable: z.boolean(),
  error: z.string().nullable(),
  blockNumber: z.string().nullable(),
  esmsContract: z.string().nullable(),
  recipeRegistry: z.string().nullable(),
  recipeNftEnabled: z.boolean(),
  wallets: z.array(
    z.object({
      role: z.enum(["minter", "redeemer", "recipe-minter"]),
      address: z.string().nullable(),
      eth: z.number().nullable(),
      low: z.boolean(),
      configured: z.boolean(),
    }),
  ),
  claims: z.object({
    status: LedgerStatus,
    byStatus: z.record(z.string(), z.number()),
    last30d: z.number(),
    oldestPendingHours: z.number().nullable(),
    totals: z
      .object({ spirit: z.number(), essence: z.number(), matter: z.number(), substance: z.number() })
      .nullable(),
    recent: z.array(
      z.object({ at: z.string(), status: z.string(), txHash: z.string().nullable(), chain: z.string().nullable() }),
    ),
  }),
  recipeMints: z.object({ status: LedgerStatus, byStatus: z.record(z.string(), z.number()), last30d: z.number() }),
});

export const ChainSchema = z.object({ generatedAt: z.string(), solana: SolanaSchema, base: BaseSchema });

export type SolanaView = z.infer<typeof SolanaSchema>;
export type BaseView = z.infer<typeof BaseSchema>;
export type ChainView = z.infer<typeof ChainSchema>;

type _SolanaDrift = AssertTrue<ServerSatisfies<SolanaProgress, SolanaView>>;
type _BaseDrift = AssertTrue<ServerSatisfies<BaseProgress, BaseView>>;
