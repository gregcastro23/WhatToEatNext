"use client";

/**
 * SettlementPanel — operator handle for the restaurant ESMS settlement rail.
 *
 * A "settlement_pending" order is a real-money hazard: the user's ESMS was
 * already debited, but the Stripe transfer that pays the restaurant its fiat
 * hasn't been confirmed. This panel is the workflow required by
 * docs/payments/CRYPTO_FOOD_PAYMENTS.md before a public launch — it lists every
 * stuck order and lets the operator resolve each one:
 *
 *   • Retry  — re-issue the Stripe transfer under the SAME idempotency key, so
 *              a transfer that actually went through the first time is returned
 *              rather than double-paid. Marks the order paid + re-fulfills.
 *   • Refund — only after Stripe confirms NO transfer exists, re-credit the
 *              exact ESMS basket the order debited and mark it refunded.
 *
 * Backed by /api/admin/restaurants/settlement (GET list, POST resolve).
 */

import React from "react";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";

interface PendingOrder {
  id: string;
  user_id: string | null;
  restaurant_name: string;
  currency: string;
  transfer_amount_cents: number;
  stripe_connected_account_id: string | null;
  stripe_transfer_id: string | null;
  status: string;
  payment_status: string | null;
  transfer_status: string | null;
  created_at: string;
}

interface ActionResult {
  orderId: string;
  success: boolean;
  message: string;
  action: "retry" | "refund";
}

function formatMoney(cents: number, currency: string): string {
  const amount = (cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency?.toUpperCase() || "USD"} ${amount}`;
}

function formatAge(iso: string): string {
  const ageMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ageMs)) return "—";
  if (ageMs < 3_600_000) return `${Math.max(1, Math.round(ageMs / 60_000))}m`;
  if (ageMs < 86_400_000) return `${Math.round(ageMs / 3_600_000)}h`;
  return `${Math.round(ageMs / 86_400_000)}d`;
}

export default function SettlementPanel() {
  const [orders, setOrders] = React.useState<PendingOrder[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ActionResult | null>(null);

  const poll = React.useCallback(async (): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch("/api/admin/restaurants/settlement", {
        cache: "no-store",
      });
      if (!res.ok) {
        setError(`HTTP ${res.status}`);
        return { ok: false };
      }
      const json = (await res.json()) as {
        success: boolean;
        pending?: PendingOrder[];
        message?: string;
      };
      if (json.success) {
        setOrders(json.pending ?? []);
        setError(null);
        setLoaded(true);
        return { ok: true };
      }
      setError(json.message ?? "Payload malformed");
      return { ok: false };
    } catch (_err) {
      setError("Failed to reach settlement API");
      return { ok: false };
    }
  }, []);

  // Settlement rows change only when an order fails or an operator acts, so a
  // relaxed cadence is plenty; the resolve handler refreshes immediately.
  useHardenedPolling(poll, { baseIntervalMs: 45_000 });

  const resolve = async (orderId: string, action: "retry" | "refund") => {
    // Refund re-credits ESMS and is irreversible from this screen — confirm it.
    if (action === "refund") {
      // eslint-disable-next-line no-alert
      const ok = window.confirm(
        "Refund ESMS for this order?\n\nOnly do this if the restaurant was NOT paid. " +
          "The exact debited token basket is re-credited to the user and the order " +
          "is marked refunded. This cannot be undone here.",
      );
      if (!ok) return;
    }
    try {
      setBusyId(orderId);
      setResult(null);
      const res = await fetch("/api/admin/restaurants/settlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action }),
      });
      const json = (await res.json()) as {
        success: boolean;
        message?: string;
        status?: string;
        transferId?: string;
      };
      setResult({
        orderId,
        action,
        success: json.success,
        message: json.success
          ? action === "retry"
            ? `Transfer settled${json.transferId ? ` · ${json.transferId}` : ""} — order marked paid.`
            : "ESMS re-credited — order marked refunded."
          : json.message ?? `HTTP ${res.status}`,
      });
      await poll();
    } catch (err) {
      setResult({
        orderId,
        action,
        success: false,
        message: err instanceof Error ? err.message : "Request failed",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Restaurant Settlements
          </h2>
          <p className="text-xs text-gray-500">
            ESMS debited · restaurant transfer not confirmed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              orders.length === 0
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {loaded ? `${orders.length} pending` : "…"}
          </span>
          <button
            type="button"
            onClick={() => void poll()}
            className="text-xs font-semibold text-purple-600 hover:text-purple-800"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 sm:px-6 py-3 bg-rose-50 border-b border-rose-100 text-sm text-rose-700">
          Settlement API error: {error}
        </div>
      )}

      {result && (
        <div
          className={`px-4 sm:px-6 py-3 border-b text-xs font-mono ${
            result.success
              ? "bg-emerald-50 border-emerald-100 text-emerald-900"
              : "bg-rose-50 border-rose-100 text-rose-900"
          }`}
        >
          <span className="font-bold uppercase">
            {result.action} · {result.success ? "OK" : "FAILED"}
          </span>{" "}
          — {result.message}
        </div>
      )}

      {!loaded && !error ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2" />
          <p className="text-gray-500 text-xs">Loading pending settlements…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-sm font-semibold text-gray-700">
            No orders awaiting settlement
          </p>
          <p className="text-xs text-gray-400 mt-1">
            The restaurant payment rail is clear.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Transfer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Resolve
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const busy = busyId === order.id;
                const canRetry =
                  Boolean(order.stripe_connected_account_id) &&
                  order.transfer_amount_cents > 0;
                return (
                  <tr key={order.id} className="hover:bg-gray-50 align-top">
                    <td className="px-4 sm:px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {order.restaurant_name || "—"}
                      </p>
                      <p className="text-[11px] text-gray-400 font-mono">
                        {order.id}
                      </p>
                      {order.user_id && (
                        <p className="text-[11px] text-gray-400 font-mono">
                          user · {order.user_id.slice(0, 8)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-800 font-mono">
                        {formatMoney(order.transfer_amount_cents, order.currency)}
                      </p>
                      <p className="text-[11px] text-gray-400 font-mono">
                        {order.stripe_connected_account_id
                          ? `→ ${order.stripe_connected_account_id}`
                          : "no connected account"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {order.status}
                      </span>
                      {order.transfer_status && (
                        <p className="text-[11px] text-gray-500 font-mono mt-1">
                          transfer · {order.transfer_status}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-500 font-mono text-xs">
                      {formatAge(order.created_at)}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={busy || !canRetry}
                          title={
                            canRetry
                              ? "Re-issue the Stripe transfer (idempotent)"
                              : "Missing connected account or amount"
                          }
                          onClick={() => void resolve(order.id, "retry")}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:scale-100 transition"
                        >
                          {busy ? "…" : "Retry"}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          title="Re-credit ESMS (only if the restaurant was not paid)"
                          onClick={() => void resolve(order.id, "refund")}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 active:scale-95 disabled:opacity-50 disabled:scale-100 transition"
                        >
                          {busy ? "…" : "Refund"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
