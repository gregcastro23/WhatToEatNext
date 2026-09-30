/** Persistent shop audit alerts, including honest transitions and recovery. */

import { executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";
import { dispatchAlert, type AlertCandidate } from "@/services/alertService";
import type { BurnHealSummary } from "@/services/chainReconcileService";
import type { FlowStatus } from "@/services/systemStatusService";
import { getSelfBaseUrl } from "@/utils/urlUtils";

const COMPONENT = "chain-shop";
const LABEL = "Shop burn↔grant audit";
const REMINDER_MS = 24 * 60 * 60 * 1000;

export interface ShopAlertState {
  status: FlowStatus;
  triggeredAt: Date;
}

/** An unconfigured audit has not verified recovery. */
export function shopAuditAlertCandidate(
  shop: BurnHealSummary,
  last: ShopAlertState | null,
  now: Date,
): AlertCandidate | null {
  if (!shop.preflight) return null;

  if (shop.failures === 0) {
    if (last?.status !== "DEGRADED") return null;
    return {
      component: COMPONENT, componentLabel: LABEL,
      previous: "DEGRADED", current: "OK", severity: "info",
      title: "Shop burn audit recovered",
      message: `Contract check passed; checked ${shop.pairsChecked} (user, item) pairs and healed ${shop.healed}.`,
    };
  }

  const blocked = shop.preflight !== "ready";
  const reminder = last?.status === "DEGRADED";
  if (reminder && now.getTime() - last.triggeredAt.getTime() < REMINDER_MS) return null;
  const title = blocked
    ? `Shop burn audit ${reminder ? "still blocked" : "blocked"}: ${shop.preflight}`
    : `Shop burn audit ${reminder ? "still failing" : "hit"} ${shop.failures} error(s)`;
  const message = blocked
    ? `${shop.firstError ?? "ESMS contract check failed"}. No (user, item) pairs were read or granted. See /admin/chain.`
    : `Checked ${shop.pairsChecked} (user, item) pairs; healed ${shop.healed}; ${shop.failures} reads/grants failed.${shop.firstError ? ` First error: ${shop.firstError}` : ""}`;
  return {
    component: COMPONENT, componentLabel: LABEL,
    previous: last?.status ?? "UNKNOWN", current: "DEGRADED", severity: "warn",
    title, message,
  };
}

async function lastShopAlert(): Promise<ShopAlertState | null> {
  try {
    const result = await executeQuery<{ current_status: string; triggered_at: Date }>(
      `SELECT current_status, triggered_at FROM alert_events
       WHERE component = $1 ORDER BY triggered_at DESC LIMIT 1`,
      [COMPONENT],
    );
    const [row] = result.rows;
    if (!row) return null;
    if (row.current_status !== "OK" && row.current_status !== "DEGRADED" && row.current_status !== "INCIDENT") return null;
    return { status: row.current_status, triggeredAt: new Date(row.triggered_at) };
  } catch (err) {
    _logger.warn("[chainShopAlert] could not read previous status:", err);
    return null;
  }
}

/** Returns whether this run dispatched a shop audit alert. */
export async function notifyShopAudit(shop: BurnHealSummary): Promise<boolean> {
  if (!shop.preflight) return false;
  const candidate = shopAuditAlertCandidate(shop, await lastShopAlert(), new Date());
  if (!candidate) return false;
  await dispatchAlert({ ...candidate, dashboardUrl: `${getSelfBaseUrl()}/admin/chain` });
  return true;
}
