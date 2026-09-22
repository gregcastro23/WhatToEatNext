/**
 * Admin Pulse — the headline number from every live source, in one call.
 * GET /api/admin/pulse
 *
 * Backs the KPI strip at the top of /admin. Each section is computed by the
 * same service (and shares the same cache key) as its detail page, so the
 * strip and the page it links to can never disagree. A section that fails
 * comes back `null` with its reason in `errors`; the others still render.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { _logger } from "@/lib/logger";
import { getBaseProgress, getSolanaProgress } from "@/services/admin/chainProgressService";
import { deployIdentity, getCodeHealthPulse } from "@/services/admin/codeHealthService";
import { getStripeRevenue } from "@/services/admin/stripeRevenueService";
import { getTrafficPulse } from "@/services/admin/trafficAnalyticsService";
import { getUserGrowth } from "@/services/admin/userGrowthService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function section<T>(label: string, errors: string[], work: () => Promise<T>): Promise<T | null> {
  try {
    return await work();
  } catch (err) {
    errors.push(`${label}: ${err instanceof Error ? err.message : "failed"}`);
    _logger.error(`[admin/pulse] ${label} failed:`, err);
    return null;
  }
}

async function buildPulse() {
  const errors: string[] = [];
  const [traffic, growth, revenue, code, solana, base] = await Promise.all([
    section("traffic", errors, () => getTrafficPulse()),
    section("growth", errors, () => memoize("admin:growth", 30_000, () => getUserGrowth())),
    section("revenue", errors, () => memoize("admin:revenue", 60_000, () => getStripeRevenue())),
    section("code", errors, () => getCodeHealthPulse()),
    section("solana", errors, () => getSolanaProgress()),
    section("base", errors, () => getBaseProgress()),
  ]);

  const lastDays = (n: number): number =>
    growth ? growth.series.slice(-n).reduce((sum, d) => sum + d.signups, 0) : 0;
  const minter = base?.wallets.find((w) => w.role === "minter") ?? null;

  return {
    generatedAt: new Date().toISOString(),
    errors,
    deploy: deployIdentity(),
    traffic,
    growth: growth
      ? {
          live: growth.live,
          humans: growth.population.humans,
          agents: growth.population.agents,
          dau: growth.engagement.dau,
          wau: growth.engagement.wau,
          mau: growth.engagement.mau,
          signupsToday: lastDays(1),
          signups7d: lastDays(7),
        }
      : null,
    revenue: revenue
      ? {
          configured: revenue.configured,
          mode: revenue.mode,
          mrr: revenue.subscriptions?.mrr ?? null,
          activeSubscriptions: revenue.subscriptions?.active ?? null,
          net30d: revenue.charges?.net ?? null,
          available: revenue.balance?.available ?? null,
          failed30d: revenue.charges?.failed ?? null,
          webhookStatus: revenue.webhookCoverage?.status ?? null,
          errors: revenue.errors,
        }
      : null,
    code,
    solana: solana
      ? {
          devnetReachable: solana.devnet.reachable,
          programDeployed: solana.devnet.program?.deployed ?? null,
          paused:
            solana.devnet.config === null
              ? null
              : solana.devnet.config.pauseClaims || solana.devnet.config.pauseRedemptions,
          lastTxAt: solana.devnet.activity?.lastTxAt ?? null,
          txs7d: solana.devnet.activity?.last7d ?? null,
          deployerSol: solana.devnet.deployer?.sol ?? null,
          deployerLow: solana.devnet.deployer?.low ?? false,
          mainnetProgramDeployed: solana.mainnet.programDeployed,
          mainnetStatus: solana.mainnet.manifestStatus,
          commits7d: solana.repo.status === "live" ? solana.repo.commits7d : null,
        }
      : null,
    base: base
      ? {
          reachable: base.reachable,
          chain: base.chain,
          minterEth: minter?.eth ?? null,
          minterLow: minter?.low ?? false,
          claimsPending: base.claims.status === "live" ? (base.claims.byStatus.pending ?? 0) : null,
          claimsMinted: base.claims.status === "live" ? (base.claims.byStatus.minted ?? 0) : null,
        }
      : null,
  };
}

export async function GET(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  const payload = await memoize("admin:pulse", 10_000, buildPulse);
  return NextResponse.json({ success: true, ...payload });
}
