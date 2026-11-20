"use client";

import {
  TRAJECTORY_METHODS,
  type CoupledTrajectoryResult,
  type TrajectoryMethodId,
} from "@/lib/butcher/science/coupledMeatTrajectory";
import type { JSX } from "react";

/**
 * Compact 1D slab cross-section doneness band (Crust · Gray Band · Ideal Core)
 * and carryover/Maillard/stall telemetry readout for `ThermalGrainPanel`.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/DonenessBandBar.tsx
 */

function DonenessBandSvg({ result }: { readonly result: CoupledTrajectoryResult }): JSX.Element {
  const half = Math.max(0.5, result.halfThicknessMm);
  const fullW = 480;
  const barH = 26;
  const halfPx = fullW * 0.5;
  const crustPx = Math.min(halfPx * 0.4, (result.crustDepthMm / half) * halfPx);
  const grayPx = Math.min(halfPx - crustPx, (result.grayBandMm / half) * halfPx);
  const corePx = Math.max(0, fullW - 2 * (crustPx + grayPx));
  const rightGrayX = crustPx + grayPx + corePx;
  const rightCrustX = rightGrayX + grayPx;
  const aria = `Cross-section thickness ${(half * 2).toFixed(0)} mm: crust ${result.crustDepthMm.toFixed(1)} mm, gray band ${result.grayBandMm.toFixed(1)} mm (${result.grayBandPct}%), ideal core ${result.idealCoreMm.toFixed(1)} mm radial.`;

  return (
    <div className="space-y-1.5">
      <svg
        viewBox={`0 0 ${fullW} ${barH}`}
        preserveAspectRatio="none"
        className="h-7 w-full overflow-hidden rounded-md border border-white/15 bg-black/40"
        role="img"
        aria-label={aria}
      >
        <rect x={0} y={0} width={crustPx} height={barH} fill="#7c2d12" />
        <rect x={crustPx} y={0} width={grayPx} height={barH} fill="#78716c" />
        <rect x={crustPx + grayPx} y={0} width={corePx} height={barH} fill="#fb7185" />
        <rect x={rightGrayX} y={0} width={grayPx} height={barH} fill="#78716c" />
        <rect x={rightCrustX} y={0} width={crustPx} height={barH} fill="#7c2d12" />
      </svg>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/65">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[#7c2d12]" aria-hidden="true" />
          Crust {result.crustDepthMm.toFixed(1)} mm
          <span className="ml-2 h-2 w-2 rounded-sm bg-[#78716c]" aria-hidden="true" />
          Gray Band {result.grayBandMm.toFixed(1)} mm
          <span className="ml-2 h-2 w-2 rounded-sm bg-[#fb7185]" aria-hidden="true" />
          Ideal Core {result.idealCoreMm.toFixed(1)} mm
        </span>
        <span className="bt-num text-white/55">
          Half-slab {result.halfThicknessMm.toFixed(1)} mm · Cook {result.cookMinutes} min
        </span>
      </div>
    </div>
  );
}

function DonenessTelemetryGrid({ result }: { readonly result: CoupledTrajectoryResult }): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
      <div className="rounded-lg border border-white/10 bg-black/25 p-2.5">
        <span className="bt-label block">Gray Band</span>
        <span className="bt-num text-sm text-white">
          {result.grayBandMm.toFixed(1)} mm ({result.grayBandPct}% depth)
        </span>
      </div>
      <div className="rounded-lg border border-white/10 bg-black/25 p-2.5">
        <span className="bt-label block">Carryover Peak</span>
        <span className="bt-num text-sm text-amber-200">
          +{result.carryoverRiseC.toFixed(1)} °C → {result.carryoverPeakC.toFixed(1)} °C
        </span>
      </div>
      <div className="rounded-lg border border-white/10 bg-black/25 p-2.5">
        <span className="bt-label block">Surface Event</span>
        <span className="text-sm font-medium text-emerald-200">{result.surfaceEventSummary}</span>
      </div>
    </div>
  );
}

export function DonenessBandBar({
  method,
  onSelectMethod,
  result,
}: {
  readonly method: TrajectoryMethodId;
  readonly onSelectMethod: (next: TrajectoryMethodId) => void;
  readonly result: CoupledTrajectoryResult;
}): JSX.Element {
  return (
    <div className="bt-card space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg">1D Coupled Heat-Moisture Trajectory</h3>
          <p className="text-xs text-white/60">
            Transient spatial gradient, evaporative cooling, and {result.restMinutes}-min ambient rest carryover.
          </p>
        </div>
        <span className="bt-num text-xs text-purple-200">
          Time-integrated gelatin {result.gelatinConversionPct}% (+{result.restGelatinGainPct}% rest)
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Trajectory cooking method">
        {TRAJECTORY_METHODS.map((m) => (
          <button key={m.id} type="button" className="bt-btn" aria-pressed={method === m.id} onClick={() => onSelectMethod(m.id)}>
            {m.label}
          </button>
        ))}
      </div>
      <DonenessBandSvg result={result} />
      <DonenessTelemetryGrid result={result} />
    </div>
  );
}
