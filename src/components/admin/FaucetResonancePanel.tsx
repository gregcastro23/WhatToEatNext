"use client";

/**
 * Faucet Resonance Panel
 *
 * Visibility into the untethered daily faucet (ADR-016), which opened the
 * [3,24] band without a shadow-mode period. This panel is the substitute for
 * that shadow period, so it is built around the two questions that decide
 * whether the calibration is holding:
 *
 *   1. BAND OCCUPANCY — are claims spread across the band, or piling up on a
 *      rail? Rail pile-up is the visible signature of a drifted baseline; it
 *      is what the 2026-pinned self-normalisation produced out of sample.
 *   2. EMISSION PACE — is a daily claimer tracking ~4,380 ESMS/site/year?
 *
 * Aggregates only: no individual user's chart, baseline or income is shown.
 *
 * Polls /api/admin/faucet-resonance every 5 min — claim volume moves on the
 * timescale of a day, so anything faster is noise and wasted queries.
 */

import React from "react";
import { z } from "zod";
import { EmptyState } from "@/components/admin/kit/EmptyState";
import { Metric } from "@/components/admin/kit/Metric";
import { fromLiveFlag } from "@/components/admin/kit/provenance";
import { ProvenanceBadge } from "@/components/admin/kit/ProvenanceBadge";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";

/**
 * Validated rather than cast. An admin panel that trusts its payload shape
 * renders `undefined` as a confident-looking blank, which is the one thing a
 * panel reading a live economic source must never do.
 */
const faucetResonanceSchema = z.object({
  success: z.boolean(),
  live: z.boolean(),
  reason: z.string().nullable(),
  windowDays: z.number().finite(),
  claims: z.number().finite(),
  claimants: z.number().finite(),
  buckets: z.array(
    z.object({
      from: z.number().finite(),
      to: z.number().finite(),
      claims: z.number().finite(),
    }),
  ),
  atMin: z.number().finite(),
  atMax: z.number().finite(),
  railShare: z.number().finite(),
  meanTotal: z.number().finite().nullable(),
  minTotal: z.number().finite().nullable(),
  maxTotal: z.number().finite().nullable(),
  meanRatio: z.number().finite().nullable(),
  annualPace: z.number().finite().nullable(),
  annualTarget: z.number().finite(),
  baselineVersions: z.array(z.string()),
});

type FaucetResonancePayload = z.infer<typeof faucetResonanceSchema>;

/**
 * Above this share of claims sitting on a rail, the band is doing the work
 * instead of the resonance — worth investigating the baseline. Chosen as a
 * legible threshold to act on, not a measured constant.
 */
const RAIL_SHARE_WARN = 0.25;

