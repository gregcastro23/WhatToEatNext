/**
 * GET /api/cron/chain-reconcile — hourly at :45 (vercel.json).
 *
 * Heals the seams between the Postgres ledgers and the Base contracts (see
 * chainReconcileService): settles stuck ESMS claims, grants burned-but-lost
 * one-time shop purchases, checks the per-wallet mint invariant, and mints
 * recipe NFTs stranded in pending_chain. Problems dispatch through
 * alertService (Slack + operator email + alert_events → admin dashboard),
 * with distinct components so the 60-min cooldown never masks one problem
 * class behind another.
 */

import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/app/api/cron/_lib/cronAuth";
import { esmsCaip2 } from "@/lib/esms-chain/contract";
import { _logger } from "@/lib/logger";
import { dispatchAlert } from "@/services/alertService";
import {
  backfillPendingNfts,
  checkWalletInvariants,
  healBurnedPurchases,
  settleStaleClaims,
} from "@/services/chainReconcileService";
import { recordCronRun } from "@/services/cronHeartbeatService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();
  const rail = esmsCaip2();
  try {
    // Sequential on purpose: shared RPC + one signer wallet — parallel jobs
    // would race nonces on the retry mints.
    const claims = await settleStaleClaims(rail, 25);
    const shop = await healBurnedPurchases(40);
    const invariants = await checkWalletInvariants(rail, 20);
    const nfts = await backfillPendingNfts(3);

    const alerts: string[] = [];

    if (claims.failures > 0) {
      await dispatchAlert({
        component: "chain-claims",
        componentLabel: "ESMS claim settler",
        previous: "OK",
        current: "DEGRADED",
        severity: "warn",
        title: `${claims.failures} stuck ESMS claim(s) on ${rail} failed to settle`,
        message: `Scanned ${claims.scanned} stale claims on ${rail}: ${claims.reconciled} reconciled, ${claims.retried} re-sent, ${claims.failures} failed. See esms_onchain_claims.error for details.`,
      });
      alerts.push("chain-claims");
    }

    if (shop.failures > 0) {
      await dispatchAlert({
        component: "chain-shop",
        componentLabel: "Shop burn↔grant audit",
        previous: "OK",
        current: "DEGRADED",
        severity: "warn",
        title: `Shop burn audit hit ${shop.failures} error(s)`,
        message: `Checked ${shop.pairsChecked} (user, item) pairs; healed ${shop.healed}; ${shop.failures} reads/grants failed.${shop.firstError ? ` First error: ${shop.firstError}` : ""}`,
      });
      alerts.push("chain-shop");
    }

    // Wallet-invariant violations persist to alert_events through
    // dispatchAlert: persistAlertEvent runs unconditionally (a cooldown only
    // suppresses the Slack/email sinks), so every violating run leaves an
    // 'error' row for the dashboard. Clean runs write no alert row — the
    // heartbeat below covers liveness.
    if (invariants.violations.length > 0) {
      await dispatchAlert({
        component: "chain-invariant",
        componentLabel: "Ledger↔chain invariant",
        previous: "OK",
        current: "INCIDENT",
        severity: "error",
        title: `On-chain ESMS exceeds ledger mints on ${rail} for ${invariants.violations.length} wallet/coin pair(s)`,
        message: invariants.violations
          .map((v) => `${v.wallet} ${v.coin}: chain=${v.onchain} ledger=${v.ledger}`)
          .join("; ")
          .slice(0, 900),
      });
      alerts.push("chain-invariant");
    }

    if (nfts.failures > 0) {
      await dispatchAlert({
        component: "chain-nft",
        componentLabel: "Recipe NFT backfill",
        previous: "OK",
        current: "DEGRADED",
        severity: "warn",
        title: `${nfts.failures} pending recipe NFT(s) failed to mint`,
        message: `Scanned ${nfts.scanned} pending_chain rows; minted ${nfts.minted}; ${nfts.failures} failed (they stay pending and retry next run).`,
      });
      alerts.push("chain-nft");
    }

    await recordCronRun("chain-reconcile", { status: "success", startedAt });
    return NextResponse.json({
      success: true,
      rail,
      claims,
      shop,
      invariants: {
        walletsChecked: invariants.walletsChecked,
        walletsTotal: invariants.walletsTotal,
        violations: invariants.violations,
        failures: invariants.failures,
        ...(invariants.notConfigured ? { notConfigured: true } : {}),
      },
      nfts,
      alertsDispatched: alerts,
    });
  } catch (err) {
    _logger.error("[cron/chain-reconcile] failed:", err);
    await recordCronRun("chain-reconcile", {
      status: "failure",
      startedAt,
      error: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
