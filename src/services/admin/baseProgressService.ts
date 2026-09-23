/**
 * Base (Sepolia today) — the live ESMS rail. Server-only, read-only.
 *
 * Latest block (liveness), operator wallet gas, the esms_onchain_claims
 * ledger, and recipe-NFT mints. Operator addresses are DERIVED from the
 * configured keys inside this module; the keys never leave it and only the
 * public address is returned.
 *
 * @file src/services/admin/baseProgressService.ts
 */

import { memoize } from "@/lib/cache/memoryCache";
import { executeQuery } from "@/lib/database/connection";
import { isMissingRelation } from "@/lib/database/pgErrors";
import { _logger } from "@/lib/logger";
import { settle } from "@/services/admin/solanaRpc";

/** A mint costs ~0.00002–0.0001 ETH on Base Sepolia; below this, refill. */
const LOW_ETH_THRESHOLD = 0.005;

type LedgerStatus = "live" | "missing-table" | "error";

export interface OperatorWallet {
  role: "minter" | "redeemer" | "recipe-minter";
  address: string | null;
  eth: number | null;
  low: boolean;
  configured: boolean;
}

export interface ClaimLedger {
  status: LedgerStatus;
  byStatus: Record<string, number>;
  last30d: number;
  oldestPendingHours: number | null;
  totals: { spirit: number; essence: number; matter: number; substance: number } | null;
  recent: Array<{ at: string; status: string; txHash: string | null; chain: string | null }>;
}

export interface BaseProgress {
  generatedAt: string;
  chain: string;
  chainId: number;
  explorer: string;
  reachable: boolean;
  error: string | null;
  blockNumber: string | null;
  esmsContract: string | null;
  recipeRegistry: string | null;
  recipeNftEnabled: boolean;
  wallets: OperatorWallet[];
  claims: ClaimLedger;
  recipeMints: { status: LedgerStatus; byStatus: Record<string, number>; last30d: number };
}

interface BalanceReader {
  getBalance: (a: { address: `0x${string}` }) => Promise<bigint>;
}

async function readWallet(
  client: BalanceReader,
  role: OperatorWallet["role"],
  key: string | undefined,
): Promise<OperatorWallet> {
  if (!key) return { role, address: null, eth: null, low: false, configured: false };
  const { privateKeyToAccount } = await import("viem/accounts");
  const hex: `0x${string}` = key.startsWith("0x") ? `0x${key.slice(2)}` : `0x${key}`;
  const account = await settle(Promise.resolve().then(() => privateKeyToAccount(hex)));
  if (!account) return { role, address: null, eth: null, low: false, configured: true };
  const wei = await settle(client.getBalance({ address: account.address }));
  const eth = wei === null ? null : Number(wei) / 1e18;
  return { role, address: account.address, eth, low: eth !== null && eth < LOW_ETH_THRESHOLD, configured: true };
}

function readWallets(client: BalanceReader): Promise<OperatorWallet[]> {
  return Promise.all([
    readWallet(client, "minter", process.env.MINTER_PRIVATE_KEY),
    readWallet(client, "redeemer", process.env.REDEEMER_PRIVATE_KEY),
    readWallet(client, "recipe-minter", process.env.RECIPE_MINTER_PRIVATE_KEY),
  ]);
}

interface ClaimAggRow {
  last30d: number;
  oldest_pending_hours: number | null;
  spirit: string | null;
  essence: string | null;
  matter: string | null;
  substance: string | null;
}

