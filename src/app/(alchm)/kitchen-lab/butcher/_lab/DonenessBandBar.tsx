"use client";

import {
  TRAJECTORY_METHODS,
  type CoupledTrajectoryResult,
  type TrajectoryMethodId,
} from "@/lib/butcher/science/coupledMeatTrajectory";
import type { JSX } from "react";

/**
 * Full-thickness cross-section doneness band, face A → face B: fat cap ·
 * crust · gray band · ideal core (split by a core bone) · gray band · crust ·
 * bone plate, plus carryover / Maillard / stall telemetry.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/DonenessBandBar.tsx
 */

const COLORS = {
  fat: "#e7d49b",
  crust: "#7c2d12",
  gray: "#78716c",
  core: "#fb7185",
  bone: "#f5eedc",
} as const;

interface BandSegment {
  readonly key: string;
  readonly mm: number;
  readonly fill: string;
}

function bandSegments(result: CoupledTrajectoryResult): readonly BandSegment[] {
  const [a, b] = result.faces;
  const meat = result.column.meatThicknessMm;
  const ideal = Math.max(0, meat - a.crustDepthMm - a.grayBandMm - b.crustDepthMm - b.grayBandMm);
  const isCore = result.column.bonePlacement === "core" && result.column.boneMm > 0;
  const middle: BandSegment[] = isCore
    ? [
        { key: "core-a", mm: Math.max(0, meat / 2 - a.crustDepthMm - a.grayBandMm), fill: COLORS.core },
        { key: "bone-core", mm: result.column.boneMm, fill: COLORS.bone },
        { key: "core-b", mm: Math.max(0, meat / 2 - b.crustDepthMm - b.grayBandMm), fill: COLORS.core },
      ]
    : [{ key: "core", mm: ideal, fill: COLORS.core }];
  return [
    { key: "fat", mm: result.column.fatCapMm, fill: COLORS.fat },
    { key: "crust-a", mm: a.crustDepthMm, fill: COLORS.crust },
    { key: "gray-a", mm: a.grayBandMm, fill: COLORS.gray },
    ...middle,
    { key: "gray-b", mm: b.grayBandMm, fill: COLORS.gray },
    { key: "crust-b", mm: b.crustDepthMm, fill: COLORS.crust },
    { key: "bone-face", mm: isCore ? 0 : result.column.boneMm, fill: COLORS.bone },
  ].filter((s) => s.mm > 0);
}

function DonenessBandSvg({ result }: { readonly result: CoupledTrajectoryResult }): JSX.Element {
  const fullW = 480;
  const barH = 26;
  const segments = bandSegments(result);
  const totalMm = Math.max(0.5, segments.reduce((acc, s) => acc + s.mm, 0));
  const scale = fullW / totalMm;
  const starts = segments.map((_, i) => segments.slice(0, i).reduce((acc, s) => acc + s.mm, 0) * scale);
  const centreX = (result.column.fatCapMm + result.column.thermalCentreFromAMm) * scale;
  const [a, b] = result.faces;
  const aria = `Cross-section thickness ${result.column.meatThicknessMm.toFixed(0)} mm of meat: face A (${a.outer}) crust ${a.crustDepthMm.toFixed(1)} mm, gray band ${a.grayBandMm.toFixed(1)} mm; face B (${b.outer}) crust ${b.crustDepthMm.toFixed(1)} mm, gray band ${b.grayBandMm.toFixed(1)} mm; ideal core ${result.idealCoreMm.toFixed(1)} mm radial.`;
  return (
    <svg viewBox={`0 0 ${fullW} ${barH}`} preserveAspectRatio="none" className="h-7 w-full overflow-hidden rounded-md border border-white/15 bg-black/40" role="img" aria-label={aria}>
      {segments.map((s, i) => (
        <rect key={s.key} x={starts[i] ?? 0} y={0} width={s.mm * scale} height={barH} fill={s.fill} />
      ))}
      <line x1={centreX} y1={0} x2={centreX} y2={barH} stroke="#fbbf24" strokeWidth={2} strokeDasharray="3 2" />
    </svg>
  );
}

function BandLegend({ result }: { readonly result: CoupledTrajectoryResult }): JSX.Element {
  const [a, b] = result.faces;
  const chip = (color: string, label: string): JSX.Element => (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: color }} aria-hidden="true" />
      {label}
    </span>
  );
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/65">
      <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
        {result.column.fatCapMm > 0 ? chip(COLORS.fat, `Fat cap ${result.column.fatCapMm} mm`) : null}
        {chip(COLORS.crust, `Crust ${a.crustDepthMm.toFixed(1)} | ${b.crustDepthMm.toFixed(1)} mm`)}
        {chip(COLORS.gray, `Gray band ${a.grayBandMm.toFixed(1)} | ${b.grayBandMm.toFixed(1)} mm`)}
        {chip(COLORS.core, `Ideal core ${result.idealCoreMm.toFixed(1)} mm`)}
        {result.column.boneMm > 0 ? chip(COLORS.bone, `Bone ${result.column.boneMm.toFixed(0)} mm`) : null}
        {chip("#fbbf24", "Thermal centre")}
      </span>
      <span className="bt-num text-white/55">
        Face A {a.outer} · Face B {b.outer} · Cook {result.cookMinutes} min
      </span>
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
            Full-thickness column (face A → face B), evaporative cooling on each face, and {result.restMinutes}-min ambient rest carryover.
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
      <div className="space-y-1.5">
        <DonenessBandSvg result={result} />
        <BandLegend result={result} />
      </div>
      <DonenessTelemetryGrid result={result} />
    </div>
  );
}
