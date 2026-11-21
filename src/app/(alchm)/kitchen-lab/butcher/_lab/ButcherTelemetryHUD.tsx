"use client";

import { getFdcRecordForCut, getSpeciesSpec } from "@/data/butcher/cutsCatalogue";
import { FAT_CLASS_COLOR } from "@/lib/butcher/science/fatClass";
import {
  celsiusToFahrenheit,
  recommendThermalStrategy,
  strategyLabel,
} from "@/lib/butcher/science/meatPhysics";
import type { AnatomicalCut } from "@/lib/butcher/types";
import {
  CATALOGUE_MAX,
  COLLAGEN_TICKS_G,
  CompositionBar,
  FAT_TICKS_G,
  FatClassChip,
  MetricBar,
  ProvenanceBadge,
} from "./TelemetryPrimitives";
import type { JSX } from "react";

/**
 * Sticky cut telemetry for the real-physics tabs of `/kitchen-lab/butcher`.
 *
 * Reading order is the order a butcher decides in: which cut and how sure the
 * numbers are (USDA EXACT / PROXY), fat and collagen (what the cut will do in
 * heat), the full composition, then the thermal target. Anatomy prose comes
 * last.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/ButcherTelemetryHUD.tsx
 */

/** "Beef · Chuck", dropping the primal when it only repeats the cut's name. */
export function cutLineage(cut: AnatomicalCut): string {
  const species = getSpeciesSpec(cut.speciesId).name;
  return cut.primalName === cut.name ? species : `${species} · ${cut.primalName}`;
}

function HudHeader({ cut }: { readonly cut: AnatomicalCut }): JSX.Element {
  const fdc = getFdcRecordForCut(cut);
  return (
    <header key={cut.id} className="bt-swap space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="bt-label pt-1">Active cut</p>
        {fdc ? <ProvenanceBadge record={fdc} /> : null}
      </div>
      <div>
        <h2 className="text-xl leading-tight text-white">{cut.name}</h2>
        <p className="text-xs text-white/55">{cutLineage(cut)}</p>
      </div>
    </header>
  );
}

function HeroMetric({
  label,
  value,
  unit,
  children,
}: {
  readonly label: string;
  readonly value: string;
  readonly unit: string;
  readonly children: JSX.Element;
}): JSX.Element {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="bt-label">{label}</span>
        <span>
          <span className="bt-num bt-hero">{value}</span>
          <span className="bt-num ml-1 text-[11px] text-white/50">{unit}</span>
        </span>
      </div>
      {children}
    </div>
  );
}

function FatCollagenMetrics({ cut }: { readonly cut: AnatomicalCut }): JSX.Element {
  const { fatG, collagenG } = cut.proximate;
  return (
    <section aria-label="Fat and collagen" className="space-y-3">
      <HeroMetric label="Fat" value={fatG.toFixed(1)} unit="g/100 g">
        <>
          <MetricBar value={fatG} max={CATALOGUE_MAX.fatG} ticks={FAT_TICKS_G} color={FAT_CLASS_COLOR[cut.fatClass]} />
          <FatClassChip fatClass={cut.fatClass} />
        </>
      </HeroMetric>
      <HeroMetric label="Collagen" value={collagenG.toFixed(2)} unit="g/100 g">
        <MetricBar value={collagenG} max={CATALOGUE_MAX.collagenG} ticks={COLLAGEN_TICKS_G} color="rgb(192 132 252)" />
      </HeroMetric>
      <p className="text-[10px] text-white/40">
        Bars span 0 to the catalogue maximum ({CATALOGUE_MAX.fatG.toFixed(1)} g fat, {CATALOGUE_MAX.collagenG.toFixed(2)} g collagen). Ticks mark the fat-class and collagen bands.
      </p>
    </section>
  );
}

function ThermalTarget({ cut }: { readonly cut: AnatomicalCut }): JSX.Element {
  const { ideal } = cut.targetCoreTempC;
  return (
    <section aria-label="Thermal target" className="bt-thermal">
      <div>
        <span className="bt-label block">Target core</span>
        <span className="bt-num bt-hero">{ideal} °C</span>
        <span className="bt-num ml-1.5 text-xs text-white/55">{celsiusToFahrenheit(ideal).toFixed(0)} °F</span>
      </div>
      <dl className="bt-kv">
        <div><dt>Method</dt><dd className="text-emerald-200">{strategyLabel(recommendThermalStrategy(cut))}</dd></div>
        <div><dt>Window</dt><dd className="bt-num">{cut.targetCoreTempC.min}–{cut.targetCoreTempC.max} °C</dd></div>
        <div><dt>Carryover</dt><dd className="bt-num">+{cut.targetCoreTempC.carryoverC} °C</dd></div>
        <div><dt>Fiber shear</dt><dd className="bt-num">{cut.fiberLengthFactor.toFixed(2)}×</dd></div>
        <div><dt>Portion</dt><dd className="bt-num">{cut.typicalPortionG} g · {cut.typicalThicknessMm} mm</dd></div>
      </dl>
    </section>
  );
}

export function ButcherTelemetryHUD({
  cut,
  onShowElements,
}: {
  readonly cut: AnatomicalCut;
  readonly onShowElements: () => void;
}): JSX.Element {
  return (
    <div className="bt-card bt-hud-card space-y-4">
      <HudHeader cut={cut} />
      <FatCollagenMetrics cut={cut} />
      <section aria-label="Composition per 100 g raw">
        <span className="bt-label mb-1.5 block">Composition · per 100 g raw</span>
        <CompositionBar proximate={cut.proximate} />
      </section>
      <ThermalTarget cut={cut} />
      <p className="border-t border-white/10 pt-3 text-xs leading-relaxed text-white/60">{cut.anatomicalNotes}</p>
      <button type="button" onClick={onShowElements} className="bt-btn w-full text-center text-violet-200">
        Read {cut.name} in Alchm Elements →
      </button>
    </div>
  );
}