async function queryClaims(): Promise<ClaimLedger> {
  const [byStatus, agg, recent] = await Promise.all([
    executeQuery<{ status: string; n: number }>(`SELECT status, COUNT(*)::int AS n FROM esms_onchain_claims GROUP BY status`),
    executeQuery<ClaimAggRow>(
      `SELECT COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS last30d,
              EXTRACT(EPOCH FROM (NOW() - MIN(created_at) FILTER (WHERE status = 'pending'))) / 3600.0 AS oldest_pending_hours,
              SUM(spirit) FILTER (WHERE status = 'minted')::text AS spirit,
              SUM(essence) FILTER (WHERE status = 'minted')::text AS essence,
              SUM(matter) FILTER (WHERE status = 'minted')::text AS matter,
              SUM(substance) FILTER (WHERE status = 'minted')::text AS substance
         FROM esms_onchain_claims`,
    ),
    executeQuery<{ created_at: Date; status: string; tx_hash: string | null; target_chain: string | null }>(
      `SELECT created_at, status, tx_hash, target_chain FROM esms_onchain_claims ORDER BY created_at DESC LIMIT 10`,
    ),
  ]);
  const [a] = agg.rows;
  return {
    status: "live",
    byStatus: Object.fromEntries(byStatus.rows.map((r) => [r.status, Number(r.n)])),
    last30d: Number(a?.last30d ?? 0),
    oldestPendingHours: a?.oldest_pending_hours == null ? null : Number(a.oldest_pending_hours),
    totals: {
      spirit: Number(a?.spirit ?? 0),
      essence: Number(a?.essence ?? 0),
      matter: Number(a?.matter ?? 0),
      substance: Number(a?.substance ?? 0),
    },
    recent: recent.rows.map((r) => ({
      at: new Date(r.created_at).toISOString(),
      status: r.status,
      txHash: r.tx_hash,
      chain: r.target_chain,
    })),
  };
}

function ledgerFailure(label: string, err: unknown): LedgerStatus {
  if (isMissingRelation(err)) return "missing-table";
  _logger.error(`[admin/chain] ${label} query failed:`, err);
  return "error";
}

async function readClaims(): Promise<ClaimLedger> {
  try {
    return await queryClaims();
  } catch (err) {
    const status = ledgerFailure("claims", err);
    return { status, byStatus: {}, last30d: 0, oldestPendingHours: null, totals: null, recent: [] };
  }
}

async function readRecipeMints(): Promise<BaseProgress["recipeMints"]> {
  try {
    const res = await executeQuery<{ status: string; n: number; last30d: number }>(
      `SELECT status, COUNT(*)::int AS n,
              COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS last30d
         FROM recipe_nft_mints GROUP BY status`,
    );
    return {
      status: "live",
      byStatus: Object.fromEntries(res.rows.map((r) => [r.status, Number(r.n)])),
      last30d: res.rows.reduce((sum, r) => sum + Number(r.last30d), 0),
    };
  } catch (err) {
    return { status: ledgerFailure("recipe mints", err), byStatus: {}, last30d: 0 };
  }
}

async function computeBaseProgress(): Promise<BaseProgress> {
  const { esmsChain, esmsPublicClient } = await import("@/lib/esms-chain/contract");
  const { recipeRegistryAddress, recipeNftEnabled } = await import("@/lib/recipe-nft/contract");
  const chain = esmsChain();
  const client = esmsPublicClient();
  const [block, wallets, claims, recipeMints] = await Promise.all([
    settle(client.getBlockNumber()),
    readWallets(client),
    readClaims(),
    readRecipeMints(),
  ]);
  return {
    generatedAt: new Date().toISOString(),
    chain: chain.name,
    chainId: chain.id,
    explorer: chain.blockExplorers.default.url,
    reachable: block !== null,
    error: block === null ? `${chain.name} RPC unreachable` : null,
    blockNumber: block === null ? null : block.toString(),
    esmsContract: process.env.ESMS_CONTRACT_ADDRESS ?? null,
    recipeRegistry: recipeRegistryAddress() ?? null,
    recipeNftEnabled: recipeNftEnabled(),
    wallets,
    claims,
    recipeMints,
  };
}

export async function getBaseProgress(): Promise<BaseProgress> {
  return memoize("admin:base-progress", 30_000, computeBaseProgress);
}
