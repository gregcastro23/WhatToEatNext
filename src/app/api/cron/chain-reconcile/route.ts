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
import { _logger } from "@/lib/logger";
import { dispatchAlert } from "@/services/alertService";
import {
  backfillPendingNfts,
  checkWalletInvariants,
  healBurnedPurchases,
  settleStaleClaims,
} from "@/services/chainReconcileService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Sequential on purpose: shared RPC + one signer wallet — parallel jobs
    // would race nonces on the retry mints.
    const claims = await settleStaleClaims(25);
    const shop = await healBurnedPurchases(40);
    const invariants = await checkWalletInvariants(20);
    const nfts = await backfillPendingNfts(3);

    const alerts: string[] = [];

    if (claims.failures > 0) {
      await dispatchAlert({
        component: "chain-claims",
        componentLabel: "ESMS claim settler",
        previous: "OK",
        current: "DEGRADED",
        severity: "warn",
        title: `${claims.failures} stuck ESMS claim(s) failed to settle`,
        message: `Scanned ${claims.scanned} stale claims: ${claims.reconciled} reconciled, ${claims.retried} re-sent, ${claims.failures} failed. See esms_onchain_claims.error for details.`,
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
        message: `Checked ${shop.pairsChecked} (user, item) pairs; healed ${shop.healed}; ${shop.failures} reads/grants failed.`,
      });
      alerts.push("chain-shop");
    }

    if (invariants.violations.length > 0) {
      await dispatchAlert({
        component: "chain-invariant",
        componentLabel: "Ledger↔chain invariant",
        previous: "OK",
        current: "INCIDENT",
        severity: "error",
        title: `On-chain ESMS exceeds ledger mints for ${invariants.violations.length} wallet/coin pair(s)`,
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

    return NextResponse.json({
      success: true,
      claims,
      shop,
      invariants: {
        walletsChecked: invariants.walletsChecked,
        violations: invariants.violations,
        failures: invariants.failures,
      },
      nfts,
      alertsDispatched: alerts,
    });
  } catch (err) {
    _logger.error("[cron/chain-reconcile] failed:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
