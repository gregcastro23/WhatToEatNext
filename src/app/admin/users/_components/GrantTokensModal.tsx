"use client";

/**
 * GrantTokensModal
 *
 * Shared admin modal for POST /api/admin/users/[userId]/grant. Used from
 * the /admin/users roster, the /admin/users/[userId] deep-dive, and
 * AdvancedMetricsPanel's recent-logins list.
 *
 * The idempotencyKey is minted ONCE per modal open (not per submit) so a
 * double-press or network retry replays the same key and the server
 * returns the existing balances instead of double-crediting.
 */

import { useState } from "react";
import { TOKEN_TYPES, type TokenType } from "@/types/economy";

export interface GrantTarget {
  userId: string;
  email: string;
}

interface GrantResultBalances {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

interface GrantResponse {
  success: boolean;
  alreadyClaimed?: boolean;
  balances?: GrantResultBalances;
  message?: string;
}

export default function GrantTokensModal({
  target,
  onClose,
  onGranted,
}: {
  target: GrantTarget;
  onClose: () => void;
  onGranted: () => void;
}) {
  const [amounts, setAmounts] = useState<Record<TokenType, number>>(() => ({
    Spirit: 5,
    Essence: 5,
    Matter: 5,
    Substance: 5,
  }));
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GrantResponse | null>(null);
  // One key per modal-open: repeat submits reuse it, so they cannot double-credit.
  const [idempotencyKey] = useState(
    () => `admin-ui-grant-${target.userId}-${crypto.randomUUID()}`,
  );

  const totalRequested = TOKEN_TYPES.reduce((sum, t) => sum + (amounts[t] || 0), 0);
  const canSubmit = !loading && !result?.success && totalRequested > 0;

  const submit = async () => {
    if (!canSubmit) return;
    const credits = TOKEN_TYPES
      .filter((t) => amounts[t] > 0)
      .map((tokenType) => ({ tokenType, amount: amounts[tokenType] }));
    if (credits.length === 0) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/users/${target.userId}/grant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits,
          idempotencyKey,
          description: description.trim() || undefined,
        }),
      });
      const data: GrantResponse = await res.json();
      setResult(data);
      if (data.success) {
        // Surface fresh stats in the panel underneath.
        onGranted();
      }
    } catch {
      setResult({ success: false, message: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="grant-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 id="grant-modal-title" className="text-base font-semibold text-gray-800">
            Grant tokens
          </h3>
          <p className="text-xs text-gray-600 mt-1 truncate" title={target.email}>
            {target.email}
            <span className="ml-2 font-mono text-gray-400">
              {target.userId.slice(0, 8)}…
            </span>
          </p>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {TOKEN_TYPES.map((t) => (
              <label key={t} className="block">
                <span className="block text-xs font-medium text-gray-700 mb-1">{t}</span>
                <input
                  type="number"
                  min={0}
                  max={10000}
                  value={amounts[t]}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setAmounts((prev) => ({ ...prev, [t]: Number.isFinite(next) ? next : 0 }));
                  }}
                  disabled={loading || result?.success === true}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </label>
            ))}
          </div>

          <label className="block">
            <span className="block text-xs font-medium text-gray-700 mb-1">
              Reason (optional)
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading || result?.success === true}
              maxLength={500}
              rows={2}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="e.g. compensation for failed daily claim"
            />
          </label>

          {result && (
            <div
              className={`rounded p-3 text-sm ${
                result.success
                  ? result.alreadyClaimed
                    ? "bg-amber-50 border border-amber-200 text-amber-800"
                    : "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {result.success ? (
                <>
                  <p className="font-medium">
                    {result.alreadyClaimed
                      ? "Already granted with that key — balances unchanged."
                      : "Granted. New balances:"}
                  </p>
                  {result.balances && (
                    <p className="mt-1 font-mono text-xs">
                      S {result.balances.spirit} · E {result.balances.essence} ·{" "}
                      M {result.balances.matter} · Sub {result.balances.substance}
                    </p>
                  )}
                </>
              ) : (
                <p>{result.message ?? "Grant failed"}</p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {result?.success ? "Close" : "Cancel"}
          </button>
          {!result?.success && (
            <button
              type="button"
              onClick={() => void submit()}
              disabled={!canSubmit}
              className="px-3 py-1.5 text-sm rounded bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-50"
            >
              {loading ? "Granting…" : `Grant ${totalRequested}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
