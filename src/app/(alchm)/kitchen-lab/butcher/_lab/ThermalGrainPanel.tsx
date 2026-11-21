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
import { applyToughnessReduction, effectivePrep } from "@/lib/butcher/science/prepModifiers";
import type {
  AnatomicalCut,
  GrainSliceEvaluation,
  ThermalCurvePoint,
  ThermalEvaluation,
} from "@/lib/butcher/types";
import { BoneConduction3dPanel } from "./BoneConduction3dPanel";
import { CutCompareDrawer } from "./CutCompareDrawer";
import { DonenessBandBar } from "./DonenessBandBar";
import { PrepTrimControls } from "./PrepTrimControls";
import { ThermalCurveChart, ThermalStatsGrid } from "./ThermalCharts";
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
  const prepProfile = effectivePrep(lab.prep, cut);
  const rawThermal = evaluateThermalProfile(cut, lab.coreTempC, lab.holdMinutes);
  const thermal = { ...rawThermal, tendernessScore: applyToughnessReduction(rawThermal.tendernessScore, prepProfile) };
  const curve = generateThermalCurve(cut, lab.holdMinutes);
  const trajectory = useMemo(
    () =>
      simulateCoupledCutTrajectory(cut, {
        method,
        targetCoreTempC: lab.coreTempC,
        holdMinutes: lab.holdMinutes,
        prep: lab.prep,
        fatCapMm: lab.fatCapMm,
        boneIn: lab.boneIn,
      }),
    [cut, method, lab.coreTempC, lab.holdMinutes, lab.prep, lab.fatCapMm, lab.boneIn],
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
      <PrepTrimControls
        cut={cut}
        prep={lab.prep}
        fatCapMm={lab.fatCapMm}
        boneIn={lab.boneIn}
        onPrepChange={lab.setPrep}
        onFatCapChange={lab.setFatCapMm}
        onBoneInChange={lab.setBoneIn}
      />
      <DonenessBandBar method={method} onSelectMethod={setMethod} result={trajectory} />
      {trajectory.column.boneNeeds3d ? <BoneConduction3dPanel cut={cut} method={method} targetCoreTempC={lab.coreTempC} /> : null}
      <GrainShearSection sliceAngleDeg={lab.sliceAngleDeg} slice={slice} onAngleChange={lab.setSliceAngleDeg} />
      <CutCompareDrawer cut={cut} comparePins={lab.comparePins} onTogglePin={lab.togglePin} />
    </div>
  );
}
