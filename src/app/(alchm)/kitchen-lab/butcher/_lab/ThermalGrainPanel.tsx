"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type JSX } from "react";
import { knifeNormalAtAngle } from "@/lib/butcher/science/butcherGame";
import {
  defaultTrajectoryMethodForCut,
  simulateCoupledCutTrajectory,
  type TrajectoryMethodId,
} from "@/lib/butcher/science/coupledMeatTrajectory";
import {
  celsiusToFahrenheit,
  evaluateGrainSlice,
  evaluateThermalProfile,
  generateThermalCurve,
  thermalCurveBoundsFor,
} from "@/lib/butcher/science/meatPhysics";
import type {
  AnatomicalCut,
  GrainSliceEvaluation,
  ThermalCurvePoint,
  ThermalEvaluation,
} from "@/lib/butcher/types";
import { DonenessBandBar } from "./DonenessBandBar";
import type { ButcherLabState } from "./useButcherLab";

/**
 * Tab 3 — `Thermal & Grain` (Meat Biophysics & Shear Force Lab).
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/ThermalGrainPanel.tsx
 */

function buildSolverHref(cut: AnatomicalCut, coreTempC: number): string {
  const query = new URLSearchParams({
    method: cut.solverMethodId,
    massG: String(cut.typicalPortionG),
    halfMm: String(Math.max(4, Math.round(cut.typicalThicknessMm * 0.5))),
    targetC: String(Math.round(coreTempC)),
  });
  if (cut.solverIngredientId) query.set("ingredient", cut.solverIngredientId);
  return `/kitchen-lab/physics?${query.toString()}`;
}

function ThermalStatsGrid({ thermal }: { readonly thermal: ThermalEvaluation }): JSX.Element {
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

function ThermalCurveChart({
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

function ThermalSliderPair({
  coreTempC,
  holdMinutes,
  minC,
  maxC,
  onTempChange,
  onHoldChange,
}: {
  readonly coreTempC: number;
  readonly holdMinutes: number;
  readonly minC: number;
  readonly maxC: number;
  readonly onTempChange: (v: number) => void;
  readonly onHoldChange: (v: number) => void;
}): JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="bt-therm-temp" className="bt-label block">
          Internal Core Temp: {coreTempC} °C ({celsiusToFahrenheit(coreTempC).toFixed(0)} °F)
        </label>
        <input id="bt-therm-temp" type="range" min={minC} max={maxC} step={1} value={Math.min(maxC, Math.max(minC, coreTempC))} onChange={(e) => onTempChange(Number(e.target.value))} className="bt-range mt-2" />
      </div>
      <div>
        <label htmlFor="bt-therm-hold" className="bt-label block">Hold Time at Temp: {holdMinutes} min</label>
        <input id="bt-therm-hold" type="range" min={0} max={360} step={5} value={holdMinutes} onChange={(e) => onHoldChange(Number(e.target.value))} className="bt-range mt-2" />
      </div>
    </div>
  );
}

function GrainShearSection({
  sliceAngleDeg,
  slice,
  onAngleChange,
}: {
  readonly sliceAngleDeg: number;
  readonly slice: GrainSliceEvaluation;
  readonly onAngleChange: (v: number) => void;
}): JSX.Element {
  return (
    <div className="bt-card space-y-3">
      <h3 className="text-lg">Warner-Bratzler Grain-Angle Shear Calculator</h3>
      <div>
        <label htmlFor="bt-therm-slice-angle" className="bt-label block">
          Knife Slice Angle vs Fiber Grain: {sliceAngleDeg}° ({slice.verdict})
        </label>
        <input id="bt-therm-slice-angle" type="range" min={0} max={90} step={1} value={sliceAngleDeg} onChange={(e) => onAngleChange(Number(e.target.value))} className="bt-range mt-2" />
      </div>
      <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-black/25 p-2.5">
          <span className="bt-label block">Effective Fiber</span>
          <span className="bt-num text-base text-white">{slice.effectiveFiberLengthMm} mm</span>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/25 p-2.5">
          <span className="bt-label block">Shear Multiplier</span>
          <span className="bt-num text-base text-amber-200">{slice.shearForceMultiplier}×</span>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/25 p-2.5">
          <span className="bt-label block">Cut Quality</span>
          <span className="bt-num text-base text-emerald-300">{slice.grainAngleScore}/100</span>
        </div>
      </div>
      <p className="text-xs text-white/70">{slice.coachingNote}</p>
    </div>
  );
}

function ThermalDenaturationCard({
  lab,
  bounds,
  thermal,
  curve,
}: {
  readonly lab: ButcherLabState;
  readonly bounds: ReturnType<typeof thermalCurveBoundsFor>;
  readonly thermal: ThermalEvaluation;
  readonly curve: readonly ThermalCurvePoint[];
}): JSX.Element {
  const { cut } = lab;
  return (
    <div className="bt-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl">Protein Denaturation &amp; Collagen Hydrolysis</h2>
          <p className="text-xs text-white/60">
            {cut.name} · {thermal.phaseLabel} · {thermal.donenessLabel}
          </p>
        </div>
        <Link href={buildSolverHref(cut, lab.coreTempC)} className="bt-btn is-primary no-underline">
          Simulate in Real Physics Solver →
        </Link>
      </div>
      <ThermalSliderPair
        coreTempC={lab.coreTempC}
        holdMinutes={lab.holdMinutes}
        minC={bounds.minC}
        maxC={bounds.maxC}
        onTempChange={lab.setCoreTempC}
        onHoldChange={lab.setHoldMinutes}
      />
      <ThermalStatsGrid thermal={thermal} />
      {thermal.warning ? <p className="bt-warn text-xs text-amber-100">{thermal.warning}</p> : null}
      <ThermalCurveChart curve={curve} coreTempC={lab.coreTempC} minC={bounds.minC} maxC={bounds.maxC} />
    </div>
  );
}

export function ThermalGrainPanel({ lab }: { readonly lab: ButcherLabState }): JSX.Element {
  const { cut } = lab;
  const [method, setMethod] = useState<TrajectoryMethodId>(() => defaultTrajectoryMethodForCut(cut));
  useEffect(() => {
    setMethod(defaultTrajectoryMethodForCut(cut));
  }, [cut]);

  const bounds = thermalCurveBoundsFor(cut.speciesId);
  const thermal = evaluateThermalProfile(cut, lab.coreTempC, lab.holdMinutes);
  const curve = generateThermalCurve(cut, lab.holdMinutes);
  const trajectory = useMemo(
    () =>
      simulateCoupledCutTrajectory(cut, {
        method,
        targetCoreTempC: lab.coreTempC,
        holdMinutes: lab.holdMinutes,
      }),
    [cut, method, lab.coreTempC, lab.holdMinutes],
  );
  const slice = evaluateGrainSlice(
    cut,
    knifeNormalAtAngle(lab.sliceAngleDeg, cut.grainVector),
    cut.typicalPortionG,
    cut.typicalPortionG,
  );

  return (
    <div className="space-y-4">
      <ThermalDenaturationCard lab={lab} bounds={bounds} thermal={thermal} curve={curve} />
      <DonenessBandBar method={method} onSelectMethod={setMethod} result={trajectory} />
      <GrainShearSection sliceAngleDeg={lab.sliceAngleDeg} slice={slice} onAngleChange={lab.setSliceAngleDeg} />
    </div>
  );
}
