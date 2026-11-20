"use client";

import { getFdcRecordForCut, getSpeciesSpec } from "@/data/butcher/cutsCatalogue";
import {
  celsiusToFahrenheit,
  recommendThermalStrategy,
  strategyLabel,
} from "@/lib/butcher/science/meatPhysics";
import type { AnatomicalCut, CookingStrategy } from "@/lib/butcher/types";
import type { JSX } from "react";

/**
 * Sticky SI / USDA proximate & thermal telemetry HUD sidebar for the
 * real-physics tabs of `/kitchen-lab/butcher`.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/ButcherTelemetryHUD.tsx
 */

function ProximateGrid({ cut }: { readonly cut: AnatomicalCut }): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="rounded-lg border border-white/10 bg-black/25 p-2.5">
        <span className="bt-label block">Water</span>
        <span className="bt-num text-base text-white">{cut.proximate.waterG.toFixed(1)} g</span>
      </div>
      <div className="rounded-lg border border-white/10 bg-black/25 p-2.5">
        <span className="bt-label block">Protein</span>
        <span className="bt-num text-base text-white">{cut.proximate.proteinG.toFixed(1)} g</span>
      </div>
      <div className="rounded-lg border border-white/10 bg-black/25 p-2.5">
        <span className="bt-label block">Fat / Marbling</span>
        <span className="bt-num text-base text-amber-200">{cut.proximate.fatG.toFixed(1)} g</span>
      </div>
      <div className="rounded-lg border border-white/10 bg-black/25 p-2.5">
        <span className="bt-label block">Collagen</span>
        <span className="bt-num text-base text-purple-300">{cut.proximate.collagenG.toFixed(2)} g</span>
      </div>
    </div>
  );
}

function TelemetryStatsList({
  cut,
  strategy,
}: {
  readonly cut: AnatomicalCut;
  readonly strategy: CookingStrategy;
}): JSX.Element {
  return (
    <dl className="space-y-1.5 border-t border-white/10 pt-3 text-xs">
      <div className="flex justify-between gap-2">
        <dt className="text-white/55">Optimal Strategy</dt>
        <dd className="font-medium text-emerald-200">{strategyLabel(strategy)}</dd>
      </div>
      <div className="flex justify-between gap-2">
        <dt className="text-white/55">Target Core Temp</dt>
        <dd className="bt-num text-white">
          {cut.targetCoreTempC.ideal} °C ({celsiusToFahrenheit(cut.targetCoreTempC.ideal).toFixed(0)} °F)
        </dd>
      </div>
      <div className="flex justify-between gap-2">
        <dt className="text-white/55">Carryover Rise</dt>
        <dd className="bt-num text-white/80">+{cut.targetCoreTempC.carryoverC} °C</dd>
      </div>
      <div className="flex justify-between gap-2">
        <dt className="text-white/55">Fiber Shear Factor</dt>
        <dd className="bt-num text-white/80">{cut.fiberLengthFactor.toFixed(2)}×</dd>
      </div>
      <div className="flex justify-between gap-2">
        <dt className="text-white/55">Standard Portion</dt>
        <dd className="bt-num text-white/80">
          {cut.typicalPortionG} g · {cut.typicalThicknessMm} mm
        </dd>
      </div>
    </dl>
  );
}

export function ButcherTelemetryHUD({
  cut,
  onShowElements,
}: {
  readonly cut: AnatomicalCut;
  readonly onShowElements: () => void;
}): JSX.Element {
  const species = getSpeciesSpec(cut.speciesId);
  const fdc = getFdcRecordForCut(cut);
  const strategy = recommendThermalStrategy(cut);

  return (
    <div className="bt-card space-y-4">
      <div>
        <p className="bt-label">Active Sub-Primal</p>
        <h2 className="mt-1 text-xl text-white">{cut.name}</h2>
        <p className="text-xs text-white/60">
          {species.name} · {cut.primalName} · FDC{" "}
          <span className="bt-num text-emerald-300">{cut.fdcId}</span>
        </p>
      </div>

      <p className="text-xs leading-relaxed text-white/70">{cut.anatomicalNotes}</p>
      <ProximateGrid cut={cut} />
      <TelemetryStatsList cut={cut} strategy={strategy} />

      {fdc ? (
        <p className="text-[11px] text-white/45">
          Basis: {fdc.description} ({fdc.dataType}).
        </p>
      ) : null}

      <button type="button" onClick={onShowElements} className="bt-btn w-full text-center text-violet-200">
        Read {cut.name} in Alchm Elements →
      </button>
    </div>
  );
}
