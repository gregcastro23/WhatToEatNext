"use client";

import type { ThermalCurvePoint, ThermalEvaluation } from "@/lib/butcher/types";
import type { JSX } from "react";

/**
 * Denaturation stats grid and the tenderness / moisture / gelatin curve chart
 * for the Thermal & Grain tab.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/ThermalCharts.tsx
 */

export function ThermalStatsGrid({ thermal }: { readonly thermal: ThermalEvaluation }): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
      <div className="rounded-lg border border-white/10 bg-black/25 p-2.5">
        <span className="bt-label block">Myosin Denatured</span>
        <span className="bt-num text-base text-white">{thermal.myosinDenaturedPct}%</span>
      </div>
      <div className="rounded-lg border border-white/10 bg-black/25 p-2.5">
        <span className="bt-label block">Actin Coagulated</span>
        <span className="bt-num text-base text-amber-200">{thermal.actinCoagulatedPct}%</span>
      </div>
      <div className="rounded-lg border border-white/10 bg-black/25 p-2.5">
        <span className="bt-label block">Collagen → Gelatin</span>
        <span className="bt-num text-base text-purple-300">{thermal.gelatinConversionPct}%</span>
      </div>
      <div className="rounded-lg border border-white/10 bg-black/25 p-2.5">
        <span className="bt-label block">Tenderness / Moisture</span>
        <span className="bt-num text-base text-emerald-300">
          {thermal.tendernessScore} / {thermal.moistureRetentionPct}%
        </span>
      </div>
    </div>
  );
}

export function ThermalCurveChart({
  curve,
  coreTempC,
  minC,
  maxC,
}: {
  readonly curve: readonly ThermalCurvePoint[];
  readonly coreTempC: number;
  readonly minC: number;
  readonly maxC: number;
}): JSX.Element {
  const w = 480;
  const h = 166;
  const plotTop = 32;
  const plotBottom = h - 20;
  const span = Math.max(1, maxC - minC);
  const toX = (tempC: number): number => ((tempC - minC) / span) * (w - 40) + 25;
  const toY = (pct: number): number => plotBottom - (pct / 100) * (plotBottom - plotTop);
  const clampedMarkerX = toX(Math.min(maxC, Math.max(minC, coreTempC)));
  const tendernessPts = curve.map((pt) => `${toX(pt.tempC).toFixed(1)},${toY(pt.tendernessScore).toFixed(1)}`).join(" ");
  const moisturePts = curve.map((pt) => `${toX(pt.tempC).toFixed(1)},${toY(pt.moistureRetentionPct).toFixed(1)}`).join(" ");
  const gelatinPts = curve.map((pt) => `${toX(pt.tempC).toFixed(1)},${toY(pt.gelatinConversionPct).toFixed(1)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full rounded-lg border border-white/10 bg-black/30 p-2"
      role="img"
      aria-label={`Tenderness, moisture retention, and gelatin conversion across ${minC} to ${maxC} degrees Celsius`}
    >
      <line x1={25} y1={12} x2={37} y2={12} stroke="#34d399" strokeWidth={2.2} />
      <text x={42} y={15} fill="#34d399" fontSize={10}>Tenderness</text>
      <line x1={110} y1={12} x2={122} y2={12} stroke="#38bdf8" strokeWidth={1.8} strokeDasharray="4 3" />
      <text x={127} y={15} fill="#38bdf8" fontSize={10}>Moisture %</text>
      <line x1={194} y1={12} x2={206} y2={12} stroke="#c084fc" strokeWidth={2} />
      <text x={211} y={15} fill="#c084fc" fontSize={10}>Gelatin %</text>
      <line x1={25} y1={plotTop - 4} x2={w - 15} y2={plotTop - 4} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      <polyline fill="none" stroke="#34d399" strokeWidth={2.2} points={tendernessPts} />
      <polyline fill="none" stroke="#38bdf8" strokeWidth={1.8} strokeDasharray="4 3" points={moisturePts} />
      <polyline fill="none" stroke="#c084fc" strokeWidth={2} points={gelatinPts} />
      <line x1={clampedMarkerX} y1={plotTop - 4} x2={clampedMarkerX} y2={plotBottom + 2} stroke="#fbbf24" strokeWidth={1.5} />
      <text x={25} y={h - 4} fill="rgba(255,255,255,0.6)" fontSize={9}>{minC} °C</text>
      <text x={w - 42} y={h - 4} fill="rgba(255,255,255,0.6)" fontSize={9}>{maxC} °C</text>
    </svg>
  );
}