export function FaucetResonancePanel(): React.JSX.Element | null {
  const [data, setData] = React.useState<FaucetResonancePayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const poll = React.useCallback(async (): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch("/api/admin/faucet-resonance", {
        cache: "no-store",
      });
      if (!res.ok) {
        setError(`Failed to load faucet resonance (HTTP ${res.status})`);
        return { ok: false };
      }
      const parsed = faucetResonanceSchema.safeParse(await res.json());
      if (parsed.success && parsed.data.success) {
        setData(parsed.data);
        setError(null);
        return { ok: true };
      }
      setError("Faucet resonance payload malformed");
      return { ok: false };
    } catch {
      setError("Failed to reach admin API");
      return { ok: false };
    }
  }, []);

  useHardenedPolling(poll, { baseIntervalMs: 300_000 });

  if (!data && !error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3" />
        <p className="text-gray-600 text-sm">Loading faucet resonance…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-2">Faucet Resonance</h3>
        <EmptyState kind="cannot-read" title="Cannot reach admin API" description={error} />
      </div>
    );
  }

  if (!data) return null;

  const provenance = fromLiveFlag(
    data.live,
    data.reason === null ? {} : { detail: data.reason },
  );
  const totalRange =
    data.minTotal !== null && data.maxTotal !== null
      ? `range ${data.minTotal.toFixed(2)}–${data.maxTotal.toFixed(2)}`
      : null;
  const peak = Math.max(1, ...data.buckets.map((b) => b.claims));
  const railHot = data.live && data.railShare >= RAIL_SHARE_WARN;
  const paceDelta =
    data.annualPace === null
      ? null
      : (data.annualPace - data.annualTarget) / data.annualTarget;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900">Faucet Resonance</h3>
            <ProvenanceBadge provenance={provenance} />
          </div>
          <p className="text-sm text-gray-700">
            Daily claim magnitude from chart × moment, last {data.windowDays} days.
          </p>
        </div>
        {railHot && (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
            Rail pressure
          </span>
        )}
      </div>

      {!data.live ? (
        <EmptyState
          kind="never-used"
          title="No resonance recorded yet"
          description={data.reason ?? "Claims will appear here once the faucet runs."}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Metric label="Claims" value={data.claims} provenance={provenance} />
            <Metric label="Claimants" value={data.claimants} provenance={provenance} />
            <Metric
              label="Mean total"
              value={data.meanTotal}
              provenance={provenance}
              format={(v) => `${Number(v).toFixed(2)} ESMS`}
              {...(totalRange === null ? {} : { caption: totalRange })}
            />
            <Metric
              label="Mean resonance z"
              value={data.meanRatio}
              provenance={provenance}
              format={(v) => Number(v).toFixed(3)}
              caption="calibration says ≈ 1.000"
            />
          </div>

          {/* Band occupancy — the headline signal. */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900">Band occupancy</h4>
              <span className="text-xs text-gray-500">
                {data.atMin} at floor · {data.atMax} at ceiling ·{" "}
                <span className={railHot ? "font-semibold text-amber-700" : ""}>
                  {(data.railShare * 100).toFixed(1)}% on a rail
                </span>
              </span>
            </div>
            <div className="flex items-end gap-1 h-28" role="img" aria-label="Claim totals across the 3 to 24 ESMS band">
              {data.buckets.map((bucket) => {
                const isRail =
                  bucket === data.buckets[0] ||
                  bucket === data.buckets[data.buckets.length - 1];
                return (
                  <div key={bucket.from} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500 tabular-nums">
                      {bucket.claims || ""}
                    </span>
                    <div
                      className={`w-full rounded-t ${
                        isRail && railHot ? "bg-amber-400" : "bg-purple-500"
                      }`}
                      style={{ height: `${(bucket.claims / peak) * 100}%` }}
                      title={`${bucket.from.toFixed(0)}–${bucket.to.toFixed(0)} ESMS: ${bucket.claims} claims`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 mt-1 tabular-nums">
              <span>{data.buckets[0]?.from.toFixed(0)}</span>
              <span>{data.buckets[data.buckets.length - 1]?.to.toFixed(0)} ESMS</span>
            </div>
          </div>

          {/* Emission pace against the calibration target. */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-baseline justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Emission pace</h4>
              <span className="text-xs text-gray-500">
                target {data.annualTarget.toLocaleString()} ESMS / site / year
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl font-bold text-gray-900 tabular-nums">
                {data.annualPace === null
                  ? "—"
                  : Math.round(data.annualPace).toLocaleString()}
              </span>
              {paceDelta !== null && (
                <span
                  className={`text-sm font-semibold ${
                    Math.abs(paceDelta) <= 0.05 ? "text-green-700" : "text-amber-700"
                  }`}
                >
                  {paceDelta >= 0 ? "+" : ""}
                  {(paceDelta * 100).toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Mean daily total annualised. Calibration holds this within ±5%.
            </p>
          </div>

          {data.baselineVersions.length > 1 && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
              Multiple baseline epochs in window ({data.baselineVersions.join(", ")}) —
              expected across a year rollover, when every chart re-derives its baseline.
            </p>
          )}
        </>
      )}

      {error && <p className="text-xs text-amber-700">Last refresh failed: {error}</p>}
    </div>
  );
}

export default FaucetResonancePanel;
