/**
 * Admin pulse — the headline number from every live admin source, assembled
 * once for the KPI strip at the top of /admin. Server-only.
 *
 * Each section comes from the same service (and the same cache key) as its
 * detail page, so the strip and the page it links to cannot disagree. A
 * section that fails is `null` with its reason in `errors`.
 *
 * @file src/services/admin/adminPulseService.ts
 */

import { memoize } from "@/lib/cache/memoryCache";
import { _logger } from "@/lib/logger";
import { getBaseProgress, type BaseProgress } from "@/services/admin/baseProgressService";
import { deployIdentity, getCodeHealthPulse, type CodeHealthPulse, type DeployIdentity } from "@/services/admin/codeHealthService";
import { getSolanaProgress } from "@/services/admin/solanaProgressService";
import type { SolanaProgress } from "@/services/admin/solanaTypes";
import { getStripeRevenue } from "@/services/admin/stripeRevenueService";
import type { Money, StripeMode, StripeRevenuePayload } from "@/services/admin/stripeRevenueTypes";
import { getTrafficPulse } from "@/services/admin/trafficAnalyticsService";
import type { TrafficPulse } from "@/services/admin/trafficTypes";
import { getUserGrowth, type GrowthPayload } from "@/services/admin/userGrowthService";
import type { CoverageStatus } from "@/services/stripeWebhookCoverageService";

export interface GrowthPulse {
  live: boolean;
  humans: number;
  agents: number;
  dau: number;
  wau: number;
  mau: number;
  signupsToday: number;
  signups7d: number;
}

export interface RevenuePulse {
  configured: boolean;
  mode: StripeMode;
  mrr: Money[] | null;
  activeSubscriptions: number | null;
  net30d: Money[] | null;
  available: Money[] | null;
  failed30d: number | null;
  webhookStatus: CoverageStatus | null;
  errors: string[];
}

export interface SolanaPulse {
  devnetReachable: boolean;
  programDeployed: boolean | null;
  paused: boolean | null;
  lastTxAt: string | null;
  txs7d: number | null;
  deployerSol: number | null;
  deployerLow: boolean;
  mainnetProgramDeployed: boolean | null;
  mainnetStatus: string | null;
  commits7d: number | null;
}

export interface BasePulse {
  reachable: boolean;
  chain: string;
  minterEth: number | null;
  minterLow: boolean;
  claimsPending: number | null;
  claimsMinted: number | null;
}

export interface AdminPulse {
  generatedAt: string;
  errors: string[];
  deploy: DeployIdentity;
  traffic: TrafficPulse | null;
  growth: GrowthPulse | null;
  revenue: RevenuePulse | null;
  code: CodeHealthPulse | null;
  solana: SolanaPulse | null;
  base: BasePulse | null;
}

async function section<T>(label: string, errors: string[], work: () => Promise<T>): Promise<T | null> {
  try {
    return await work();
  } catch (err) {
    errors.push(`${label}: ${err instanceof Error ? err.message : "failed"}`);
    _logger.error(`[admin/pulse] ${label} failed:`, err);
    return null;
  }
}

function growthPulse(g: GrowthPayload): GrowthPulse {
  const lastDays = (n: number): number => g.series.slice(-n).reduce((sum, d) => sum + d.signups, 0);
  return {
    live: g.live,
    humans: g.population.humans,
    agents: g.population.agents,
    dau: g.engagement.dau,
    wau: g.engagement.wau,
    mau: g.engagement.mau,
    signupsToday: lastDays(1),
    signups7d: lastDays(7),
  };
}

function revenuePulse(r: StripeRevenuePayload): RevenuePulse {
  return {
    configured: r.configured,
    mode: r.mode,
    mrr: r.subscriptions?.mrr ?? null,
    activeSubscriptions: r.subscriptions?.active ?? null,
    net30d: r.charges?.net ?? null,
    available: r.balance?.available ?? null,
    failed30d: r.charges?.failed ?? null,
    webhookStatus: r.webhookCoverage?.status ?? null,
    errors: r.errors,
  };
}

function solanaPulse(s: SolanaProgress): SolanaPulse {
  const { devnet, mainnet, repo } = s;
  return {
    devnetReachable: devnet.reachable,
    programDeployed: devnet.program?.deployed ?? null,
    paused: devnet.config ? devnet.config.pauseClaims || devnet.config.pauseRedemptions : null,
    lastTxAt: devnet.activity?.lastTxAt ?? null,
    txs7d: devnet.activity?.last7d ?? null,
    deployerSol: devnet.deployer?.sol ?? null,
    deployerLow: devnet.deployer?.low ?? false,
    mainnetProgramDeployed: mainnet.programDeployed,
    mainnetStatus: mainnet.manifestStatus,
    commits7d: repo.status === "live" ? repo.commits7d : null,
  };
}

function basePulse(b: BaseProgress): BasePulse {
  const minter = b.wallets.find((w) => w.role === "minter");
  const claimsLive = b.claims.status === "live";
  return {
    reachable: b.reachable,
    chain: b.chain,
    minterEth: minter?.eth ?? null,
    minterLow: minter?.low ?? false,
    claimsPending: claimsLive ? (b.claims.byStatus.pending ?? 0) : null,
    claimsMinted: claimsLive ? (b.claims.byStatus.minted ?? 0) : null,
  };
}

function mapOrNull<T, U>(value: T | null, fn: (v: T) => U): U | null {
  return value === null ? null : fn(value);
}

export async function getAdminPulse(): Promise<AdminPulse> {
  const errors: string[] = [];
  const [traffic, growth, revenue, code, solana, base] = await Promise.all([
    section("traffic", errors, () => getTrafficPulse()),
    section("growth", errors, () => memoize("admin:growth", 30_000, () => getUserGrowth())),
    section("revenue", errors, () => memoize("admin:revenue", 60_000, () => getStripeRevenue())),
    section("code", errors, () => getCodeHealthPulse()),
    section("solana", errors, () => getSolanaProgress()),
    section("base", errors, () => getBaseProgress()),
  ]);
  return {
    generatedAt: new Date().toISOString(),
    errors,
    deploy: deployIdentity(),
    traffic,
    growth: mapOrNull(growth, growthPulse),
    revenue: mapOrNull(revenue, revenuePulse),
    code,
    solana: mapOrNull(solana, solanaPulse),
    base: mapOrNull(base, basePulse),
  };
}
