"use client";

import Link from "next/link";
import { knifeNormalAtAngle } from "@/lib/butcher/science/butcherGame";
import {
  celsiusToFahrenheit,
  evaluateGrainSlice,
  evaluateThermalProfile,
  generateThermalCurve,
} from "@/lib/butcher/science/meatPhysics";
import type {
  AnatomicalCut,
  GrainSliceEvaluation,
  ThermalCurvePoint,
  ThermalEvaluation,
} from "@/lib/butcher/types";
import type { ButcherLabState } from "./useButcherLab";
import type { JSX } from "react";

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
}: {
  readonly curve: readonly ThermalCurvePoint[];
  readonly coreTempC: number;
}): JSX.Element {
  const w = 480;
  const h = 150;
  const toX = (tempC: number): number => ((tempC - 45) / (95 - 45)) * (w - 40) + 25;
  const toY = (pct: number): number => h - 18 - (pct / 100) * (h - 32);
  const tendernessPts = curve.map((pt) => `${toX(pt.tempC).toFixed(1)},${toY(pt.tendernessScore).toFixed(1)}`).join(" ");
  const moisturePts = curve.map((pt) => `${toX(pt.tempC).toFixed(1)},${toY(pt.moistureRetentionPct).toFixed(1)}`).join(" ");
  const gelatinPts = curve.map((pt) => `${toX(pt.tempC).toFixed(1)},${toY(pt.gelatinConversionPct).toFixed(1)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full rounded-lg border border-white/10 bg-black/30 p-2"
      role="img"
      aria-label="Tenderness, moisture retention, and gelatin conversion across 45 to 95 degrees Celsius"
    >
      <polyline fill="none" stroke="#34d399" strokeWidth={2.2} points={tendernessPts} />
      <polyline fill="none" stroke="#38bdf8" strokeWidth={1.8} strokeDasharray="4 3" points={moisturePts} />
      <polyline fill="none" stroke="#c084fc" strokeWidth={2} points={gelatinPts} />
      <line x1={toX(coreTempC)} y1={10} x2={toX(coreTempC)} y2={h - 14} stroke="#fbbf24" strokeWidth={1.5} />
      <text x={28} y={18} fill="#34d399" fontSize={10}>Tenderness</text>
      <text x={102} y={18} fill="#38bdf8" fontSize={10}>Moisture %</text>
      <text x={176} y={18} fill="#c084fc" fontSize={10}>Gelatin %</text>
      <text x={25} y={h - 3} fill="rgba(255,255,255,0.6)" fontSize={9}>45 °C</text>
      <text x={w - 42} y={h - 3} fill="rgba(255,255,255,0.6)" fontSize={9}>95 °C</text>
    </svg>
  );
}

function ThermalSliderPair({
  coreTempC,
  holdMinutes,
  onTempChange,
  onHoldChange,
}: {
  readonly coreTempC: number;
  readonly holdMinutes: number;
  readonly onTempChange: (v: number) => void;
  readonly onHoldChange: (v: number) => void;
}): JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="bt-therm-temp" className="bt-label block">
          Internal Core Temp: {coreTempC} °C ({celsiusToFahrenheit(coreTempC).toFixed(0)} °F)
        </label>
        <input id="bt-therm-temp" type="range" min={45} max={95} step={1} value={coreTempC} onChange={(e) => onTempChange(Number(e.target.value))} className="bt-range mt-2" />
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
      <div className="grid grid-cols-3 gap-2 text-xs">
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

export function ThermalGrainPanel({ lab }: { readonly lab: ButcherLabState }): JSX.Element {
  const { cut } = lab;
  const thermal = evaluateThermalProfile(cut, lab.coreTempC, lab.holdMinutes);
  const curve = generateThermalCurve(cut, lab.holdMinutes);
  const slice = evaluateGrainSlice(
    cut,
    knifeNormalAtAngle(lab.sliceAngleDeg, cut.grainVector),
    cut.typicalPortionG,
    cut.typicalPortionG,
  );

  return (
    <div className="space-y-4">
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
        <ThermalSliderPair coreTempC={lab.coreTempC} holdMinutes={lab.holdMinutes} onTempChange={lab.setCoreTempC} onHoldChange={lab.setHoldMinutes} />
        <ThermalStatsGrid thermal={thermal} />
        {thermal.warning ? <p className="bt-warn text-xs text-amber-100">{thermal.warning}</p> : null}
        <ThermalCurveChart curve={curve} coreTempC={lab.coreTempC} />
      </div>
      <GrainShearSection sliceAngleDeg={lab.sliceAngleDeg} slice={slice} onAngleChange={lab.setSliceAngleDeg} />
    </div>
  );
}
