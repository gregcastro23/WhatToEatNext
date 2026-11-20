"use client";

import { SystemBadge } from "@/components/lab/SystemBadge";
import { ElementalMeter } from "@/components/ui/alchm/ElementalMeter";
import {
  BUTCHER_ELEMENTS,
  type ButcherElementComponent,
  type ButcherElementalReading,
  computeButcherElementalReading,
} from "@/lib/butcher/science/butcherElemental";
import type { ButcherElement } from "@/lib/butcher/types";
import type { ButcherLabState } from "./useButcherLab";
import type { JSX } from "react";

/**
 * Tab 4 — `Elements` (`alchm` system).
 *
 * Explicitly badged separately from real meat physics so elemental/ESMS/planetary
 * metadata can never be mistaken for USDA or SI measurements.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/ButcherElementsPanel.tsx
 */

const COLOR_VAR: Readonly<Record<ButcherElement, string>> = {
  Fire: "var(--el-fire)",
  Water: "var(--el-water)",
  Earth: "var(--el-earth)",
  Air: "var(--el-air)",
};

function ElementalHeroCard({
  cutName,
  reading,
}: {
  readonly cutName: string;
  readonly reading: ButcherElementalReading;
}): JSX.Element {
  return (
    <div className="bt-card grid items-center gap-6 md:grid-cols-[170px_1fr]">
      <ElementalMeter
        layout="radial"
        values={{
          fire: reading.scores.Fire / 100,
          water: reading.scores.Water / 100,
          earth: reading.scores.Earth / 100,
          air: reading.scores.Air / 100,
        }}
      />
      <div className="space-y-2">
        <h2 className="text-xl">
          {cutName}: {reading.dominant}-Led Projection
        </h2>
        <p className="text-sm text-white/70">{reading.alchemicalPrep}</p>
        <p className="bt-num text-xs text-white/55">
          ESMS · Spirit {(reading.esms.Spirit * 100).toFixed(0)} · Essence{" "}
          {(reading.esms.Essence * 100).toFixed(0)} · Matter{" "}
          {(reading.esms.Matter * 100).toFixed(0)} · Substance{" "}
          {(reading.esms.Substance * 100).toFixed(0)}
        </p>
      </div>
    </div>
  );
}

function ElementBreakdownCard({
  element,
  score,
  components,
}: {
  readonly element: ButcherElement;
  readonly score: number;
  readonly components: readonly ButcherElementComponent[];
}): JSX.Element {
  return (
    <div className="bt-card">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base" style={{ color: COLOR_VAR[element] }}>
          {element}
        </h3>
        <span className="bt-num text-lg">{score.toFixed(0)}</span>
      </div>
      <ul className="mt-2 space-y-1 text-xs text-white/65">
        {components.map((c) => (
          <li key={c.label} className="flex justify-between gap-2">
            <span>{c.label}</span>
            <span className="bt-num">{(c.value * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ButcherElementsPanel({
  lab,
}: {
  readonly lab: ButcherLabState;
}): JSX.Element {
  const reading = computeButcherElementalReading(lab.cut);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SystemBadge system="alchm" variant="chip" />
        <span className="text-xs text-violet-200/80">
          Planetary Rulers: {reading.rulingPlanets.join(" · ")}
        </span>
      </div>

      <ElementalHeroCard cutName={lab.cut.name} reading={reading} />

      <div className="grid gap-3 sm:grid-cols-2">
        {BUTCHER_ELEMENTS.map((el) => (
          <ElementBreakdownCard
            key={el}
            element={el}
            score={reading.scores[el]}
            components={reading.components[el]}
          />
        ))}
      </div>
    </div>
  );
}
